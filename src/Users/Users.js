import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Key, 
  Search, 
  RefreshCw, 
  CheckCircle,
  X,
  Info,
  AlertCircle
} from 'lucide-react';

const UsersManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  
  // F-number verification states
  const [isFnumber, setIsFnumber] = useState(false);
  const [fnumberVerifying, setFnumberVerifying] = useState(false);
  const [fnumberVerified, setFnumberVerified] = useState(false);
  const [fnumberError, setFnumberError] = useState(null);
  const [isFnumberUser, setIsFnumberUser] = useState(false);
  const [fnumberVerificationStatus, setFnumberVerificationStatus] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    department: '',
    role: ''
  });

  // Constants
  const DEPARTMENTS = {
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
    COST_CONTROL: 'COST_CONTROL'
  };

  const ROLES = {
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
    DEPARTMENT_USER: 'DEPARTMENT_USER'
  };

  // Helper function to detect F-number pattern
  const isFnumberPattern = (email) => {
    return /^[Ff]\d+/.test(email.trim());
  };

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const isAdmin = () => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user?.username === 'Admin' || user?.email === 'Admin';
      } catch (e) {
        console.error('Error parsing stored user:', e);
        return false;
      }
    }
    return false;
  };

  // F-number verification function
  const verifyFnumber = async (fnumber) => {
    try {
      if (!isAdmin()) {
        throw new Error('Access denied - Admin privileges required');
      }

      const token = getAuthToken();
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${baseURL}/api/auth/ldap/verify-fnumber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      department: '',
      role: ''
    });
    setIsFnumber(false);
    setFnumberVerified(false);
    setFnumberError(null);
    setFnumberVerifying(false);
    setIsFnumberUser(false);
    setFnumberVerificationStatus(null);
  };

  // API functions
  const apiCall = useCallback(async (url, options = {}) => {
    const token = getAuthToken();
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const fullUrl = `${baseURL}${url}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const data = await apiCall(`/api/auth/users?${queryParams}`);
      
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, apiCall]);

  const createUser = async (userData) => {
    try {
      const data = await apiCall('/api/auth/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const data = await apiCall(`/api/auth/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });

      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (userId, newPassword) => {
    try {
      const data = await apiCall(`/api/auth/users/${userId}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ password: newPassword })
      });

      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const data = await apiCall(`/api/auth/users/${userId}`, {
        method: 'DELETE'
      });

      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      throw error;
    }
  };

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Handle email field changes for F-number detection
    if (name === 'email') {
      const isCurrentlyFnumber = isFnumberPattern(value);
      
      if (isCurrentlyFnumber && !isFnumber) {
        // F-number detected for the first time
        setIsFnumber(true);
        setIsFnumberUser(true);
        setFnumberError(null);
        setFnumberVerified(false);
        
        // Clear password field since it's not needed for F-number users
        setFormData(prev => ({ ...prev, password: '' }));
        
        // Start verification if value is long enough
        if (value.trim().length >= 4) {
          setFnumberVerifying(true);
          try {
            const result = await verifyFnumber(value.trim());
            if (result.success) {
              setFnumberVerified(true);
              setFnumberError(null);
              setFnumberVerificationStatus({ success: true, message: 'F-number verified successfully' });
              
              // Auto-populate fields if available from verification
              if (result.user) {
                setFormData(prev => ({
                  ...prev,
                  name: result.user.displayName || prev.name,
                  username: result.user.samAccountName || prev.username
                }));
              }
            } else {
              setFnumberVerified(false);
              setFnumberError(result.message || 'F-number verification failed');
              setFnumberVerificationStatus({ success: false, message: result.message || 'F-number verification failed' });
            }
          } catch (error) {
            setFnumberVerified(false);
            setFnumberError(error.message);
            setFnumberVerificationStatus({ success: false, message: error.message });
          } finally {
            setFnumberVerifying(false);
          }
        }
      } else if (!isCurrentlyFnumber && isFnumber) {
        // No longer an F-number pattern
        setIsFnumber(false);
        setIsFnumberUser(false);
        setFnumberVerified(false);
        setFnumberError(null);
        setFnumberVerifying(false);
        setFnumberVerificationStatus(null);
      } else if (isCurrentlyFnumber && isFnumber && value.trim().length >= 4) {
        // Continue verification for F-number changes
        setFnumberVerifying(true);
        try {
          const result = await verifyFnumber(value.trim());
          if (result.success) {
            setFnumberVerified(true);
            setFnumberError(null);
            setFnumberVerificationStatus({ success: true, message: 'F-number verified successfully' });
            
            if (result.user) {
              setFormData(prev => ({
                ...prev,
                name: result.user.displayName || prev.name,
                username: result.user.samAccountName || prev.username
              }));
            }
          } else {
            setFnumberVerified(false);
            setFnumberError(result.message || 'F-number verification failed');
            setFnumberVerificationStatus({ success: false, message: result.message || 'F-number verification failed' });
          }
        } catch (error) {
          setFnumberVerified(false);
          setFnumberError(error.message);
          setFnumberVerificationStatus({ success: false, message: error.message });
        } finally {
          setFnumberVerifying(false);
        }
      }
    }
  };

  const handleEmailChange = handleInputChange;

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const openAddModal = () => {
    setMode('add');
    resetForm();
    setModalOpen(true);
    setError(null);
  };

  const openEditModal = (user) => {
    setMode('edit');
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: '',
      department: user.department,
      role: user.role
    });
    
    // Check if editing user has F-number email
    if (isFnumberPattern(user.email)) {
      setIsFnumber(true);
      setIsFnumberUser(true);
      setFnumberVerified(true); // Assume it's already verified since user exists
    } else {
      setIsFnumber(false);
      setIsFnumberUser(false);
      setFnumberVerified(false);
    }
    
    setModalOpen(true);
    setError(null);
  };

  const openPasswordModal = (user) => {
    setCurrentUser(user);
    setNewPassword('');
    setPasswordModalOpen(true);
    setError(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.username || !formData.department || !formData.role) {
        throw new Error('All fields are required');
      }

      // For F-number users, ensure verification passed
      if (isFnumber && !fnumberVerified) {
        throw new Error('F-number must be verified before registration');
      }

      // Password validation: required for non-F-number users in add mode
      if (mode === 'add' && !isFnumber && (!formData.password || formData.password.length < 6)) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (mode === 'add') {
        // For F-number users, don't send password
        const userData = isFnumber ? {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          department: formData.department,
          role: formData.role,
          isFnumberUser: true
        } : formData;
        
        await createUser(userData);
      } else {
        const updateData = {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          department: formData.department,
          role: formData.role
        };
        await updateUser(currentUser.id, updateData);
      }

      setModalOpen(false);
      resetForm();
      setCurrentUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      await updatePassword(currentUser.id, newPassword);
      setPasswordModalOpen(false);
      setNewPassword('');
      setCurrentUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteUser(userId);
      
      if (result && result.success) {
        await fetchUsers();
      } else {
        throw new Error('Deletion failed - no success response');
      }
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchUsers]);

  return (
  <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
    
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px' 
    }}>
      <div>
        <h2 style={{ margin: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} /> 
          User Management
        </h2>
        {pagination.total > 0 && (
          <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0 28px' }}>
            {pagination.total} total users
          </p>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={openAddModal}
          style={{
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <UserPlus size={16} /> Register New User
        </button>
        
        <button 
          onClick={fetchUsers}
          disabled={isLoading}
          style={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
    </div>

    {error && (
      <div style={{ 
        backgroundColor: '#FFEBEE', 
        borderLeft: '4px solid #F44336', 
        padding: '16px', 
        marginBottom: '20px',
        borderRadius: '4px'
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#c62828' }}>{error}</p>
        <button 
          onClick={() => { setError(null); fetchUsers(); }}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Try again
        </button>
      </div>
    )}

    {/* Search and Filter */}
    <div style={{ marginBottom: '20px', position: 'relative' }}>
      <Search style={{ 
        position: 'absolute', 
        left: '10px', 
        top: '50%', 
        transform: 'translateY(-50%)', 
        color: '#666' 
      }} size={18} />
      <input
        type="text"
        placeholder="Search users by name, email, username, department or role..."
        style={{ 
          width: '100%', 
          padding: '10px 10px 10px 40px', 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>

    {/* Users Table */}
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px', 
      overflow: 'hidden',
      backgroundColor: 'white'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'green'}}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'green'}}>Username</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd',color:'green' }}>Email</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'green'}}>Department</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd',color:'green' }}>Role</th>
            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd',color:'green' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length > 0 ? (
            users.map((user, index) => (
              <tr key={user.id} style={{ borderBottom: index < users.length - 1 ? '1px solid #eee' : 'none' }}>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>{user.username}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>{user.department}</td>
                <td style={{ padding: '12px' }}>{user.role}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => openEditModal(user)}
                      title="Edit user"
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => openPasswordModal(user)}
                      title="Change password"
                      style={{
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Key size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      title="Delete user"
                      style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                {searchTerm ? 'No users match your search' : 'No users found'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    {pagination.pages > 1 && (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: '20px',
        gap: '10px'
      }}>
        <button 
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: pagination.page <= 1 ? '#f5f5f5' : 'white',
            cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        
        <span style={{ color: '#666' }}>
          Page {pagination.page} of {pagination.pages}
        </span>
        
        <button 
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: pagination.page >= pagination.pages ? '#f5f5f5' : 'white',
            cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
      </div>
    )}

    {/* Add/Edit User Modal */}
    {modalOpen && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '400px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h2 style={{ margin: '0 0 20px 0' }}>
            {mode === 'add' ? 'Register New User' : 'Edit User'}
          </h2>
          
          {error && (
            <div style={{ 
              backgroundColor: '#FFEBEE', 
              color: '#c62828', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* F-number verification status */}
          {mode === 'add' && isFnumber && (
            <div style={{ 
              backgroundColor: fnumberVerified ? '#E8F5E8' : '#FFEBEE', 
              color: fnumberVerified ? '#2e7d32' : '#c62828', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {fnumberVerified ? (
                <>
                  <CheckCircle size={16} />
                  F-number verified successfully
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  {fnumberError || 'F-number verification required'}
                </>
              )}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Email {mode === 'add' && '(Enter F-number for LDAP users or regular email)'} *
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder={mode === 'add' ? "Enter F-number (e.g., F123456) or email address" : "Enter email address"}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              {mode === 'add' && fnumberVerifying && (
                <div style={{ 
                  marginTop: '4px', 
                  fontSize: '12px', 
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #2196f3',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Verifying F-number...
                </div>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter username"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {/* Password field - hidden for F-number users in add mode */}
            {!(mode === 'add' && isFnumber) && (
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!(mode === 'add' && isFnumber)}
                  placeholder="Enter password (min 6 characters)"
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Show note for F-number users */}
            {mode === 'add' && isFnumber && (
              <div style={{ 
                backgroundColor: '#E3F2FD', 
                color: '#1976d2', 
                padding: '10px', 
                borderRadius: '4px', 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={14} />
                F-number users will use LDAP authentication. No password required.
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select Department</option>
                {Object.values(DEPARTMENTS).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select Role</option>
                {Object.values(ROLES).map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setModalOpen(false);
                setError(null);
                resetForm();
                setCurrentUser(null);
              }}
              style={{
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (mode === 'add' && isFnumber && !fnumberVerified)}
              style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                cursor: (isLoading || (mode === 'add' && isFnumber && !fnumberVerified)) ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: (isLoading || (mode === 'add' && isFnumber && !fnumberVerified)) ? 0.6 : 1
              }}
            >
              {isLoading ? 'Processing...' : (mode === 'add' ? 'Register User' : 'Save Changes')}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Change Password Modal */}
    {passwordModalOpen && currentUser && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '400px'
        }}>
          <h2 style={{ margin: '0 0 20px 0' }}>Change Password</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Update password for <strong>{currentUser.name}</strong> ({currentUser.username})
          </p>
          
          {error && (
            <div style={{ 
              backgroundColor: '#FFEBEE', 
              color: '#c62828', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              New Password *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Enter new password (min 6 characters)"
              minLength="6"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setPasswordModalOpen(false);
                setError(null);
                setNewPassword('');
                setCurrentUser(null);
              }}
              style={{
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordSubmit}
              disabled={isLoading}
              style={{
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Add CSS for spinner animation */}
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);
}
export default UsersManagement;








