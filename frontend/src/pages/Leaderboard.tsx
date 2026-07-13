import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';

// ✅ FIXED: Use backticks (`) not single quotes (')
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/v1`;

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_score: number;
  total_questions: number;
  correct_answers: number;
  best_streak: number;
  total_sessions: number;
  accuracy: number;
  emotion_transitions: number;
}

interface ScoreBreakdown {
  base_score: number;
  attempt_penalty: number;
  streak_bonus: number;
  emotion_points: number;
  total_score: number;
  explanation: string;
}

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leaderboard/`);
      setLeaderboard(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
      setLoading(false);
    }
  };

  const fetchScoreBreakdown = async (entry: LeaderboardEntry) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/${entry.user_id}`);
      const data = res.data;

      const correct = data.user.total_correct;
      const totalAttempts = data.user.total_attempts || 0;
      const streak = data.user.best_streak || 0;

      const baseScore = correct * 10;
      const attemptPenalty = totalAttempts * 2;
      const streakBonus = streak * 5;
      const totalScore = baseScore - attemptPenalty + streakBonus;

      const explanation = `Score = (${correct}×10) - (${totalAttempts}×2) + (${streak}×5) = ${totalScore}`;

      setScoreBreakdown({
        base_score: baseScore,
        attempt_penalty: attemptPenalty,
        streak_bonus: streakBonus,
        emotion_points: 0,
        total_score: totalScore,
        explanation
      });
      setSelectedUser(entry);
      setBreakdownOpen(true);
    } catch (err) {
      console.error('Error fetching breakdown:', err);
      alert('Could not fetch score breakdown');
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#2196f3';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading leaderboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4">🏆 Leaderboard</Typography>
            <Typography variant="subtitle1">
              Top performers ranked by total score
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Home
          </Button>
        </Box>
      </Paper>

      {/* Score Formula Explanation */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="body2" align="center">
          <strong>📊 Score Formula:</strong>{' '}
          (Correct × 10) − (Attempts × 2) + (Best Streak × 5)
        </Typography>
        <Typography variant="caption" align="center" display="block" color="text.secondary">
          Scores reflect academic performance only
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Leaderboard Table */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>📊 Full Ranking</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell align="center">Rank</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Accuracy</TableCell>
                <TableCell align="right">Streak</TableCell>
                <TableCell align="right">Sessions</TableCell>
                <TableCell align="center">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow key={entry.user_id} hover>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {getRankIcon(entry.rank) && (
                        <Typography variant="h6">{getRankIcon(entry.rank)}</Typography>
                      )}
                      <Chip
                        label={`#${entry.rank}`}
                        size="small"
                        sx={{
                          bgcolor:
                            entry.rank === 1
                              ? '#FFD700'
                              : entry.rank === 2
                              ? '#C0C0C0'
                              : entry.rank === 3
                              ? '#CD7F32'
                              : '#e0e0e0',
                          color: entry.rank <= 3 ? 'black' : 'inherit',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: getScoreColor(entry.total_score) }}>
                        {entry.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight="500">
                        {entry.username}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color={getScoreColor(entry.total_score)}>
                      {entry.total_score}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Chip
                      label={`${entry.accuracy}%`}
                      size="small"
                      color={entry.accuracy >= 70 ? 'success' : entry.accuracy >= 50 ? 'warning' : 'error'}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      <TrendingUpIcon fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight="bold">{entry.best_streak}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      <SchoolIcon fontSize="small" color="secondary" />
                      <Typography variant="body2">{entry.total_sessions}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="View Score Breakdown">
                      <IconButton size="small" onClick={() => fetchScoreBreakdown(entry)}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Score Breakdown Dialog */}
      <Dialog open={breakdownOpen} onClose={() => setBreakdownOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#667eea', color: 'white' }}>
          📊 Score Breakdown: {selectedUser?.username}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {scoreBreakdown && (
            <Box>
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#e8f5e9' }}>
                <Typography variant="subtitle1" fontWeight="bold">📈 Calculation:</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    • Correct Answers: {scoreBreakdown.base_score / 10} × 10 ={' '}
                    <strong>+{scoreBreakdown.base_score}</strong>
                  </Typography>
                  <Typography variant="body2" color="error">
                    • Total Attempts: {scoreBreakdown.attempt_penalty / 2} × 2 ={' '}
                    <strong>−{scoreBreakdown.attempt_penalty}</strong>
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    • Best Streak: {scoreBreakdown.streak_bonus / 5} × 5 ={' '}
                    <strong>+{scoreBreakdown.streak_bonus}</strong>
                  </Typography>
                  <Box sx={{ borderTop: '1px solid #ccc', mt: 1, pt: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      TOTAL SCORE:{' '}
                      <strong style={{ color: '#4caf50' }}>
                        {scoreBreakdown.total_score}
                      </strong>
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                <Typography variant="subtitle1" fontWeight="bold">💡 Explanation:</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {scoreBreakdown.explanation}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBreakdownOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button variant="contained" onClick={() => navigate('/')}>
          Start New Learning Session
        </Button>
      </Box>
    </Container>
  );
};

export default Leaderboard;
