import React, { createContext, useContext, useState, useEffect } from 'react';

export const ROLES = {
  HEAD_OF_FINANCE: 'HEAD_OF_FINANCE',
  CFO: 'CFO',
  CEO: 'CEO',
  PC: 'PC',
  EXCO: 'EXCO',
  TAX_MANAGER: 'TAX_MANAGER',
  COST_CONTROL: 'COST_CONTROL',
  APPROVAL_USER_1: 'APPROVAL_USER_1',
  APPROVAL_USER_2: 'APPROVAL_USER_2',
  PAYMENT_USER: 'PAYMENT_USER',
  DEPARTMENT_USER: 'DEPARTMENT_USER',
};

export const DEPARTMENTS = {
  FINANCE: 'FINANCE',
  IT: 'IT',
  HR: 'HR',
  OPERATIONS: 'OPERATIONS',
  GLOBALMARKET: 'GLOBALMARKET',
  MARKETTING: 'MARKETTING',
  LEGAL: 'LEGAL',
  COMPLIANCE: 'COMPLIANCE',
  EXCOBERS: 'EXCOBERS',
  TAX: 'TAX',
  COST_CONTROL: 'COST_CONTROL',
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for existing token in localStorage
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      setToken(null);
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const isAdmin = () => {
    return user && (
      user.role === ROLES.HEAD_OF_FINANCE ||
      user.role === ROLES.CFO ||
      user.role === ROLES.CEO ||
      user.role === ROLES.PC ||
      user.role === ROLES.EXCO
    );
  };

  const hasRole = (requiredRoles) => {
    if (!user) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ 
          display: 'inline-block',
          width: '50px',
          height: '50px',
          border: '3px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          borderTopColor: '#2196f3',
          animation: 'spin 1s ease-in-out infinite'
        }}></div>
        <p style={{ marginTop: '10px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider 
      value={{
        user,
        token,
        login,
        logout,
        loading,
        apiRequest,
        isAdmin,
        hasRole,
        ROLES,
        DEPARTMENTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};