import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Alert,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CompanyInfo } from '../types';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const defaultCompanyInfo: Omit<CompanyInfo, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  logo: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  isDefault: false,
  signature: '',
};

type CompanyFormData = Omit<CompanyInfo, 'id' | 'createdAt' | 'updatedAt'> & {
  logo?: string | File;
  signature?: string | File;
};

const CompanySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyInfo | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(defaultCompanyInfo);
  const [selectedCompany, setSelectedCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const userId = await getUserId();
      if (!userId) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .order('createdAt', { ascending: true });
      if (error) setError(error.message);
      setCompanies(data || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (companies.length === 0) {
      setSelectedCompany(null);
    } else {
      const defaultCompany = companies.find(c => c.isDefault) || companies[0];
      setSelectedCompany(defaultCompany);
    }
  }, [companies]);

  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  };

  const uploadImageToSupabase = async (file: File, userId: string, type: 'logo' | 'signature') => {
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/${type}_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('company-assets').upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('company-assets').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const handleChange = (field: keyof CompanyFormData, value: string | boolean | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const userId = await getUserId();
    if (!userId) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    let logoUrl = typeof formData.logo === 'string' ? formData.logo : '';
    let signatureUrl = typeof formData.signature === 'string' ? formData.signature : '';
    // If logo/signature is a File, upload to Supabase Storage
    if (formData.logo && typeof formData.logo !== 'string') {
      try {
        logoUrl = await uploadImageToSupabase(formData.logo, userId, 'logo');
      } catch (e: any) {
        setError('로고 업로드 실패: ' + e.message);
        setLoading(false);
        return;
      }
    }
    if (formData.signature && typeof formData.signature !== 'string') {
      try {
        signatureUrl = await uploadImageToSupabase(formData.signature, userId, 'signature');
      } catch (e: any) {
        setError('사인/직인 업로드 실패: ' + e.message);
        setLoading(false);
        return;
      }
    }
    const now = new Date().toISOString();
    let result;
    if (editingCompany) {
      // Update
      result = await supabase
        .from('companies')
        .update({ ...formData, logo: logoUrl, signature: signatureUrl, updatedAt: now, user_id: userId })
        .eq('id', editingCompany.id)
        .eq('user_id', userId)
        .select();
    } else {
      // Insert
      result = await supabase
        .from('companies')
        .insert([{ ...formData, logo: logoUrl, signature: signatureUrl, user_id: userId, isDefault: formData.isDefault, createdAt: now, updatedAt: now, id: uuidv4() }])
        .select();
    }
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    // 기본 회사 설정
    if (formData.isDefault) {
      await supabase
        .from('companies')
        .update({ isDefault: false })
        .eq('user_id', userId)
        .neq('id', editingCompany ? editingCompany.id : result.data[0].id);
      await supabase
        .from('companies')
        .update({ isDefault: true })
        .eq('id', editingCompany ? editingCompany.id : result.data[0].id)
        .eq('user_id', userId);
    }
    // Reload
    const { data, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('createdAt', { ascending: true });
    if (fetchError) setError(fetchError.message);
    setCompanies(data || []);
    setIsDialogOpen(false);
    setEditingCompany(null);
    setFormData(defaultCompanyInfo);
    setLoading(false);
  };

  const handleEdit = (company: CompanyInfo) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      logo: company.logo || '',
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website || '',
      isDefault: company.isDefault || false,
      signature: company.signature || '',
      bizNo: company.bizNo || '',
      bizType: company.bizType || '',
      bizItem: company.bizItem || '',
      bankName: company.bankName || '',
      accountNumber: company.accountNumber || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (companyId: string) => {
    setLoading(true);
    setError(null);
    const userId = await getUserId();
    if (!userId) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
      .eq('user_id', userId);
    if (error) setError(error.message);
    // Reload
    const { data, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('createdAt', { ascending: true });
    if (fetchError) setError(fetchError.message);
    setCompanies(data || []);
    setLoading(false);
  };

  const handleSetDefault = async (companyId: string) => {
    setLoading(true);
    setError(null);
    const userId = await getUserId();
    if (!userId) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    // 모든 회사 isDefault false, 선택 회사만 true
    await supabase
      .from('companies')
      .update({ isDefault: false })
      .eq('user_id', userId);
    await supabase
      .from('companies')
      .update({ isDefault: true })
      .eq('id', companyId)
      .eq('user_id', userId);
    // Reload
    const { data, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('createdAt', { ascending: true });
    if (fetchError) setError(fetchError.message);
    setCompanies(data || []);
    setLoading(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCompany(null);
    setFormData(defaultCompanyInfo);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('이미지 용량은 1MB 이하만 가능합니다.');
      return;
    }
    // 미리보기용 File 객체 저장
    handleChange(field, file);
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mb: 4, background: '#111', color: '#fff', borderRadius: 3, boxShadow: '0 2px 8px #eee' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
          회사 정보 관리
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
            새 회사 추가
          </Button>
        </Box>

        {loading && <Alert severity="info">로딩 중...</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {companies.length === 0 ? (
          <Alert severity="info">
            저장된 회사 정보가 없습니다. 새 회사를 추가해주세요.
          </Alert>
        ) : (
          <List>
            {companies.map((company, index) => (
              <React.Fragment key={company.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <>
                      <IconButton
                        onClick={() => handleSetDefault(company.id)}
                        sx={{ color: company.isDefault ? '#111' : '#bbb', '&:hover': { color: '#111' } }}
                      >
                        {company.isDefault ? <Star /> : <StarBorder />}
                      </IconButton>
                      <IconButton onClick={() => handleEdit(company)}>
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(company.id)}
                        disabled={companies.length === 1}
                        sx={{ color: '#bbb', '&:hover': { color: '#111' } }}
                      >
                        <Delete />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemButton
                    selected={selectedCompany?.id === company.id}
                    onClick={() => setSelectedCompany(company)}
                    sx={{ '&.Mui-selected': { background: '#f5f5f5' } }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {company.name}
                          {company.isDefault && (
                            <Chip label="기본" size="small" sx={{ background: '#111', color: '#fff', fontWeight: 700 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {company.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {company.phone} • {company.email}
                          </Typography>
                          {company.website && (
                            <Typography variant="body2" color="text.secondary">
                              {company.website}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < companies.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        <Box sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/')}
            sx={{ background: '#fff', color: '#111', border: '1px solid #bbb', '&:hover': { background: '#111', color: '#fff', border: '1px solid #111' } }}
          >
            홈으로 돌아가기
          </Button>
        </Box>
      </Box>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCompany ? '회사 정보 수정' : '새 회사 추가'}
        </DialogTitle>
        <DialogContent>
            <TextField
              fullWidth
              label="회사명"
            value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>로고</Typography>
            {formData.logo && (
              <Box sx={{ mb: 1 }}>
                <img src={typeof formData.logo === 'string' ? formData.logo : URL.createObjectURL(formData.logo as File)} alt="logo" style={{ maxWidth: 120, maxHeight: 60, display: 'block', marginBottom: 8, background: '#eee', borderRadius: 4 }} />
                <Button size="small" onClick={() => handleChange('logo', '')}>삭제</Button>
              </Box>
            )}
            <Button variant="outlined" component="label" sx={{ width: '100%' }}>
              이미지 업로드
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImageUpload(e, 'logo')}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">최대 1MB, PNG/JPG 권장</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>사인 또는 직인</Typography>
            {formData.signature && (
              <Box sx={{ mb: 1 }}>
                <img src={typeof formData.signature === 'string' ? formData.signature : URL.createObjectURL(formData.signature as File)} alt="signOrStamp" style={{ maxWidth: 80, maxHeight: 80, display: 'block', marginBottom: 8, background: '#eee', borderRadius: 4 }} />
                <Button size="small" onClick={() => handleChange('signature', '')}>삭제</Button>
              </Box>
            )}
            <Button variant="outlined" component="label" sx={{ width: '100%' }}>
              이미지 업로드
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImageUpload(e, 'signature')}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">최대 1MB</Typography>
          </Box>
            <TextField
              fullWidth
              label="주소"
            value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="전화번호"
            value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="이메일"
            value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="웹사이트"
            value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              sx={{ mb: 2 }}
            />
          <TextField
            fullWidth
            label="사업자등록번호"
            value={formData.bizNo || ''}
            onChange={(e) => handleChange('bizNo', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="업태"
            value={formData.bizType || ''}
            onChange={(e) => handleChange('bizType', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="종목"
            value={formData.bizItem || ''}
            onChange={(e) => handleChange('bizItem', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="은행명"
            value={formData.bankName || ''}
            onChange={(e) => handleChange('bankName', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="계좌번호"
            value={formData.accountNumber || ''}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.name || !formData.address || !formData.phone || !formData.email}
          >
              저장
            </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompanySettingsPage; 