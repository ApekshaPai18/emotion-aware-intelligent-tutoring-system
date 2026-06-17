import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Button, Alert, CircularProgress } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Emotion } from '../../types';

interface WebcamCaptureProps {
  onEmotionDetected?: (emotion: Emotion, confidence: number) => void;
  onFaceDetected?: (detected: boolean) => void;
  sessionId?: number;
  quizPerformance?: {
    correct: boolean;
    streak: number;
  };
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
  onEmotionDetected, 
  onFaceDetected,
  sessionId,
  quizPerformance 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [confidence, setConfidence] = useState(0.5);
  const [isDetecting, setIsDetecting] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Improved emotion detection based on facial features (NOT quiz performance)
  const detectEmotion = (): { emotion: Emotion; confidence: number } => {
    // This should be based on real facial analysis
    // For demo, we'll use a realistic distribution
    const emotions: Emotion[] = [
      'neutral', 'neutral', 'neutral',  // Most common
      'happy', 'happy',                  // Often happy
      'confused', 'confused',            // Sometimes confused
      'surprise',                         // Occasionally surprised
      'frustrated',                       // Rarely frustrated
      'sad'                               // Rarely sad
    ];
    
    const randomIndex = Math.floor(Math.random() * emotions.length);
    const selectedEmotion = emotions[randomIndex];
    
    // Confidence based on how definite the detection is
    let confidenceValue = 0.7 + Math.random() * 0.25;
    
    return { emotion: selectedEmotion, confidence: confidenceValue };
  };

  // Simulate face detection
  const checkFaceDetection = () => {
    const detected = Math.random() > 0.1; // 90% chance of face detected
    setFaceDetected(detected);
    if (onFaceDetected) {
      onFaceDetected(detected);
    }

    if (detected) {
      const { emotion, confidence } = detectEmotion();
      setCurrentEmotion(emotion);
      setConfidence(confidence);
      
      if (onEmotionDetected) {
        onEmotionDetected(emotion, confidence);
      }
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
        setError(null);
        
        // Start detection interval
        setIsDetecting(true);
        intervalRef.current = setInterval(checkFaceDetection, 2000); // Check every 2 seconds
      }
    } catch (err) {
      setError('Failed to access webcam. Please ensure camera permissions are granted.');
      console.error('Webcam error:', err);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    setIsDetecting(false);
    setFaceDetected(false);
  };

  const handleToggleWebcam = () => {
    if (isActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

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
    <Paper elevation={3} sx={{ p: 2, maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Emotion Detection
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ position: 'relative', mb: 2 }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 8,
            backgroundColor: '#000',
            transform: 'scaleX(-1)',
          }}
          muted
          playsInline
        />
        
        {!isActive && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 1,
            }}
          >
            <Typography color="white">Webcam is off</Typography>
          </Box>
        )}

        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 4,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: faceDetected ? '#4caf50' : '#f44336',
                animation: faceDetected ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            <Typography variant="body2">
              {faceDetected ? 'Face Detected' : 'No Face'}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          variant={isActive ? 'outlined' : 'contained'}
          color={isActive ? 'error' : 'primary'}
          startIcon={isActive ? <VideocamOffIcon /> : <VideocamIcon />}
          onClick={handleToggleWebcam}
        >
          {isActive ? 'Stop Webcam' : 'Start Webcam'}
        </Button>

        {isActive && isDetecting && faceDetected && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Emotion:
            </Typography>
            <Box
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 4,
                backgroundColor: getEmotionColor(currentEmotion),
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {currentEmotion}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {(confidence * 100).toFixed(0)}% confidence
            </Typography>
          </Box>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary">
        Note: This is a simulation. In production, actual ML models would be used.
      </Typography>
    </Paper>
  );
};

export default WebcamCapture;