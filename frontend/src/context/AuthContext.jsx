import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set default API URL
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching current user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrUsername, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { emailOrUsername, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. User may already exist.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
