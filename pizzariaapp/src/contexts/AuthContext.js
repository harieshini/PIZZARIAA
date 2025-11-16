import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api, { setAuthToken } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Error loading user:', err.response?.data || err.message);
      setToken(null);
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      loadUser();
    } else {
      setAuthToken(null);
      setLoading(false);
    }
  }, [token, loadUser]);

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      setAuthToken(newToken);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      setAuthToken(newToken);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
