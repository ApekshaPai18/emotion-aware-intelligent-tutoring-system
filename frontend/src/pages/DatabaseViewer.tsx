import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import StorageIcon from '@mui/icons-material/Storage';
import DownloadIcon from '@mui/icons-material/Download';

const API_BASE_URL = 'http://localhost:8000/api/v1';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DatabaseViewer: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const fetchDatabaseData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/database-export/`);
      setData(res.data);
      console.log('📊 Database Data:', res.data);
    } catch (err) {
      console.error('Error fetching database data:', err);
      setError('Failed to load database data');
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_export_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (tableName: string, tableData: any[]) => {
    if (!tableData.length) return;
    
    const headers = Object.keys(tableData[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of tableData) {
      const values = headers.map(header => {
        const val = row[header];
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading database data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" display="flex" alignItems="center" gap={1}>
              <StorageIcon /> Database Viewer
            </Typography>
            <Typography variant="subtitle1">
              View and export all data from your database
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={exportToJSON}
            startIcon={<DownloadIcon />}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Export All (JSON)
          </Button>
        </Box>
      </Paper>

      {/* Summary Cards */}
      {data?.summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ bgcolor: '#e3f2fd', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3">{data.summary.total_users}</Typography>
                <Typography variant="caption">Total Users</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ bgcolor: '#c8e6c9', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3">{data.summary.total_sessions}</Typography>
                <Typography variant="caption">Total Sessions</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ bgcolor: '#fff9c4', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3">{data.summary.total_interactions}</Typography>
                <Typography variant="caption">Total Interactions</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ bgcolor: '#f3e5f5', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3">{data.summary.total_emotion_detections}</Typography>
                <Typography variant="caption">Emotion Detections</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs for Different Tables */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Users (${data?.users?.length || 0})`} />
          <Tab label={`Sessions (${data?.sessions?.length || 0})`} />
          <Tab label={`Interactions (${data?.interactions?.length || 0})`} />
          <Tab label={`Leaderboard (${data?.leaderboard?.length || 0})`} />
        </Tabs>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button size="small" onClick={() => exportToCSV('users', data?.users || [])}>
              Export CSV
            </Button>
          </Box>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Sessions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.users?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Chip label={user.role} size="small" color={user.role === 'admin' ? 'error' : 'primary'} /></TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{user.total_sessions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Sessions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button size="small" onClick={() => exportToCSV('sessions', data?.sessions || [])}>
              Export CSV
            </Button>
          </Box>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Session ID</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell>Correct</TableCell>
                  <TableCell>Attempts</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.sessions?.map((session: any) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.id}</TableCell>
                    <TableCell>{session.user_id}</TableCell>
                    <TableCell>{new Date(session.start_time).toLocaleDateString()}</TableCell>
                    <TableCell>{session.total_questions}</TableCell>
                    <TableCell>{session.correct_answers}</TableCell>
                    <TableCell>{session.total_attempts}</TableCell>
                    <TableCell>
                      {session.total_questions > 0 
                        ? `${((session.correct_answers / session.total_questions) * 100).toFixed(1)}%`
                        : '0%'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Interactions Tab (Emotions + RL Actions) */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button size="small" onClick={() => exportToCSV('interactions', data?.interactions || [])}>
              Export CSV
            </Button>
          </Box>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Emotion</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>RL Action</TableCell>
                  <TableCell>Correct</TableCell>
                  <TableCell>Streak</TableCell>
                  <TableCell>Repeat</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.interactions?.slice().reverse().map((interaction: any) => (
                  <TableRow key={interaction.id}>
                    <TableCell>{interaction.id}</TableCell>
                    <TableCell>{interaction.user_id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={interaction.detected_emotion || 'N/A'} 
                        size="small"
                        color={
                          interaction.detected_emotion === 'happy' ? 'success' :
                          interaction.detected_emotion === 'sad' ? 'error' :
                          interaction.detected_emotion === 'neutral' ? 'default' : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell>{(interaction.emotion_confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      <Chip 
                        label={interaction.rl_action || 'N/A'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {interaction.is_correct ? '✅' : '❌'}
                    </TableCell>
                    <TableCell>{interaction.streak}</TableCell>
                    <TableCell>{interaction.repetition_count}</TableCell>
                    <TableCell>{new Date(interaction.timestamp).toLocaleTimeString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Leaderboard Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button size="small" onClick={() => exportToCSV('leaderboard', data?.leaderboard || [])}>
              Export CSV
            </Button>
          </Box>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Total Score</TableCell>
                  <TableCell>Best Streak</TableCell>
                  <TableCell>Sessions</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.leaderboard?.sort((a: any, b: any) => b.total_score - a.total_score).map((entry: any, idx: number) => (
                  <TableRow key={entry.user_id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{entry.user_id}</TableCell>
                    <TableCell><strong>{entry.total_score}</strong></TableCell>
                    <TableCell>{entry.best_streak}</TableCell>
                    <TableCell>{entry.total_sessions}</TableCell>
                    <TableCell>{new Date(entry.last_updated).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default DatabaseViewer;