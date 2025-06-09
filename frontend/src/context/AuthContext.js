import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUserProfile(decoded);
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (decoded) => {
    try {
      const response = await api.get('http://localhost:5000/api/auth/me'); // assuming this returns the user with `profile_completed`
      const user = response.data;
      setCurrentUser({
        ...user,
        ...decoded,
        profileCompleted: user.profile_completed,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('http://localhost:5000/api/auth/login', { email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const decoded = jwtDecode(token);
    setCurrentUser({
      ...user,
      ...decoded,
      profileCompleted: user.profile_completed,
    });

    return user;
  };

  const signup = async (userData) => {
    const response = await api.post('http://localhost:5000/api/auth/signup', userData);
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const decoded = jwtDecode(token);
    setCurrentUser({
      ...user,
      ...decoded,
      profileCompleted: user.profile_completed,
    });

    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('http://localhost:5000/api/auth/refresh');
      const { token } = response.data;

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const decoded = jwtDecode(token);
      await fetchUserProfile(decoded);
    } catch (error) {
      logout();
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    refreshToken,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
