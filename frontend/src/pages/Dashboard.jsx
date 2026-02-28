import { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, 
  Card, CardContent, Chip, CircularProgress 
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'https://exquisite-harmony-production.up.railway.app';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v2/metrics`);
      setMetrics(res.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Live Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Real-time system metrics and activity
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>NOW</Typography>
              <Typography variant="h3" sx={{ color: '#4caf50' }}>
                {metrics?.totals?.now || 0}
              </Typography>
              <Typography variant="body2">Immediate notifications</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>LATER</Typography>
              <Typography variant="h3" sx={{ color: '#ff9800' }}>
                {metrics?.totals?.later || 0}
              </Typography>
              <Typography variant="body2">Deferred notifications</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>NEVER</Typography>
              <Typography variant="h3" sx={{ color: '#f44336' }}>
                {metrics?.totals?.never || 0}
              </Typography>
              <Typography variant="body2">Suppressed notifications</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>TOTAL</Typography>
              <Typography variant="h3">
                {metrics?.totals?.total || 0}
              </Typography>
              <Typography variant="body2">All time</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Processing Modes</Typography>
            <Grid container spacing={2}>
              {metrics?.by_processing_mode && Object.entries(metrics.by_processing_mode).map(([mode, count]) => (
                <Grid item xs={4} key={mode}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip 
                      label={mode} 
                      sx={{ 
                        bgcolor: mode === 'groq_ai' ? '#2196f3' : mode === 'rule_based' ? '#9c27b0' : '#757575',
                        color: 'white',
                        mb: 1
                      }} 
                    />
                    <Typography variant="h5">{count}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Suppression Reasons</Typography>
            <Grid container spacing={2}>
              {metrics?.by_suppression_reason && Object.entries(metrics.by_suppression_reason).map(([reason, count]) => (
                <Grid item xs={6} key={reason}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{reason}:</Typography>
                    <Typography variant="body2" fontWeight="bold">{count}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}