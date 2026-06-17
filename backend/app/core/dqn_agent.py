"""
Deep Q-Network (DQN) Agent for Emotion-Aware Tutoring System
"""
import numpy as np
import random
import torch
import torch.nn as nn
import torch.optim as optim
from collections import deque
import json
import os

class DQNetwork(nn.Module):
    """Neural network that predicts Q-values for all actions"""
    
    def __init__(self, input_size, output_size):
        super(DQNetwork, self).__init__()
        self.fc1 = nn.Linear(input_size, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 32)
        self.fc4 = nn.Linear(32, output_size)
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)
        x = torch.relu(self.fc2(x))
        x = torch.relu(self.fc3(x))
        return self.fc4(x)


class ReplayBuffer:
    """Experience replay memory for DQN"""
    
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))
    
    def sample(self, batch_size=32):
        return random.sample(self.buffer, min(batch_size, len(self.buffer)))
    
    def __len__(self):
        return len(self.buffer)


class DQNAgent:
    """Deep Q-Network Agent"""
    
    def __init__(self, input_size=10, output_size=5, learning_rate=0.001):
        # Emotion mapping to numerical values
        self.emotion_to_num = {
            'happy': 1.0,
            'neutral': 0.5,
            'surprise': 0.8,
            'sad': 0.2,
            'frustrated': 0.1,
            'confused': 0.15,
            'No Face': 0.0,
            'neutral': 0.5
        }
        
        self.actions = ['normal', 'hint', 'repeat', 'simplify', 'motivate']
        self.action_to_idx = {a: i for i, a in enumerate(self.actions)}
        self.idx_to_action = {i: a for i, a in enumerate(self.actions)}
        
        # Hyperparameters
        self.gamma = 0.99      # Discount factor
        self.epsilon = 0.1     # Exploration rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = learning_rate
        self.batch_size = 32
        self.update_target_freq = 100
        self.step_count = 0
        
        # Networks
        self.input_size = input_size
        self.output_size = output_size
        
        # Use GPU if available
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.q_network = DQNetwork(input_size, output_size).to(self.device)
        self.target_network = DQNetwork(input_size, output_size).to(self.device)
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=learning_rate)
        
        # Replay buffer
        self.memory = ReplayBuffer(capacity=10000)
        
        # Statistics
        self.training_losses = []
        self.q_values_history = []
        
        # Load if exists
        self.load("dqn_model.pth")
        
        # Update target network
        self.update_target_network()
        
        print(f"✅ DQN Agent initialized")
        print(f"   Input size: {input_size}")
        print(f"   Output size: {output_size}")
        print(f"   Device: {self.device}")
        print(f"   Gamma: {self.gamma}, Epsilon: {self.epsilon}")
    
    def _state_to_tensor(self, state):
        """
        Convert state tuple to continuous tensor
        State: (prev_emotion, current_emotion, streak, repeat_count, face_present)
        """
        prev_emotion, current_emotion, streak, repeat_count, face_present = state
        
        # Convert emotions to numerical values (continuous)
        prev_val = self.emotion_to_num.get(prev_emotion, 0.5)
        curr_val = self.emotion_to_num.get(current_emotion, 0.5)
        
        # Normalize streak (0-5 → 0-1)
        streak_norm = streak / 5.0
        
        # Normalize repeat (0-3 → 0-1)
        repeat_norm = repeat_count / 3.0
        
        # Face presence (0 or 1)
        face_val = 1.0 if face_present else 0.0
        
        # Create feature vector
        features = [
            prev_val,           # Previous emotion value
            curr_val,           # Current emotion value
            streak_norm,        # Normalized streak
            repeat_norm,        # Normalized repeat count
            face_val,           # Face presence
            # Additional features for better learning
            abs(prev_val - curr_val),  # Emotion change magnitude
            streak_norm * (1 + curr_val),  # Streak weighted by emotion
            1.0 - repeat_norm,   # Progress (1 - repetition)
            curr_val * (1 - repeat_norm),  # Emotion considering repetition
            streak_norm * curr_val   # Performance-emotion interaction
        ]
        
        return torch.FloatTensor(features).to(self.device)
    
    def choose_action(self, state):
        """Choose action using epsilon-greedy policy"""
        # Exploration
        if random.random() < self.epsilon:
            action_idx = random.randint(0, self.output_size - 1)
            return self.idx_to_action[action_idx]
        
        # Exploitation
        with torch.no_grad():
            state_tensor = self._state_to_tensor(state)
            q_values = self.q_network(state_tensor.unsqueeze(0))
            action_idx = torch.argmax(q_values).item()
        
        return self.idx_to_action[action_idx]
    
    def update(self, state, action, reward, next_state):
        """Store experience and train"""
        # Convert action to index
        action_idx = self.action_to_idx[action]
        
        # Convert next_state to tensor (for done flag check)
        done = False  # In your system, done when session ends
        
        # Store in replay buffer
        state_tensor = self._state_to_tensor(state).cpu().numpy()
        next_state_tensor = self._state_to_tensor(next_state).cpu().numpy()
        
        self.memory.push(state_tensor, action_idx, reward, next_state_tensor, done)
        
        # Train if enough samples
        if len(self.memory) >= self.batch_size:
            loss = self._train_step()
            self.training_losses.append(loss)
        
        # Update target network periodically
        self.step_count += 1
        if self.step_count % self.update_target_freq == 0:
            self.update_target_network()
        
        # Decay epsilon
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)
    
    def _train_step(self):
        """Perform one training step using experience replay"""
        batch = self.memory.sample(self.batch_size)
        
        states = []
        actions = []
        rewards = []
        next_states = []
        dones = []
        
        for state, action, reward, next_state, done in batch:
            states.append(state)
            actions.append(action)
            rewards.append(reward)
            next_states.append(next_state)
            dones.append(done)
        
        # Convert to tensors
        states = torch.FloatTensor(np.array(states)).to(self.device)
        actions = torch.LongTensor(actions).to(self.device)
        rewards = torch.FloatTensor(rewards).to(self.device)
        next_states = torch.FloatTensor(np.array(next_states)).to(self.device)
        dones = torch.FloatTensor(dones).to(self.device)
        
        # Current Q-values
        current_q = self.q_network(states).gather(1, actions.unsqueeze(1))
        
        # Target Q-values
        with torch.no_grad():
            next_q = self.target_network(next_states).max(1)[0]
            target_q = rewards + (1 - dones) * self.gamma * next_q
        
        # Compute loss
        loss = nn.MSELoss()(current_q.squeeze(), target_q)
        
        # Optimize
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        return loss.item()
    
    def update_target_network(self):
        """Copy weights from Q-network to target network"""
        self.target_network.load_state_dict(self.q_network.state_dict())
    
    def save(self, path="dqn_model.pth"):
        """Save model"""
        torch.save({
            'q_network_state_dict': self.q_network.state_dict(),
            'target_network_state_dict': self.target_network.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'epsilon': self.epsilon,
            'training_losses': self.training_losses
        }, path)
        print(f"💾 DQN model saved to {path}")
    
    def load(self, path="dqn_model.pth"):
        """Load model"""
        if os.path.exists(path):
            checkpoint = torch.load(path, map_location=self.device)
            self.q_network.load_state_dict(checkpoint['q_network_state_dict'])
            self.target_network.load_state_dict(checkpoint['target_network_state_dict'])
            self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            self.epsilon = checkpoint.get('epsilon', self.epsilon)
            self.training_losses = checkpoint.get('training_losses', [])
            print(f"📂 DQN model loaded from {path}")
            return True
        return False
    
    def get_stats(self):
        """Get agent statistics"""
        return {
            'epsilon': self.epsilon,
            'memory_size': len(self.memory),
            'training_steps': self.step_count,
            'avg_loss': np.mean(self.training_losses[-100:]) if self.training_losses else 0,
            'q_network_params': sum(p.numel() for p in self.q_network.parameters())
        }