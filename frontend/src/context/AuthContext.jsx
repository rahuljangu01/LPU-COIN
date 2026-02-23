import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

 // AuthContext.jsx में register फंक्शन अपडेट करें
const register = async (name, email, password, role, collegeId, phoneNumber, faceDescriptor, otp) => {
  try {
    setLoading(true);
    const response = await axios.post(`${API_URL}/auth/register`, {
      name, email, password, role, collegeId, phoneNumber, faceDescriptor, otp // <--- otp यहाँ भेजा गया है
    });
    setToken(response.data.token);
    setUser(response.data.user);
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (err) {
    throw err;
  } finally {
    setLoading(false);
  }
};

  // 2. लॉगिन
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const getMe = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success) {
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (err) {
      if (err.response?.status === 401) logout();
      throw err;
    }
  }, [token]);

  const updateMe = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/auth/update-me`, userData);
      if (response.data.success) {
        await getMe();
        return response.data;
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwords) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/auth/change-password`, passwords);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      register,
      login,
      logout,
      getMe,
      updateMe,
      changePassword,
      forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};