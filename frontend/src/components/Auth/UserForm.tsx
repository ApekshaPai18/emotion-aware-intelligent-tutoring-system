import React, { useState } from 'react';

import {
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { createUser } from '../../api/client';
import { User } from '../../types';

interface UserFormProps {
  onUserCreated: (user: User) => void;
}

const UserForm: React.FC<UserFormProps> = ({ onUserCreated }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const user = await createUser({ username, email });
    onUserCreated(user);
  } catch (err: any) {
    console.error('Full error:', err);
    // Show more detailed error message
    const errorMessage = err.response?.data?.detail || err.message || 'Failed to create user';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center">
        Welcome to Emotion-Aware ITS
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your details to start learning
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          margin="normal"
          disabled={loading}
        />
        
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          margin="normal"
          disabled={loading}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? 'Creating...' : 'Start Learning'}
        </Button>
      </form>
    </Paper>
  );
};

export default UserForm;
