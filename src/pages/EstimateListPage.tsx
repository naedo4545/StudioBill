import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Button, Grid } from '@mui/material';
import { supabase } from '../supabaseClient';

const EstimateListPage: React.FC = () => {
  const [estimates, setEstimates] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('user_id', user.id)
        .order('createdAt', { ascending: false });
      setEstimates(data || []);
    })();
  }, []);

  const handleDelete = async (id: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    await supabase.from('estimates').delete().eq('id', id).eq('user_id', user.id);
    // 목록 새로고침
    const { data } = await supabase
      .from('estimates')
      .select('*')
      .eq('user_id', user.id)
      .order('createdAt', { ascending: false });
    setEstimates(data || []);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>견적서 목록</Typography>
        <Grid container spacing={3}>
          {estimates.map(estimate => (
            <Grid key={estimate.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{estimate.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{estimate.clientName}</Typography>
                  <Button onClick={() => navigate(`/view/${estimate.id}`)} sx={{ mt: 1 }}>상세보기</Button>
                  <Button onClick={() => navigate(`/editor/${estimate.id}`)} sx={{ mt: 1, ml: 1 }}>편집</Button>
                  <Button color="error" onClick={() => handleDelete(estimate.id)} sx={{ mt: 1, ml: 1 }}>삭제</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default EstimateListPage; 