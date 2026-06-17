import { useState, useCallback, useRef, useEffect } from 'react';
import { Emotion } from '../types';

interface RealEmotionData {
  emotion: Emotion;
  confidence: number;
  intensity: number;
  attention: number;
  confusion: number;
  trend: 'improving' | 'stable' | 'worsening';
}

export const useRealEmotion = () => {
  const [emotionData, setEmotionData] = useState<RealEmotionData>({
    emotion: 'neutral',
    confidence: 0.5,
    intensity: 0.3,
    attention: 0.5,
    confusion: 0,
    trend: 'stable'
  });
  
  const [isDetecting, setIsDetecting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Define simulateRealEmotionDetection FIRST (before it's used)
  const simulateRealEmotionDetection = useCallback(() => {
    // Random but realistic emotion transitions
    const emotions: Emotion[] = ['neutral', 'neutral', 'happy', 'surprise', 'confused', 'frustrated', 'sad'];
    const randomIndex = Math.floor(Math.random() * emotions.length);
    
    setEmotionData(prev => ({
      emotion: emotions[randomIndex],
      confidence: 0.6 + Math.random() * 0.3,
      intensity: 0.3 + Math.random() * 0.5,
      attention: 0.4 + Math.random() * 0.5,
      confusion: Math.random() * 0.8,
      trend: Math.random() > 0.7 ? 'improving' : Math.random() > 0.5 ? 'worsening' : 'stable'
    }));
  }, []);

  // Now define analyzeFrame which uses simulateRealEmotionDetection
  const analyzeFrame = useCallback((videoElement: HTMLVideoElement) => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // In production: send canvas.toDataURL() to backend
      // For demo: simulate realistic emotion changes
      simulateRealEmotionDetection();
    }
    
    animationFrameRef.current = requestAnimationFrame(() => analyzeFrame(videoElement));
  }, [simulateRealEmotionDetection]);

  const startDetection = useCallback((videoElement: HTMLVideoElement) => {
    setIsDetecting(true);
    analyzeFrame(videoElement);
  }, [analyzeFrame]);

  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsDetecting(false);
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    emotionData,
    isDetecting,
    startDetection,
    stopDetection
  };
};