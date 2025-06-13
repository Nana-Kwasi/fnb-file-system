//WORKED

// import React, { createContext, useContext, useState, useEffect } from 'react';

// export const ROLES = {
//   HEAD_OF_FINANCE: 'HEAD_OF_FINANCE',
//   CFO: 'CFO',
//   CEO: 'CEO',
//   PC: 'PC',
//   EXCO: 'EXCO',
//   TAX_MANAGER: 'TAX_MANAGER',
//   COST_CONTROL: 'COST_CONTROL',
//   APPROVAL_USER_1: 'APPROVAL_USER_1',
//   APPROVAL_USER_2: 'APPROVAL_USER_2',
//   PAYMENT_USER: 'PAYMENT_USER',
//   DEPARTMENT_USER: 'DEPARTMENT_USER',
// };

// export const DEPARTMENTS = {
//   FINANCE: 'FINANCE',
//   IT: 'IT',
//   HR: 'HR',
//   OPERATIONS: 'OPERATIONS',
//   GLOBALMARKET: 'GLOBALMARKET',
//   MARKETTING: 'MARKETTING',
//   LEGAL: 'LEGAL',
//   COMPLIANCE: 'COMPLIANCE',
//   EXCOBERS: 'EXCOBERS',
//   TAX: 'TAX',
//   COST_CONTROL: 'COST_CONTROL',
// };

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       // Check for existing token in localStorage
//       const storedToken = localStorage.getItem('token');
//       const storedUser = localStorage.getItem('user');
      
//       if (storedToken && storedUser) {
//         setToken(storedToken);
//         setUser(JSON.parse(storedUser));
//       }
//     } catch (error) {
//       console.error('Auth check error:', error);
//       // Clear potentially corrupted data
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const apiRequest = async (endpoint, options = {}) => {
//     const url = `${API_BASE_URL}${endpoint}`;
//     const config = {
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { Authorization: `Bearer ${token}` }),
//         ...options.headers,
//       },
//       ...options,
//     };

