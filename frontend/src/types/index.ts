export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_active: string;
}

export interface UserCreate {
  username: string;
  email: string;
}

export type Emotion = 'happy' | 'neutral' | 'sad' | 'frustrated' | 'surprise' | 'confused';

export interface EmotionData {
  emotion: Emotion;
  confidence: number;
  timestamp: string;
}

// Update EmotionStats interface
export interface EmotionStats {
  happy: number;
  neutral: number;
  sad: number;
  frustrated: number;
  surprise: number;
  confused: number;  // Add this
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  topic: string;
  difficulty: number;
  order_index: number;
}

export interface Question {
  id: string;
  lesson_id: string;
  question_text: string;
  options: string[];
  hint: string;
  difficulty: number;
  correct_answer?: string;
}

export interface LearnerState {
  user_id: number;
  session_id: number;
  current_lesson: string;
  last_question_correct: boolean | null;
  streak: number;
  repetition_count: number;
  current_emotion: Emotion;
  emotion_confidence: number;
  completed_lessons: string[];
}

export interface TeachingAction {
  action: 'normal' | 'hint' | 'repeat';
  lesson_id?: string;
  question_id?: string;
  hint_text?: string;
}

export interface Interaction {
  user_id: number;
  session_id: number;
  lesson_id: string;
  question_id?: string;
  is_correct?: boolean;
  detected_emotion: Emotion;
  emotion_confidence: number;
  rl_action: string;
  rl_state: any;
}

export interface Session {
  id: number;
  user_id: number;
  topic: string;
  start_time: string;
  end_time: string | null;
  total_questions: number;
  correct_answers: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}



