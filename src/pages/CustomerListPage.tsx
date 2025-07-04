import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface CustomerInfo {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
}

const defaultCustomer: Omit<CustomerInfo, 'id'> = {
  name: '',
  company: '',
  email: '',
  phone: '',
};

const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerInfo | null>(null);
  const [formData, setFormData] = useState(defaultCustomer);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('createdAt', { ascending: true });
      if (error) setError(error.message);
      setCustomers(data || []);
      setLoading(false);
    })();
  }, []);

  const handleChange = (field: keyof typeof defaultCustomer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    let result;
    if (editingCustomer) {
      // Update
      result = await supabase
        .from('customers')
        .update({ ...formData, updatedAt: new Date().toISOString() })
        .eq('id', editingCustomer.id)
        .eq('user_id', user.id)
        .select();
    } else {
      // Insert
      result = await supabase
        .from('customers')
        .insert([{ ...formData, user_id: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), id: uuidv4() }])
        .select();
    }
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    // Reload
    const { data, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('createdAt', { ascending: true });
    if (fetchError) setError(fetchError.message);
    setCustomers(data || []);
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setFormData(defaultCustomer);
    setLoading(false);
  };

  const handleEdit = (customer: CustomerInfo) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) setError(error.message);
    // Reload
    const { data, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('createdAt', { ascending: true });
    if (fetchError) setError(fetchError.message);
    setCustomers(data || []);
    setLoading(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setFormData(defaultCustomer);
  };

  const handleExport = () => {
    if (customers.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(customers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '고객정보');
    XLSX.writeFile(wb, '고객정보목록.xlsx');
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mb: 4, background: '#111', color: '#fff', borderRadius: 3, boxShadow: '0 2px 8px #eee' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
          고객 정보 관리
        </Typography>
      </Paper>
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsDialogOpen(true)}
            sx={{ background: '#111', color: '#fff', '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
          >
            새 고객 추가
          </Button>
          <Button
            variant="outlined"
            onClick={handleExport}
            sx={{ ml: 2, background: '#fff', color: '#111', border: '1px solid #bbb', fontWeight: 700, '&:hover': { background: '#111', color: '#fff', border: '1px solid #111' } }}
          >
            문서로 저장하기
          </Button>
        </Box>
        <TextField
          fullWidth
          placeholder="고객명, 회사명, 이메일, 연락처로 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2, background: '#fafafa', borderRadius: 2 }}
          size="small"
        />
        {loading && <Alert severity="info">로딩 중...</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {customers.length === 0 ? (
          <Alert severity="info">저장된 고객 정보가 없습니다. 새 고객을 추가해 주세요.</Alert>
        ) : (
          <List>
            {customers
              .filter(customer => {
                const q = search.trim().toLowerCase();
                if (!q) return true;
                return (
                  customer.name.toLowerCase().includes(q) ||
                  customer.company.toLowerCase().includes(q) ||
                  customer.email.toLowerCase().includes(q) ||
                  customer.phone.toLowerCase().includes(q)
                );
              })
              .map((customer, idx, arr) => (
                <React.Fragment key={customer.id}>
                  <ListItem>
                    <ListItemText
                      primary={customer.name + (customer.company ? ` / ${customer.company}` : '')}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">{customer.email}</Typography>
                          <Typography variant="body2" color="text.secondary">{customer.phone}</Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleEdit(customer)}><Edit /></IconButton>
                      <IconButton onClick={() => handleDelete(customer.id)}
                        sx={{ color: '#bbb', '&:hover': { color: '#111' } }}
                      ><Delete /></IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {idx < arr.length - 1 && <Divider />}
                </React.Fragment>
              ))}
          </List>
        )}
        <Box sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/')}
            sx={{ background: '#fff', color: '#111', border: '1px solid #bbb', '&:hover': { background: '#111', color: '#fff', border: '1px solid #111' } }}
          >홈으로 돌아가기</Button>
        </Box>
      </Box>
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingCustomer ? '고객 정보 수정' : '새 고객 추가'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="담당자명" value={formData.name} onChange={e => handleChange('name', e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="회사명" value={formData.company} onChange={e => handleChange('company', e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="이메일" value={formData.email} onChange={e => handleChange('email', e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="연락처" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSave} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerListPage; 