import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import Login from './pages/Login';
import Simulator from './pages/Simulator';
import Dashboard from './pages/Dashboard';
import AuditLog from './pages/AuditLog';
import LaterQueue from './pages/LaterQueue';
import RulesManager from './pages/RulesManager';
import Metrics from './pages/Metrics';

function Navigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Notification Engine
        </Typography>
        <Button color="inherit" component={Link} to="/simulator">Simulator</Button>
        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
        <Button color="inherit" component={Link} to="/audit">Audit Log</Button>
        <Button color="inherit" component={Link} to="/queue">LATER Queue</Button>
        <Button color="inherit" component={Link} to="/rules">Rules</Button>
        <Button color="inherit" component={Link} to="/metrics">Metrics</Button>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Box className="app">
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/queue" element={<LaterQueue />} />
            <Route path="/rules" element={<RulesManager />} />
            <Route path="/metrics" element={<Metrics />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
}

export default App;