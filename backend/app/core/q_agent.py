"""
Simple Q-Learning Agent
"""
import random
import json
import os
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class QLearningAgent:
    def __init__(self, actions, alpha=0.1, gamma=0.9, epsilon=0.2):
        self.actions = actions
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.q_table = defaultdict(lambda: {a: 0.0 for a in self.actions})
        self.action_counts = {a: 0 for a in actions}  # Track action usage
        self.load("q_table.json")
        logger.info(f"RL Agent initialized with {len(actions)} actions: {actions}")
        logger.info(f"   α={alpha}, γ={gamma}, ε={epsilon}")
    
    def choose_action(self, state):
        """
        Choose action using epsilon-greedy policy.
        When Q-values are equal (e.g., all zeros), chooses randomly among them.
        """
        state_key = json.dumps(state)
        
        # Exploration: choose random action
        if random.random() < self.epsilon:
            action = random.choice(self.actions)
            logger.debug(f"🔍 Exploration: chose {action}")
            self.action_counts[action] += 1
            return action
        
        # Exploitation: choose best action (with tie-breaking)
        q_values = self.q_table[state_key]
        
        # Find the maximum Q-value
        max_value = max(q_values.values())
        
        # Get all actions that have this max value
        best_actions = [a for a, v in q_values.items() if v == max_value]
        
        # Choose randomly among best actions (FIXES THE TIE ISSUE!)
        action = random.choice(best_actions)
        
        logger.debug(f"🎯 Exploitation: max_value={max_value:.3f}, best_actions={best_actions}, chose={action}")
        self.action_counts[action] += 1
        return action
    
    def update(self, state, action, reward, next_state):
        """
        Update Q-table using Q-learning formula:
        Q(s,a) = Q(s,a) + α * (r + γ * max(Q(s')) - Q(s,a))
        """
        state_key = json.dumps(state)
        next_key = json.dumps(next_state)
        
        old_q = self.q_table[state_key][action]
        next_max = max(self.q_table[next_key].values())
        
        # Q-learning update
        new_q = old_q + self.alpha * (reward + self.gamma * next_max - old_q)
        self.q_table[state_key][action] = new_q
        
        logger.debug(f"📊 Q-update: action={action}, reward={reward:.1f}, old_q={old_q:.3f}, new_q={new_q:.3f}")
        
        # Save after update
        self.save("q_table.json")
    
    def save(self, path):
        """Save Q-table to file"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
            
            # Convert defaultdict to regular dict for JSON serialization
            data = {
                'q_table': {k: dict(v) for k, v in self.q_table.items()},
                'action_counts': self.action_counts,
                'alpha': self.alpha,
                'gamma': self.gamma,
                'epsilon': self.epsilon
            }
            with open(path, 'w') as f:
                json.dump(data, f, indent=2)
            logger.debug(f"💾 Q-table saved to {path} (size: {len(self.q_table)} states)")
        except Exception as e:
            logger.warning(f"Failed to save Q-table: {e}")
    
    def load(self, path):
        """Load Q-table from file"""
        try:
            if os.path.exists(path):
                with open(path, 'r') as f:
                    data = json.load(f)
                    
                    # Handle both old and new save formats
                    if 'q_table' in data:
                        q_table_data = data['q_table']
                        self.action_counts = data.get('action_counts', {a: 0 for a in self.actions})
                    else:
                        # Old format (just the q_table dict)
                        q_table_data = data
                        self.action_counts = {a: 0 for a in self.actions}
                    
                    # Reset q_table with defaults
                    self.q_table = defaultdict(lambda: {a: 0.0 for a in self.actions})
                    
                    # Load saved Q-values
                    for k, v in q_table_data.items():
                        self.q_table[k] = v
                    
                    logger.info(f"📂 Q-table loaded from {path} (size: {len(self.q_table)} states)")
                    logger.info(f"   Action counts: {self.action_counts}")
                return True
        except Exception as e:
            logger.warning(f"Failed to load Q-table: {e}")
        return False
    
    def get_stats(self):
        """Get agent statistics for debugging"""
        total_actions = sum(self.action_counts.values())
        action_percentages = {
            action: round((count / max(1, total_actions)) * 100, 1)
            for action, count in self.action_counts.items()
        }
        
        # Count states where each action is best
        action_best_counts = {a: 0 for a in self.actions}
        for state_key, q_values in self.q_table.items():
            max_value = max(q_values.values())
            best_actions = [a for a, v in q_values.items() if v == max_value]
            for a in best_actions:
                action_best_counts[a] += 1
        
        return {
            'total_states': len(self.q_table),
            'total_actions_taken': total_actions,
            'action_distribution': action_percentages,
            'action_counts': self.action_counts,
            'action_best_counts': action_best_counts,
            'exploration_rate': self.epsilon
        }
    
    def reset_stats(self):
        """Reset action counts (keep Q-table)"""
        self.action_counts = {a: 0 for a in self.actions}
        logger.info("🔄 Action counts reset")