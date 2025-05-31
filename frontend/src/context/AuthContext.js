// File: src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Business authentication functions
  const businessLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/business/login', { email, password });
      const userData = { 
        ...response.data.user, 
        type: 'business', 
        token: response.data.token 
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const businessRegister = async (businessData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/business/register', businessData);
      const userData = { 
        ...response.data.user, 
        type: 'business', 
        token: response.data.token 
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  // Creator authentication functions
  const creatorLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/creator/login', { email, password });
      const userData = { 
        ...response.data.user, 
        type: 'creator', 
        token: response.data.token,
        profileCompleted: response.data.profileCompleted
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { 
        success: true, 
        profileCompleted: response.data.profileCompleted,
        user: userData
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const creatorRegister = async (creatorData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/creator/register', creatorData);
      const userData = { 
        ...response.data.user, 
        type: 'creator', 
        token: response.data.token 
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateCreatorProfile = async (profileData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/creator/profile', profileData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Update user in state and localStorage
      const updatedUser = { 
        ...user, 
        ...profileData, 
        profileCompleted: true 
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Profile update failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    businessLogin,
    businessRegister,
    creatorLogin,
    creatorRegister,
    logout,
    updateCreatorProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}