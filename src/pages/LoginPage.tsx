import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
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