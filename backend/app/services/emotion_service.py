"""
Real emotion detection service using MediaPipe
Completely independent of quiz performance
"""
import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Tuple, Optional
import logging
import time
from collections import deque

logger = logging.getLogger(__name__)

class EmotionDetector:
    def __init__(self):
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Emotion detection history for trend analysis
        self.emotion_history = deque(maxlen=10)
        self.attention_history = deque(maxlen=5)
        
        # Constants for facial feature analysis
        self.EYE_AR_THRESH = 0.25  # Eye aspect ratio threshold for attention
        self.MOUTH_AR_THRESH = 0.1  # Mouth aspect ratio for surprise/confusion
        
        logger.info("✅ Real Emotion Detector initialized with MediaPipe")
    
    def detect_emotion(self, image: np.ndarray) -> Dict[str, any]:
        """
        Detect REAL emotion from facial expressions
        Returns emotion independent of any other factors
        """
        try:
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process the image
            results = self.face_mesh.process(rgb_image)
            
            if not results.multi_face_landmarks:
                return {
                    'emotion': 'neutral',
                    'confidence': 0.5,
                    'intensity': 0.3,
                    'attention': 0.5,
                    'confusion': 0.0,
                    'trend': 'stable'
                }
            
            # Get face landmarks
            landmarks = results.multi_face_landmarks[0]
            
            # Extract facial features
            features = self._extract_facial_features(landmarks)
            
            # Analyze features to detect emotion
            emotion_analysis = self._analyze_emotion(features)
            
            # Calculate attention score
            attention = self._calculate_attention(features)
            
            # Calculate confusion level (based on brow furrow, etc.)
            confusion = self._calculate_confusion(features)
            
            # Track history for trend analysis
            self.emotion_history.append(emotion_analysis['emotion'])
            self.attention_history.append(attention)
            
            # Determine emotion trend
            trend = self._analyze_trend()
            
            return {
                'emotion': emotion_analysis['emotion'],
                'confidence': emotion_analysis['confidence'],
                'intensity': emotion_analysis['intensity'],
                'attention': attention,
                'confusion': confusion,
                'trend': trend,
                'timestamp': time.time()
            }
            
        except Exception as e:
            logger.error(f"Error detecting emotion: {e}")
            return {
                'emotion': 'neutral',
                'confidence': 0.5,
                'intensity': 0.3,
                'attention': 0.5,
                'confusion': 0.0,
                'trend': 'stable'
            }
    
    def _extract_facial_features(self, landmarks) -> Dict:
        """Extract key facial features for emotion detection"""
        try:
            # Eye landmarks (indices for left and right eyes)
            left_eye_indices = [33, 133, 157, 158, 159, 160, 161, 173]
            right_eye_indices = [362, 263, 387, 386, 385, 384, 398, 466]
            
            # Eyebrow landmarks
            left_brow = [46, 53, 52, 65]
            right_brow = [285, 295, 282, 283]
            
            # Mouth landmarks
            mouth_indices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0]
            
            # Calculate eye aspect ratio (EAR)
            left_ear = self._eye_aspect_ratio(landmarks, left_eye_indices[:6])
            right_ear = self._eye_aspect_ratio(landmarks, right_eye_indices[:6])
            avg_ear = (left_ear + right_ear) / 2.0
            
            # Calculate mouth aspect ratio (MAR)
            mar = self._mouth_aspect_ratio(landmarks)
            
            # Calculate eyebrow height
            left_brow_height = self._eyebrow_height(landmarks, left_brow)
            right_brow_height = self._eyebrow_height(landmarks, right_brow)
            
            # Calculate mouth width (smile detection)
            mouth_width = abs(landmarks.landmark[61].x - landmarks.landmark[291].x)
            
            # Calculate head pose (rough approximation)
            head_tilt = self._calculate_head_tilt(landmarks)
            
            return {
                'eye_aspect_ratio': avg_ear,
                'mouth_aspect_ratio': mar,
                'mouth_width': mouth_width,
                'left_brow_height': left_brow_height,
                'right_brow_height': right_brow_height,
                'head_tilt': head_tilt
            }
            
        except Exception as e:
            logger.error(f"Error extracting features: {e}")
            return {
                'eye_aspect_ratio': 0.3,
                'mouth_aspect_ratio': 0.05,
                'mouth_width': 0.1,
                'left_brow_height': 0.1,
                'right_brow_height': 0.1,
                'head_tilt': 0
            }
    
    def _eye_aspect_ratio(self, landmarks, eye_indices) -> float:
        """Calculate eye aspect ratio (blink/attention detection)"""
        try:
            # Vertical eye landmarks
            top = landmarks.landmark[eye_indices[1]]
            bottom = landmarks.landmark[eye_indices[4]]
            
            # Horizontal eye landmarks
            left = landmarks.landmark[eye_indices[0]]
            right = landmarks.landmark[eye_indices[3]]
            
            # Calculate distances
            vert_dist = abs(top.y - bottom.y)
            horz_dist = abs(right.x - left.x)
            
            if horz_dist == 0:
                return 0.3
            
            return vert_dist / horz_dist
            
        except:
            return 0.3
    
    def _mouth_aspect_ratio(self, landmarks) -> float:
        """Calculate mouth aspect ratio (surprise/confusion detection)"""
        try:
            # Top and bottom lip landmarks
            top_lip = landmarks.landmark[13]
            bottom_lip = landmarks.landmark[14]
            
            # Left and right mouth corners
            left_mouth = landmarks.landmark[61]
            right_mouth = landmarks.landmark[291]
            
            vert_dist = abs(top_lip.y - bottom_lip.y)
            horz_dist = abs(right_mouth.x - left_mouth.x)
            
            if horz_dist == 0:
                return 0.05
            
            return vert_dist / horz_dist
            
        except:
            return 0.05
    
    def _eyebrow_height(self, landmarks, brow_indices) -> float:
        """Calculate eyebrow height (surprise/frustration detection)"""
        try:
            brow_y = sum([landmarks.landmark[i].y for i in brow_indices]) / len(brow_indices)
            eye_y = landmarks.landmark[33].y  # Use left eye as reference
            
            return abs(brow_y - eye_y)
            
        except:
            return 0.1
    
    def _calculate_head_tilt(self, landmarks) -> float:
        """Approximate head tilt (engagement detection)"""
        try:
            left_eye = landmarks.landmark[33]
            right_eye = landmarks.landmark[362]
            
            return abs(left_eye.y - right_eye.y)
            
        except:
            return 0
    
    def _analyze_emotion(self, features: Dict) -> Dict:
        """
        Analyze facial features to determine real emotion
        Completely independent of external factors
        """
        emotion = 'neutral'
        confidence = 0.7
        intensity = 0.5
        
        # Happy detection (smile + relaxed brows)
        if features['mouth_width'] > 0.15 and features['mouth_aspect_ratio'] < 0.02:
            emotion = 'happy'
            confidence = 0.8 + (features['mouth_width'] * 0.2)
            intensity = features['mouth_width'] * 2
            
        # Surprise detection (wide eyes + open mouth)
        elif features['eye_aspect_ratio'] > 0.35 and features['mouth_aspect_ratio'] > 0.08:
            emotion = 'surprise'
            confidence = 0.75
            intensity = features['mouth_aspect_ratio'] * 5
            
        # Frustration detection (furrowed brows + narrowed eyes)
        elif (features['left_brow_height'] < 0.08 and 
              features['right_brow_height'] < 0.08 and 
              features['eye_aspect_ratio'] < 0.2):
            emotion = 'frustrated'
            confidence = 0.7
            intensity = 1 - (features['eye_aspect_ratio'] * 2)
            
        # Sadness detection (downturned mouth + lowered brows)
        elif features['mouth_aspect_ratio'] < 0.01 and features['eye_aspect_ratio'] < 0.2:
            emotion = 'sad'
            confidence = 0.65
            intensity = 0.5
            
        # Confusion detection (slightly furrowed brows + head tilt)
        elif (features['left_brow_height'] < 0.1 and 
              features['right_brow_height'] < 0.1 and 
              features['head_tilt'] > 0.02):
            emotion = 'confused'  # Adding new emotion
            confidence = 0.6
            intensity = features['head_tilt'] * 10
            
        return {
            'emotion': emotion,
            'confidence': min(confidence, 1.0),
            'intensity': min(intensity, 1.0)
        }
    
    def _calculate_attention(self, features: Dict) -> float:
        """Calculate attention score based on eye openness and head position"""
        attention = 0.5
        
        # Higher eye aspect ratio means more alert/attentive
        if features['eye_aspect_ratio'] > 0.25:
            attention += 0.3
        elif features['eye_aspect_ratio'] < 0.15:
            attention -= 0.2
            
        # Head tilt might indicate distraction
        if features['head_tilt'] > 0.05:
            attention -= 0.1
            
        return max(0.1, min(1.0, attention))
    
    def _calculate_confusion(self, features: Dict) -> float:
        """Calculate confusion level based on facial indicators"""
        confusion = 0.0
        
        # Furrowed brows indicate confusion
        if features['left_brow_height'] < 0.09 and features['right_brow_height'] < 0.09:
            confusion += 0.4
            
        # Slight mouth opening with neutral expression
        if 0.02 < features['mouth_aspect_ratio'] < 0.05:
            confusion += 0.3
            
        # Head tilt adds to confusion
        if features['head_tilt'] > 0.02:
            confusion += 0.2
            
        return min(1.0, confusion)
    
    def _analyze_trend(self) -> str:
        """Analyze emotion trend over time"""
        if len(self.emotion_history) < 5:
            return 'stable'
            
        # Count recent emotions
        recent = list(self.emotion_history)[-3:]
        
        # Check if improving (moving from negative to positive)
        negative_emotions = ['frustrated', 'sad', 'confused']
        positive_emotions = ['happy', 'surprise']
        
        if any(e in negative_emotions for e in recent[:2]) and recent[-1] in positive_emotions:
            return 'improving'
        elif any(e in positive_emotions for e in recent[:2]) and recent[-1] in negative_emotions:
            return 'worsening'
        else:
            return 'stable'