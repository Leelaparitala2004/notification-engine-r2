import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, InputAdornment, Chip, FormControl, InputLabel,
  Select, MenuItem, Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterDecision, setFilterDecision] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Using a sample user_id - in production this would be from context
      const res = await axios.get(`http://localhost:5000/api/v2/history/test_user_123`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          decision: filterDecision || undefined
        }
      });
      setLogs(res.data.decisions || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, filterDecision]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDecisionColor = (decision) => {
    switch(decision) {
      case 'now': return 'success';
      case 'later': return 'warning';
      case 'never': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Audit Log</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Complete history of all classification decisions
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by event ID or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Decision</InputLabel>
              <Select
                value={filterDecision}
                label="Filter by Decision"
                onChange={(e) => setFilterDecision(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="now">NOW</MenuItem>
                <MenuItem value="later">LATER</MenuItem>
                <MenuItem value="never">NEVER</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Timestamp</TableCell>
              <TableCell>Event ID</TableCell>
              <TableCell>Decision</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Mode</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.event_id} hover>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {log.event_id?.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={log.decision.toUpperCase()} 
                    color={getDecisionColor(log.decision)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.reason}</TableCell>
                <TableCell>{(log.confidence * 100).toFixed(0)}%</TableCell>
                <TableCell>
                  <Chip 
                    label={log.processing_mode} 
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}