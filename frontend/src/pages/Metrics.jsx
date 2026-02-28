import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent,
  CircularProgress
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';

const API_BASE_URL = 'https://exquisite-harmony-production.up.railway.app';

export default function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
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

  const decisionData = [
    { name: 'NOW', value: metrics?.totals?.now || 0, color: '#4caf50' },
    { name: 'LATER', value: metrics?.totals?.later || 0, color: '#ff9800' },
    { name: 'NEVER', value: metrics?.totals?.never || 0, color: '#f44336' }
  ];

  const modeData = Object.entries(metrics?.by_processing_mode || {}).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>System Metrics</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Detailed analytics and trends
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Events</Typography>
              <Typography variant="h3">{metrics?.totals?.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: '#4caf50' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>NOW</Typography>
              <Typography variant="h4">{metrics?.totals?.now || 0}</Typography>
              <Typography variant="caption">
                {((metrics?.totals?.now / metrics?.totals?.total) * 100).toFixed(1)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: '#ff9800' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>LATER</Typography>
              <Typography variant="h4">{metrics?.totals?.later || 0}</Typography>
              <Typography variant="caption">
                {((metrics?.totals?.later / metrics?.totals?.total) * 100).toFixed(1)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: '#f44336' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>NEVER</Typography>
              <Typography variant="h4">{metrics?.totals?.never || 0}</Typography>
              <Typography variant="caption">
                {((metrics?.totals?.never / metrics?.totals?.total) * 100).toFixed(1)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Decision Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={decisionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Processing Modes</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>24-Hour Activity</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={metrics?.hourly_trend_24h || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id.hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}