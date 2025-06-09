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
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/' + (email.includes('business') ? 'business' : 'creator'));
    } catch (err) {
      setError('Failed to log in: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#0f0f0f',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient Background Blobs */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: 'rgba(168, 85, 247, 0.2)',
            filter: 'blur(80px)',
            borderRadius: '50%',
            animation: 'pulse 6s infinite ease-in-out',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '300px',
            height: '300px',
            background: 'rgba(236, 72, 153, 0.2)',
            filter: 'blur(80px)',
            borderRadius: '50%',
            animation: 'pulse 8s infinite ease-in-out',
          }
        }}
      />

      {/* Login Box */}
      <Container maxWidth="xs" sx={{ zIndex: 10, backgroundColor: '#1f1f1f', p: 4, borderRadius: 4, boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            Sign In
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                style: { color: 'white' },
              }}
              InputLabelProps={{
                style: { color: '#aaa' },
              }}
              sx={{ input: { backgroundColor: '#2c2c2c' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                style: { color: 'white' },
              }}
              InputLabelProps={{
                style: { color: '#aaa' },
              }}
              sx={{ input: { backgroundColor: '#2c2c2c' } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #a855f7, #ec4899)',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(to right, #9333ea, #db2777)',
                  boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)',
                }
              }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2" sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" variant="body2" sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>

      {/* Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }
      `}</style>
    </Box>
  );
}

export default Login;
