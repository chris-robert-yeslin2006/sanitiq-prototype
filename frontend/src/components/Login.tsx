import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert
} from '@mui/material';
import axios from 'axios';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: 'admin', password: 'admin' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://sanitiq-prototype.onrender.com/api/auth/login', credentials);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (error: any) {
      setError('Login failed. Use admin/admin');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          SanitiQ
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Secure Data Sanitization
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            margin="normal"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          Demo credentials: admin / admin hi
          test with these datas
        </Alert>
      </Paper>
    </Container>
  );
};

export default Login;