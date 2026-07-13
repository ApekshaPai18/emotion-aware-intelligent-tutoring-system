import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CloseIcon from '@mui/icons-material/Close';
import * as faceapi from 'face-api.js';

// ============ API Configuration ============
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/v1`;

// ============ LESSON DATA ============
const LESSONS = [
  {
    id: 1,
    title: "What is Python?",
    content: "Python is a high-level, interpreted programming language.\n\nKey Features:\n• Simple, easy-to-read syntax\n• Dynamically typed\n• Interpreted language\n\nExample:\nprint('Hello, World!')",
    simplifiedContent: "🐍 Python is a language that helps you talk to computers.\n\nSimple Example:\nprint('Hello') → This shows 'Hello' on screen.\n\nKey Points:\n• Python reads code line by line (interpreted)\n• You don't need to compile anything",
    question: { id: 1, question: "What type of language is Python?", options: ["Compiled", "Interpreted", "Machine", "Assembly"], correct: 1, explanation: "Python is an interpreted language — it runs line by line without needing to be compiled first." }
  },
  {
    id: 2,
    title: "Variables in Python",
    content: "Variables store data values.\n\nRules:\n• Start with a letter or underscore\n• Cannot start with a number\n• Case-sensitive\n\nExamples:\nname = 'John'\nage = 25",
    simplifiedContent: "📦 Variables are like storage boxes with labels.\n\nSimple Examples:\nname = 'John'   # Store 'John' in box named 'name'\nage = 25        # Store 25 in box named 'age'\n\nRules:\n• Must start with a letter or underscore\n• Cannot start with a number",
    question: { id: 2, question: "Which is a valid variable name?", options: ["2var", "my-var", "my_var", "my var"], correct: 2, explanation: "my_var uses an underscore, which is valid. Hyphens, spaces, and starting with numbers are not allowed." }
  },
  {
    id: 3,
    title: "Data Types",
    content: "Python has several built-in data types:\n• int: whole numbers — 1, 2, 100\n• float: decimals — 3.14, 2.5\n• str: text — 'Hello'\n• bool: True or False",
    simplifiedContent: "🔢 Data types tell Python what kind of information you're working with.\n\nThree main types:\n• Numbers (int/float) → for math calculations\n• Text (string) → for words and sentences\n• True/False (boolean) → for yes/no questions",
    question: { id: 3, question: "What data type is: x = 3.14?", options: ["int", "float", "str", "bool"], correct: 1, explanation: "Numbers with decimal points are floats in Python." }
  },
  {
    id: 4,
    title: "If Statements",
    content: "if statements let your code make decisions.\n\nSyntax:\nif condition:\n    # runs if true\nelif another_condition:\n    # runs if second condition is true\nelse:\n    # runs otherwise",
    simplifiedContent: "🤔 If statements help Python make decisions.\n\nThink of it like a fork in the road:\n- If it's raining → take an umbrella\n- Otherwise → enjoy the sun\n\nSimple Example:\nage = 18\nif age >= 18:\n    print('Adult')\nelse:\n    print('Minor')",
    question: { id: 4, question: "Which keyword is used for conditional statements?", options: ["for", "while", "if", "def"], correct: 2, explanation: "'if' is the keyword for conditional execution in Python." }
  },
  {
    id: 5,
    title: "Loops",
    content: "Loops repeat code multiple times.\n\nFor loop — iterates over a sequence:\nfor i in range(5):\n    print(i)\n\nWhile loop — runs while a condition is true:\ncount = 0\nwhile count < 3:\n    print(count)\n    count += 1",
    simplifiedContent: "🔄 Loops help you repeat tasks without writing the same code many times.\n\nTwo types:\n1. For loop - repeats a fixed number of times\n   for i in range(3):\n       print(i)   # Prints 0, 1, 2\n\n2. While loop - repeats until condition is false\n   count = 0\n   while count < 3:\n       print(count)\n       count = count + 1",
    question: { id: 5, question: "Which loop runs while a condition is true?", options: ["for", "while", "if", "else"], correct: 1, explanation: "A while loop keeps running as long as its condition evaluates to True." }
  }
];

const EASY_QUESTIONS_SET = [
  { id: 101, question: "What does the 'len()' function do?", options: ["Returns length", "Returns last element", "Returns first", "Returns type"], correct: 0, explanation: "len() returns the number of items in a sequence." },
  { id: 102, question: "What is the output of print(2**3)?", options: ["6", "8", "9", "5"], correct: 1, explanation: "** is the power operator. 2**3 = 2×2×2 = 8." },
  { id: 103, question: "Which operator is used for floor division?", options: ["/", "//", "%", "**"], correct: 1, explanation: "// performs floor (integer) division, discarding the remainder." },
  { id: 104, question: "What is the result of bool('False')?", options: ["True", "False", "Error", "None"], correct: 0, explanation: "Any non-empty string is truthy in Python, so bool('False') returns True." },
  { id: 105, question: "Which function converts a string to an integer?", options: ["str()", "int()", "float()", "list()"], correct: 1, explanation: "int() converts a compatible string or float to an integer." }
];

const MEDIUM_QUESTIONS_SET = [
  { id: 201, question: "What is list comprehension?", options: ["Creating a list manually", "A compact way to create lists", "A list of integers only", "A built-in function"], correct: 1, explanation: "List comprehension provides a compact, readable syntax for creating lists from iterables." },
  { id: 202, question: "What is the output of [1,2,3][::-1]?", options: ["[1,2,3]", "[3,2,1]", "Error", "[1,3]"], correct: 1, explanation: "The slice [::-1] steps backward through the list, reversing it." },
  { id: 203, question: "What does a lambda function do?", options: ["Creates an anonymous function", "Starts a loop", "Defines a class", "Declares a variable"], correct: 0, explanation: "lambda creates a small anonymous (nameless) function inline." },
  { id: 204, question: "What is the output of print(type(10/3))?", options: ["<class 'int'>", "<class 'float'>", "<class 'complex'>", "Error"], correct: 1, explanation: "The / operator always returns a float in Python 3, even when dividing two integers." },
  { id: 205, question: "What is the purpose of 'pass' in Python?", options: ["Skip all remaining code", "Act as a placeholder statement", "Exit a loop", "Return a value"], correct: 1, explanation: "'pass' is a null operation — it does nothing and is used as a syntactic placeholder." }
];

const HARD_QUESTIONS_SET = [
  { id: 301, question: "What is a decorator in Python?", options: ["A design pattern class", "A function that modifies another function", "A class method type", "A variable annotation"], correct: 1, explanation: "Decorators wrap a function to modify or extend its behavior without changing its source code." },
  { id: 302, question: "What is the GIL in CPython?", options: ["Global Interpreter Lock — prevents true multi-threading", "Global Instance Library", "A memory management function", "A variable locking mechanism"], correct: 0, explanation: "The GIL (Global Interpreter Lock) ensures only one thread executes Python bytecode at a time in CPython." },
  { id: 303, question: "Output of list(map(lambda x: x**2, [1,2,3]))?", options: ["[1,4,9]", "[1,2,3]", "Error", "[1,1,1]"], correct: 0, explanation: "map() applies the lambda (x squared) to each element: 1²=1, 2²=4, 3²=9." },
  { id: 304, question: "What is Method Resolution Order (MRO)?", options: ["The order Python searches base classes during inheritance", "Memory allocation order for methods", "The order methods execute", "Variable lookup scope order"], correct: 0, explanation: "MRO (C3 linearization) defines the order Python searches parent classes when resolving method calls." },
  { id: 305, question: "What is the output of all([1, 2, 3])?", options: ["True", "False", "Error", "None"], correct: 0, explanation: "all() returns True only if every element in the iterable is truthy. All of 1, 2, 3 are truthy." }
];

const REVIEW_CONTENT: { [key: number]: string } = {
  0: "📚 Let's review the key concept for this question.\n\nThe len() function returns the length (number of items) in an object like a string, list, or tuple.\n\nExamples:\n• len('hello') returns 5\n• len([1,2,3]) returns 3\n\n💡 Tip: Count the characters carefully!",
  1: "📚 Let's review the power operator (**).\n\nThe ** operator is used for exponentiation (power).\n\nExamples:\n• 2**3 means 2 × 2 × 2 = 8\n• 3**2 means 3 × 3 = 9\n\n💡 Tip: The number before ** is the base, after ** is the exponent!",
  2: "📚 Let's review floor division (//).\n\nThe // operator divides and rounds DOWN to the nearest whole number.\n\nExamples:\n• 7 // 2 = 3 (not 3.5)\n• 10 // 3 = 3 (not 3.33)\n\n💡 Tip: // gives you the integer part of division!",
  3: "📚 Let's review truthy values in Python.\n\nIn Python, any non-empty string is considered True in a boolean context.\n\nExamples:\n• bool('False') returns True (because 'False' is a non-empty string)\n• bool('') returns False (empty string)\n\n💡 Tip: Only empty strings are False!",
  4: "📚 Let's review type conversion.\n\nThe int() function converts a compatible value to an integer.\n\nExamples:\n• int('123') converts string '123' to integer 123\n• int(3.14) converts float 3.14 to integer 3\n\n💡 Tip: int() removes decimal points (doesn't round, it truncates)!"
};

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const difficultySettings = {
  easy:   { label: '🟢 Easy',   color: '#4caf50', description: 'Building confidence step by step' },
  medium: { label: '🟡 Medium', color: '#ff9800', description: 'Testing your understanding' },
  hard:   { label: '🔴 Hard',   color: '#f44336', description: 'Challenging your knowledge' }
};

const Learn: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, userName, sessionId } = location.state || {};

  // Core state
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [currentSessionId] = useState<number | null>(sessionId || null);
  const [mode, setMode] = useState<'lesson' | 'quiz'>('lesson');
  const [quizPhase, setQuizPhase] = useState<'baseline' | 'adaptive'>('baseline');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [difficultyReason, setDifficultyReason] = useState<string>('');
  const [showAdaptiveStart, setShowAdaptiveStart] = useState<boolean>(false);

  // Webcam state
  const [emotion, setEmotion] = useState<string>('Neutral');
  const [prevEmotion, setPrevEmotion] = useState<string>('Neutral');
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0.8);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [showFaceWarning, setShowFaceWarning] = useState<boolean>(false);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [modelsLoading, setModelsLoading] = useState<boolean>(true);
  const [modelsError, setModelsError] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // RL state
  const [streak, setStreak] = useState<number>(0);
  const [repeatCount, setRepeatCount] = useState<number>(0);
  const [rlAction, setRlAction] = useState<string>('');
  const [emotionHistory, setEmotionHistory] = useState<{ [key: string]: number }>({
    happy: 0, neutral: 0, sad: 0, frustrated: 0, surprise: 0, confused: 0
  });
  const [emotionTimeline, setEmotionTimeline] = useState<{ emotion: string, time: number }[]>([]);
  const [baselineEmotions, setBaselineEmotions] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [adaptiveAnswers, setAdaptiveAnswers] = useState<boolean[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [reviewContent, setReviewContent] = useState<string>('');
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showSimplified, setShowSimplified] = useState<boolean>(false);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');

  // ✅ NEW: Algorithm selection state
  const [useDQN, setUseDQN] = useState<boolean>(false); // false = Q-Learning, true = DQN

  const baselineQuestionsCompleted = quizAnswers.filter(a => a !== undefined).length;
  const adaptiveQuestionsCompleted = adaptiveAnswers.filter(a => a !== undefined).length;

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setModelsLoading(true);
        setModelsError(false);
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        console.log('✅ Face detection models loaded');
        setModelsLoading(false);
      } catch (err) {
        console.error('❌ Failed to load face detection models:', err);
        setModelsError(true);
        setModelsLoading(false);
      }
    };
    loadModels();
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // getCurrentLesson is commented out as it's not used
  // const getCurrentLesson = () => LESSONS[currentLessonIndex];
  
  const getCurrentQuestion = (): Question | null => {
    if (quizPhase === 'baseline') {
      return currentLessonIndex < LESSONS.length ? LESSONS[currentLessonIndex].question : null;
    }
    const sets = { easy: EASY_QUESTIONS_SET, medium: MEDIUM_QUESTIONS_SET, hard: HARD_QUESTIONS_SET };
    return sets[difficultyLevel][currentLessonIndex] ?? null;
  };

  const analyzeEmotionsAndSetDifficulty = useCallback((emotions: string[]): 'easy' | 'medium' | 'hard' => {
    if (emotions.length === 0) {
      setDifficultyLevel('medium');
      setDifficultyReason('No emotion data captured — defaulting to Medium difficulty.');
      return 'medium';
    }

    const positiveEmotions = ['happy', 'surprise'];
    const negativeEmotions = ['sad', 'frustrated', 'confused'];
    const positiveCount = emotions.filter(e => positiveEmotions.includes(e)).length;
    const negativeCount = emotions.filter(e => negativeEmotions.includes(e)).length;

    let difficulty: 'easy' | 'medium' | 'hard';
    let reason: string;

    if (positiveCount >= 2) {
      difficulty = 'hard';
      reason = `You showed ${positiveCount} positive emotion${positiveCount !== 1 ? 's' : ''} — time for a real challenge! 🎯`;
    } else if (negativeCount >= 2) {
      difficulty = 'easy';
      reason = `You showed ${negativeCount} signs of struggle — let's build confidence first! 💪`;
    } else {
      difficulty = 'medium';
      reason = `Your emotions were balanced — Medium difficulty is perfect. 📊`;
    }

    setDifficultyLevel(difficulty);
    setDifficultyReason(reason);
    return difficulty;
  }, []);

  const resetQuizState = () => {
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setMessage('');
    setRlAction('');
  };

  const finishBaselinePhase = (capturedEmotions: string[]) => {
    const difficulty = analyzeEmotionsAndSetDifficulty(capturedEmotions);
    setShowAdaptiveStart(true);
    setMode('lesson');
    setQuizPhase('adaptive');
    setMessage(`🎯 Difficulty set to ${difficulty.toUpperCase()}!`);
    setTimeout(() => setMessage(''), 4000);
  };

  const moveToNextLesson = (latestBaselineEmotions: string[]) => {
    const nextIndex = currentLessonIndex + 1;
    if (nextIndex < LESSONS.length) {
      setCurrentLessonIndex(nextIndex);
      setMode('lesson');
      resetQuizState();
    } else {
      finishBaselinePhase(latestBaselineEmotions);
    }
  };

  const startAdaptivePhase = () => {
    setShowAdaptiveStart(false);
    setCurrentLessonIndex(0);
    setQuizPhase('adaptive');
    setMode('quiz');
    resetQuizState();
    setMessage(`🎯 Adaptive Phase started — ${difficultySettings[difficultyLevel].label} questions`);
    setTimeout(() => setMessage(''), 3000);
  };

  const moveToNextAdaptiveQuestion = (finalScore: number, finalAdaptiveAnswers: boolean[]) => {
    const nextIndex = currentLessonIndex + 1;
    if (nextIndex < 5) {
      setCurrentLessonIndex(nextIndex);
      resetQuizState();
    } else {
      const firstBaselineAnswers = quizAnswers.slice(0, 5);
      const baselineCount = firstBaselineAnswers.filter(a => a === true).length;
      const firstAdaptiveAnswers = finalAdaptiveAnswers.slice(0, 5);
      const adaptiveCount = firstAdaptiveAnswers.filter(a => a === true).length;
      const totalCorrectFirstAttempts = baselineCount + adaptiveCount;

      navigate('/results', {
        state: {
          userId,
          userName,
          stats: {
            totalQuestions: 10,
            correctAnswers: totalCorrectFirstAttempts,
            emotions: emotionHistory,
            quizAnswers: [...firstBaselineAnswers, ...firstAdaptiveAnswers],
            baselineScore: Math.round((baselineCount / 5) * 100),
            adaptiveScore: Math.round((adaptiveCount / 5) * 100),
            finalScore: Math.round((totalCorrectFirstAttempts / 10) * 100),
            difficultyLevel,
            baselineEmotions,
            difficultyReason
          }
        }
      });
    }
  };

  // Face detection with REAL confidence scores
  const detectFaceAndEmotion = useCallback(async () => {
    if (!videoRef.current || !videoRef.current.videoWidth || modelsLoading || modelsError) return;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const hasFace = detections.length > 0;

      if (hasFace) {
        setFaceDetected(true);
        setShowFaceWarning(false);

        const expressions = detections[0].expressions;
        let dominantEmotion = 'neutral';
        let maxScore = 0;
        
        for (const [exp, val] of Object.entries(expressions)) {
          if (val > maxScore) {
            maxScore = val;
            if (exp === 'happy') dominantEmotion = 'happy';
            else if (exp === 'sad') dominantEmotion = 'sad';
            else if (exp === 'angry') dominantEmotion = 'frustrated';
            else if (exp === 'surprised') dominantEmotion = 'surprise';
            else if (exp === 'fearful') dominantEmotion = 'confused';
            else if (exp === 'disgusted') dominantEmotion = 'frustrated';
            else dominantEmotion = 'neutral';
          }
        }

        const actualConfidence = maxScore;
        setEmotionConfidence(actualConfidence);
        
        console.log(`🎯 Detected: ${dominantEmotion} with ${(actualConfidence * 100).toFixed(1)}% confidence`);

        const capitalizedEmotion = dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1);
        setEmotion(capitalizedEmotion);
        setPrevEmotion(dominantEmotion);

        setEmotionTimeline(prev => [...prev, { emotion: dominantEmotion, time: Date.now() }].slice(-20));
        setEmotionHistory(prev => ({ ...prev, [dominantEmotion]: (prev[dominantEmotion] || 0) + 1 }));

        setBaselineEmotions(prev => {
          if (quizPhase === 'baseline' && mode === 'quiz' && !quizSubmitted && prev.length < 5) {
            return [...prev, dominantEmotion];
          }
          return prev;
        });

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, detections);
          faceapi.draw.drawFaceLandmarks(canvas, detections);
          faceapi.draw.drawFaceExpressions(canvas, detections);
        }
      } else {
        setFaceDetected(false);
        setEmotion('No Face');
        setEmotionConfidence(0);
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (webcamActive) {
          setShowFaceWarning(true);
          setSnackbarOpen(true);
        }
      }
    } catch (err) {
      console.error('Face detection error:', err);
    }
  }, [modelsLoading, modelsError, quizPhase, mode, quizSubmitted, webcamActive]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setWebcamActive(true);
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
          detectionIntervalRef.current = setInterval(detectFaceAndEmotion, 500);
        };
      }
    } catch (err) {
      console.error('Webcam error:', err);
      setMessage('❌ Failed to access webcam. Please grant camera permission.');
    }
  };

  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    setWebcamActive(false);
    setFaceDetected(false);
    setShowFaceWarning(false);
    setEmotion('No Face');
    setEmotionConfidence(0);
  };

  useEffect(() => {
    if (!webcamActive) return;
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = setInterval(detectFaceAndEmotion, 500);
    return () => { if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current); };
  }, [detectFaceAndEmotion, webcamActive]);

  // ============ RL ACTION HANDLERS (With Algorithm Selection) ============
  
  const getRLDecision = async (): Promise<string> => {
    try {
      const endpoint = useDQN 
        ? `${API_BASE_URL}/dqn-decision/`
        : `${API_BASE_URL}/rl-decision/`;
      
      const res = await axios.post(endpoint, {
        prev_emotion: prevEmotion,
        current_emotion: emotion.toLowerCase(),
        streak: streak,
        repeat_count: repeatCount,
        face_present: faceDetected
      });
      const action = res.data.action;
      console.log(`🤖 ${useDQN ? 'DQN' : 'Q-Learning'} Agent decided: ${action}`);
      return action;
    } catch (err) {
      console.error('RL API error:', err);
      const actions = ["hint", "repeat", "simplify", "motivate", "normal"];
      return actions[Math.floor(Math.random() * actions.length)];
    }
  };

  const updateRL = async (correct: boolean, action: string) => {
    try {
      const endpoint = useDQN
        ? `${API_BASE_URL}/dqn-update/`
        : `${API_BASE_URL}/update-rl/`;
      
      await axios.post(endpoint, {
        prev_emotion: prevEmotion,
        current_emotion: emotion.toLowerCase(),
        streak: streak,
        repeat_count: repeatCount,
        face_present: faceDetected,
        action: action,
        correct: correct
      });
      console.log(`📊 ${useDQN ? 'DQN' : 'Q-Learning'} Updated: action=${action}, correct=${correct}`);
    } catch (err) {
      console.error('RL update error:', err);
    }
  };

  const postInteraction = async (lessonIdx: number, questionId: string, correct: boolean, action: string, newStreak: number, newRepeat: number) => {
    const currentEmotionLower = emotion.toLowerCase();
    try {
      await axios.post(`${API_BASE_URL}/interactions/`, {
        user_id: userId,
        session_id: currentSessionId,
        lesson_id: (lessonIdx + 1).toString(),
        question_id: questionId,
        is_correct: correct,
        detected_emotion: currentEmotionLower !== 'no face' ? currentEmotionLower : 'neutral',
        emotion_confidence: emotionConfidence,
        rl_action: action,
        streak: newStreak,
        repetition_count: newRepeat,
        algorithm: useDQN ? "dqn" : "q_learning"
      });
      console.log(`📝 Interaction recorded: ${correct ? '✅' : '❌'} | Algorithm: ${useDQN ? 'DQN' : 'Q-Learning'} | Confidence: ${(emotionConfidence * 100).toFixed(1)}%`);
    } catch (err) {
      console.error('Failed to record interaction:', err);
    }
  };

  const executeRLAction = (action: string, currentQuestion: Question, isAdaptivePhase: boolean) => {
    setRlAction(action);
    console.log(`🎬 Executing ${useDQN ? 'DQN' : 'Q-Learning'} Action: ${action.toUpperCase()}`);
    
    switch (action) {
      case 'hint':
        setMessage(`💡 Hint: ${currentQuestion.explanation}`);
        setTimeout(() => {
          setQuizSubmitted(false);
          setQuizAnswer(null);
          setRlAction('');
          setLoading(false);
        }, 2500);
        break;
        
      case 'repeat':
        if (isAdaptivePhase) {
          const review = REVIEW_CONTENT[currentLessonIndex] || 
            "📚 Review the concept carefully. Read the question again and think about what it's asking.";
          setReviewContent(review);
          setShowReview(true);
          setMessage(`🔄 ${useDQN ? 'DQN' : 'RL'} Agent chose: REPEAT - Review the concept before trying again!`);
        } else {
          setMessage(`🔄 ${useDQN ? 'DQN' : 'RL'} Agent chose: REPEAT - Review the lesson once more!`);
        }
        setTimeout(() => {
          setMode('lesson');
          setRlAction('');
          setLoading(false);
        }, 1500);
        break;
        
      case 'simplify':
        setShowSimplified(true);
        setMessage(`📖 ${useDQN ? 'DQN' : 'RL'} Agent chose: SIMPLIFY - Showing simplified version to help you understand better!`);
        setTimeout(() => {
          setMode('lesson');
          setRlAction('');
          setLoading(false);
        }, 1500);
        break;
        
      case 'motivate':
        const motivateMessages = [
          `💪 ${useDQN ? 'DQN' : 'RL'} Agent says: You can do this! Take a deep breath and try again.`,
          `🌟 ${useDQN ? 'DQN' : 'RL'} Agent says: Every mistake is a learning opportunity! You've got this.`,
          `🎯 ${useDQN ? 'DQN' : 'RL'} Agent says: Keep going! The fact that you're trying means you're learning.`,
          `💡 ${useDQN ? 'DQN' : 'RL'} Agent says: Don't give up! Let's look at this question from another angle.`,
          `⭐ ${useDQN ? 'DQN' : 'RL'} Agent says: You're making progress! Each attempt brings you closer to mastery.`
        ];
        const randomMsg = motivateMessages[Math.floor(Math.random() * motivateMessages.length)];
        setMessage(randomMsg);
        setTimeout(() => {
          setQuizSubmitted(false);
          setQuizAnswer(null);
          setRlAction('');
          setLoading(false);
        }, 2500);
        break;
        
      case 'normal':
        setMessage('❌ Not quite right, but try again!');
        setTimeout(() => {
          setQuizSubmitted(false);
          setQuizAnswer(null);
          setRlAction('');
          setLoading(false);
        }, 2000);
        break;
        
      default:
        setMessage('❌ Try again!');
        setTimeout(() => {
          setQuizSubmitted(false);
          setQuizAnswer(null);
          setRlAction('');
          setLoading(false);
        }, 2000);
    }
  };

  // ============ QUIZ SUBMIT ============
  const handleQuizSubmit = async () => {
    if (!webcamActive) {
      setMessage('⚠️ Please start the webcam first!');
      setSnackbarOpen(true);
      return;
    }
    if (!faceDetected && !modelsError) {
      setShowFaceWarning(true);
      setSnackbarOpen(true);
      return;
    }
    if (quizAnswer === null) return;

    setLoading(true);
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      setLoading(false);
      return;
    }

    const correct = quizAnswer === currentQuestion.correct;
    const questionId = `q${currentQuestion.id}`;

    if (correct) {
      const newStreak = streak + 1;
      const newScore = score + 1;
      setStreak(newStreak);
      setScore(newScore);
      setMessage(`✅ Correct! ${currentQuestion.explanation}`);
      setQuizSubmitted(true);
      
      await updateRL(true, 'normal');
      await postInteraction(currentLessonIndex, questionId, true, 'normal', newStreak, repeatCount);
      
      setShowReview(false);
      setShowSimplified(false);
      setReviewContent('');

      if (quizPhase === 'baseline') {
        const updatedAnswers = [...quizAnswers, true];
        setQuizAnswers(updatedAnswers);
        setTimeout(() => {
          setBaselineEmotions(latestEmotions => {
            moveToNextLesson(latestEmotions);
            return latestEmotions;
          });
          setLoading(false);
        }, 1500);
      } else {
        const updatedAdaptive = [...adaptiveAnswers, true];
        setAdaptiveAnswers(updatedAdaptive);
        setTimeout(() => {
          moveToNextAdaptiveQuestion(newScore, updatedAdaptive);
          setLoading(false);
        }, 1500);
      }
    } else {
      setStreak(0);
      
      const action = await getRLDecision();
      const newRepeat = repeatCount + 1;
      setRepeatCount(newRepeat);
      
      await updateRL(false, action);
      await postInteraction(currentLessonIndex, questionId, false, action, 0, newRepeat);

      if (quizPhase === 'baseline') {
        setQuizAnswers(prev => [...prev, false]);
      } else {
        setAdaptiveAnswers(prev => [...prev, false]);
      }

      executeRLAction(action, currentQuestion, quizPhase === 'adaptive');
    }
  };

  const resetSpecialModes = () => {
    setShowSimplified(false);
    setShowReview(false);
    setReviewContent('');
  };

  const getDisplayContent = () => {
    if (showReview && reviewContent) return reviewContent;
    if (showSimplified) return LESSONS[currentLessonIndex]?.simplifiedContent || LESSONS[currentLessonIndex]?.content;
    return LESSONS[currentLessonIndex]?.content;
  };

  const getDisplayTitle = () => {
    if (showReview) return '📚 Concept Review (RL Action: REPEAT)';
    if (showSimplified) return '📖 Simplified Lesson (RL Action: SIMPLIFY)';
    return `📖 Lesson ${currentLessonIndex + 1}: ${LESSONS[currentLessonIndex]?.title}`;
  };

  const completedCount = quizPhase === 'baseline' 
    ? Math.min(baselineQuestionsCompleted, 5)
    : Math.min(adaptiveQuestionsCompleted, 5);
  const progress = (completedCount / 5) * 100;
  const isQuizDisabled = (!webcamActive || !faceDetected) && !modelsError;
  const currentQuestion = mode === 'quiz' ? getCurrentQuestion() : null;
  const currentQuestionNum = quizPhase === 'baseline' 
    ? Math.min(baselineQuestionsCompleted + 1, 5)
    : Math.min(adaptiveQuestionsCompleted + 1, 5);

  const emotionColor = (e: string) => {
    if (e === 'happy' || e === 'surprise') return '#4caf50';
    if (e === 'sad' || e === 'frustrated' || e === 'confused') return '#f44336';
    return '#9e9e9e';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'hint': return '#2196f3';
      case 'repeat': return '#ff9800';
      case 'simplify': return '#4caf50';
      case 'motivate': return '#e91e63';
      case 'normal': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {modelsLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 1 }}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">Loading face detection models…</Typography>
        </Box>
      )}

      {!webcamActive && !modelsLoading && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ Webcam is required for emotion tracking. Click <strong>"Start Webcam"</strong> on the right panel to continue.
        </Alert>
      )}

      <Dialog open={showFaceWarning} onClose={() => setShowFaceWarning(false)}>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>⚠️ Face Not Detected</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>Please make sure your face is clearly visible to the camera before submitting.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFaceWarning(false)} variant="contained">Got it</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={!webcamActive ? '⚠️ Please start the webcam first!' : '⚠️ Face not detected — please look at the camera.'}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Main learning panel */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" color="primary">
                {userName ? `Welcome, ${userName}!` : 'Python Learning'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Score: <strong>{score}</strong> / 10
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #1976d2, #42a5f5)'
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {quizPhase === 'baseline' && !showAdaptiveStart
                  ? `📋 Baseline — Question ${currentQuestionNum} / 5`
                  : showAdaptiveStart
                  ? '📊 Baseline complete — ready for adaptive phase'
                  : `🎯 Adaptive — Question ${currentQuestionNum} / 5`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>

          {showAdaptiveStart && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                🎉 Baseline Phase Complete!
              </Typography>
              <Alert severity={difficultyLevel === 'hard' ? 'success' : difficultyLevel === 'easy' ? 'info' : 'warning'} sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body1">
                  <strong>Your adaptive difficulty: </strong>
                  <Chip label={difficultySettings[difficultyLevel].label} size="small" sx={{ bgcolor: difficultySettings[difficultyLevel].color, color: 'white', mx: 1 }} />
                  <br /><br />
                  {difficultyReason}
                </Typography>
              </Alert>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Baseline emotions captured:</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, justifyContent: 'center' }}>
                  {baselineEmotions.map((e, i) => (
                    <Chip key={i} label={e} size="small" sx={{ bgcolor: emotionColor(e), color: 'white' }} />
                  ))}
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={startAdaptivePhase}
                sx={{ px: 5, py: 1.5, background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)', fontWeight: 700 }}
              >
                Start Adaptive Phase ({difficultySettings[difficultyLevel].label})
              </Button>
            </Box>
          )}

          {mode === 'lesson' && !showAdaptiveStart && (
            <>
              <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 700 }}>
                {getDisplayTitle()}
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, mt: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ lineHeight: 2, whiteSpace: 'pre-line' }}>
                  {getDisplayContent()}
                </Typography>
              </Paper>
              {(showSimplified || showReview) && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {showSimplified 
                    ? '💡 Simplified version shown (RL Action: SIMPLIFY). Take your time before attempting the quiz again.' 
                    : '📚 Review content shown (RL Action: REPEAT). Click below to try the quiz again.'}
                </Alert>
              )}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => { resetSpecialModes(); setMode('quiz'); resetQuizState(); }}
                  size="large"
                  sx={{ px: 5, py: 1.5 }}
                  disabled={isQuizDisabled}
                >
                  {isQuizDisabled ? '⚠️ Start webcam to take quiz' : `Take Quiz — ${quizPhase === 'baseline' ? `Lesson ${currentLessonIndex + 1}` : 'Adaptive Question'}`}
                </Button>
              </Box>
            </>
          )}

          {mode === 'quiz' && currentQuestion && !showAdaptiveStart && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  Question {currentQuestionNum} of 5
                </Typography>
                {quizPhase === 'adaptive' && (
                  <Chip label={difficultySettings[difficultyLevel].label} size="small" sx={{ bgcolor: difficultySettings[difficultyLevel].color, color: 'white' }} />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {quizPhase === 'baseline' 
                  ? `📋 Lesson ${currentLessonIndex + 1} Quiz` 
                  : `🎯 Adaptive Question (${difficultySettings[difficultyLevel].description})`}
              </Typography>

              <Paper variant="outlined" sx={{ p: 2.5, mt: 2, mb: 3, bgcolor: '#f0f4ff', borderRadius: 2 }}>
                <Typography variant="h6">{currentQuestion.question}</Typography>
              </Paper>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {currentQuestion.options.map((opt, idx) => (
                  <Button
                    key={idx}
                    variant={quizAnswer === idx ? 'contained' : 'outlined'}
                    onClick={() => !quizSubmitted && setQuizAnswer(idx)}
                    disabled={quizSubmitted || isQuizDisabled}
                    sx={{
                      justifyContent: 'flex-start',
                      p: 1.5,
                      textAlign: 'left',
                      ...(quizAnswer === idx && { background: 'linear-gradient(90deg, #1565c0, #1976d2)' })
                    }}
                  >
                    <strong style={{ marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</strong> {opt}
                  </Button>
                ))}
              </Box>

              {message && (
                <Alert severity={message.startsWith('✅') ? 'success' : message.startsWith('💡') || message.includes('RL Agent') ? 'info' : 'error'} sx={{ mt: 3 }}>
                  {message}
                </Alert>
              )}

              {rlAction && (
                <Chip 
                  label={`🤖 ${useDQN ? 'DQN' : 'RL'} Agent Action: ${rlAction.toUpperCase()}`} 
                  sx={{ mt: 1.5, bgcolor: getActionColor(rlAction), color: 'white', fontWeight: 'bold' }} 
                />
              )}

              <Button
                variant="contained"
                onClick={handleQuizSubmit}
                disabled={quizAnswer === null || quizSubmitted || loading || isQuizDisabled}
                sx={{ mt: 3, py: 1.5, fontWeight: 700 }}
                fullWidth
              >
                {loading ? 'Processing…' : isQuizDisabled ? '⚠️ Webcam / face required' : 'Submit Answer'}
              </Button>
            </>
          )}
        </Paper>

        {/* Emotion Panel */}
        <Paper elevation={3} sx={{ p: 2.5 }}>
          <Typography variant="h6" gutterBottom>🎥 Emotion Detection</Typography>

          <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: '#000' }}>
            <video ref={videoRef} style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }} autoPlay playsInline muted />
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'scaleX(-1)' }} />
          </Box>

          {!webcamActive ? (
            <Button variant="contained" startIcon={<VideocamIcon />} onClick={startWebcam} sx={{ mt: 2 }} fullWidth disabled={modelsLoading}>
              {modelsLoading ? 'Loading Models…' : 'Start Webcam (Required)'}
            </Button>
          ) : (
            <Button variant="outlined" color="error" startIcon={<VideocamOffIcon />} onClick={stopWebcam} sx={{ mt: 2 }} fullWidth>
              Stop Webcam
            </Button>
          )}

          {/* ✅ Algorithm Toggle Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'center' }}>
            <Button 
              size="small" 
              variant={!useDQN ? "contained" : "outlined"}
              onClick={() => setUseDQN(false)}
              sx={{ fontSize: '0.7rem', py: 0.5 }}
            >
              🧠 Q-Learning
            </Button>
            <Button 
              size="small" 
              variant={useDQN ? "contained" : "outlined"}
              onClick={() => setUseDQN(true)}
              sx={{ fontSize: '0.7rem', py: 0.5 }}
            >
              🤖 DQN
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2, justifyContent: 'center' }}>
            <Chip label={`😊 ${emotion}`} color={emotion === 'Happy' || emotion === 'Surprise' ? 'success' : emotion === 'Frustrated' || emotion === 'Sad' || emotion === 'Confused' ? 'error' : 'info'} />
            <Chip label={faceDetected ? '✅ Face Detected' : '❌ No Face'} color={faceDetected ? 'success' : 'error'} />
            <Chip label={useDQN ? "🤖 DQN Active" : "🧠 Q-Learning Active"} color={useDQN ? "secondary" : "primary"} size="small" />
          </Box>

          {webcamActive && faceDetected && (
            <Alert severity="success" sx={{ mt: 1.5 }}>
              ✅ Ready — face detected! 
              {emotionConfidence > 0 && ` (Confidence: ${(emotionConfidence * 100).toFixed(1)}%)`}
            </Alert>
          )}
          {webcamActive && !faceDetected && <Alert severity="warning" sx={{ mt: 1.5 }}>⚠️ Please look at the camera.</Alert>}

          {quizPhase === 'baseline' && mode === 'quiz' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>🎯 Baseline Emotions:</strong> {baselineEmotions.length} / 5
              </Typography>
              <LinearProgress variant="determinate" value={(baselineEmotions.length / 5) * 100} sx={{ mt: 0.5, height: 6, borderRadius: 3 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {baselineEmotions.map((e, i) => (
                  <Chip key={i} label={e} size="small" sx={{ bgcolor: emotionColor(e), color: 'white', fontSize: '0.7rem' }} />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary"><strong>📈 Recent Emotions:</strong></Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {emotionTimeline.slice(-10).map((item, idx) => (
                <Chip key={idx} label={item.emotion} size="small" sx={{ bgcolor: emotionColor(item.emotion), color: 'white', fontSize: '0.7rem' }} />
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary"><strong>📊 Session Totals:</strong></Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {Object.entries(emotionHistory).filter(([, count]) => count > 0).map(([em, count]) => (
                <Chip key={em} label={`${em}: ${count}`} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              🔥 Streak: <strong>{streak}</strong> &nbsp;|&nbsp; 🔄 Repeat Count: <strong>{repeatCount}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              🤖 {useDQN ? 'DQN' : 'Q-Learning'} Agent learns which actions lead to correct answers
            </Typography>
            {difficultyLevel && !showAdaptiveStart && quizPhase === 'adaptive' && (
              <Chip label={difficultySettings[difficultyLevel].label} size="small" sx={{ mt: 1, bgcolor: difficultySettings[difficultyLevel].color, color: 'white' }} />
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Learn;
