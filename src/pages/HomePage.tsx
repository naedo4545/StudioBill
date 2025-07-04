import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Description,
  Settings,
  Add,
} from '@mui/icons-material';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CampaignIcon from '@mui/icons-material/Campaign';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Grid from '@mui/material/Grid';
import { estimateTemplates } from '../data/templates';
import CalculateIcon from '@mui/icons-material/Calculate';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: '견적서 템플릿',
      summary: '샘플 견적서로 빠른 시작',
      description: '다양한 상황에 맞는 견적서 샘플을 제공합니다',
      icon: <OndemandVideoIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/templates'),
    },
    {
      title: '견적서 편집',
      summary: '항목 추가/수정, 자유 편집',
      description: '견적 내용을 자유롭게 수정하고 커스터마이징할 수 있습니다',
      icon: <PlayCircleOutlineIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/editor'),
    },
    {
      title: '회사 정보 관리',
      summary: '여러 회사 정보 저장/관리',
      description: '여러 회사 정보를 저장하고 관리할 수 있습니다',
      icon: <Settings sx={{ fontSize: 40 }} />,
      action: () => navigate('/settings'),
    },
    {
      title: '고객 정보 관리',
      summary: '고객 정보 목록/수정/삭제',
      description: '여러 고객 정보를 저장, 수정, 삭제할 수 있습니다',
      icon: <Description sx={{ fontSize: 40, color: '#111' }} />,
      action: () => navigate('/customers'),
    },
    {
      title: 'AI 견적 내기',
      summary: 'AI가 자동으로 견적을 추천',
      description: '간단한 정보만 입력하면 AI가 견적을 자동으로 생성해줍니다',
      icon: <CalculateIcon sx={{ fontSize: 40, color: '#111' }} />,
      action: () => navigate('/ai-estimate'),
    },
  ];

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'planning':
        return <Description sx={{ fontSize: 40, color: '#1976d2' }} />;
      case 'production':
        return <PlayCircleOutlineIcon sx={{ fontSize: 40, color: '#dc004e' }} />;
      case 'postProduction':
        return <OndemandVideoIcon sx={{ fontSize: 40, color: '#2e7d32' }} />;
      case 'budget':
        return <CampaignIcon sx={{ fontSize: 40, color: '#ed6c02' }} />;
      case 'tvc':
        return <OndemandVideoIcon sx={{ fontSize: 40, color: '#9c27b0' }} />;
      case 'motion':
        return <PlayCircleOutlineIcon sx={{ fontSize: 40, color: '#0288d1' }} />;
      case 'corporate':
        return <Description sx={{ fontSize: 40, color: '#388e3c' }} />;
      case 'sns':
        return <CampaignIcon sx={{ fontSize: 40, color: '#e91e63' }} />;
      case 'youtube':
        return <YouTubeIcon sx={{ fontSize: 40, color: '#f44336' }} />;
      case 'ai':
        return <CalculateIcon sx={{ fontSize: 40, color: '#ffd600' }} />;
      default:
        return <Description sx={{ fontSize: 40, color: '#757575' }} />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const [recentEstimates, setRecentEstimates] = React.useState<any[]>([]);
  const [calcValue, setCalcValue] = React.useState('');
  const [calcResult, setCalcResult] = React.useState<number|null>(null);
  const [myTemplates, setMyTemplates] = React.useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('estimates');
    if (saved) {
      const arr = JSON.parse(saved);
      setRecentEstimates(arr.slice(-3).reverse());
    }
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem('myEstimateTemplateList');
    if (saved) {
      const arr = JSON.parse(saved);
      setMyTemplates(arr.slice(-3).reverse());
    } else {
      setMyTemplates([]);
    }
  }, []);

  const handleCalcKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      try { setCalcResult(eval(calcValue)); } catch { setCalcResult(null); }
    }
  };

  const handleReset = () => {
    setCalcValue('');
    setCalcResult(null);
  };

  // 주요 기능 + 계산기 배열
  const featuresWithCalc = [
    ...features,
    { isCalculator: true as const },
  ];

  return (
    <Container maxWidth="lg" sx={{ background: '#fff', minHeight: '100vh', py: 4 }}>
      <Box sx={{ my: 4 }}>
        {/* 헤더 섹션 */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: '#111',
            color: '#fff',
            textAlign: 'center',
            boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
            borderRadius: 3,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#fff' }}>
            영상제작 견적서 서비스
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, color: '#bbb' }}>
            전문적이고 정확한 영상제작 견적서를 쉽고 빠르게 작성하세요
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/templates')}
            sx={{
              backgroundColor: '#fff',
              color: '#111',
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: '#222',
                color: '#fff',
              },
            }}
          >
            견적서 시작하기
          </Button>
        </Paper>

        {/* 주요 기능 섹션 */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 0, textAlign: 'center' }}>
          주요 기능
        </Typography>
        <Divider sx={{ mb: 1.5, borderColor: '#e6e6e6', borderBottomWidth: 2 }} />
        <Box sx={{ display: 'flex', gap: 3, mb: 4, alignItems: 'stretch', minHeight: 340 }}>
          <Grid container spacing={3}>
            {featuresWithCalc.map((feature, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', alignItems: 'stretch' }}>
                {'isCalculator' in feature && feature.isCalculator ? (
                  <Box sx={{ flex: 1, background: '#222', borderRadius: 3, boxShadow: 2, p: 2, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', minHeight: 160, maxWidth: 340, width: '100%' }}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                      빠른 견적 계산기
                    </Typography>
                    <input
                      type="text"
                      value={calcValue}
                      readOnly
                      onKeyDown={handleCalcKeyDown}
                      style={{
                        fontSize: 16,
                        padding: 6,
                        width: '100%',
                        border: '2px solid #fff',
                        borderRadius: 6,
                        textAlign: 'right',
                        marginBottom: 6,
                        background: '#111',
                        color: '#fff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5, width: '100%', mb: 1 }}>
                      {[7,8,9,'/'].map((v) => (
                        <Button key={v} variant="outlined" sx={{ background: '#fff', color: '#111', fontWeight: 700, borderRadius: 2, boxShadow: 1, border: 'none', minWidth: 0, minHeight: 28, px: 0, py: 0.25, fontSize: 14, '&:hover': { background: '#222', color: '#fff' } }} onClick={()=>setCalcValue(calcValue+v)}>{v}</Button>
                      ))}
                      {[4,5,6,'*'].map((v) => (
                        <Button key={v} variant="outlined" sx={{ background: '#fff', color: '#111', fontWeight: 700, borderRadius: 2, boxShadow: 1, border: 'none', minWidth: 0, minHeight: 28, px: 0, py: 0.25, fontSize: 14, '&:hover': { background: '#222', color: '#fff' } }} onClick={()=>setCalcValue(calcValue+v)}>{v}</Button>
                      ))}
                      {[1,2,3,'-'].map((v) => (
                        <Button key={v} variant="outlined" sx={{ background: '#fff', color: '#111', fontWeight: 700, borderRadius: 2, boxShadow: 1, border: 'none', minWidth: 0, minHeight: 28, px: 0, py: 0.25, fontSize: 14, '&:hover': { background: '#222', color: '#fff' } }} onClick={()=>setCalcValue(calcValue+v)}>{v}</Button>
                      ))}
                      {[0,'.','=','+'].map((v) => (
                        v === '='
                          ? <Button key={v} variant="contained" color="warning" sx={{ background: '#fff', color: '#111', fontWeight: 700, borderRadius: 2, boxShadow: 1, border: 'none', minWidth: 0, minHeight: 28, px: 0, py: 0.25, fontSize: 14, '&:hover': { background: '#222', color: '#fff' } }} onClick={() => {
                              try { setCalcResult(eval(calcValue)); } catch { setCalcResult(null); }
                            }}>=</Button>
                          : <Button key={v} variant="outlined" sx={{ background: '#fff', color: '#111', fontWeight: 700, borderRadius: 2, boxShadow: 1, border: 'none', minWidth: 0, minHeight: 28, px: 0, py: 0.25, fontSize: 14, '&:hover': { background: '#222', color: '#fff' } }} onClick={()=>setCalcValue(calcValue+v)}>{v}</Button>
                      ))}
                    </Box>
                    {calcResult !== null && <Typography sx={{ fontWeight: 700, color: '#ffd600', mb: 1 }}>결과: {calcResult}</Typography>}
                    <Button sx={{ mt: 1, background: '#fff', color: '#222', border: '1px solid #222', borderRadius: 2, fontWeight: 700, alignSelf: 'center', width: 90, fontSize: 15, py: 0.5, '&:hover': { background: '#222', color: '#fff' } }} onClick={handleReset}>초기화</Button>
                  </Box>
                ) : (
            <Card
              sx={{
                      flex: 1,
                      minWidth: 160,
                      maxWidth: 340,
                      height: 160,
                      background: '#fff',
                      color: '#111',
                      borderRadius: 3,
                      boxShadow: '0 2px 8px #eee',
                cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
              }}
                    onClick={'action' in feature ? feature.action : undefined}
            >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Box sx={{ color: '#111', mb: 1 }}>{'icon' in feature ? feature.icon : null}</Box>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#111' }}>{'title' in feature ? feature.title : ''}</Typography>
                      <Typography variant="body2" sx={{ color: '#888' }}>{'summary' in feature ? feature.summary : ''}</Typography>
              </CardContent>
            </Card>
                )}
              </Grid>
          ))}
          </Grid>
        </Box>

        {/* 최근 저장된 견적서 */}
        {myTemplates.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
              최근 저장된 견적서
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#e6e6e6', borderBottomWidth: 2 }} />
            <Grid container spacing={3} sx={{ mb: 2 }}>
              {myTemplates.map(est => (
                <Grid key={est.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ background: '#fff', color: '#111', borderRadius: 3, boxShadow: '0 2px 8px #eee', border: '1px solid #eee', cursor: 'pointer', height: '100%' }} onClick={() => navigate(`/editor/${est.id}`)}>
                    <CardContent>
                      <Typography variant="h6">{est.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{est.clientName}</Typography>
                      <Typography variant="caption" color="text.secondary">{est.savedAt ? new Date(est.savedAt).toLocaleDateString() : ''}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* 견적서 템플릿 섹션 및 카드 모두 제거, 단 안내 카드(샘플 견적서로 빠른 시작)는 남김 */}
        {/* <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 0, textAlign: 'center' }}>
          견적서 템플릿
        </Typography>
        <Divider sx={{ mb: 1.5, borderColor: '#e6e6e6', borderBottomWidth: 2 }} /> */}
        <Paper sx={{ p: 4, mb: 4, background: '#111', color: '#fff', borderRadius: 3, boxShadow: '0 2px 8px #eee' }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
            샘플 견적서로 빠른 시작
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            각 템플릿은 기획, 제작(촬영/연출), 후반제작으로 구성되어 있으며, 필요에 따라 항목을 추가, 수정, 삭제할 수 있습니다.
          </Typography>
        </Paper>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {estimateTemplates.map((template) => (
            <Grid key={template.id} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
              <Card sx={{ background: '#fff', color: '#222', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e6e6e6', mb: 3, p: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>{template.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>{template.description}</Typography>
                  {/* 포함 Chip */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {template.items.slice(0, 3).map((item) => (
                      <Chip
                        key={item.id}
                        label={item.name}
                        sx={item.category === 'ai' ? { backgroundColor: '#ffd600', color: '#333', fontWeight: 700 }
                          : item.category === 'planning' ? { backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }
                          : item.category === 'production' ? { backgroundColor: '#fce4ec', color: '#c2185b', fontWeight: 700 }
                          : item.category === 'postProduction' ? { backgroundColor: '#e8f5e8', color: '#2e7d32', fontWeight: 700 }
                          : { backgroundColor: '#222', color: '#fff', fontWeight: 700 }}
                      />
                    ))}
                    {template.items.length > 3 && (
                      <Chip
                        label={`+${template.items.length - 3}개`}
                        sx={{ backgroundColor: '#222', color: '#fff', fontWeight: 700 }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#222', fontSize: 20 }}>₩{formatPrice(template.totalAmount)}</Typography>
              <Button
                variant="outlined"
                      sx={{ borderColor: '#222', color: '#222', fontWeight: 700, borderRadius: 2, px: 3, background: '#fff', '&:hover': { background: '#222', color: '#fff', borderColor: '#222' } }}
                      onClick={() => navigate(`/editor/${template.id}`)}
              >
                선택하기
              </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {/* 빈 견적서 카드 */}
          <Grid key="empty" size={{ xs: 12, sm: 6, md: 6, lg: 6 }} sx={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
            <Card sx={{ background: '#fff', color: '#222', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e6e6e6', mb: 3, p: 3, height: '100%', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s, color 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4, background: '#111', color: '#fff' } }} onClick={() => navigate('/editor')}>
              <CardContent sx={{ p: 2, flex: 1, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', textAlign: 'left', height: '100%' }}>
                {/* Chip 영역(투명 더미) */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {[1,2,3].map(i => (
                    <Chip key={i} label=" " sx={{ backgroundColor: 'transparent', color: 'transparent', border: 'none', minWidth: 60, height: 32, p: 0, m: 0 }} />
                  ))}
                </Box>
                {/* 타이틀/설명 영역 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <Add sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'inherit', fontSize: 22, textAlign: 'center', width: '100%' }}>
                    빈 견적서 작성하기
              </Typography>
                  <Typography variant="body2" sx={{ color: 'inherit', mb: 2, textAlign: 'center', width: '100%' }}>
                    처음부터 직접 견적 항목을 추가해 자유롭게 작성할 수 있습니다.
              </Typography>
                </Box>
                {/* 금액/버튼 영역(투명 더미) */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: 'transparent', fontSize: 20, m: 0, p: 0 }}>₩0</Typography>
                  <Button variant="outlined" sx={{ borderColor: 'transparent', color: 'transparent', fontWeight: 700, borderRadius: 2, px: 3, background: 'transparent', minWidth: 100, height: 40, pointerEvents: 'none', m: 0, p: 0 }}>선택하기</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage; 