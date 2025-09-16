'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, loadToken } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (loadToken()) {
          const { success, user } = await getCurrentUser();
          if (success && user) {
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { success, user, message } = await apiLogin(email, password);

      if (success && user) {
        setUser(user);
        return { success: true };
      } else {
        setError(message || 'Login failed');
        return { success: false, message };
      }
    } catch (error) {
      const message = error.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    apiLogout();
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!user;

  // Check if user is admin
  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);