import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Description, Add } from '@mui/icons-material';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CampaignIcon from '@mui/icons-material/Campaign';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Grid from '@mui/material/Grid';
import { estimateTemplates } from '../data/templates';
import CalculateIcon from '@mui/icons-material/Calculate';

const TemplateSelectionPage: React.FC = () => {
  const navigate = useNavigate();

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'budget':
        return 'primary';
      case 'tvc':
        return 'secondary';
      case 'motion':
        return 'success';
      case 'corporate':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            뒤로가기
          </Button>
          <Typography variant="h4" component="h1">
            견적서 템플릿 선택
          </Typography>
        </Box>

        {/* 설명 */}
        <Paper sx={{ p: 4, mb: 4, background: '#111', color: '#fff', borderRadius: 3, boxShadow: '0 2px 8px #eee' }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
            프로젝트 유형에 맞는 템플릿을 선택하세요
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            각 템플릿은 기획, 제작(촬영/연출), 후반제작으로 구성되어 있으며, 필요에 따라 항목을 추가, 수정, 삭제할 수 있습니다.
          </Typography>
        </Paper>

        {/* 템플릿 목록 */}
        <Grid container spacing={3}>
          {estimateTemplates.map((template) => (
            <Grid key={template.id} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
              <Card sx={{ background: '#fff', color: '#222', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e6e6e6', mb: 3, p: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>{template.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>{template.description}</Typography>
                  {/* 포함 항목 Chips */}
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
          <Grid key="empty" size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', boxShadow: 2, borderRadius: 3, justifyContent: 'center', alignItems: 'center', p: 4, cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }} onClick={() => navigate('/editor')}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Add sx={{ fontSize: 48, color: '#1976d2' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 2 }}>
                  빈 견적서 작성하기
                  </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  처음부터 직접 견적 항목을 추가해 자유롭게 작성할 수 있습니다.
                  </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TemplateSelectionPage; 