//     try {
//       const response = await fetch(url, config);
//       return response;
//     } catch (error) {
//       console.error('API request error:', error);
//       throw error;
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const response = await apiRequest('/api/auth/login', {
//         method: 'POST',
//         body: JSON.stringify({ email, password }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Login failed');
//       }

//       const data = await response.json();

//       if (data.success) {
//         setUser(data.user);
//         setToken(data.token);
        
//         // Store in localStorage
//         localStorage.setItem('user', JSON.stringify(data.user));
//         localStorage.setItem('token', data.token);
        
//         return true;
//       } else {
//         throw new Error(data.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       if (token) {
//         await apiRequest('/api/auth/logout', {
//           method: 'POST',
//         });
//       }
//     } catch (error) {
//       console.error('Logout API error:', error);
//     } finally {
//       setUser(null);
//       setToken(null);
//       // Clear localStorage
//       localStorage.removeItem('user');
//       localStorage.removeItem('token');
//     }
//   };

//   const isAdmin = () => {
//     return user && (
//       user.role === ROLES.HEAD_OF_FINANCE ||
//       user.role === ROLES.CFO ||
//       user.role === ROLES.CEO ||
//       user.role === ROLES.PC ||
//       user.role === ROLES.EXCO
//     );
//   };

//   const hasRole = (requiredRoles) => {
//     if (!user) return false;
//     if (Array.isArray(requiredRoles)) {
//       return requiredRoles.includes(user.role);
//     }
//     return user.role === requiredRoles;
//   };

//   if (loading) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         flexDirection: 'column'
//       }}>
//         <div style={{ 
//           display: 'inline-block',
//           width: '50px',
//           height: '50px',
//           border: '3px solid rgba(0, 0, 0, 0.1)',
//           borderRadius: '50%',
//           borderTopColor: '#2196f3',
//           animation: 'spin 1s ease-in-out infinite'
//         }}></div>
//         <p style={{ marginTop: '10px' }}>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider 
//       value={{
//         user,
//         token,
//         login,
//         logout,
//         loading,
//         apiRequest,
//         isAdmin,
//         hasRole,
//         ROLES,
//         DEPARTMENTS,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


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
  const [sessionId, setSessionId] = useState(null);
  
  // LDAP/2FA specific state
  const [twoFASessionId, setTwoFASessionId] = useState(null);
  const [pendingLdapAuth, setPendingLdapAuth] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for existing token in localStorage
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedSessionId = localStorage.getItem('sessionId');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setSessionId(storedSessionId);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear potentially corrupted data
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    setUser(null);
    setToken(null);
    setSessionId(null);
    setTwoFASessionId(null);
    setPendingLdapAuth(null);
  };

  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(sessionId && { 'x-session-id': sessionId }),
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

  // Helper function to detect f-number format
  const isFnumber = (identifier) => {
    return /^f\d{7}$/i.test(identifier);
  };

  // ===== AUTHENTICATION METHODS =====

  /**
   * Universal login method - handles both email/password and f-number/password
   * @param {string} identifier - Email or f-number
   * @param {string} password - Password
   * @returns {Promise<Object>} Login result
   */
  const login = async (identifier, password) => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          email: identifier, // Controller handles both email and f-number
          password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      if (data.success) {
        // Check if this is LDAP flow requiring 2FA
        if (data.requires2FA) {
          setTwoFASessionId(data.twoFASessionId);
          setPendingLdapAuth({
            fnumber: identifier,
            sessionId: data.twoFASessionId
          });
          
          return {
            success: true,
            requires2FA: true,
            twoFASessionId: data.twoFASessionId,
            message: data.message || '2FA verification required'
          };
        } else {
          // Traditional login success
          setUser(data.user);
          setToken(data.token);
          setSessionId(data.sessionId);
          
          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          localStorage.setItem('sessionId', data.sessionId);
          
          return { success: true, user: data.user };
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * LDAP Authentication - First step for f-number login
   * @param {string} fnumber - F-number (e.g., f8877557)
   * @param {string} password - LDAP password
   * @returns {Promise<Object>} LDAP auth result
   */
  const authenticateLdap = async (fnumber, password) => {
    try {
      const response = await apiRequest('/api/auth/ldap/authenticate', {
        method: 'POST',
        body: JSON.stringify({ fnumber, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'LDAP authentication failed');
      }

      const data = await response.json();

      if (data.success) {
        setTwoFASessionId(data.twoFASessionId);
        setPendingLdapAuth({
          fnumber,
          sessionId: data.twoFASessionId
        });
      }

      return data;
    } catch (error) {
      console.error('LDAP auth error:', error);
      throw error;
    }
  };
  const getUserByFnumber = async (fnumber) => {
    try {
      if (!fnumber) {
        throw new Error('F-number is required');
      }
  
      // Validate F-number format
      if (!/^f\d{7}$/i.test(fnumber)) {
        throw new Error('Invalid F-number format. Expected format: f1234567');
      }
  
      console.log('[AUTH_CONTEXT] Getting user data for F-number:', fnumber);
  
      const response = await apiRequest('/api/auth/get-user-by-fnumber', {
        method: 'POST',
        body: JSON.stringify({ fnumber }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get user data');
      }
  
      const data = await response.json();
      console.log('[AUTH_CONTEXT] User data retrieved successfully:', data.success);
      
      return data;
    } catch (error) {
      console.error('Get user by F-number error:', error);
      throw error;
    }
  };
  
  /**
   * Verify 2FA code - Second step for LDAP login
   * @param {string} code - 2FA verification code
   * @param {string} sessionId - 2FA session ID (optional, uses stored if not provided)
   * @returns {Promise<Object>} 2FA verification result
   */
    const verify2FA = async (code, sessionId = null) => {
    try {
      const activeSessionId = sessionId || twoFASessionId;
      
      if (!activeSessionId) {
        throw new Error('No active 2FA session found');
      }

      const response = await apiRequest('/api/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ 
          code, 
          twoFASessionId: activeSessionId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '2FA verification failed');
      }

      const data = await response.json();

      if (data.success) {
        // Complete login process
        setUser(data.user);
        setToken(data.token);
        setSessionId(data.sessionId);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('sessionId', data.sessionId);
        
        // Clear 2FA state
        setTwoFASessionId(null);
        setPendingLdapAuth(null);
      }

      return data;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  };

  /**
 * Track 2FA verification status
 * @param {string} sessionId - 2FA session ID (required)
 * @returns {Promise<Object>} 2FA status
 */
const track2FAStatus = async (sessionId) => {
  try {
    console.log('[AUTH_CONTEXT] Tracking 2FA status with sessionId:', sessionId ? 'Present' : 'Missing');
    
    // Always require explicit sessionId parameter
    if (!sessionId) {
      throw new Error('2FA session ID is required for status tracking');
    }

    const response = await apiRequest('/api/auth/track-2fa-status', {
      method: 'POST',
      body: JSON.stringify({ 
        token: sessionId, // Backend expects 'token', not 'twoFASessionId'
        twoFASessionId: sessionId // Send both for compatibility
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to track 2FA status');
    }

    const data = await response.json();
    console.log('[AUTH_CONTEXT] Track 2FA response:', data);
    
    return {
      success: data.success,
      verificationStatus: data.verificationStatus,
      statusCode: data.statusCode,
      statusMessage: data.statusMessage,
      verified: data.verificationStatus === "success",
      rejected: data.verificationStatus === "failed",
      pending: data.verificationStatus === "pending",
      fnumber: data.fnumber
    };
  } catch (error) {
    console.error('Track 2FA status error:', error);
    throw error;
  }
};

  /**
   * Verify F-number exists in LDAP (Admin only)
   * @param {string} fnumber - F-number to verify
   * @returns {Promise<Object>} Verification result
   */

  
  const verifyFnumber = async (fnumber) => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const response = await apiRequest('/api/auth/ldap/verify-fnumber', {
        method: 'POST',
        body: JSON.stringify({ fnumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'F-number verification failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('F-number verification error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ sessionId }),
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuthData();
    }
  };

  const isAdmin = (user) => {
    // Check for hardcoded admin usernames/emails first
    if (user?.username === 'Admin' || user?.username === 'admin' || 
        user?.email === 'Admin' || user?.email === 'admin') {
      return true;
    }
    
    // Use consistent admin roles - SAME AS MIDDLEWARE
    const adminRoles = ['HEAD_OF_FINANCE', 'CFO', 'CEO'];
    return user && adminRoles.includes(user.role);
  };

  const hasRole = (requiredRoles) => {
    if (!user) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  // ===== LOGIN LOGS API METHODS =====

  /**
   * Get login logs with filtering and pagination
   * @param {Object} filters - Filter options
   * @param {string} filters.user_id - Filter by user ID
   * @param {string} filters.email - Filter by email (partial match)
   * @param {string} filters.login_status - Filter by status (SUCCESS/FAILED)
   * @param {string} filters.ip_address - Filter by IP address
   * @param {string} filters.start_date - Filter from date (ISO string)
   * @param {string} filters.end_date - Filter to date (ISO string)
   * @param {string} filters.country - Filter by country
   * @param {string} filters.device_type - Filter by device type
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Records per page (default: 50)
   * @returns {Promise<Object>} Login logs data with pagination and stats
   */
  const getLoginLogs = async (filters = {}) => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiRequest(`/api/auth/logs?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch login logs');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get login logs error:', error);
      throw error;
    }
  };

  /**
   * Get login statistics
   * @param {Object} filters - Date range filters
   * @param {string} filters.start_date - Start date (ISO string)
   * @param {string} filters.end_date - End date (ISO string)
   * @returns {Promise<Object>} Login statistics
   */
  const getLoginStats = async (filters = {}) => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const queryParams = new URLSearchParams();
      
      if (filters.start_date) {
        queryParams.append('start_date', filters.start_date);
      }
      if (filters.end_date) {
        queryParams.append('end_date', filters.end_date);
      }

      const response = await apiRequest(`/api/auth/logs/stats?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch login statistics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get login stats error:', error);
      throw error;
    }
  };

  /**
   * Get suspicious login activities
   * @returns {Promise<Object>} Suspicious activities data
   */
  const getSuspiciousActivities = async () => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const response = await apiRequest('/api/auth/logs/suspicious');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch suspicious activities');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get suspicious activities error:', error);
      throw error;
    }
  };

  /**
   * Export login logs as CSV
   * @param {Object} filters - Same filters as getLoginLogs
   * @returns {Promise<Blob>} CSV file blob
   */
  const exportLoginLogs = async (filters = {}) => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiRequest(`/api/auth/logs/export?${queryParams.toString()}`, {
        headers: {
          'Accept': 'text/csv',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export login logs');
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Export login logs error:', error);
      throw error;
    }
  };

  /**
   * Download exported CSV file
   * @param {Object} filters - Export filters
   * @param {string} filename - Optional filename (default: auto-generated)
   */
  const downloadLoginLogsCSV = async (filters = {}, filename = null) => {
    try {
      const blob = await exportLoginLogs(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `login_logs_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download CSV error:', error);
      throw error;
    }
  };

  // ===== USER MANAGEMENT API METHODS =====

  /**
   * Get all users with pagination and search
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Records per page
   * @param {string} options.search - Search term
   * @returns {Promise<Object>} Users data with pagination
   */
  const getAllUsers = async (options = {}) => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const queryParams = new URLSearchParams();
      
      if (options.page) queryParams.append('page', options.page);
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.search) queryParams.append('search', options.search);

      const response = await apiRequest(`/api/auth/users?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  };

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.username - User's username
   * @param {string} userData.password - User's password
   * @param {string} userData.department - User's department
   * @param {string} userData.role - User's role
   * @param {string} userData.fnumber - User's f-number (optional for LDAP users)
   * @returns {Promise<Object>} Created user data
   */
  const createUser = async (userData) => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const response = await apiRequest('/api/auth/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  };

  /**
   * Update user information
   * @param {string} userId - User ID to update
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user data
   */
  const updateUser = async (userId, userData) => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const response = await apiRequest(`/api/auth/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} password - New password
   * @returns {Promise<Object>} Success response
   */
  const updateUserPassword = async (userId, password) => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const response = await apiRequest(`/api/auth/users/${userId}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  /**
   * Delete a user
   * @param {string} userId - User ID to delete
   * @returns {Promise<Object>} Success response
   */
  const deleteUser = async (userId) => {
    try {
      if (!isAdmin(user)) {
        throw new Error('Access denied - Admin privileges required');
      }

      const response = await apiRequest(`/api/auth/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
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
        // Auth state
        user,
        token,
        sessionId,
        loading,
        
        // LDAP/2FA state
        twoFASessionId,
        pendingLdapAuth,
        
        // Auth methods
        login,
        logout,
        isAdmin,
        hasRole,
        apiRequest,
        isFnumber,
        
        // LDAP/2FA methods
        authenticateLdap,
        verify2FA,
        track2FAStatus,
        verifyFnumber,
        getUserByFnumber, // NEW METHOD

        
        // Login Logs methods
        getLoginLogs,
        getLoginStats,
        getSuspiciousActivities,
        exportLoginLogs,
        downloadLoginLogsCSV,
        
        // User Management methods
        getAllUsers,
        createUser,
        updateUser,
        updateUserPassword,
        deleteUser,
        
        // Constants
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



// verify2fa nww
const verify2FA = async (req, res) => {
  const { token, code, fnumber: requestFnumber } = req.body;

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token is required' 
    });
  }

  try {
    console.log("[2FA] Starting 2FA verification process");
    if (code) {
      console.log("[2FA] Verifying with code:", code);
    } else {
      console.log("[2FA] Checking 2FA status without code");
    }
    
    const authToken = await getAuthToken();
    console.log('[2FA] Successfully obtained token for 2FA verification');
    
    console.log('[2FA] Sending verification request to LDAP service');
    const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
      token,
      code: code || ""
    }, { 
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[2FA] Verify response status:', verifyResponse.status);
    console.log('[2FA] Verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
    if (!verifyResponse.data || 
        (verifyResponse.data.status_code !== '000' && 
         verifyResponse.data.status_code !== '0' && 
         verifyResponse.data.status_code !== 0)) {
      console.error('[2FA] 2FA verification failed:', JSON.stringify(verifyResponse.data, null, 2));
      
      const fnumber = verifyResponse.data.fnumber || 
                     (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
                     requestFnumber;
      
      if (fnumber) {
        await loginLogService.logFailedLogin(
          fnumber, 
          '2FA verification failed', 
          req
        );
      }
      
      return res.status(401).json({ 
        success: false, 
        error: verifyResponse.data?.status_message || '2FA verification failed',
        data: verifyResponse.data 
      });
    }
    
    console.log('[2FA] 2FA verification successful');
    
    const fnumber = verifyResponse.data.fnumber || 
                   (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
                   requestFnumber;
                   
    if (!fnumber) {
      console.error('[2FA] No fnumber found in response or request');
      return res.status(400).json({
        success: false,
        error: 'Unable to identify user. Missing F-number in response.',
      });
    }
    
    console.log(`[2FA] User identified as: ${fnumber}`);

    // Call getUserByFnumber logic directly instead of making HTTP request
    console.log(`[2FA] Getting user data for: ${fnumber}`);
    
    // Validate F-number format (f followed by 7 digits)
    const fnumberRegex = /^f\d{7}$/i;
    if (!fnumberRegex.test(fnumber)) {
      await loginLogService.logFailedLogin(
        fnumber, 
        'Invalid F-number format', 
        req
      );
      
      return res.status(400).json({
        success: false,
        error: 'Invalid F-number format. Expected format: f1234567'
      });
    }

    try {
      // Query users table directly instead of making HTTP call
      const userResult = await query(`
        SELECT 
          id, 
          name, 
          email, 
          username, 
          department, 
          role, 
          status, 
          is_active, 
          last_login, 
          created_at, 
          updated_at, 
          is_fnumber_user, 
          fnumber
        FROM users 
        WHERE is_fnumber_user = true 
        AND is_active = true
        AND (LOWER(email) = LOWER($1) OR LOWER(fnumber) = LOWER($1))
      `, [fnumber]);

      console.log(`[2FA] Query result count: ${userResult.rows.length}`);

      if (userResult.rows.length === 0) {
        console.log(`[2FA] F-number user ${fnumber} not found in users table`);
        
        await loginLogService.logFailedLogin(
          fnumber, 
          'User not found in system after 2FA verification', 
          req
        );
        
        return res.status(404).json({
          success: false,
          error: 'F-number user not found in system. Please contact administrator.',
          fnumber: fnumber
        });
      }

      const user = userResult.rows[0];
      console.log(`[2FA] User data retrieved successfully:`, {
        id: user.id,
        email: user.email,
        fnumber: user.fnumber,
        name: user.name,
        role: user.role,
        department: user.department
      });

      // Verify this is indeed an F-number user
      if (!user.is_fnumber_user) {
        console.error(`[2FA] User found but is_fnumber_user is false for ${fnumber}`);
        await loginLogService.logFailedLogin(
          fnumber, 
          'Invalid user type for F-number authentication', 
          req
        );
        
        return res.status(400).json({
          success: false,
          error: 'Invalid user type for F-number authentication.',
          fnumber: fnumber
        });
      }

      // Check if user is active
      if (!user.is_active) {
        console.error(`[2FA] User found but is not active for ${fnumber}`);
        await loginLogService.logFailedLogin(
          fnumber, 
          'User account is not active', 
          req
        );
        
        return res.status(403).json({
          success: false,
          error: 'User account is not active. Please contact administrator.',
          fnumber: fnumber
        });
      }

    } catch (dbError) {
      console.error(`[2FA] Database error while getting user:`, dbError.message);
      
      await loginLogService.logFailedLogin(
        fnumber, 
        `Database error: ${dbError.message}`, 
        req
      );
      
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve user information. Please try again.',
      });
    }
    
    // Generate session token using existing generateToken function
    const sessionToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Store session in user_sessions table
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt]
    );
    
    // Log successful login
    let logInfo = { sessionId: null };
    try {
      logInfo = await loginLogService.logSuccessfulLogin(user, req);
      console.log('[2FA] Login logged successfully');
    } catch (logError) {
      console.error('[2FA] Failed to log successful login:', logError.message);
    }
    
    // Update user's last login
    try {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      console.error('[2FA] Failed to update last login time:', updateError.message);
    }
    
    console.log(`[2FA] Session token generated for user: ${fnumber}`);
    console.log('[2FA] 2FA verification process complete, returning success response');
    
    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      department: user.department,
      role: user.role
    };
    
    return res.status(200).json({
      success: true,
      message: '2FA verification successful - Login complete',
      user: userInfo,
      token: sessionToken,
      sessionId: logInfo.sessionId,
      verifyResponseData: verifyResponse.data 
    });
    
  } catch (err) {
    console.error('[2FA] 2FA verification error:', err.message);
    
    const fnumber = requestFnumber;
    if (fnumber) {
      await loginLogService.logFailedLogin(
        fnumber, 
        `2FA system error: ${err.message}`, 
        req
      );
    }
    
    if (err.response) {
      console.error('[2FA] Error response status:', err.response.status);
      console.error('[2FA] Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      success: false, 
      error: `Server error during 2FA verification: ${err.message}` 
    });
  }
};