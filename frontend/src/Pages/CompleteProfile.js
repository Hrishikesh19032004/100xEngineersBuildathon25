// src/pages/CompleteProfile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatorProfileForm from '../components/CreatorProfileForm';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Container
} from '@mui/material';

function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [needsCompletion, setNeedsCompletion] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/profile-status', {
          credentials: 'include',
        });
        const data = await response.json();
        if (!data.needsCompletion) {
          navigate('/creator');
        } else {
          setNeedsCompletion(true);
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
              <CircularProgress />
            </Box>
          ) : !needsCompletion ? (
            <Typography align="center" variant="h6">Redirecting...</Typography>
          ) : (
            <CreatorProfileForm />
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default CompleteProfile;
