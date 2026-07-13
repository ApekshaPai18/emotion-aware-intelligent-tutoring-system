import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import axios from 'axios';

interface RLAnalytics {
  actionSuccessRates: Record<string, number>;
  averageReward: number;
  explorationRate: number;
  qTableSize: number;
  mostSuccessfulAction: string;
  leastSuccessfulAction: string;
}

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/v1`;

const RLPerformance: React.FC<{ userId: number }> = ({ userId }) => {
  const [analytics, setAnalytics] = useState<RLAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRLAnalytics();
  }, [userId]);

  const fetchRLAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/rl/analytics/${userId}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching RL analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (!analytics) return null;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
        <PsychologyIcon color="secondary" /> 🤖 RL Agent Performance
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {analytics.averageReward}
              </Typography>
              <Typography variant="caption">Avg Reward per Action</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {analytics.explorationRate}%
              </Typography>
              <Typography variant="caption">Exploration Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="subtitle2">🏆 Most Successful</Typography>
              <Typography variant="h6" color="success.main">
                {analytics.mostSuccessfulAction}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>⚠️ Needs Improvement</Typography>
              <Typography variant="body2" color="error.main">
                {analytics.leastSuccessfulAction}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="subtitle2" gutterBottom>Action Success Rates</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell align="right">Success Rate</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(analytics.actionSuccessRates).map(([action, rate]) => (
              <TableRow key={action}>
                <TableCell>{action}</TableCell>
                <TableCell align="right">{rate}%</TableCell>
                <TableCell align="right">
                  <Chip 
                    label={rate >= 70 ? 'Effective' : rate >= 50 ? 'Average' : 'Needs Work'}
                    size="small"
                    color={rate >= 70 ? 'success' : rate >= 50 ? 'warning' : 'error'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RLPerformance;
