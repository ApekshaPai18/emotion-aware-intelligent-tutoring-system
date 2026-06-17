import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert, Tab, Tabs } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [existingUsername, setExistingUsername] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // NEW USER: Create account and start learning
  const handleNewUser = async () => {
    if (!newUsername || !newEmail) {
      setError('Please enter username and email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create new user
      const userRes = await axios.post('http://localhost:8000/api/v1/users/', {
        username: newUsername, 
        email: newEmail
      });
      
      console.log('User created:', userRes.data);
      
      // Create session
      const sessionRes = await axios.post('http://localhost:8000/api/v1/sessions/', {
        user_id: userRes.data.id
      });
      
      console.log('Session created:', sessionRes.data);
      
      navigate('/learn', {
        state: {
          userId: userRes.data.id,
          sessionId: sessionRes.data.session_id,
          userName: newUsername,
          userRole: 'user'
        }
      });
    } catch (err: any) {
      console.error('Error:', err);
      let errorMessage = 'Failed to create account';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // EXISTING USER: Login with existing username
  const handleExistingUser = async () => {
    if (!existingUsername) {
      setError('Please enter your username');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Get existing user by username
      const userRes = await axios.get(`http://localhost:8000/api/v1/users/by-username/${existingUsername}`);
      
      // Create a new session for this user
      const sessionRes = await axios.post('http://localhost:8000/api/v1/sessions/', {
        user_id: userRes.data.id
      });
      
      console.log('Session created:', sessionRes.data);
      
      navigate('/learn', {
        state: {
          userId: userRes.data.id,
          sessionId: sessionRes.data.session_id,
          userName: existingUsername,
          userRole: 'user'
        }
      });
    } catch (err: any) {
      console.error('Error:', err);
      setError('User not found. Please create a new account.');
    } finally {
      setLoading(false);
    }
  };

  // ADMIN LOGIN
  const handleAdminLogin = async () => {
    if (!adminUsername || !adminPassword) {
      setError('Please enter admin username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userRes = await axios.get(`http://localhost:8000/api/v1/users/by-username/${adminUsername}`);
      
      if (userRes.data.role !== 'admin') {
        setError('Not an admin account');
        setLoading(false);
        return;
      }
      
      navigate('/admin-dashboard', {
        state: {
          userId: userRes.data.id,
          userName: adminUsername,
          userRole: 'admin'
        }
      });
    } catch (err: any) {
      console.error('Error:', err);
      setError('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          📚 Adaptive Learning System
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Learn Python with AI that adapts to your emotions
        </Typography>
        
        <Tabs value={tab} onChange={(e, v) => { setTab(v); setError(''); }} centered sx={{ mb: 3 }}>
          <Tab label="New User" />
          <Tab label="Existing User" />
          <Tab label="Admin Login" />
        </Tabs>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {/* New User Tab */}
        {tab === 0 && (
          <>
            <TextField
              fullWidth
              label="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleNewUser}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Creating Account...' : 'Create Account & Start'}
            </Button>
          </>
        )}
        
        {/* Existing User Tab */}
        {tab === 1 && (
          <>
            <TextField
              fullWidth
              label="Username"
              value={existingUsername}
              onChange={(e) => setExistingUsername(e.target.value)}
              margin="normal"
              helperText="Enter the username you used before"
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleExistingUser}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Logging in...' : 'Login & Continue Learning'}
            </Button>
          </>
        )}
        
        {/* Admin Login Tab */}
        {tab === 2 && (
          <>
            <TextField
              fullWidth
              label="Admin Username"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Admin Password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleAdminLogin}
              disabled={loading}
              startIcon={<AdminPanelSettingsIcon />}
              sx={{ mt: 3, bgcolor: '#dc004e', '&:hover': { bgcolor: '#b0003a' } }}
            >
              {loading ? 'Logging in...' : 'Admin Login'}
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Home;