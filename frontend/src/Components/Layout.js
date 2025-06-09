import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../api'; // adjust path if different

function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (currentUser?.role === 'creator') {
        try {
          const response = await api.get('http://localhost:5000/api/auth/profile-status');
          if (response.data.needsCompletion && !location.pathname.includes('/complete-profile')) {
            navigate('/complete-profile');
          }
        } catch (error) {
          console.error('Error checking profile status:', error);
        }
      }
    };

    checkProfileCompletion();
  }, [currentUser, navigate, location]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        {/* <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Business-Creator Platform
          </Typography>
          {currentUser && (
            <>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                {currentUser.username} ({currentUser.role})
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar> */}
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'grey.100' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Business-Creator Platform
        </Typography>
      </Box>
    </Box>
  );
}

export default Layout;
