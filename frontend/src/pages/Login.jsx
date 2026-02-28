import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: 'admin@cyepro.com', password: 'admin123' });

  const handleLogin = () => {
    navigate('/simulator');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" gutterBottom align="center">
            Notification Engine
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
            Demo Credentials (click to use)
          </Typography>
          
          <TextField
            fullWidth
            label="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            sx={{ mb: 3 }}
          />
          <Button fullWidth variant="contained" size="large" onClick={handleLogin}>
            Login as Admin
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}