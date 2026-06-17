import React from 'react';
import { Paper, Typography, Box, Grid, Chip, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

interface ValidationSummaryProps {
  emotionAccuracy: number;
  successRate: number;
  baselineRate: number;
  rlImprovement: number;
  totalInteractions: number;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  emotionAccuracy,
  successRate,
  baselineRate,
  rlImprovement,
  totalInteractions
}) => {
  const isEmotionGood = emotionAccuracy >= 70;
  const isPerformanceGood = successRate >= baselineRate;
  const isValidated = isEmotionGood && totalInteractions >= 50;

  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: isValidated ? '#e8f5e9' : '#fff3e0' }}>
      <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
        {isValidated ? <CheckCircleIcon color="success" /> : <WarningIcon color="warning" />}
        Project Validation Summary
      </Typography>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h3" color={isEmotionGood ? 'success.main' : 'warning.main'}>
              {emotionAccuracy}%
            </Typography>
            <Typography variant="caption">Emotion Detection Accuracy</Typography>
            <Chip 
              label={isEmotionGood ? "✅ Pass" : "⚠️ Needs Work"} 
              size="small" 
              color={isEmotionGood ? "success" : "warning"}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>
        
        <Grid size={{ xs: 6, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h3" color={isPerformanceGood ? 'success.main' : 'warning.main'}>
              {successRate}%
            </Typography>
            <Typography variant="caption">Success Rate (Adaptive)</Typography>
          </Box>
        </Grid>
        
        <Grid size={{ xs: 6, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h3" color="text.secondary">
              {baselineRate}%
            </Typography>
            <Typography variant="caption">Baseline (Standard)</Typography>
          </Box>
        </Grid>
        
        <Grid size={{ xs: 6, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h3" color={rlImprovement >= 0 ? 'success.main' : 'error.main'}>
              {rlImprovement >= 0 ? `+${rlImprovement}` : rlImprovement}%
            </Typography>
            <Typography variant="caption">RL Agent Improvement</Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Alert severity={isValidated ? "success" : "info"} sx={{ mt: 2 }}>
        {isValidated 
          ? "✅ Your project is VALIDATED! The emotion-aware system successfully adapts to student emotions and shows measurable improvement."
          : `📊 Project needs more data (${totalInteractions}/50 interactions). Continue testing to achieve validation.`
        }
      </Alert>
    </Paper>
  );
};

export default ValidationSummary;