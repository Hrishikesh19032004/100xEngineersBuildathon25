
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BusinessDashboard from './pages/BusinessDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import ChatRoom from './pages/ChatRoom';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import CompleteProfile from './pages/CompleteProfile';
import Home from './pages/Home';
import Contact from './pages/Contact';
import About from './pages/About';
import AppNavbar from './components/AppNavbar';
import YTChecker from './pages/YTChecker';
import InfluencerChat from './pages/flask/Chat.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#111827', // Dark background to match
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    // Remove default MUI padding/margins
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
        },
        html: {
          margin: 0,
          padding: 0,
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
            <AppNavbar/>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/ytchecker" element={<YTChecker />} />
              <Route path="/recommender" element={<InfluencerChat />} />

              <Route element={<Layout />}>
                <Route 
                  path="/business" 
                  element={
                    <ProtectedRoute allowedRoles={['business']}>
                      <BusinessDashboard />
                    </ProtectedRoute>
                  } 
                />
              
                <Route 
                  path="/creator" 
                  element={
                    <ProtectedRoute allowedRoles={['creator']}>
                      <CreatorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat/:id" 
                  element={
                    <ProtectedRoute>
                      <ChatRoom />
                    </ProtectedRoute>
                  } 
                />
              </Route>
              <Route 
                path="/complete-profile" 
                element={
                  <ProtectedRoute allowedRoles={['creator']}>
                    <CompleteProfile />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;