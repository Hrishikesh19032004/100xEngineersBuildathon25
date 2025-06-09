import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('business');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await signup({ email, password, username, role });
      navigate('/' + (role === 'business' ? 'business' : 'creator'));
    } catch (err) {
      setError('Failed to sign up: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0f0f1b',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glowing background orbs */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}>
        <Box sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: 'rgba(147, 51, 234, 0.25)',
          filter: 'blur(80px)',
          animation: 'pulse 8s ease-in-out infinite',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          backgroundColor: 'rgba(236, 72, 153, 0.25)',
          filter: 'blur(80px)',
          animation: 'pulse 6s ease-in-out infinite',
        }} />
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          backgroundColor: 'rgba(56, 189, 248, 0.2)',
          filter: 'blur(60px)',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 10s ease-in-out infinite',
        }} />
      </Box>

      <Container maxWidth="xs" sx={{ zIndex: 10 }}>
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" sx={{
            mb: 2,
            fontWeight: 600,
            background: 'linear-gradient(to right, #c084fc, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Sign Up
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                input: { color: 'white' },
                label: { color: '#bbb' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#888' },
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                input: { color: 'white' },
                label: { color: '#bbb' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#888' },
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                input: { color: 'white' },
                label: { color: '#bbb' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#888' },
                }
              }}
            />
            <FormControl fullWidth margin="normal" sx={{
              '& .MuiInputLabel-root': { color: '#bbb' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: '#888' },
                color: 'white'
              }
            }}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="creator">Creator</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(to right, #9333ea, #ec4899)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(to right, #7e22ce, #db2777)',
                  transform: 'scale(1.02)'
                }
              }}
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2" sx={{ color: '#bbb', '&:hover': { color: '#fff' } }}>
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>

      {/* Keyframe animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </Box>
  );
}

export default Signup;
