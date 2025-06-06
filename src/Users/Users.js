import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Key, Search, RefreshCw, AlertCircle } from 'lucide-react';

// Mock AuthContext for testing
const mockAuthContext = {
  user: { id: 1, name: 'Admin', role: 'ADMIN' },
  ROLES: {
    ADMIN: 'ADMIN',
    USER: 'USER',
    MANAGER: 'MANAGER'
  },
  DEPARTMENTS: {
    IT: 'IT',
    HR: 'HR',
    FINANCE: 'FINANCE',
    OPERATIONS: 'OPERATIONS'
  },
  apiRequest: async (url, options = {}) => {
    console.log('API Request:', url, options);
    
    // Mock API responses for testing
    if (url.includes('/api/auth/users')) {
      return {
        ok: true,
        json: async () => ({
          success: true,
          users: [
            { id: 1, name: 'John Doe', username: 'johndoe', email: 'john@example.com', department: 'IT', role: 'ADMIN' },
            { id: 2, name: 'Jane Smith', username: 'janesmith', email: 'jane@example.com', department: 'HR', role: 'USER' },
            { id: 3, name: 'Bob Johnson', username: 'bobjohnson', email: 'bob@example.com', department: 'FINANCE', role: 'MANAGER' }
          ],
          pagination: { total: 3, pages: 1 }
        })
      };
    }
    
    return { ok: true, json: async () => ({ success: true, message: 'Operation successful' }) };
  },
  isAdmin: () => true
};

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    department: '',
    role: ''
  });
  const [newPassword, setNewPassword] = useState('');
  
  // Use mock context for this demo
  const { user, ROLES, DEPARTMENTS, apiRequest, isAdmin } = mockAuthContext;

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`DEBUG: ${message}`);
  };

  useEffect(() => {
    addDebugInfo('Component mounted');
    addDebugInfo(`isAdmin(): ${isAdmin()}`);
    
    if (isAdmin()) {
      addDebugInfo('User is admin, fetching users');
      fetchUsers();
    } else {
      addDebugInfo('User is not admin, access denied');
    }
  }, [searchTerm, pagination.page]);

  const fetchUsers = async () => {
    try {
      addDebugInfo('Starting fetchUsers');
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm
      });

      const url = `/api/auth/users?${queryParams}`;
      addDebugInfo(`Making API request to: ${url}`);
      
      const response = await apiRequest(url);
      addDebugInfo(`API response ok: ${response.ok}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      addDebugInfo(`API response data: ${JSON.stringify(data)}`);
      
      if (data.success) {
        addDebugInfo(`Setting ${data.users?.length || 0} users`);
        setUsers(data.users || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      addDebugInfo(`Fetch error: ${err.message}`);
      console.error('Fetch users error:', err);
      setError(err.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
      addDebugInfo('fetchUsers completed');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
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
  };

  const openAddModal = () => {
    resetForm();
    setMode('add');
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      password: '',
      department: user.department || '',
      role: user.role || ''
    });
    setCurrentUser(user);
    setMode('edit');
    setModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setCurrentUser(user);
    setNewPassword('');
    setPasswordModalOpen(true);
  };

  const validateForm = () => {
    const { name, email, username, password, department, role } = formData;
    
    if (!name.trim()) {
      throw new Error('Name is required');
    }
    if (!email.trim()) {
      throw new Error('Email is required');
    }
    if (!username.trim()) {
      throw new Error('Username is required');
    }
    if (!department) {
      throw new Error('Department is required');
    }
    if (!role) {
      throw new Error('Role is required');
    }
    if (mode === 'add' && !password.trim()) {
      throw new Error('Password is required');
    }
    if (mode === 'add' && password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      validateForm();
      
      let response;
      
      if (mode === 'add') {
        response = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      } else {
        const { password, ...updateData } = formData;
        response = await apiRequest(`/api/auth/users/${currentUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${mode === 'add' ? 'create' : 'update'} user`);
      }

      const data = await response.json();
      
      if (data.success) {
        setModalOpen(false);
        resetForm();
        setCurrentUser(null);
        await fetchUsers();
        alert(data.message || `User ${mode === 'add' ? 'registered' : 'updated'} successfully`);
      } else {
        throw new Error(data.message || `Failed to ${mode === 'add' ? 'register' : 'update'} user`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      setError(null);
      
      if (!newPassword.trim()) {
        throw new Error('Password is required');
      }
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const response = await apiRequest(`/api/auth/users/${currentUser.id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ password: newPassword })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }

      const data = await response.json();
      
      if (data.success) {
        setPasswordModalOpen(false);
        setNewPassword('');
        setCurrentUser(null);
        alert(data.message || 'Password updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setError(null);
      
      const response = await apiRequest(`/api/auth/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchUsers();
        alert(data.message || 'User deleted successfully');
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // If not admin, show access denied
  if (!isAdmin()) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        color: '#666'
      }}>
        <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h3>Access Denied</h3>
        <p>You don't have permission to access user management.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
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
        <p style={{ marginTop: '10px' }}>Loading users...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Debug Panel */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          Debug Information
        </h4>
        <div style={{ fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
          <div><strong>Current State:</strong></div>
          <div>• Users count: {users.length}</div>
          <div>• Is loading: {isLoading.toString()}</div>
          <div>• Error: {error || 'None'}</div>
          <div>• Search term: "{searchTerm}"</div>
          <div>• Is admin: {isAdmin().toString()}</div>
          <div style={{ marginTop: '10px' }}><strong>Debug Log:</strong></div>
          {debugInfo.slice(-10).map((info, index) => (
            <div key={index} style={{ color: '#666' }}>• {info}</div>
          ))}
        </div>
      </div>

      {/* Header with title and add button */}
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
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Username</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Department</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Actions</th>
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
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
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
              
              {mode === 'add' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
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
                disabled={isLoading}
                style={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  opacity: isLoading ? 0.6 : 1
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
    </div>
  );
};

export default UsersManagement;