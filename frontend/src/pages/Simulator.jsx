import { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, 
  Grid, MenuItem, Alert, Chip, Divider 
} from '@mui/material';
import axios from 'axios';

export default function Simulator() {
  const [event, setEvent] = useState({
    user_id: 'test_user_123',
    event_type: 'security_alert',
    message: 'Test notification',
    priority_hint: 'medium',
    channel: 'push',
    source: 'test'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const eventTypes = ['security_alert', 'payment', 'order_shipped', 'promo', 'marketing', 'system', 'message'];
  const channels = ['push', 'sms', 'email', 'in_app'];
  const priorities = ['critical', 'high', 'medium', 'low'];

  const submitEvent = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/v2/classify', event);
      setResult(res.data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to classify' });
    } finally {
      setLoading(false);
    }
  };

  const getColor = (decision) => {
    switch(decision) {
      case 'now': return '#4caf50';
      case 'later': return '#ff9800';
      case 'never': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Event Simulator</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Test how the engine classifies different notification events
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Event Details</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="User ID" 
                  value={event.user_id} 
                  onChange={(e) => setEvent({...event, user_id: e.target.value})} 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  select 
                  fullWidth 
                  label="Event Type" 
                  value={event.event_type} 
                  onChange={(e) => setEvent({...event, event_type: e.target.value})}
                >
                  {eventTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Message" 
                  multiline 
                  rows={3} 
                  value={event.message} 
                  onChange={(e) => setEvent({...event, message: e.target.value})} 
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  select 
                  fullWidth 
                  label="Priority" 
                  value={event.priority_hint} 
                  onChange={(e) => setEvent({...event, priority_hint: e.target.value})}
                >
                  {priorities.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  select 
                  fullWidth 
                  label="Channel" 
                  value={event.channel} 
                  onChange={(e) => setEvent({...event, channel: e.target.value})}
                >
                  {channels.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  fullWidth 
                  label="Source" 
                  value={event.source} 
                  onChange={(e) => setEvent({...event, source: e.target.value})} 
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={submitEvent}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Classifying...' : 'Classify Event'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {result && !result.error && (
            <Paper sx={{ p: 3, borderLeft: 6, borderColor: getColor(result.decision) }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Classification Result</Typography>
                <Chip 
                  label={result.decision?.toUpperCase()} 
                  sx={{ 
                    bgcolor: getColor(result.decision),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                <strong>Reason:</strong> {result.reason}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%
              </Typography>
              
              {result.scheduled_at && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Scheduled:</strong> {new Date(result.scheduled_at).toLocaleString()}
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary">
                <strong>Mode:</strong> {result.processing_mode}
              </Typography>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Pipeline Stages</Typography>
              {result.pipeline_stages?.map((stage, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip size="small" label={stage.stage} />
                  <Typography variant="body2">{stage.result}</Typography>
                </Box>
              ))}
            </Paper>
          )}

          {result?.error && (
            <Paper sx={{ p: 3, bgcolor: '#ffebee' }}>
              <Alert severity="error">{result.error}</Alert>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}