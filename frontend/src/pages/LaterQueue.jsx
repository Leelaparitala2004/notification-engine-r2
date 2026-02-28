import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import axios from 'axios';

export default function LaterQueue() {
  const [queue, setQueue] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      // Get LATER decisions from audit log
      const res = await axios.get(`http://localhost:5000/api/v2/history/test_user_123`, {
        params: { decision: 'later', limit: 50 }
      });
      setQueue(res.data.decisions || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessNow = async (event) => {
    try {
      // Reclassify as NOW
      const res = await axios.post('http://localhost:5000/api/v2/classify', {
        event_id: event.event_id,
        user_id: event.user_id,
        event_type: event.event_type,
        message: event.message,
        priority_hint: 'critical',
        channel: 'push'
      });
      setOpenDialog(false);
      fetchQueue();
    } catch (error) {
      console.error('Error processing:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>LATER Queue</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Deferred notifications waiting to be processed
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#fff3e0' }}>
              <TableCell>Scheduled Time</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queue.map((item) => (
              <TableRow key={item.event_id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="warning" fontSize="small" />
                    {item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : 'Pending'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={item.event_type} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {item.message}
                  </Typography>
                </TableCell>
                <TableCell>{item.user_id}</TableCell>
                <TableCell>{item.channel}</TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    onClick={() => {
                      setSelectedEvent(item);
                      setOpenDialog(true);
                    }}
                  >
                    Process Now
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Process Notification Now</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            This will reclassify the notification as NOW and send it immediately.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleProcessNow(selectedEvent)}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}