import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setInfo('인증 메일을 보냈습니다. 메일함을 확인해 주세요!');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <Paper sx={{ p: 4, minWidth: 320, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>로그인됨</Typography>
          <Typography sx={{ mb: 2 }}>{user.email}</Typography>
          <Button variant="contained" onClick={handleLogout}>로그아웃</Button>
          <Button variant="outlined" sx={{ ml: 2 }} onClick={() => navigate('/')}>홈으로 가기</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <Paper sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>{mode === 'login' ? '로그인' : '회원가입'}</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="이메일"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="비밀번호"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          {info && <Typography color="primary" sx={{ mb: 2 }}>{info}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mb: 1 }}>
            {mode === 'login' ? '로그인' : '회원가입'}
          </Button>
        </form>
        <Button color="secondary" fullWidth onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? '회원가입' : '로그인'}으로 전환
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage; 