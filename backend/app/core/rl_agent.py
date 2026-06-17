"""
Enhanced RL Agent with proper Q-learning - NO HARD-CODED RULES
"""
import numpy as np
import random
import json
import os
from typing import Dict, List, Tuple
import logging
from collections import deque

from ..utils.config import settings

logger = logging.getLogger(__name__)

class EnhancedRLAgent:
    def __init__(self):
        # Action space
        self.actions = [
            'normal',           # Continue to next topic
            'hint',             # Show helpful hint
            'repeat',           # Repeat current lesson
            'simplify',         # Show simpler explanation
            'motivate',         # Show encouragement
            'review_previous',  # Go back to previous lesson
            'break_suggestion', # Suggest taking a break
            'example',          # Show more examples
            'practice'          # Give practice questions
        ]
        self.n_actions = len(self.actions)
        
        # State dimensions
        self.state_dims = {
            'academic': (2, 3, 3, 3),      # correctness, streak, repetition, mastery
            'emotional': (6, 3, 3, 3, 3)   # emotion, intensity, attention, confusion, trend
        }
        
        # Total states
        self.total_states = 54 * 486
        
        # Q-table - stores learned values
        self.q_table = np.zeros((self.total_states, self.n_actions))
        
        # Learning parameters
        self.learning_rate = settings.learning_rate
        self.discount_factor = settings.discount_factor
        self.exploration_rate = settings.exploration_rate
        self.exploration_decay = settings.exploration_decay
        self.min_exploration_rate = settings.min_exploration_rate
        
        # Emotion categories for reward calculation
        self.positive_emotions = ['happy', 'surprise']
        self.neutral_emotions = ['neutral']
        self.negative_emotions = ['sad', 'frustrated', 'confused']
        
        # Emotion mapping for state indexing
        self.emotion_map = {
            'happy': 0,
            'neutral': 1,
            'sad': 2,
            'frustrated': 3,
            'surprise': 4,
            'confused': 5
        }
        
        # Load existing Q-table
        self.q_table_path = settings.q_table_path
        self.load_q_table()
        
        # History for tracking
        self.decision_history = deque(maxlen=50)
        
        logger.info(f"✅ RL Agent initialized with {self.total_states} states")
        logger.info(f"   Learning rate: {self.learning_rate}")
        logger.info(f"   Exploration rate: {self.exploration_rate}")
        logger.info(f"   Actions: {self.actions}")
    
    def _discretize_value(self, value: float, bins: int) -> int:
        """Convert continuous value to discrete bin"""
        return min(int(value * bins), bins - 1)
    
    def state_to_index(self, state: Dict) -> int:
        """Convert state dictionary to Q-table index"""
        # Academic state
        correctness = 1 if state['academic']['correctness'] else 0
        streak_bin = min(state['academic']['streak'] // 2, 2)
        repetition_bin = min(state['academic']['repetition_count'], 2)
        mastery_bin = self._discretize_value(state['academic']['mastery'] / 100, 3)
        
        # Emotional state
        emotion_bin = self.emotion_map.get(state['emotional']['emotion'], 1)
        intensity_bin = self._discretize_value(state['emotional']['intensity'], 3)
        attention_bin = self._discretize_value(state['emotional']['attention'], 3)
        confusion_bin = self._discretize_value(state['emotional']['confusion'], 3)
        
        trend_map = {'improving': 0, 'stable': 1, 'worsening': 2}
        trend_bin = trend_map.get(state['emotional']['trend'], 1)
        
        # Calculate indices
        academic_idx = (
            correctness * 27 +
            streak_bin * 9 +
            repetition_bin * 3 +
            mastery_bin
        )
        
        emotional_idx = (
            emotion_bin * 81 +
            intensity_bin * 27 +
            attention_bin * 9 +
            confusion_bin * 3 +
            trend_bin
        )
        
        return academic_idx * 486 + emotional_idx
    
    def choose_action(self, state: Dict) -> str:
        """
        Choose action using epsilon-greedy policy from Q-table
        NO HARD-CODED RULES - purely RL
        """
        state_idx = self.state_to_index(state)
        
        # Exploration: random action
        if random.random() < self.exploration_rate:
            action_idx = random.randint(0, self.n_actions - 1)
            action = self.actions[action_idx]
            logger.info(f"🎲 EXPLORATION: Trying {action} (exploration rate: {self.exploration_rate:.3f})")
            return action
        
        # Exploitation: best action from Q-table
        action_idx = np.argmax(self.q_table[state_idx])
        action = self.actions[action_idx]
        q_value = self.q_table[state_idx, action_idx]
        logger.info(f"📊 EXPLOITATION: Choosing {action} with Q-value {q_value:.3f}")
        
        return action
    
    def compute_reward(self, correct: bool, prev_emotion: str, curr_emotion: str, repeat_count: int) -> float:
        """
        Simple, interpretable reward function
        
        Args:
            correct: Whether the answer was correct
            prev_emotion: Emotion before action
            curr_emotion: Emotion after action
            repeat_count: Number of times lesson repeated
        
        Returns:
            float: Reward value
        """
        reward = 0
        
        # 1. Base reward from quiz performance (primary signal)
        if correct:
            reward += 10
            logger.debug(f"📝 +10 for correct answer")
        else:
            reward -= 5
            logger.debug(f"📝 -5 for incorrect answer")
        
        # 2. Emotion-based reward adjustment (secondary signal)
        def get_emotion_category(emotion):
            if emotion in self.positive_emotions:
                return 'positive'
            elif emotion in self.neutral_emotions:
                return 'neutral'
            else:
                return 'negative'
        
        prev_category = get_emotion_category(prev_emotion)
        curr_category = get_emotion_category(curr_emotion)
        
        # Emotion transition rewards
        if prev_category == 'negative' and curr_category == 'positive':
            reward += 3
            logger.debug(f"😊 +3: Negative → Positive")
        elif prev_category == 'neutral' and curr_category == 'positive':
            reward += 2
            logger.debug(f"😊 +2: Neutral → Positive")
        elif prev_category == 'positive' and curr_category == 'negative':
            reward -= 3
            logger.debug(f"😞 -3: Positive → Negative")
        elif prev_category == 'neutral' and curr_category == 'negative':
            reward -= 2
            logger.debug(f"😞 -2: Neutral → Negative")
        
        # 3. Repetition penalty (control signal)
        if repeat_count > 0:
            penalty = repeat_count
            reward -= penalty
            logger.debug(f"🔄 -{penalty} for {repeat_count} repetitions")
        
        logger.info(f"💰 Final reward: {reward:.1f}")
        return reward
    
    def update(self, state: Dict, action: str, reward: float, next_state: Dict):
        """Update Q-table using Q-learning - this is where learning happens"""
        state_idx = self.state_to_index(state)
        next_idx = self.state_to_index(next_state)
        action_idx = self.actions.index(action)
        
        # Q-learning update formula
        current_q = self.q_table[state_idx, action_idx]
        next_max_q = np.max(self.q_table[next_idx])
        
        # Bellman equation
        new_q = current_q + self.learning_rate * (
            reward + self.discount_factor * next_max_q - current_q
        )
        
        # Update Q-table
        self.q_table[state_idx, action_idx] = new_q
        
        # Decay exploration rate (reduce random exploration over time)
        self.exploration_rate = max(
            self.min_exploration_rate,
            self.exploration_rate * self.exploration_decay
        )
        
        logger.debug(f"📈 Q-value updated: {current_q:.2f} → {new_q:.2f}")
        
        # Log top actions for this state to see what RL is learning
        state_q_values = self.q_table[state_idx]
        top_actions = np.argsort(state_q_values)[-3:][::-1]
        logger.debug(f"   Top actions for this state: " + 
                    ", ".join([f"{self.actions[i]}: {state_q_values[i]:.2f}" for i in top_actions]))
    
    def get_teaching_strategy(self, state: Dict) -> Dict:
        """Get complete teaching strategy with explanation"""
        action = self.choose_action(state)
        state_idx = self.state_to_index(state)
        action_idx = self.actions.index(action)
        confidence = float(self.q_table[state_idx, action_idx])
        
        explanations = {
            'normal': "You're doing great! Let's continue.",
            'hint': "Here's a hint to help you out.",
            'repeat': "Let's review this again for better understanding.",
            'simplify': "Let me explain this in a simpler way.",
            'motivate': "You've got this! Keep going! 💪",
            'review_previous': "Let's go back and review the basics.",
            'break_suggestion': "You seem frustrated. Take a short break?",
            'example': "Let me show you some examples.",
            'practice': "Time to practice what you've learned!"
        }
        
        return {
            'action': action,
            'explanation': explanations.get(action, "Let's continue learning."),
            'confidence': float(confidence),
            'exploration_rate': self.exploration_rate
        }
    
    def get_q_values(self, state: Dict) -> Dict[str, float]:
        """Get Q-values for all actions in current state (for debugging)"""
        state_idx = self.state_to_index(state)
        q_values = {}
        for i, action in enumerate(self.actions):
            q_values[action] = float(self.q_table[state_idx, i])
        return q_values
    
    def save_q_table(self):
        """Save Q-table to file"""
        try:
            os.makedirs(os.path.dirname(self.q_table_path), exist_ok=True)
            np.save(self.q_table_path, self.q_table)
            
            # Save metadata
            meta_path = self.q_table_path.replace('.npy', '_meta.json')
            with open(meta_path, 'w') as f:
                json.dump({
                    'exploration_rate': self.exploration_rate,
                    'learning_rate': self.learning_rate,
                    'discount_factor': self.discount_factor,
                    'actions': self.actions
                }, f, indent=2)
            
            logger.info(f"✅ Q-table saved to {self.q_table_path}")
        except Exception as e:
            logger.error(f"Error saving Q-table: {e}")
    
    def load_q_table(self):
        """Load Q-table from file"""
        try:
            if os.path.exists(self.q_table_path):
                self.q_table = np.load(self.q_table_path)
                
                meta_path = self.q_table_path.replace('.npy', '_meta.json')
                if os.path.exists(meta_path):
                    with open(meta_path, 'r') as f:
                        meta = json.load(f)
                        self.exploration_rate = meta.get('exploration_rate', self.exploration_rate)
                
                logger.info(f"✅ Q-table loaded from {self.q_table_path}")
                logger.info(f"   Q-table shape: {self.q_table.shape}")
                logger.info(f"   Non-zero entries: {np.count_nonzero(self.q_table)}")
            else:
                logger.info("No existing Q-table found, starting fresh with zeros")
        except Exception as e:
            logger.error(f"Error loading Q-table: {e}")