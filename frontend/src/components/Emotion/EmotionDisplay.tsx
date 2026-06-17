import React from 'react';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import { Emotion } from '../../types';
import {
  SentimentVerySatisfied as HappyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as SadIcon,
  MoodBad as FrustratedIcon,
  EmojiEmotions as SurpriseIcon,
  Help as ConfusedIcon  // Add this import
} from '@mui/icons-material';

interface EmotionDisplayProps {
  emotion: Emotion;
  confidence: number;
  size?: 'small' | 'medium' | 'large';
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ emotion, confidence, size = 'medium' }) => {
  const getIconSize = (): { fontSize: 'small' | 'medium' | 'large' | 'inherit' } => {
    switch (size) {
      case 'small':
        return { fontSize: 'small' };
      case 'medium':
        return { fontSize: 'medium' };
      case 'large':
        return { fontSize: 'large' };
      default:
        return { fontSize: 'medium' };
    }
  };

  const getEmotionIcon = () => {
    const iconSize = getIconSize();

    switch (emotion) {
      case 'happy':
        return <HappyIcon {...iconSize} sx={{ color: '#4caf50' }} />;
      case 'neutral':
        return <NeutralIcon {...iconSize} sx={{ color: '#9e9e9e' }} />;
      case 'sad':
        return <SadIcon {...iconSize} sx={{ color: '#2196f3' }} />;
      case 'frustrated':
        return <FrustratedIcon {...iconSize} sx={{ color: '#f44336' }} />;
      case 'surprise':
        return <SurpriseIcon {...iconSize} sx={{ color: '#ff9800' }} />;
      case 'confused':
        return <ConfusedIcon {...iconSize} sx={{ color: '#7e57c2' }} />;  // Purple for confused
      default:
        return <NeutralIcon {...iconSize} />;
    }
  };

  const getEmotionDescription = (): string => {
    switch (emotion) {
      case 'happy':
        return 'You seem happy! Great for learning.';
      case 'neutral':
        return 'Neutral state. Ready to learn.';
      case 'sad':
        return 'Feeling sad? Take a break if needed.';
      case 'frustrated':
        return 'Feeling frustrated? Let\'s try a different approach.';
      case 'surprise':
        return 'Surprised? That means you\'re engaged!';
      case 'confused':
        return 'Feeling confused? Let me explain differently.';
      default:
        return '';
    }
  };

  const getEmotionColor = (emotion: Emotion): string => {
    const colors = {
      happy: '#4caf50',
      neutral: '#9e9e9e',
      sad: '#2196f3',
      frustrated: '#f44336',
      surprise: '#ff9800',
      confused: '#7e57c2'
    };
    return colors[emotion];
  };

  return (
    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
      <Box sx={{ mb: 2 }}>{getEmotionIcon()}</Box>
      
      <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
        {emotion}
      </Typography>
      
      <Box sx={{ width: '100%', mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={confidence * 100}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getEmotionColor(emotion),
            },
          }}
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Confidence: {(confidence * 100).toFixed(1)}%
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {getEmotionDescription()}
      </Typography>
    </Paper>
  );
};

export default EmotionDisplay;