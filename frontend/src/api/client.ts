import axios from 'axios';
import { User, UserCreate, LearnerState, Interaction, Session } from '../types';

// Use environment variable for API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createUser = async (userData: UserCreate): Promise<User> => {
  try {
    const response = await api.post<User>('/users/', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (userId: number): Promise<User> => {
  try {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const createSession = async (userId: number): Promise<{ session_id: number; message: string }> => {
  try {
    const response = await api.post(`/sessions/?user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const getSession = async (sessionId: number): Promise<Session> => {
  try {
    const response = await api.get<Session>(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
};

export const getNextAction = async (state: LearnerState): Promise<{ action: string; explanation: string; confidence: number }> => {
  try {
    const response = await api.post('/get-next-action/', state);
    return response.data;
  } catch (error) {
    console.error('Error getting next action:', error);
    throw error;
  }
};

export const recordInteraction = async (interaction: {
  user_id: number;
  session_id: number;
  lesson_id: string;
  question_id?: string;
  is_correct?: boolean;
  detected_emotion: string;
  emotion_confidence: number;
  rl_action: string;
}): Promise<any> => {
  try {
    // Format the data exactly as the backend expects
    const backendData = {
      user_id: interaction.user_id,
      session_id: interaction.session_id,
      lesson_id: interaction.lesson_id,
      question_id: interaction.question_id,
      is_correct: interaction.is_correct,
      detected_emotion: interaction.detected_emotion,
      emotion_confidence: interaction.emotion_confidence,
      rl_action: interaction.rl_action
    };
    
    console.log('Sending interaction:', backendData);
    const response = await api.post('/interactions/', backendData);
    return response.data;
  } catch (error) {
    console.error('Error recording interaction:', error);
    throw error;
  }
};

export default api;