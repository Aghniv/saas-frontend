// Frontend authentication service

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Set auth token for API requests
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  } else {
    delete axios.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
};

// Load token from storage
const loadToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      return token;
    }
  }
  return null;
};

// Login user
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { token, user } = response.data;
    
    setAuthToken(token);
    
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
};

// Logout user
const logout = () => {
  setAuthToken(null);
  return { success: true };
};

// Get current user profile
const getCurrentUser = async () => {
  try {
    loadToken();
    const response = await axios.get(`${API_URL}/profile`);
    return { success: true, user: response.data.user };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get user profile'
    };
  }
};

// Invite a new user (admin only)
const inviteUser = async (email, role) => {
  try {
    const response = await axios.post(`${API_URL}/invite`, { email, role });
    return { success: true, user: response.data.user };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to invite user'
    };
  }
};

// Upgrade tenant to Pro plan (admin only)
const upgradeToPro = async (slug) => {
  try {
    const response = await axios.post(`${API_URL}/tenants/${slug}/upgrade`);
    return { success: true, tenant: response.data.tenant };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to upgrade subscription'
    };
  }
};

export {
  setAuthToken,
  loadToken,
  login,
  logout,
  getCurrentUser,
  inviteUser,
  upgradeToPro
};