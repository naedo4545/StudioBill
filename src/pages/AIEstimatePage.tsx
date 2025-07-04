import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AIEstimatePage: React.FC = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState('');
  const [budget, setBudget] = useState('');
  const [desc, setDesc] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = () => {
    setResult('AI가 생성한 견적 예시입니다. (실제 AI 연동 필요)');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ background: '#fff', color: '#111', border: '1px solid #bbb', fontWeight: 700, '&:hover': { background: '#111', color: '#fff', border: '1px solid #111' } }}>
          홈으로 돌아가기
        </Button>
      </Box>
      <Paper sx={{ p: 4, mb: 4, background: '#111', color: '#fff', borderRadius: 3, boxShadow: '0 2px 8px #eee', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
          AI 견적 내기
        </Typography>
        <Typography variant="body1" sx={{ color: '#bbb', mt: 1 }}>
          간단한 정보를 입력하면 AI가 자동으로 견적을 추천해줍니다.
        </Typography>
      </Paper>
      <Card sx={{ background: '#fff', border: '1px solid #e6e6e6', color: '#111', borderRadius: 3, boxShadow: '0 2px 8px #eee', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="프로젝트명" value={project} onChange={e => setProject(e.target.value)} fullWidth />
            <TextField label="예산(원)" value={budget} onChange={e => setBudget(e.target.value)} fullWidth type="number" />
            <TextField label="설명" value={desc} onChange={e => setDesc(e.target.value)} fullWidth multiline rows={3} />
            <Button variant="contained" sx={{ background: '#111', color: '#fff', fontWeight: 700, '&:hover': { background: '#fff', color: '#111', border: '1px solid #111' } }} onClick={handleGenerate}>
              AI 견적 생성
            </Button>
          </Box>
        </CardContent>
      </Card>
      {result && (
        <Card sx={{ background: '#fafafa', border: '1px solid #bbb', color: '#111', borderRadius: 3, boxShadow: '0 2px 8px #eee' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>AI 견적 결과</Typography>
            <Typography>{result}</Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default AIEstimatePage; 