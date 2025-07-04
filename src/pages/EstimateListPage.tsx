import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Button, Grid } from '@mui/material';

const EstimateListPage: React.FC = () => {
  const [estimates, setEstimates] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('estimates');
    setEstimates(saved ? JSON.parse(saved) : []);
  }, []);

  const handleDelete = (id: string) => {
    const filtered = estimates.filter(e => e.id !== id);
    setEstimates(filtered);
    localStorage.setItem('estimates', JSON.stringify(filtered));
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