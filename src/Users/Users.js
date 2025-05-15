import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Key, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    department: '',
    role: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const { user, ROLES, DEPARTMENTS } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
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

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      department: '',
      role: ''
    });
    setMode('add');
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      department: user.department,
      role: user.role
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

  const handleSubmit = async () => {
    try {
      let response;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      
      if (mode === 'add') {
        response = await fetch('/api/users', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
      } else {
        // For edit mode, don't send password in the update
        const { password, ...updateData } = formData;
        response = await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updateData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to ${mode === 'add' ? 'add' : 'update'} user`);
      }
      
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const response = await fetch(`/api/users/${currentUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update password');
      }
      
      setPasswordModalOpen(false);
      alert('Password updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Check if user is admin (username or email is 'admin')
  const isAdmin = user?.username === 'admin' || user?.email === 'admin';

  // If not admin, don't render anything
  if (!isAdmin) {
    return null;
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="loading">
        <div style={{ 
          display: 'inline-block',
          width: '50px',
          height: '50px',
          border: '3px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          borderTopColor: '#2196f3',
          animation: 'spin 1s ease-in-out infinite'
        }}></div>
        <p>Loading users...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* Header with title and add button */}
      <div className="users-header">
        <div>
          <h2><Users size={20} style={{ display: 'inline', marginRight: '8px' }} /> User Management</h2>        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={openAddModal} className="add-user-btn">
            <UserPlus size={16} /> Register New User
          </button>
          
          <button 
            onClick={fetchUsers}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error" style={{ backgroundColor: '#FFEBEE', borderLeft: '4px solid #F44336', padding: '16px', marginBottom: '20px' }}>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => { setError(null); fetchUsers(); }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={18} />
        <input
          type="text"
          placeholder="Search users by name, email, username, department or role..."
          style={{ 
            width: '100%', 
            padding: '10px 10px 10px 40px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            fontSize: '14px'
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.department}</td>
                  <td>{user.role}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons">
                      <button 
                        onClick={() => openEditModal(user)} 
                        className="edit-btn"
                        title="Edit user"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => openPasswordModal(user)} 
                        className="password-btn"
                        title="Change password"
                      >
                        <Key size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="delete-btn"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  {searchTerm ? 'No users match your search' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{mode === 'add' ? 'Register New User' : 'Edit User'}</h2>
            
            <div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {mode === 'add' && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  {Object.values(DEPARTMENTS).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Role</option>
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-buttons">
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginRight: '10px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="submit-btn"
              >
                {mode === 'add' ? 'Register User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && currentUser && (
        <div className="modal">
          <div className="modal-content">
            <h2>Change Password</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Update password for {currentUser.username}</p>
            
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="modal-buttons">
              <button
                onClick={() => setPasswordModalOpen(false)}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginRight: '10px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="submit-btn"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
   
 

      <style jsx>{`
        .users-container {
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .users-header h2 {
          font-size: 1.5rem;
          color: #333;
          margin: 0;
        }
        
        .add-user-btn {
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .add-user-btn:hover {
          background-color: #45a049;
        }
        
        .users-table-wrapper {
          overflow-x: auto;
          margin-bottom: 20px;
        }
        
        .users-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .users-table th,
        .users-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .users-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #333;
        }
        
        .users-table tr:hover {
          background-color: #f9f9f9;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
        }
        
        .action-buttons button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .edit-btn {
          color: #2196f3;
        }
        
        .edit-btn:hover {
          background-color: rgba(33, 150, 243, 0.1);
        }
        
        .password-btn {
          color: #ff9800;
        }
        
        .password-btn:hover {
          background-color: rgba(255, 152, 0, 0.1);
        }
        
        .delete-btn {
          color: #f44336;
        }
        
        .delete-btn:hover {
          background-color: rgba(244, 67, 54, 0.1);
        }
        
        .retry-btn {
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          margin-top: 10px;
        }
        
        .loading, .error {
          text-align: center;
          padding: 20px;
          font-size: 1rem;
        }
        
        .error {
          color: #f44336;
        }
        
        /* Modal styles */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .modal-content h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 1.5rem;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .submit-btn {
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .submit-btn:hover {
          background-color: #45a049;
        }
        
        .cancel-btn {
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .cancel-btn:hover {
          background-color: #d32f2f;
        }
      `}</style>
    </div>
  );
};

export default UsersManagement;