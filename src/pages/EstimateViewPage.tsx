import React, { useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack,
  Print,
  Share,
  Edit,
  Download,
  Image,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const EstimateViewPage: React.FC = () => {
  const { estimateId } = useParams<{ estimateId: string }>();
  const navigate = useNavigate();
  const estimateRef = useRef<HTMLDivElement>(null);

  // 샘플 데이터 (실제로는 API에서 가져올 데이터)
  const estimate = {
    id: estimateId,
    title: '영상제작 견적서',
    clientName: 'ABC 기업',
    clientInfo: {
      name: '김철수',
      company: 'ABC 기업',
      email: 'kim@abc.com',
      phone: '010-1234-5678',
    },
    companyInfo: {
      name: '우리 영상제작사',
      logo: '',
      stamp: '',
      signature: '',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'info@ourcompany.com',
      website: 'www.ourcompany.com',
      businessNumber: '123-45-67890',
      businessType: '서비스업',
      businessCategory: '영상제작업',
      bankName: '신한은행',
      accountNumber: '110-123-456789',
    },
    items: [
      {
        id: '1',
        category: 'planning',
        name: '기획 및 컨셉 개발',
        description: '프로젝트 기획, 스토리보드, 컨셉 개발',
        quantity: 1,
        unit: '건',
        unitPrice: 500000,
        totalPrice: 500000,
      },
      {
        id: '2',
        category: 'production',
        name: '촬영 및 제작',
        description: '기본 촬영, 연출, 장비 및 인력',
        quantity: 1,
        unit: '건',
        unitPrice: 1500000,
        totalPrice: 1500000,
      },
      {
        id: '3',
        category: 'postProduction',
        name: '후반 제작',
        description: '편집, 색보정, 사운드 믹싱',
        quantity: 1,
        unit: '건',
        unitPrice: 800000,
        totalPrice: 800000,
      },
    ],
    totalAmount: 2800000,
    taxRate: 10,
    taxAmount: 280000,
    finalAmount: 3080000,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    notes: '견적서는 발행일로부터 30일간 유효합니다.',
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR').format(date);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'planning': return '기획';
      case 'production': return '제작';
      case 'postProduction': return '후반제작';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'planning': return 'primary';
      case 'production': return 'secondary';
      case 'postProduction': return 'success';
      default: return 'default';
    }
  };

  // A4 사이즈 분할 함수
  const splitIntoPages = (element: HTMLElement) => {
    const A4_HEIGHT = 1123; // A4 높이 (px, 96 DPI 기준)
    const A4_WIDTH = 794; // A4 너비 (px, 96 DPI 기준)
    const pages: HTMLElement[] = [];
    
    const clone = element.cloneNode(true) as HTMLElement;
    const children = Array.from(clone.children);
    let currentPage = document.createElement('div');
    currentPage.style.width = `${A4_WIDTH}px`;
    currentPage.style.height = `${A4_HEIGHT}px`;
    currentPage.style.overflow = 'hidden';
    currentPage.style.position = 'relative';
    currentPage.style.backgroundColor = 'white';
    currentPage.style.padding = '40px';
    currentPage.style.boxSizing = 'border-box';
    
    let currentHeight = 0;
    
    children.forEach((child) => {
      const childHeight = (child as HTMLElement).offsetHeight;
      
      if (currentHeight + childHeight > A4_HEIGHT - 80) {
        // 새 페이지 시작
        pages.push(currentPage);
        currentPage = document.createElement('div');
        currentPage.style.width = `${A4_WIDTH}px`;
        currentPage.style.height = `${A4_HEIGHT}px`;
        currentPage.style.overflow = 'hidden';
        currentPage.style.position = 'relative';
        currentPage.style.backgroundColor = 'white';
        currentPage.style.padding = '40px';
        currentPage.style.boxSizing = 'border-box';
        currentHeight = 0;
      }
      
      currentPage.appendChild(child.cloneNode(true));
      currentHeight += childHeight;
    });
    
    if (currentPage.children.length > 0) {
      pages.push(currentPage);
    }
    
    return pages;
  };

  // PDF 저장
  const handleSavePDF = async () => {
    if (!estimateRef.current) return;
    
    try {
      const element = estimateRef.current;
      const pages = splitIntoPages(element);
      
      const pdf = new jsPDF('p', 'pt', 'a4');
      
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
        });
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 595.28, 841.89);
      }
      
      const fileName = `${estimate.title}_${formatDate(estimate.createdAt)}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF 저장 중 오류:', error);
    }
  };

  // 이미지 저장 (A4 분할)
  const handleSaveImage = async () => {
    if (!estimateRef.current) return;
    
    try {
      const element = estimateRef.current;
      const pages = splitIntoPages(element);
      
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
        });
        
        const link = document.createElement('a');
        link.download = `${estimate.title}_${formatDate(estimate.createdAt)}_${i + 1}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('이미지 저장 중 오류:', error);
    }
  };

  // 회사 정보 이미지가 있는지 확인
  const hasCompanyImages = estimate.companyInfo.logo || estimate.companyInfo.stamp || estimate.companyInfo.signature;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
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
              견적서 보기
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/editor/${estimateId}`)}
              sx={{ mr: 1 }}
            >
              편집
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleSavePDF}
              sx={{ mr: 1 }}
            >
              PDF 저장
            </Button>
            <Button
              variant="contained"
              startIcon={<Image />}
              onClick={handleSaveImage}
              sx={{ mr: 1 }}
            >
              이미지 저장
            </Button>
            <Button
              variant="contained"
              startIcon={<Print />}
              sx={{ mr: 1 }}
            >
              인쇄
            </Button>
            <Button
              variant="contained"
              startIcon={<Share />}
            >
              공유
            </Button>
          </Box>
        </Box>

        {/* 견적서 내용 */}
        <Paper ref={estimateRef} sx={{ p: 4, backgroundColor: 'white' }}>
          {/* 회사 정보 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              {estimate.companyInfo.logo && (
                <img src={estimate.companyInfo.logo} alt="회사 로고" style={{ maxHeight: 48, marginBottom: 8 }} />
              )}
              <Typography variant="h5" component="h2" gutterBottom>
                {estimate.companyInfo.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {estimate.companyInfo.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tel: {estimate.companyInfo.phone} | Email: {estimate.companyInfo.email}
              </Typography>
              {estimate.companyInfo.website && (
                <Typography variant="body2" color="text.secondary">
                  Web: {estimate.companyInfo.website}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                사업자등록번호: {estimate.companyInfo.businessNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                업태: {estimate.companyInfo.businessType} | 종목: {estimate.companyInfo.businessCategory}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {estimate.companyInfo.bankName}: {estimate.companyInfo.accountNumber}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" gutterBottom>
                견적서
              </Typography>
              <Typography variant="body2" color="text.secondary">
                발행일: {formatDate(estimate.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                유효기간: {formatDate(estimate.validUntil)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 견적서 제목 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h3" gutterBottom>
              {estimate.title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              고객: {estimate.clientName}
            </Typography>
          </Box>

          {/* 고객 정보 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                고객 정보
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">담당자</Typography>
                  <Typography variant="body1">{estimate.clientInfo.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">회사명</Typography>
                  <Typography variant="body1">{estimate.clientInfo.company}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">이메일</Typography>
                  <Typography variant="body1">{estimate.clientInfo.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">연락처</Typography>
                  <Typography variant="body1">{estimate.clientInfo.phone}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* 견적 항목 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              견적 항목
            </Typography>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estimate.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Chip 
                          label={getCategoryLabel(item.category)} 
                          size="small"
                          color={getCategoryColor(item.category) as any}
                        />
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                      <TableCell align="right">₩{formatPrice(item.unitPrice)}</TableCell>
                      <TableCell align="right">₩{formatPrice(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 합계 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <Box sx={{ minWidth: 300 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>공급가액:</Typography>
                <Typography>₩{formatPrice(estimate.totalAmount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>부가세 ({estimate.taxRate}%):</Typography>
                <Typography>₩{formatPrice(estimate.taxAmount)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <Typography variant="h6">총 금액:</Typography>
                <Typography variant="h6" color="primary">
                  ₩{formatPrice(estimate.finalAmount)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 비고 */}
          {estimate.notes && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                비고
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {estimate.notes}
              </Typography>
            </Box>
          )}

          {/* 서명 영역 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                고객 확인
              </Typography>
              <Box sx={{ 
                width: 200, 
                height: 80, 
                border: '1px dashed #ccc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Typography variant="body2" color="text.secondary">
                  서명 또는 도장
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                견적자 서명
              </Typography>
              <Box sx={{ 
                width: 200, 
                height: 80, 
                border: '1px dashed #ccc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Typography variant="body2" color="text.secondary">
                  서명 또는 도장
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 하단 회사 정보 (이미지가 있을 때만 표시) */}
          {hasCompanyImages && (
            <>
              <Divider sx={{ my: 4 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    감사합니다
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    더 나은 서비스를 위해 노력하겠습니다.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  {estimate.companyInfo.stamp && (
                    <img 
                      src={estimate.companyInfo.stamp} 
                      alt="직인" 
                      style={{ width: 60, height: 60, objectFit: 'contain' }} 
                    />
                  )}
                  {estimate.companyInfo.signature && (
                    <img 
                      src={estimate.companyInfo.signature} 
                      alt="사인" 
                      style={{ width: 80, height: 40, objectFit: 'contain' }} 
                    />
                  )}
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EstimateViewPage; 