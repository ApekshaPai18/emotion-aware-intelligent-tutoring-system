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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GroupIcon from '@mui/icons-material/Group';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// ✅ FIXED: Use backticks (`) not single quotes (')
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/v1`;

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  total_sessions: number;
  total_questions: number;
  total_correct: number;
}

interface DashboardData {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: string;
    total_sessions: number;
    total_questions_answered: number;
    total_correct: number;
    total_attempts: number;
    avg_attempts_per_question: number;
    best_streak: number;
    emotion_transitions?: number;
    total_score?: number;
  };
  sessions: Array<{
    id: number;
    start_time: string;
    total_questions: number;
    correct_answers: number;
    total_attempts: number;
    score_percentage: number;
  }>;
  question_attempts: Array<{
    question_id: string;
    attempts: number;
    success: boolean;
  }>;
}

interface RLPerformance {
  total_interactions: number;
  action_success_rates: Record<string, number>;
  best_action: string;
  worst_action: string;
  best_action_success: number;
  worst_action_success: number;
  early_success_rate: number;
  late_success_rate: number;
  improvement_percentage: number;
  is_learning: boolean;
  overall_success: number;
}

interface QTableStats {
  status: string;
  table_size: number;
  learned_states: number;
  learning_progress: number;
  avg_q_value: number;
  max_q_value: number;
  interpretation: string;
}

interface OverallStats {
  total_users: number;
  total_sessions: number;
  total_questions: number;
  total_correct: number;
  total_attempts: number;
  overall_success_rate: number;
  avg_questions_per_user: number;
  avg_correct_per_user: number;
}

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, userName, userRole } = location.state || {};
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [rlPerformance, setRlPerformance] = useState<RLPerformance | null>(null);
  const [qTableStats, setQTableStats] = useState<QTableStats | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId || userRole !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
    fetchOverallStats();
  }, [userId]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users/`);
      setUsers(res.data);
      if (res.data.length > 0 && !selectedUserId) {
        setSelectedUserId(res.data[0].id);
        fetchUserDashboard(res.data[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/overall-stats/`);
      setOverallStats(res.data);
      console.log('📊 Overall Stats:', res.data);
    } catch (err) {
      console.error('Error fetching overall stats:', err);
    }
  };

  const fetchRLPerformance = async (uid: number) => {
    try {
      const [perfRes, qTableRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/rl/performance/${uid}`),
        axios.get(`${API_BASE_URL}/rl/q_table_stats`)
      ]);
      setRlPerformance(perfRes.data);
      setQTableStats(qTableRes.data);
      console.log('📊 RL Performance:', perfRes.data);
    } catch (err) {
      console.error('Error fetching RL performance:', err);
    }
  };

  const fetchUserDashboard = async (uid: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/dashboard/${uid}`);
      setDashboardData(res.data);
      await fetchRLPerformance(uid);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load user dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (event: any) => {
    const uid = event.target.value;
    setSelectedUserId(uid);
    fetchUserDashboard(uid);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const getScoreBackgroundColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#2196f3';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  };

  const calculateMetrics = () => {
    if (!dashboardData) return null;
    
    const streakBonus = (dashboardData.user.best_streak || 0) * 5;
    const baseScore = dashboardData.user.total_correct * 10;
    const attemptPenalty = dashboardData.user.total_attempts * 2;
    const totalScore = baseScore - attemptPenalty + streakBonus;
    const accuracy = (dashboardData.user.total_correct / dashboardData.user.total_questions_answered * 100).toFixed(1);
    
    return { streakBonus, baseScore, attemptPenalty, totalScore, accuracy };
  };

  const metrics = calculateMetrics();

  const getOverallSuccessRate = () => {
    if (rlPerformance?.overall_success) {
      return rlPerformance.overall_success;
    }
    if (metrics?.accuracy) {
      return parseFloat(metrics.accuracy);
    }
    return 0;
  };

  const getActionColor = (rate: number): "success" | "warning" | "error" | "info" | "default" => {
    if (rate >= 70) return 'success';
    if (rate >= 50) return 'warning';
    if (rate > 0) return 'error';
    return 'info';
  };

  if (loading && users.length === 0) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading admin dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Admin Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #dc004e 0%, #b0003a 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4">👑 Admin Dashboard</Typography>
            <Typography variant="subtitle1">
              Welcome, {userName || 'Admin'}! Manage all learners
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Home
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/leaderboard')}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Leaderboard
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* OVERALL STATISTICS CARD */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#e8f5e9' }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <GroupIcon color="primary" /> 📊 OVERALL STATISTICS (All Users)
        </Typography>
        
        {overallStats && overallStats.total_users > 0 ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 2 }}>
              <Card sx={{ bgcolor: '#e3f2fd', textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <PeopleIcon color="primary" sx={{ fontSize: 30 }} />
                  <Typography variant="h4">{overallStats.total_users}</Typography>
                  <Typography variant="caption">Total Users</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 6, md: 2 }}>
              <Card sx={{ bgcolor: '#c8e6c9', textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <TrendingUpIcon color="success" sx={{ fontSize: 30 }} />
                  <Typography variant="h4">{overallStats.overall_success_rate}%</Typography>
                  <Typography variant="caption">Avg Success Rate</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 6, md: 2 }}>
              <Card sx={{ bgcolor: '#fff9c4', textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <SchoolIcon color="warning" sx={{ fontSize: 30 }} />
                  <Typography variant="h4">{overallStats.total_sessions}</Typography>
                  <Typography variant="caption">Total Sessions</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 6, md: 2 }}>
              <Card sx={{ bgcolor: '#ffccbc', textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <QuestionAnswerIcon sx={{ fontSize: 30, color: '#ff9800' }} />
                  <Typography variant="h4">{overallStats.total_questions}</Typography>
                  <Typography variant="caption">Total Questions</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 6, md: 2 }}>
              <Card sx={{ bgcolor: '#e1bee7', textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <CheckCircleIcon color="secondary" sx={{ fontSize: 30 }} />
                  <Typography variant="h4">{overallStats.total_correct}</Typography>
                  <Typography variant="caption">Total Correct</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 6, md: 2 }}>
              <Card sx={{ bgcolor: '#b3e5fc', textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <TimelineIcon sx={{ fontSize: 30, color: '#2196f3' }} />
                  <Typography variant="h4">{overallStats.total_attempts}</Typography>
                  <Typography variant="caption">Total Attempts</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No data yet. Complete some learning sessions first.
          </Typography>
        )}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* User Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <PeopleIcon color="primary" />
          <Typography variant="h6">Select Student to View</Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedUserId || ''}
              onChange={handleUserChange}
              label="Select Student"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username} ({user.role}) - {user.total_correct}/{user.total_questions} correct
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={() => selectedUserId && fetchUserDashboard(selectedUserId)}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {dashboardData && metrics && (
        <>
          {/* Score Formula Explanation */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" align="center">
              <strong>📊 Score Formula:</strong>{' '}
              (Correct × 10) − (Attempts × 2) + (Best Streak × 5)
            </Typography>
            <Typography variant="caption" align="center" display="block" color="text.secondary">
              Based on performance across all 10 questions (5 Baseline + 5 Adaptive)
            </Typography>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">Total Score</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: getScoreBackgroundColor(metrics.totalScore) }}>
                    {metrics.totalScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dashboardData.user.total_correct} correct | Streak: +{metrics.streakBonus}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">Accuracy</Typography>
                  </Box>
                  <Typography variant="h4">{metrics.accuracy}%</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dashboardData.user.total_correct}/{dashboardData.user.total_questions_answered}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimelineIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">Best Streak</Typography>
                  </Box>
                  <Typography variant="h4">{dashboardData.user.best_streak}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    consecutive correct answers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmojiEventsIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">Sessions</Typography>
                  </Box>
                  <Typography variant="h4">{dashboardData.user.total_sessions}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    learning sessions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* RL Agent Performance Card */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#f3e5f5' }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <PsychologyIcon color="secondary" /> 🤖 RL Agent Performance Validation
            </Typography>
            
            {rlPerformance && rlPerformance.total_interactions > 0 ? (
              <>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ bgcolor: '#e1bee7', height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3">{rlPerformance.total_interactions}</Typography>
                        <Typography variant="caption">Total RL Decisions</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ bgcolor: '#c8e6c9', height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="success.main">
                          {rlPerformance.best_action_success}%
                        </Typography>
                        <Typography variant="caption">Best Action: {rlPerformance.best_action}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ bgcolor: '#ffcdd2', height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="error.main">
                          {rlPerformance.worst_action_success}%
                        </Typography>
                        <Typography variant="caption">Worst Action: {rlPerformance.worst_action}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ bgcolor: '#fff9c4', height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="warning.main">
                          {getOverallSuccessRate()}%
                        </Typography>
                        <Typography variant="caption">Overall Success Rate</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Action Performance Breakdown:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {Object.entries(rlPerformance.action_success_rates || {}).map(([action, rate]) => (
                      <Chip 
                        key={action}
                        label={`${action}: ${rate}%`}
                        color={getActionColor(rate)}
                        size="medium"
                        sx={{ fontWeight: 'bold', minWidth: 100 }}
                      />
                    ))}
                  </Box>
                </Box>
                
                <Alert 
                  severity={rlPerformance.is_learning ? "success" : "info"} 
                  sx={{ mt: 2 }}
                >
                  <strong>{rlPerformance.is_learning ? "✅ RL Agent IS LEARNING!" : "📊 RL Agent Performance"}</strong>
                  <br />
                  Early sessions: {rlPerformance.early_success_rate}% → Recent sessions: {rlPerformance.late_success_rate}%
                  {rlPerformance.is_learning && ` (+${rlPerformance.improvement_percentage}% improvement)`}
                </Alert>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Complete more learning sessions for RL agent to gather performance data.
              </Typography>
            )}
            
            {qTableStats && qTableStats.status === "active" && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8eaf6', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="bold">🧠 Q-Learning Progress</Typography>
                <Typography variant="caption" display="block">
                  {qTableStats.interpretation || `Explored ${qTableStats.learning_progress}% of state space`}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={qTableStats.learning_progress || 0} 
                  sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Explored: {(qTableStats.learning_progress || 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    States: {qTableStats.learned_states || 0} / {qTableStats.table_size || 1728}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Score Breakdown */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>📈 Score Breakdown</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="success.main">➕ Positive Contributions</Typography>
                  <Typography variant="body2">
                    • Correct Answers: {dashboardData.user.total_correct} × 10 = <strong>+{dashboardData.user.total_correct * 10}</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Best Streak: {dashboardData.user.best_streak} × 5 = <strong>+{metrics.streakBonus}</strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="error.main">➖ Negative Contributions</Typography>
                  <Typography variant="body2">
                    • Total Attempts: {dashboardData.user.total_attempts} × 2 = <strong>-{dashboardData.user.total_attempts * 2}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Avg Attempts per Question: {dashboardData.user.avg_attempts_per_question}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" align="center">
                FINAL SCORE: {metrics.totalScore}
              </Typography>
              <Typography variant="caption" align="center" display="block" color="text.secondary">
                Formula: ({dashboardData.user.total_correct}×10) − ({dashboardData.user.total_attempts}×2) + ({dashboardData.user.best_streak}×5)
                = {dashboardData.user.total_correct * 10} - {dashboardData.user.total_attempts * 2} + {metrics.streakBonus} = {metrics.totalScore}
              </Typography>
            </Box>
          </Paper>

          {/* Session History */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>📅 Session History</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Questions</TableCell>
                    <TableCell align="right">Correct</TableCell>
                    <TableCell align="right">Attempts</TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{new Date(session.start_time).toLocaleDateString()}</TableCell>
                      <TableCell align="right">{session.total_questions}</TableCell>
                      <TableCell align="right">{session.correct_answers}</TableCell>
                      <TableCell align="right">{session.total_attempts}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${session.score_percentage}%`} 
                          size="small"
                          color={getScoreColor(session.score_percentage)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Question Attempt Details */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>📝 Question Attempt Details</Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {dashboardData.question_attempts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No question attempts recorded yet.
                </Typography>
              ) : (
                dashboardData.question_attempts.map((q, idx) => (
                  <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Question {idx + 1}:</strong> {q.question_id}
                      </Typography>
                      <Chip 
                        label={q.success ? 'Solved ✅' : 'Not Solved ❌'} 
                        size="small"
                        color={q.success ? 'success' : 'error'}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Attempts: <strong>{q.attempts}</strong>
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, (1 / q.attempts) * 100)} 
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button variant="contained" onClick={() => navigate('/')}>
              Home
            </Button>
            <Button variant="outlined" onClick={() => navigate('/leaderboard')}>
              View Leaderboard
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/database')}
            >
              View Database
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
