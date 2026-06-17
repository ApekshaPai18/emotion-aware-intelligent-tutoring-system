import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { Question } from '../../types';

interface QuizDisplayProps {
  question?: Question;
  onAnswer: (isCorrect: boolean) => void;
  showHint?: boolean;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ question, onAnswer, showHint }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);

  if (!question) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading question...
        </Typography>
      </Paper>
    );
  }

  if (!question.question_text || !question.options || !question.correct_answer) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">
          Invalid question format. Please try again.
        </Alert>
      </Paper>
    );
  }

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    const correct = selectedOption === question.correct_answer;
    setIsCorrect(correct);
    setSubmitted(true);
    setShowResult(true);
    
    // Don't show the correct answer, just whether it was right or wrong
    setTimeout(() => {
      setShowResult(false);
      onAnswer(correct);
    }, 1500);
  };

  const handleNext = () => {
    setSelectedOption('');
    setSubmitted(false);
    setShowResult(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Quiz Question
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            {question.question_text}
          </Typography>
        </CardContent>
      </Card>

      {showHint && question.hint && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Hint:</Typography>
          {question.hint}
        </Alert>
      )}

      <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
        <RadioGroup
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          {question.options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={option}
              control={<Radio />}
              label={option}
              disabled={submitted}
              sx={{
                mb: 1,
                p: 1,
                borderRadius: 1,
                // Only show red for wrong answer, NOT the correct answer
                ...(showResult && !isCorrect && selectedOption === option && {
                  backgroundColor: '#ffebee',
                  border: '1px solid #f44336',
                }),
                // Don't highlight the correct answer at all
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {showResult && (
        <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mb: 3 }}>
          {isCorrect ? '✅ Correct! Great job!' : '❌ Not quite right. Try again!'}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {!submitted ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedOption}
          >
            Submit Answer
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            {isCorrect ? 'Next Question' : 'Try Again'}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default QuizDisplay;