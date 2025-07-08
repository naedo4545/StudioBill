import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Save,
  Print,
  Share,
} from '@mui/icons-material';
import { estimateTemplates } from '../data/templates';
import { EstimateItem, EstimateDocument } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Snackbar from '@mui/material/Snackbar';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import { supabase } from '../supabaseClient';

const EstimateEditorPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  const [estimate, setEstimate] = useState<any>({
    title: '',
    clientName: '',
    displayClientName: '',
    clientInfo: {
      name: '',
      company: '',
      email: '',
      phone: '',
    },
    companyInfo: {
      id: '',
      name: '우리 회사',
      logo: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    items: [],
    totalAmount: 0,
    taxRate: 10,
    taxAmount: 0,
    finalAmount: 0,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
    notes: '',
  });

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EstimateItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<EstimateItem>>({
    category: 'planning',
    name: '',
    description: '',
    quantity: 1,
    unit: '건',
    unitPrice: 0,
    isDiscount: false,
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', company: '', email: '', phone: '' });

  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [customerEditForm, setCustomerEditForm] = useState({ name: '', company: '', email: '', phone: '' });
  const [isCustomerEditDialogOpen, setIsCustomerEditDialogOpen] = useState(false);

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [myTemplates, setMyTemplates] = useState<any[]>([]);

  const [companies, setCompanies] = useState<any[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setCompanyLoading(true);
      setCompanyError(null);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setCompanyError('로그인이 필요합니다.');
        setCompanyLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('createdAt', { ascending: true });
      if (error) setCompanyError(error.message);
      setCompanies(data || []);
      // 기본회사 선택
      if (data && data.length > 0) {
        const defaultCompany = data.find((c: any) => c.isDefault) || data[0];
        setEstimate((prev: any) => ({ ...prev, companyInfo: defaultCompany }));
      }
      setCompanyLoading(false);
    })();
  }, [templateId]);

  useEffect(() => {
    if (templateId && templateId !== 'new') {
      const template = estimateTemplates.find(t => t.id === templateId);
      if (template) {
        setEstimate((prev: any) => ({
          ...prev,
          title: template.name,
          items: [...template.items],
        }));
      }
    }
  }, [templateId]);

  useEffect(() => {
    // 총액 계산 (할인 항목 고려)
    const totalAmount = estimate.items?.reduce((sum: any, item: any) => {
      const itemTotal = item.totalPrice || 0;
      return item.isDiscount ? sum - itemTotal : sum + itemTotal;
    }, 0) || 0;
    const taxAmount = totalAmount * (estimate.taxRate || 0) / 100;
    const finalAmount = totalAmount + taxAmount;
    
    setEstimate((prev: any) => ({
      ...prev,
      totalAmount,
      taxAmount,
      finalAmount,
    }));
  }, [estimate.items, estimate.taxRate]);

  useEffect(() => {
    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('createdAt', { ascending: true });
      if (!error) setCustomers(data || []);
    })();
  }, []);

  const handleItemChange = (field: string, value: any) => {
    if (field === 'category' && value === 'ai') {
      if (!editingItem) {
        setNewItem((prev: any) => ({
          ...prev,
          category: value,
          name: 'AI생성',
          description: 'AI가 생성한 예시 견적 항목',
        }));
        return;
      } else {
        setEditingItem((prev: any) => ({
          ...prev!,
          category: value,
          name: 'AI생성',
          description: 'AI가 생성한 예시 견적 항목',
        }));
        return;
      }
    }
    if (editingItem) {
      setEditingItem((prev: any) => ({ ...prev!, [field]: value }));
    } else {
      setNewItem((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveItem = () => {
    if (editingItem) {
      // 기존 아이템 수정
      setEstimate((prev: any) => ({
        ...prev,
        items: prev.items?.map((item: any) => 
          item.id === editingItem.id ? editingItem : item
        ) || [],
      }));
    } else {
      // 새 아이템 추가
      const item: EstimateItem = {
        ...(newItem.id ? {} : { id: Date.now().toString() }),
        ...newItem as EstimateItem,
        totalPrice: (newItem.quantity || 1) * (newItem.unitPrice || 0),
      };
      setEstimate((prev: any) => ({
        ...prev,
        items: [...(prev.items || []), item],
      }));
    }
    
    setIsItemDialogOpen(false);
    setEditingItem(null);
    setNewItem({
      category: 'planning',
      name: '',
      description: '',
      quantity: 1,
      unit: '건',
      unitPrice: 0,
    });
  };

  const handleEditItem = (item: EstimateItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setEstimate((prev: any) => ({
      ...prev,
      items: prev.items?.filter((item: any) => item.id !== itemId) || [],
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'planning': return '기획';
      case 'production': return '제작';
      case 'postProduction': return '후반제작';
      case 'ai': return 'AI';
      default: return category;
    }
  };

  // PDF/이미지 저장 함수
  const handleSaveAsPDF = async () => {
    const element = document.getElementById('estimate-preview-area');
    if (!element) return;
    // html2canvas로 전체 캡처
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    // 첫 페이지
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    position = -pageHeight;

    // 여러 페이지 지원
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;
    }

    // 파일명: 견적서제목_YYYYMMDD.pdf
    const today = new Date();
    const ymd = today.toISOString().slice(0,10).replace(/-/g, '');
    const title = estimate.title ? estimate.title.replace(/\s+/g, '') : '견적서';
    pdf.save(`${title}_${ymd}.pdf`);
  };

  const handleSaveAsImage = async () => {
    const element = document.getElementById('estimate-preview-area');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const today = new Date();
    const ymd = today.toISOString().slice(0,10).replace(/-/g, '');
    const title = estimate.title ? estimate.title.replace(/\s+/g, '') : '견적서';
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${title}_${ymd}.png`;
    link.click();
  };

  const handleSaveEstimate = () => {
    const saved = localStorage.getItem('estimates');
    const estimates = saved ? JSON.parse(saved) : [];
    let newEstimate = { ...estimate, id: estimate.id || Date.now().toString() };
    // id 중복 방지
    const idx = estimates.findIndex((e: any) => e.id === newEstimate.id);
    if (idx > -1) {
      estimates[idx] = newEstimate;
    } else {
      estimates.push(newEstimate);
    }
    localStorage.setItem('estimates', JSON.stringify(estimates));
    setSnackbarOpen(true);
    setTimeout(() => navigate('/estimates'), 1000);
  };

  const handleImageUpload = (field: 'logo'|'stamp'|'signature', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setEstimate((prev: any) => ({
        ...prev,
        companyInfo: {
          ...(prev.companyInfo || {}),
          [field]: e.target?.result as string,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  // 고객 선택 핸들러
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const customer = customers.find(c => c.id === id);
    if (customer) {
      setEstimate((prev: any) => ({ ...prev, clientInfo: customer }));
    }
  };

  // 새 고객 저장
  const handleSaveCustomer = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { error } = await supabase.from('customers').insert([
      { ...newCustomer, user_id: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]);
    if (!error) {
      // 저장 후 목록 새로고침
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('createdAt', { ascending: true });
      setCustomers(data || []);
      setIsCustomerDialogOpen(false);
      setNewCustomer({ name: '', company: '', email: '', phone: '' });
      if (data && data.length > 0) {
        const last = data[data.length - 1];
        setSelectedCustomerId(last.id);
        setEstimate((prev: any) => ({ ...prev, clientInfo: last }));
      }
    }
  };

  const calcTotalAmount = () => {
    return (estimate.items || []).reduce((sum: number, item: any) => sum + (item.isDiscount ? -item.totalPrice : item.totalPrice), 0);
  };

  const totalDiscount = (estimate.items || []).filter((i: any) => i.isDiscount).reduce((sum: number, i: any) => sum + i.totalPrice, 0);
  const totalBeforeDiscount = (estimate.items || []).filter((i: any) => !i.isDiscount).reduce((sum: number, i: any) => sum + i.totalPrice, 0);
  const negoRate = totalBeforeDiscount > 0 ? Math.round((totalDiscount / totalBeforeDiscount) * 100) : 0;

  // 나만의 템플릿 저장 (Supabase)
  const handleSaveMyTemplate = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert('로그인 후 이용해 주세요!');
      return;
    }
    const { error } = await supabase
      .from('estimates')
      .insert([{ ...estimate, user_id: user.id, savedAt: new Date() }]);
    if (!error) setSnackbarOpen(true);
    else alert('저장 실패: ' + error.message);
  };

  // 나만의 템플릿 불러오기 (Supabase)
  const handleOpenMyTemplates = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert('로그인 후 이용해 주세요!');
      return;
    }
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('user_id', user.id)
      .order('savedAt', { ascending: false });
    if (!error) setMyTemplates(data || []);
    setIsTemplateDialogOpen(true);
  };

  // 나만의 템플릿 삭제 (Supabase)
  const handleDeleteMyTemplate = async (id: string) => {
    await supabase.from('estimates').delete().eq('id', id);
    handleOpenMyTemplates();
  };

  // 유효기간 미리 계산
  const validUntilDateString = (() => {
    if (!estimate.validUntil) return '';
    const d = typeof estimate.validUntil === 'string' ? new Date(estimate.validUntil) : estimate.validUntil;
    return d.toLocaleDateString();
  })();

  // 공유 기능: 견적서 미리보기 링크 복사
  const handleShare = async () => {
    const url = window.location.origin + window.location.pathname;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch (err) {
        // 사용자가 공유를 취소한 경우 아무 동작도 하지 않음
      }
    } else {
      navigator.clipboard.writeText(url);
      setSnackbarOpen(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectMyTemplate = (template: any) => {
    setEstimate({ ...template, id: undefined });
    setIsTemplateDialogOpen(false);
  };

  // 고객 정보 수정 (supabase)
  const handleEditCustomer = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { error } = await supabase
      .from('customers')
      .update({ ...customerEditForm, updatedAt: new Date().toISOString() })
      .eq('id', selectedCustomerId)
      .eq('user_id', user.id);
    if (!error) {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('createdAt', { ascending: true });
      setCustomers(data || []);
      setIsCustomerEditDialogOpen(false);
      setEstimate((prev: any) => ({ ...prev, clientInfo: { ...prev.clientInfo, ...customerEditForm } }));
    }
  };

  // 고객 삭제 (supabase)
  const handleDeleteCustomer = async (id: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    await supabase.from('customers').delete().eq('id', id).eq('user_id', user.id);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('createdAt', { ascending: true });
    setCustomers(data || []);
    setSelectedCustomerId('');
    setEstimate((prev: any) => ({ ...prev, clientInfo: { name: '', company: '', email: '', phone: '' } }));
  };

  return (
    <Container maxWidth="lg" sx={{ background: '#fff', minHeight: '100vh', py: 4 }}>
      <Box sx={{ my: 4 }}>
        {/* 회사 정보 표시 및 선택 */}
        <Card sx={{ background: '#fff', border: '1px solid #e6e6e6', color: '#111', borderRadius: 3, boxShadow: '0 2px 8px #eee', mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              {/* 왼쪽: 로고+정보 */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
              {estimate.companyInfo?.logo && (
                  <img src={estimate.companyInfo.logo} alt="회사 로고" style={{ maxWidth: 132, maxHeight: 132, width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 12, marginRight: 24, background: 'none', verticalAlign: 'top', display: 'block', marginTop: 0, padding: 0 }} />
              )}
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{estimate.companyInfo?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{estimate.companyInfo?.address}</Typography>
                <Typography variant="body2" color="text.secondary">Tel: {estimate.companyInfo?.phone} | Email: {estimate.companyInfo?.email}</Typography>
                {estimate.companyInfo?.website && (
                  <Typography variant="body2" color="text.secondary">Web: {estimate.companyInfo.website}</Typography>
                )}
                  {estimate.companyInfo?.bizNo && (
                    <Typography variant="body2" color="text.secondary">사업자등록번호: {estimate.companyInfo.bizNo}</Typography>
                  )}
                  {(estimate.companyInfo?.bizType || estimate.companyInfo?.bizItem) && (
                    <Typography variant="body2" color="text.secondary">
                      {estimate.companyInfo?.bizType && `업태: ${estimate.companyInfo.bizType}`}
                      {estimate.companyInfo?.bizType && estimate.companyInfo?.bizItem && ' / '}
                      {estimate.companyInfo?.bizItem && `종목: ${estimate.companyInfo.bizItem}`}
                    </Typography>
                  )}
                  {(estimate.companyInfo?.bankName || estimate.companyInfo?.accountNumber) && (
                    <Typography variant="body2" color="text.secondary">
                      {estimate.companyInfo?.bankName && `은행명: ${estimate.companyInfo.bankName}`}
                      {estimate.companyInfo?.bankName && estimate.companyInfo?.accountNumber && ' / '}
                      {estimate.companyInfo?.accountNumber && `계좌번호: ${estimate.companyInfo.accountNumber}`}
                    </Typography>
                  )}
              </Box>
              </Box>
              {/* 오른쪽: 회사 선택/관리 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, minWidth: 200 }}>
                <FormControl sx={{ minWidth: 200, width: '100%' }}>
                  <InputLabel>회사 선택</InputLabel>
                  <Select
                    value={estimate.companyInfo?.id || ''}
                    onChange={(e) => {
                      const selectedCompany = companies.find((company: any) => company.id === e.target.value);
                      if (selectedCompany) {
                        setEstimate((prev: any) => ({
                          ...prev,
                          companyInfo: selectedCompany,
                        }));
                      }
                    }}
                    label="회사 선택"
                  >
                    {companies.map((company: any) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name} {company.isDefault && '(기본)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {companyLoading && <Typography color="text.secondary">회사 정보 불러오는 중...</Typography>}
                {companyError && <Typography color="error">{companyError}</Typography>}
                <Button
                  variant="outlined"
                  onClick={() => navigate('/settings')}
                  sx={{
                    mt: 1,
                    width: '100%',
                    background: '#fff',
                    color: '#111',
                    border: '1px solid #bbb',
                    fontWeight: 700,
                    '&:hover': {
                      background: '#111',
                      color: '#fff',
                      border: '1px solid #111',
                    },
                  }}
                >
                  회사 정보 관리
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              뒤로가기
            </Button>
            <Typography variant="h4" component="h1">
              견적서 편집
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveMyTemplate}
              sx={{ background: '#111', color: '#fff', borderRadius: 2, fontWeight: 700, boxShadow: 1, border: '1px solid #111', '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
            >
              내 견적서 저장
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenMyTemplates}
              sx={{ background: '#111', color: '#fff', borderRadius: 2, fontWeight: 700, boxShadow: 1, border: '1px solid #111', '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
            >
              내 견적서 불러오기
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsPreviewOpen(true)}
              sx={{ background: '#111', color: '#fff', borderRadius: 2, fontWeight: 700, boxShadow: 1, border: '1px solid #111', '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
            >
              미리보기
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 기본 정보와 고객 정보 */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* 기본 정보 */}
            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  견적서 정보
                </Typography>
                <TextField
                  fullWidth
                  label="견적서 제목"
                  value={estimate.title}
                  onChange={(e) => setEstimate((prev: any) => ({ ...prev, title: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="견적서 표시 고객명"
                  value={estimate.displayClientName}
                  onChange={(e) => setEstimate((prev: any) => ({ ...prev, displayClientName: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="유효기간"
                  type="date"
                  value={(() => {
                    if (!estimate.validUntil) return '';
                    const d = typeof estimate.validUntil === 'string' ? new Date(estimate.validUntil) : estimate.validUntil;
                    return d.toISOString().split('T')[0];
                  })()}
                  onChange={(e) => setEstimate((prev: any) => ({ 
                    ...prev, 
                    validUntil: new Date(e.target.value) 
                  }))}
                  InputLabelProps={{ shrink: true }}
                />
              </CardContent>
            </Card>

            {/* 고객 정보 */}
            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>고객 정보</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>고객 선택</InputLabel>
                  <Select
                    value={selectedCustomerId}
                    label="고객 선택"
                    onChange={e => handleSelectCustomer(e.target.value)}
                  >
                    {customers.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name} / {c.company}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button variant="outlined" onClick={() => setIsCustomerDialogOpen(true)}>새 고객 추가</Button>
                  <Button variant="outlined" disabled={!estimate.clientInfo} onClick={() => {
                    setEditingCustomer(estimate.clientInfo);
                    setCustomerEditForm({
                      name: estimate.clientInfo?.name || '',
                      company: estimate.clientInfo?.company || '',
                      email: estimate.clientInfo?.email || '',
                      phone: estimate.clientInfo?.phone || '',
                    });
                    setIsCustomerEditDialogOpen(true);
                  }}>고객 정보 수정</Button>
                  <Button variant="outlined" color="error" disabled={!estimate.clientInfo} onClick={() => {
                    setSelectedCustomerId('');
                    setEstimate((prev: any) => ({ ...prev, clientInfo: { name: '', company: '', email: '', phone: '' } }));
                  }}>비우기</Button>
                </Box>
                {estimate.clientInfo && (
                  <>
                    <TextField fullWidth label="담당자명" value={estimate.clientInfo.name} sx={{ mb: 1, minWidth: 240 }} disabled />
                    <TextField fullWidth label="회사명" value={estimate.clientInfo.company} sx={{ mb: 1 }} disabled />
                    <TextField fullWidth label="이메일" value={estimate.clientInfo.email} sx={{ mb: 1 }} disabled />
                    <TextField fullWidth label="연락처" value={estimate.clientInfo.phone} sx={{ mb: 1 }} disabled />
                  </>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* 견적 항목 */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  견적 항목
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setIsItemDialogOpen(true)}
                  sx={{ background: '#111', color: '#fff', '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
                >
                  항목 추가
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>카테고리</TableCell>
                      <TableCell>항목명</TableCell>
                      <TableCell>설명</TableCell>
                      <TableCell align="right">수량</TableCell>
                      <TableCell align="right">단가</TableCell>
                      <TableCell align="right">금액</TableCell>
                      <TableCell align="center">할인</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estimate.items?.map((item: any, index: number) => (
                      <TableRow key={item.id} sx={{ 
                        backgroundColor: item.isDiscount ? '#fff3e0' : 'inherit',
                        '& .MuiTableCell-root': {
                          color: item.isDiscount ? '#e65100' : 'inherit',
                        }
                      }}>
                        <TableCell>
                          <span
                            style={{
                              display: 'inline-block',
                              minWidth: 44,
                              padding: '2px 12px',
                              borderRadius: 16,
                              fontWeight: 700,
                              fontSize: '0.95em',
                              textAlign: 'center',
                              background:
                                item.category === 'ai'
                                  ? '#ffd600'
                                  : item.category === 'planning'
                                  ? '#e3f2fd'
                                  : item.category === 'production'
                                  ? '#fce4ec'
                                  : item.category === 'postProduction'
                                  ? '#e8f5e8'
                                  : '#222',
                              color:
                                item.category === 'ai'
                                  ? '#333'
                                  : item.category === 'planning'
                                  ? '#1976d2'
                                  : item.category === 'production'
                                  ? '#c2185b'
                                  : item.category === 'postProduction'
                                  ? '#2e7d32'
                                  : '#fff',
                              border: 'none',
                              verticalAlign: 'middle',
                            }}
                          >
                            {getCategoryLabel(item.category) || item.category}
                          </span>
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  const newQuantity = Math.floor(item.quantity) - 1;
                                  const newTotalPrice = newQuantity * item.unitPrice;
                                  setEstimate((prev: any) => ({
                                    ...prev,
                                    items: prev.items?.map((i: any) => 
                                      i.id === item.id 
                                        ? { ...i, quantity: newQuantity, totalPrice: newTotalPrice }
                                        : i
                                    ) || [],
                                  }));
                                }
                              }}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </IconButton>
                            <TextField
                              type="number"
                              value={item.unit === '일' ? item.quantity : Math.floor(item.quantity)}
                              onChange={(e) => {
                                let newQuantity = Number(e.target.value);
                                if (item.unit === '일') {
                                  if (isNaN(newQuantity) || newQuantity < 0.5) newQuantity = 0.5;
                                  newQuantity = Math.round(newQuantity * 2) / 2;
                                } else {
                                  if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
                                  newQuantity = Math.floor(newQuantity);
                                }
                                const newTotalPrice = newQuantity * item.unitPrice;
                                setEstimate((prev: any) => ({
                                  ...prev,
                                  items: prev.items?.map((i: any) =>
                                    i.id === item.id
                                      ? { ...i, quantity: newQuantity, totalPrice: newTotalPrice }
                                      : i
                                  ) || [],
                                }));
                              }}
                              size="small"
                              sx={{ width: 60, mx: 1 }}
                              inputProps={item.unit === '일' ? { min: 0.5, step: 0.5 } : { min: 1, step: 1, pattern: '[0-9]*', inputMode: 'numeric' }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newQuantity = Math.floor(item.quantity) + 1;
                                const newTotalPrice = newQuantity * item.unitPrice;
                                setEstimate((prev: any) => ({
                                  ...prev,
                                  items: prev.items?.map((i: any) => 
                                    i.id === item.id 
                                      ? { ...i, quantity: newQuantity, totalPrice: newTotalPrice }
                                      : i
                                  ) || [],
                                }));
                              }}
                            >
                              +
                            </IconButton>
                            {' '}{item.unit}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newUnitPrice = Number(e.target.value);
                              const newTotalPrice = item.quantity * newUnitPrice;
                              setEstimate((prev: any) => ({
                                ...prev,
                                items: prev.items?.map((i: any) =>
                                  i.id === item.id
                                    ? { ...i, unitPrice: newUnitPrice, totalPrice: newTotalPrice }
                                    : i
                                ) || [],
                              }));
                            }}
                            size="small"
                            sx={{ width: 120 }}
                            inputProps={{ min: 0, step: 1000 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          color: item.isDiscount ? '#e65100' : 'inherit',
                          fontWeight: item.isDiscount ? 'bold' : 'normal'
                        }}>
                          {item.isDiscount ? '-' : ''}₩{formatPrice(item.totalPrice)}
                        </TableCell>
                        <TableCell align="center">
                          <FormControlLabel
                            control={
                              <Switch
                                checked={item.isDiscount || false}
                                onChange={(e) => {
                                  setEstimate((prev: any) => ({
                                    ...prev,
                                    items: prev.items?.map((i: any) => 
                                      i.id === item.id 
                                        ? { ...i, isDiscount: e.target.checked }
                                        : i
                                    ) || [],
                                  }));
                                }}
                                size="small"
                              />
                            }
                            label="할인"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => handleEditItem(item)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteItem(item.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* 합계와 비고 */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* 합계 */}
            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  합계
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>공급가액:</Typography>
                  <Typography>₩{formatPrice(calcTotalAmount() || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>부가세 ({estimate.taxRate === 11 ? '일본(10%)' : estimate.taxRate === 10 ? '한국(10%)' : estimate.taxRate === 0 ? '미국(0%)' : estimate.taxRate === 20 ? '영국(20%)' : estimate.taxRate + '%' }):</Typography>
                  <Typography>₩{formatPrice(estimate.taxAmount || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>네고율:</Typography>
                  <Typography color="warning.main">{negoRate}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontWeight: 'bold' }}>
                  <Typography variant="h6">총 금액:</Typography>
                  <Typography variant="h6" color="primary">
                    ₩{formatPrice(estimate.finalAmount || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel>세율 선택</InputLabel>
                    <Select
                      value={estimate.taxRate ?? 10}
                      label="세율 선택"
                      onChange={e => {
                        const v = Number(e.target.value);
                        setEstimate((prev: any) => ({ ...prev, taxRate: v }));
                      }}
                    >
                      <MenuItem value={10}>한국 (10%)</MenuItem>
                      <MenuItem value={0}>미국 (0%)</MenuItem>
                      <MenuItem value={11}>일본 (10%)</MenuItem>
                      <MenuItem value={20}>영국 (20%)</MenuItem>
                    </Select>
                  </FormControl>
                <TextField
                    label="세율 직접 입력 (%)"
                  type="number"
                    value={estimate.taxRate === 11 ? 10 : estimate.taxRate}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setEstimate((prev: any) => ({ ...prev, taxRate: prev.taxRate === 11 ? (v === 10 ? 11 : v) : v }));
                    }}
                    sx={{ flex: 1, textAlign: 'right', input: { textAlign: 'right' } }}
                    InputProps={{ endAdornment: <span style={{ color: '#bbb', marginLeft: 4 }}>%</span> }}
                />
                </Box>
              </CardContent>
            </Card>

            {/* 비고 */}
            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  비고
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="추가 사항이나 특이사항을 입력하세요"
                  value={estimate.notes}
                  onChange={(e) => setEstimate((prev: any) => ({ ...prev, notes: e.target.value }))}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* 항목 추가/편집 다이얼로그 */}
        <Dialog open={isItemDialogOpen} onClose={() => setIsItemDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingItem ? '항목 수정' : '항목 추가'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel shrink={true}>카테고리</InputLabel>
                <Select
                  label="카테고리"
                  value={editingItem?.category || newItem.category}
                  onChange={(e) => handleItemChange('category', e.target.value)}
                >
                  <MenuItem value="planning">기획</MenuItem>
                  <MenuItem value="production">제작</MenuItem>
                  <MenuItem value="postProduction">후반제작</MenuItem>
                  <MenuItem value="ai">AI생성</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="항목명"
                value={editingItem?.name || newItem.name}
                onChange={(e) => handleItemChange('name', e.target.value)}
              />
              <TextField
                fullWidth
                label="설명"
                multiline
                rows={2}
                value={editingItem?.description || newItem.description}
                onChange={(e) => handleItemChange('description', e.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="수량"
                  type="number"
                  value={editingItem?.quantity || newItem.quantity}
                  onChange={(e) => handleItemChange('quantity', Number(e.target.value))}
                />
                <TextField
                  fullWidth
                  label="단위"
                  value={editingItem?.unit || newItem.unit}
                  onChange={(e) => handleItemChange('unit', e.target.value)}
                />
              </Box>
              <TextField
                fullWidth
                label="단가"
                type="number"
                value={editingItem?.unitPrice || newItem.unitPrice}
                onChange={(e) => handleItemChange('unitPrice', Number(e.target.value))}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editingItem?.isDiscount || newItem.isDiscount || false}
                    onChange={(e) => handleItemChange('isDiscount', e.target.checked)}
                  />
                }
                label="할인 항목"
              />
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  총액: ₩{formatPrice(
                    (editingItem?.quantity || newItem.quantity || 1) * 
                    (editingItem?.unitPrice || newItem.unitPrice || 0)
                  )}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsItemDialogOpen(false)}>취소</Button>
            <Button onClick={handleSaveItem} variant="contained">저장</Button>
          </DialogActions>
        </Dialog>

        {/* 새 고객 추가 다이얼로그 */}
        <Dialog open={isCustomerDialogOpen} onClose={() => setIsCustomerDialogOpen(false)}>
          <DialogTitle>새 고객 추가</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="담당자명" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth label="회사명" value={newCustomer.company} onChange={e => setNewCustomer({ ...newCustomer, company: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth label="이메일" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth label="연락처" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} sx={{ mb: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCustomerDialogOpen(false)}>취소</Button>
            <Button onClick={handleSaveCustomer} variant="contained">저장</Button>
          </DialogActions>
        </Dialog>

        {/* 고객 정보 수정 다이얼로그 */}
        <Dialog open={isCustomerEditDialogOpen} onClose={() => setIsCustomerEditDialogOpen(false)}>
          <DialogTitle>고객 정보 수정</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="담당자명" value={customerEditForm.name} onChange={e => setCustomerEditForm(f => ({ ...f, name: e.target.value }))} sx={{ mb: 2, minWidth: 240 }} />
            <TextField fullWidth label="회사명" value={customerEditForm.company} onChange={e => setCustomerEditForm(f => ({ ...f, company: e.target.value }))} sx={{ mb: 2 }} />
            <TextField fullWidth label="이메일" value={customerEditForm.email} onChange={e => setCustomerEditForm(f => ({ ...f, email: e.target.value }))} sx={{ mb: 2 }} />
            <TextField fullWidth label="연락처" value={customerEditForm.phone} onChange={e => setCustomerEditForm(f => ({ ...f, phone: e.target.value }))} sx={{ mb: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCustomerEditDialogOpen(false)}>취소</Button>
            <Button variant="contained" onClick={handleEditCustomer}>저장</Button>
          </DialogActions>
        </Dialog>

        {/* 미리보기 다이얼로그 */}
        <Dialog open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>견적서 미리보기</DialogTitle>
          <DialogContent>
            {/* 미리보기 A4 스타일 적용 */}
            <Box id="estimate-preview-area" sx={{
              background: '#fff',
              margin: '0 auto',
              boxShadow: 3,
              borderRadius: 2,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}>
              {/* 회사 정보 왼쪽 정렬 */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  {estimate.companyInfo?.logo && (
                  <img src={estimate.companyInfo.logo} alt="회사 로고" style={{ maxWidth: 132, maxHeight: 132, width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 12, background: 'none', marginRight: 32, verticalAlign: 'top', display: 'block', marginTop: 0, padding: 0 }} />
                  )}
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{estimate.companyInfo?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{estimate.companyInfo?.address}</Typography>
                  <Typography variant="body2" color="text.secondary">Tel: {estimate.companyInfo?.phone} | Email: {estimate.companyInfo?.email}</Typography>
                  {estimate.companyInfo?.website && (
                    <Typography variant="body2" color="text.secondary">Web: {estimate.companyInfo.website}</Typography>
                  )}
                  {estimate.companyInfo?.bizNo && (
                    <Typography variant="body2" color="text.secondary">사업자등록번호: {estimate.companyInfo.bizNo}</Typography>
                  )}
                  {(estimate.companyInfo?.bizType || estimate.companyInfo?.bizItem) && (
                  <Typography variant="body2" color="text.secondary">
                      {estimate.companyInfo?.bizType && `업태: ${estimate.companyInfo.bizType}`}
                      {estimate.companyInfo?.bizType && estimate.companyInfo?.bizItem && ' / '}
                      {estimate.companyInfo?.bizItem && `종목: ${estimate.companyInfo.bizItem}`}
                  </Typography>
                  )}
                  {(estimate.companyInfo?.bankName || estimate.companyInfo?.accountNumber) && (
                  <Typography variant="body2" color="text.secondary">
                      {estimate.companyInfo?.bankName && `은행명: ${estimate.companyInfo.bankName}`}
                      {estimate.companyInfo?.bankName && estimate.companyInfo?.accountNumber && ' / '}
                      {estimate.companyInfo?.accountNumber && `계좌번호: ${estimate.companyInfo.accountNumber}`}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 180, ml: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mt: 1 }}>견적서</Typography>
                  <Typography variant="body2" color="text.secondary">
                    발행일: {estimate.createdAt?.toLocaleDateString() || new Date().toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    유효기간: {validUntilDateString}
                  </Typography>
                </Box>
              </Box>

              {/* 견적서 제목 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  {estimate.title}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  고객: {estimate.displayClientName}
                </Typography>
              </Box>

              {/* 고객 정보 */}
              <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  고객 정보
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">담당자</Typography>
                    <Typography variant="body1">{estimate.clientInfo?.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">회사명</Typography>
                    <Typography variant="body1">{estimate.clientInfo?.company}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">이메일</Typography>
                    <Typography variant="body1">{estimate.clientInfo?.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">연락처</Typography>
                    <Typography variant="body1">{estimate.clientInfo?.phone}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* 견적 항목 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  견적 항목
                </Typography>
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 2fr 2fr 1fr 1fr 1fr',
                    backgroundColor: '#f5f5f5',
                    p: 1,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #e0e0e0',
                  }}>
                    <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>카테고리</Box>
                    <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>항목명</Box>
                    <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>설명</Box>
                    <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'right' }}>수량</Box>
                    <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'right' }}>단가</Box>
                    <Box sx={{ p: 1, textAlign: 'right' }}>금액</Box>
                  </Box>
                  {estimate.items?.map((item: any, index: number) => (
                    <Box key={item.id} sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 2fr 2fr 1fr 1fr 1fr',
                      borderTop: index > 0 ? '1px solid #e0e0e0' : 'none',
                      fontSize: '0.875rem',
                      alignItems: 'center',
                      minHeight: 40,
                    }}>
                      <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: 44,
                            padding: '2px 12px',
                            borderRadius: 16,
                            fontWeight: 700,
                            fontSize: '0.95em',
                            textAlign: 'center',
                            background:
                              item.category === 'ai'
                                ? '#ffd600'
                                : item.category === 'planning'
                                ? '#e3f2fd'
                                : item.category === 'production'
                                ? '#fce4ec'
                                : item.category === 'postProduction'
                                ? '#e8f5e8'
                                : '#222',
                            color:
                              item.category === 'ai'
                                ? '#333'
                                : item.category === 'planning'
                                ? '#1976d2'
                                : item.category === 'production'
                                ? '#c2185b'
                                : item.category === 'postProduction'
                                ? '#2e7d32'
                                : '#fff',
                            border: 'none',
                            verticalAlign: 'middle',
                          }}
                        >
                          {getCategoryLabel(item.category) || item.category}
                        </span>
                      </Box>
                      <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>{item.name}</Box>
                      <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>{item.description}</Box>
                      <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'right' }}>{Math.floor(item.quantity)} {item.unit}</Box>
                      <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', textAlign: 'right' }}>₩{formatPrice(item.unitPrice)}</Box>
                      <Box sx={{ p: 1, textAlign: 'right', color: item.isDiscount ? '#e65100' : 'inherit', fontWeight: item.isDiscount ? 'bold' : 'normal' }}>
                        {item.isDiscount ? '-' : ''}₩{formatPrice(item.totalPrice)}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* 합계 */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Box sx={{ minWidth: 300 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>공급가액:</Typography>
                    <Typography>₩{formatPrice(calcTotalAmount() || 0)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>부가세 ({estimate.taxRate === 11 ? '일본(10%)' : estimate.taxRate === 10 ? '한국(10%)' : estimate.taxRate === 0 ? '미국(0%)' : estimate.taxRate === 20 ? '영국(20%)' : estimate.taxRate + '%' }):</Typography>
                    <Typography>₩{formatPrice(estimate.taxAmount || 0)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>네고율:</Typography>
                    <Typography color="warning.main">{negoRate}%</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold',
                    borderTop: '1px solid #e0e0e0',
                    pt: 1
                  }}>
                    <Typography variant="h6">총 금액:</Typography>
                    <Typography variant="h6" color="primary">
                      ₩{formatPrice(estimate.finalAmount || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 비고 */}
              {estimate.notes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    비고
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {estimate.notes}
                  </Typography>
                </Box>
              )}

              {/* 하단 직인/사인 */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 120, textAlign: 'right' }}>{estimate.companyInfo?.name}</Typography>
                {estimate.companyInfo?.signature && (
                  <img src={estimate.companyInfo.signature} alt="사인 또는 직인" style={{ height: 48, marginLeft: 4, background: 'none', borderRadius: 6, verticalAlign: 'middle', display: 'inline-block' }} />
                )}
              </Box>
              {/* 하단 감사 문구 */}
              <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  감사합니다. 문의사항은 언제든 연락주세요.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, background: '#fff' }}>
            <Button
              onClick={handlePrint}
              startIcon={<Print />}
              sx={{ background: '#111', color: '#fff', borderRadius: '8px 0 0 8px', fontWeight: 700, border: '1px solid #111', minWidth: 110, '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
            >
              인쇄
            </Button>
            <Button
              onClick={handleShare}
              sx={{ background: '#111', color: '#fff', borderRadius: 0, fontWeight: 700, border: '1px solid #111', minWidth: 110, '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
            >
              공유
            </Button>
            <Button
              onClick={handleSaveAsPDF}
              sx={{ background: '#111', color: '#fff', borderRadius: 0, fontWeight: 700, border: '1px solid #111', minWidth: 110, '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
            >
              PDF저장
            </Button>
            <Button
              onClick={handleSaveAsImage}
              sx={{ background: '#111', color: '#fff', borderRadius: 0, fontWeight: 700, border: '1px solid #111', minWidth: 110, '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
            >
              이미지 저장
            </Button>
            <Button
              onClick={() => setIsPreviewOpen(false)}
              sx={{ background: '#111', color: '#fff', borderRadius: '0 8px 8px 0', fontWeight: 700, border: '1px solid #111', minWidth: 110, '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }}
            >
              닫기
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={1500} message={'견적서가 저장되었습니다'} onClose={()=>setSnackbarOpen(false)} />

        <Dialog open={isTemplateDialogOpen} onClose={() => setIsTemplateDialogOpen(false)}>
          <DialogTitle>내 견적서 불러오기</DialogTitle>
          <DialogContent dividers>
            {myTemplates.length === 0 && (
              <Typography sx={{ color: '#888', textAlign: 'center', my: 4 }}>
                저장된 견적서가 없습니다
              </Typography>
            )}
            {myTemplates.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {myTemplates.map((tpl, idx) => (
                  <Card key={tpl.id} sx={{
                    boxShadow: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
                    background: '#fff',
                    border: '1.5px solid #222',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    minHeight: 72,
                    gap: 2,
                    '&:hover': {
                      boxShadow: 8,
                      border: '2px solid #111',
                      background: '#222',
                      color: '#fff',
                      '.MuiTypography-root': { color: '#fff !important' },
                      '.MuiSvgIcon-root': { color: '#fff !important' },
                    },
                  }}>
                    <Box onClick={() => handleSelectMyTemplate(tpl)} sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DescriptionIcon sx={{ color: '#222', fontSize: 32, mr: 1, transition: 'color 0.2s' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#222', mb: 0.5 }}>{tpl.title || `템플릿 ${idx + 1}`}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{tpl.savedAt ? new Date(tpl.savedAt).toLocaleString() : ''}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#222' }}>항목 수: {tpl.items?.length || 0}</Typography>
                      </Box>
                    </Box>
                    <IconButton onClick={() => handleDeleteMyTemplate(tpl.id)} size="small" sx={{ ml: 1, alignSelf: 'flex-start', opacity: 0.7, transition: 'opacity 0.2s, color 0.2s, background 0.2s', color: '#222', '&:hover': { opacity: 1, color: '#fff', background: '#111' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsTemplateDialogOpen(false)}>닫기</Button>
          </DialogActions>
        </Dialog>

        {/* Add print CSS for A4 and page-break */}
        <style>{`
@media print {
  #estimate-preview-area {
    width: 210mm !important;
    min-height: 297mm !important;
    max-width: 210mm !important;
    background: #fff !important;
    margin: 0 auto !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    page-break-after: always;
    overflow: visible !important;
  }
  body {
    background: #fff !important;
  }
  .MuiDialog-root, .MuiDialog-container, .MuiDialogContent-root {
    background: none !important;
    box-shadow: none !important;
  }
}
`}</style>
      </Box>
    </Container>
  );
};

export default EstimateEditorPage; 