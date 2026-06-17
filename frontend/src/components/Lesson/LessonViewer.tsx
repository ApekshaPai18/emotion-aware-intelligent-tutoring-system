import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import { Lesson } from '../../types';

interface LessonViewerProps {
  lesson: Lesson;
  onNext: () => void;
  onQuiz: () => void;
  disableQuiz?: boolean;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, onNext, onQuiz, disableQuiz = false }) => {
  const getDifficultyColor = (difficulty: number): 'success' | 'warning' | 'error' => {
    if (difficulty <= 2) return 'success';
    if (difficulty <= 4) return 'warning';
    return 'error';
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          {lesson.title}
        </Typography>
        <Chip
          label={`Difficulty: ${lesson.difficulty}/5`}
          color={getDifficultyColor(lesson.difficulty)}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ my: 3 }}>
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="contained" onClick={onNext}>
          Next Lesson
        </Button>
        <Button 
          variant="outlined" 
          onClick={onQuiz}
          disabled={disableQuiz}
        >
          {disableQuiz ? 'Complete all lessons first' : 'Go to Quiz'}
        </Button>
      </Box>
    </Paper>
  );
};

export default LessonViewer;