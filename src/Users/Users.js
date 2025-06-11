
// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Users, 
//   UserPlus, 
//   Edit, 
//   Trash2, 
//   Key, 
//   Search, 
//   RefreshCw, 
//   AlertCircle 
// } from 'lucide-react';

// const UsersManagement = () => {
//   // State management
//   const [users, setUsers] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [modalOpen, setModalOpen] = useState(false);
//   const [passwordModalOpen, setPasswordModalOpen] = useState(false);
//   const [mode, setMode] = useState('add'); // 'add' or 'edit'
//   const [currentUser, setCurrentUser] = useState(null);
//   const [newPassword, setNewPassword] = useState('');
//   const [debugInfo, setDebugInfo] = useState([]);
  
//   // Pagination state
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 0
//   });

//   // Form data state
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     username: '',
//     password: '',
//     department: '',
//     role: ''
//   });

//   // Constants
//   const DEPARTMENTS = {
//     FINANCE: 'FINANCE',
//     IT: 'IT',
//     HR: 'HR',
//     OPERATIONS: 'OPERATIONS',
//     GLOBALMARKET: 'GLOBALMARKET',
//     MARKETTING: 'MARKETTING',
//     LEGAL: 'LEGAL',
//     COMPLIANCE: 'COMPLIANCE',
//     EXCOBERS: 'EXCOBERS',
//     TAX: 'TAX',
//     COST_CONTROL: 'COST_CONTROL'
//   };

//   const ROLES = {
//     HEAD_OF_FINANCE: 'HEAD_OF_FINANCE',
//     CFO: 'CFO',
//     CEO: 'CEO',
//     PC: 'PC',
//     EXCO: 'EXCO',
//     TAX_MANAGER: 'TAX_MANAGER',
//     COST_CONTROL: 'COST_CONTROL',
//     APPROVAL_USER_1: 'APPROVAL_USER_1',
//     APPROVAL_USER_2: 'APPROVAL_USER_2',
//     PAYMENT_USER: 'PAYMENT_USER',
//     DEPARTMENT_USER: 'DEPARTMENT_USER'
//   };

  
//   const addDebugInfo = (info) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setDebugInfo(prev => [...prev, `${timestamp}: ${info}`]);
//   };

//   const getAuthToken = () => {
//     return localStorage.getItem('token') || sessionStorage.getItem('token');
//   };

//   const isAdmin = () => {
//   const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
//   if (storedUser) {
//     try {
//       const user = JSON.parse(storedUser);
//       return user?.username === 'Admin' || user?.email === 'Admin';
//     } catch (e) {
//       console.error('Error parsing stored user:', e);
//       return false;
//     }
//   }
//   return false;
// };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       email: '',
//       username: '',
//       password: '',
//       department: '',
//       role: ''
//     });
//   };

//   // API functions
//  // API functions
//   const apiCall = async (url, options = {}) => {
//     const token = getAuthToken();
//     const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
//     const fullUrl = `${baseURL}${url}`;
//     const defaultHeaders = {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` })
//     };

//     try {
//       const response = await fetch(fullUrl, {
//         ...options,
//         headers: {
//           ...defaultHeaders,
//           ...options.headers
//         }
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || `HTTP error! status: ${response.status}`);
//       }

//       return data;
//     } catch (error) {
//       addDebugInfo(`API Error: ${error.message}`);
//       throw error;
//     }
//   };

//     const fetchUsers = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     addDebugInfo('Fetching users...');

//     try {
//       const queryParams = new URLSearchParams({
//         page: pagination.page.toString(),
//         limit: pagination.limit.toString(),
//         ...(searchTerm && { search: searchTerm })
//       });

//       const data = await apiCall(`/api/auth/users?${queryParams}`);
      
//       if (data.success) {
//         setUsers(data.users);
//         setPagination(data.pagination);
//         addDebugInfo(`Loaded ${data.users.length} users`);
//       } else {
//         throw new Error(data.message || 'Failed to fetch users');
//       }
//     } catch (err) {
//       setError(`Failed to load users: ${err.message}`);
//       addDebugInfo(`Error: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   }, 
  
//   [pagination.page, pagination.limit, searchTerm]);


  

//   const createUser = async (userData) => {
//     addDebugInfo('Creating user...');
    
//     try {
//       const data = await apiCall('/api/auth/users', {
//         method: 'POST',
//         body: JSON.stringify(userData)
//       });

//       if (data.success) {
//         addDebugInfo(`User created: ${data.user.email}`);
//         return data;
//       } else {
//         throw new Error(data.message || 'Failed to create user');
//       }
//     } catch (error) {
//       addDebugInfo(`Create error: ${error.message}`);
//       throw error;
//     }
//   };

//   const updateUser = async (userId, userData) => {
//     addDebugInfo(`Updating user ${userId}...`);
    
//     try {
//       const data = await apiCall(`/api/auth/users/${userId}`, {
//         method: 'PUT',
//         body: JSON.stringify(userData)
//       });

//       if (data.success) {
//         addDebugInfo(`User updated: ${data.user.email}`);
//         return data;
//       } else {
//         throw new Error(data.message || 'Failed to update user');
//       }
//     } catch (error) {
//       addDebugInfo(`Update error: ${error.message}`);
//       throw error;
//     }
//   };

//   const updatePassword = async (userId, newPassword) => {
//     addDebugInfo(`Updating password for user ${userId}...`);
    
//     try {
//       const data = await apiCall(`/api/auth/users/${userId}/password`, {
//         method: 'PATCH',
//         body: JSON.stringify({ password: newPassword })
//       });

//       if (data.success) {
//         addDebugInfo('Password updated successfully');
//         return data;
//       } else {
//         throw new Error(data.message || 'Failed to update password');
//       }
//     } catch (error) {
//       addDebugInfo(`Password update error: ${error.message}`);
//       throw error;
//     }
//   };

//   const deleteUser = async (userId) => {
//     addDebugInfo(`Deleting user ${userId}...`);
    
//     try {
//       const data = await apiCall(`/api/auth/users/${userId}`, {
//         method: 'DELETE'
//       });

//       if (data.success) {
//         addDebugInfo('User deleted successfully');
//         return data;
//       } else {
//         throw new Error(data.message || 'Failed to delete user');
//       }
//     } catch (error) {
//       addDebugInfo(`Delete error: ${error.message}`);
//       throw error;
//     }
//   };

//   // Event handlers
//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   const handlePageChange = (newPage) => {
//     setPagination(prev => ({ ...prev, page: newPage }));
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handlePasswordChange = (e) => {
//     setNewPassword(e.target.value);
//   };

//   const openAddModal = () => {
//     setMode('add');
//     resetForm();
//     setModalOpen(true);
//     setError(null);
//   };

//   const openEditModal = (user) => {
//     setMode('edit');
//     setCurrentUser(user);
//     setFormData({
//       name: user.name,
//       email: user.email,
//       username: user.username,
//       password: '',
//       department: user.department,
//       role: user.role
//     });
//     setModalOpen(true);
//     setError(null);
//   };

//   const openPasswordModal = (user) => {
//     setCurrentUser(user);
//     setNewPassword('');
//     setPasswordModalOpen(true);
//     setError(null);
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       // Validation
//       if (!formData.name || !formData.email || !formData.username || !formData.department || !formData.role) {
//         throw new Error('All fields are required');
//       }

//       if (mode === 'add' && (!formData.password || formData.password.length < 6)) {
//         throw new Error('Password must be at least 6 characters long');
//       }

//       if (mode === 'add') {
//         await createUser(formData);
//       } else {
//         const updateData = {
//           name: formData.name,
//           email: formData.email,
//           username: formData.username,
//           department: formData.department,
//           role: formData.role
//         };
//         await updateUser(currentUser.id, updateData);
//       }

//       setModalOpen(false);
//       resetForm();
//       setCurrentUser(null);
//       fetchUsers();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePasswordSubmit = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       if (!newPassword || newPassword.length < 6) {
//         throw new Error('Password must be at least 6 characters long');
//       }

//       await updatePassword(currentUser.id, newPassword);
//       setPasswordModalOpen(false);
//       setNewPassword('');
//       setCurrentUser(null);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteUser = async (userId, userName) => {
//   if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
//     return;
//   }

//   setIsLoading(true);
//   setError(null);

//   try {
//     // Wait for deletion to complete successfully
//     const result = await deleteUser(userId);
    
//     // Only refresh if deletion was successful
//     if (result && result.success) {
//       addDebugInfo(`User ${userName} deleted successfully`);
//       // Refresh the users list from the database
//       await fetchUsers();
//     } else {
//       throw new Error('Deletion failed - no success response');
//     }
//   } catch (err) {
//     addDebugInfo(`Delete failed: ${err.message}`);
//     setError(`Failed to delete user: ${err.message}`);
//     // Don't refresh the list if deletion failed
//   } finally {
//     setIsLoading(false);
//   }
// };
//   // Effects
//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   // Debounced search effect
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       if (searchTerm !== '') {
//         fetchUsers();
//       }
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   }, [searchTerm, fetchUsers]);

//   return (
//   <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//     {/* Debug Panel */}
//     {/* <div style={{
//       backgroundColor: '#f8f9fa',
//       border: '1px solid #dee2e6',
//       borderRadius: '4px',
//       padding: '15px',
//       marginBottom: '20px'
//     }}>
//       <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
//         <AlertCircle size={16} />
//         Debug Information
//       </h4>
//       <div style={{ fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
//         <div><strong>Current State:</strong></div>
//         <div>• Users count: {users.length}</div>
//         <div>• Is loading: {isLoading.toString()}</div>
//         <div>• Error: {error || 'None'}</div>
//         <div>• Search term: "{searchTerm}"</div>
//         <div>• Is admin: {isAdmin().toString()}</div>
//         <div style={{ marginTop: '10px' }}><strong>Debug Log:</strong></div>
//         {debugInfo.slice(-10).map((info, index) => (
//           <div key={index} style={{ color: '#666' }}>• {info}</div>
//         ))}
//       </div>
//     </div> */}

//     {/* Header with title and add button */}
//     <div style={{ 
//       display: 'flex', 
//       justifyContent: 'space-between', 
//       alignItems: 'center', 
//       marginBottom: '20px' 
//     }}>
//       <div>
//         <h2 style={{ margin: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <Users size={20} /> 
//           User Management
//         </h2>
//         {pagination.total > 0 && (
//           <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0 28px' }}>
//             {pagination.total} total users
//           </p>
//         )}
//       </div>
      
//       <div style={{ display: 'flex', gap: '10px' }}>
//         <button 
//           onClick={openAddModal}
//           style={{
//             backgroundColor: '#2196f3',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             padding: '10px 16px',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '8px',
//             cursor: 'pointer',
//             fontWeight: '500'
//           }}
//         >
//           <UserPlus size={16} /> Register New User
//         </button>
        
//         <button 
//           onClick={fetchUsers}
//           disabled={isLoading}
//           style={{
//             backgroundColor: '#f5f5f5',
//             color: '#333',
//             border: 'none',
//             borderRadius: '4px',
//             padding: '8px 16px',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '8px',
//             cursor: isLoading ? 'not-allowed' : 'pointer',
//             fontWeight: '500',
//             opacity: isLoading ? 0.6 : 1
//           }}
//         >
//           <RefreshCw size={16} /> Refresh
//         </button>
//       </div>
//     </div>

//     {error && (
//       <div style={{ 
//         backgroundColor: '#FFEBEE', 
//         borderLeft: '4px solid #F44336', 
//         padding: '16px', 
//         marginBottom: '20px',
//         borderRadius: '4px'
//       }}>
//         <p style={{ margin: '0 0 8px 0', color: '#c62828' }}>{error}</p>
//         <button 
//           onClick={() => { setError(null); fetchUsers(); }}
//           style={{
//             backgroundColor: '#f44336',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             padding: '6px 12px',
//             cursor: 'pointer',
//             fontSize: '12px'
//           }}
//         >
//           Try again
//         </button>
//       </div>
//     )}

//     {/* Search and Filter */}
//     <div style={{ marginBottom: '20px', position: 'relative' }}>
//       <Search style={{ 
//         position: 'absolute', 
//         left: '10px', 
//         top: '50%', 
//         transform: 'translateY(-50%)', 
//         color: '#666' 
//       }} size={18} />
//       <input
//         type="text"
//         placeholder="Search users by name, email, username, department or role..."
//         style={{ 
//           width: '100%', 
//           padding: '10px 10px 10px 40px', 
//           border: '1px solid #ddd', 
//           borderRadius: '4px',
//           fontSize: '14px',
//           boxSizing: 'border-box'
//         }}
//         value={searchTerm}
//         onChange={handleSearchChange}
//       />
//     </div>

//     {/* Users Table */}
//     <div style={{ 
//       border: '1px solid #ddd', 
//       borderRadius: '4px', 
//       overflow: 'hidden',
//       backgroundColor: 'white'
//     }}>
//       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr style={{ backgroundColor: '#f8f9fa' }}>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'green'}}>Name</th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'green'}}>Username</th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd',color:'green' }}>Email</th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'green'}}>Department</th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd',color:'green' }}>Role</th>
//             <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd',color:'green' }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users && users.length > 0 ? (
//             users.map((user, index) => (
//               <tr key={user.id} style={{ borderBottom: index < users.length - 1 ? '1px solid #eee' : 'none' }}>
//                 <td style={{ padding: '12px' }}>{user.name}</td>
//                 <td style={{ padding: '12px' }}>{user.username}</td>
//                 <td style={{ padding: '12px' }}>{user.email}</td>
//                 <td style={{ padding: '12px' }}>{user.department}</td>
//                 <td style={{ padding: '12px' }}>{user.role}</td>
//                 <td style={{ padding: '12px', textAlign: 'right' }}>
//                   <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
//                     <button 
//                       onClick={() => openEditModal(user)}
//                       title="Edit user"
//                       style={{
//                         backgroundColor: '#4CAF50',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         padding: '6px 8px',
//                         cursor: 'pointer'
//                       }}
//                     >
//                       <Edit size={14} />
//                     </button>
//                     <button 
//                       onClick={() => openPasswordModal(user)}
//                       title="Change password"
//                       style={{
//                         backgroundColor: '#ff9800',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         padding: '6px 8px',
//                         cursor: 'pointer'
//                       }}
//                     >
//                       <Key size={14} />
//                     </button>
//                     <button 
//                       onClick={() => handleDeleteUser(user.id, user.name)}
//                       title="Delete user"
//                       style={{
//                         backgroundColor: '#f44336',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         padding: '6px 8px',
//                         cursor: 'pointer'
//                       }}
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
//                 {searchTerm ? 'No users match your search' : 'No users found'}
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>

//     {/* Pagination */}
//     {pagination.pages > 1 && (
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         marginTop: '20px',
//         gap: '10px'
//       }}>
//         <button 
//           onClick={() => handlePageChange(pagination.page - 1)}
//           disabled={pagination.page <= 1}
//           style={{
//             padding: '8px 12px',
//             border: '1px solid #ddd',
//             borderRadius: '4px',
//             backgroundColor: pagination.page <= 1 ? '#f5f5f5' : 'white',
//             cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer'
//           }}
//         >
//           Previous
//         </button>
        
//         <span style={{ color: '#666' }}>
//           Page {pagination.page} of {pagination.pages}
//         </span>
        
//         <button 
//           onClick={() => handlePageChange(pagination.page + 1)}
//           disabled={pagination.page >= pagination.pages}
//           style={{
//             padding: '8px 12px',
//             border: '1px solid #ddd',
//             borderRadius: '4px',
//             backgroundColor: pagination.page >= pagination.pages ? '#f5f5f5' : 'white',
//             cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer'
//           }}
//         >
//           Next
//         </button>
//       </div>
//     )}

//     {/* Add/Edit User Modal */}
//     {modalOpen && (
//       <div style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 1000
//       }}>
//         <div style={{
//           backgroundColor: 'white',
//           borderRadius: '8px',
//           padding: '24px',
//           width: '400px',
//           maxHeight: '80vh',
//           overflowY: 'auto'
//         }}>
//           <h2 style={{ margin: '0 0 20px 0' }}>
//             {mode === 'add' ? 'Register New User' : 'Edit User'}
//           </h2>
          
//           {error && (
//             <div style={{ 
//               backgroundColor: '#FFEBEE', 
//               color: '#c62828', 
//               padding: '10px', 
//               borderRadius: '4px', 
//               marginBottom: '16px',
//               fontSize: '14px'
//             }}>
//               {error}
//             </div>
//           )}
          
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//             <div>
//               <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
//                 Full Name *
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter full name"
//                 style={{
//                   width: '100%',
//                   padding: '8px',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   boxSizing: 'border-box'
//                 }}
//               />
//             </div>
            
//             <div>
//               <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
//                 Email *
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter email address"
//                 style={{
//                   width: '100%',
//                   padding: '8px',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   boxSizing: 'border-box'
//                 }}
//               />
//             </div>
            
//             <div>
//               <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
//                 Username *
//               </label>
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter username"
//                 style={{
//                   width: '100%',
//                   padding: '8px',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   boxSizing: 'border-box'
//                 }}
//               />
//             </div>
            
//             {mode === 'add' && (
//               <div>
//                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
//                   Password *
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   required
//                   placeholder="Enter password (min 6 characters)"
//                   minLength="6"
//                   style={{
//                     width: '100%',
//                     padding: '8px',
//                     border: '1px solid #ddd',
//                     borderRadius: '4px',
//                     boxSizing: 'border-box'
//                   }}
//                 />
//               </div>
//             )}
            
//             <div>
//               <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
//                 Department *
//               </label>
//               <select
//                 name="department"
//                 value={formData.department}
//                 onChange={handleInputChange}
//                 required
//                 style={{
//                   width: '100%',
//                   padding: '8px',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   boxSizing: 'border-box'
//                 }}
//               >
//                 <option value="">Select Department</option>
//                 {Object.values(DEPARTMENTS).map((dept) => (
//                   <option key={dept} value={dept}>
//                     {dept.replace(/_/g, ' ')}
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <div>
//               <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
//                 Role *
//               </label>
//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleInputChange}
//                 required
//                 style={{
//                   width: '100%',
//                   padding: '8px',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   boxSizing: 'border-box'
//                 }}
//               >
//                 <option value="">Select Role</option>
//                 {Object.values(ROLES).map((role) => (
//                   <option key={role} value={role}>
//                     {role.replace(/_/g, ' ')}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
          
//           <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
//             <button
//               onClick={() => {
//                 setModalOpen(false);
//                 setError(null);
//                 resetForm();
//                 setCurrentUser(null);
//               }}
//               style={{
//                 backgroundColor: '#f5f5f5',
//                 color: '#333',
//                 border: 'none',
//                 borderRadius: '4px',
//                 padding: '10px 20px',
//                 cursor: 'pointer',
//                 fontWeight: '500'
//               }}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               disabled={isLoading}
//               style={{
//                 backgroundColor: '#2196f3',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 padding: '10px 20px',
//                 cursor: isLoading ? 'not-allowed' : 'pointer',
//                 fontWeight: '500',
//                 opacity: isLoading ? 0.6 : 1
//               }}
//             >
//               {isLoading ? 'Processing...' : (mode === 'add' ? 'Register User' : 'Save Changes')}
//             </button>
//           </div>
//         </div>
//       </div>
//     )}

//     {/* Change Password Modal */}
//     {passwordModalOpen && currentUser && (
//       <div style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 1000
//       }}>
//         <div style={{
//           backgroundColor: 'white',
//           borderRadius: '8px',
//           padding: '24px',
//           width: '400px'
//         }}>
//           <h2 style={{ margin: '0 0 20px 0' }}>Change Password</h2>
//           <p style={{ color: '#666', marginBottom: '20px' }}>
//             Update password for <strong>{currentUser.name}</strong> ({currentUser.username})
//           </p>
          
//           {error && (
//             <div style={{ 
//               backgroundColor: '#FFEBEE', 
//               color: '#c62828', 
//               padding: '10px', 
//               borderRadius: '4px', 
//               marginBottom: '16px',
//               fontSize: '14px'
//             }}>
//               {error}
//             </div>
//           )}
          
//           <div>
//             <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
//               New Password *
//             </label>
//             <input
//               type="password"
//               value={newPassword}
//               onChange={handlePasswordChange}
//               required
//               placeholder="Enter new password (min 6 characters)"
//               minLength="6"
//               style={{
//                 width: '100%',
//                 padding: '8px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 boxSizing: 'border-box'
//               }}
//             />
//           </div>
          
//           <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
//             <button
//               onClick={() => {
//                 setPasswordModalOpen(false);
//                 setError(null);
//                 setNewPassword('');
//                 setCurrentUser(null);
//               }}
//               style={{
//                 backgroundColor: '#f5f5f5',
//                 color: '#333',
//                 border: 'none',
//                 borderRadius: '4px',
//                 padding: '10px 20px',
//                 cursor: 'pointer',
//                 fontWeight: '500'
//               }}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handlePasswordSubmit}
//               disabled={isLoading}
//               style={{
//                 backgroundColor: '#ff9800',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 padding: '10px 20px',
//                 cursor: isLoading ? 'not-allowed' : 'pointer',
//                 fontWeight: '500',
//                 opacity: isLoading ? 0.6 : 1
//               }}
//             >
//               {isLoading ? 'Updating...' : 'Update Password'}
//             </button>
//           </div>
//         </div>
//       </div>
//     )}
//   </div>
// );
// }
// export default UsersManagement;



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
  
  // F-number verification states - simplified
  const [isFnumber, setIsFnumber] = useState(false);
  const [fnumberVerifying, setFnumberVerifying] = useState(false);
  
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

  // F-number verification function - Fixed to match working code pattern
  const verifyFnumber = async (fnumber) => {
    try {
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
        throw new Error(errorData.message || errorData.error || 'F-number verification failed');
      }
  
      const data = await response.json();
      console.log('F-number verification response:', data);
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
    setFnumberVerifying(false);
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

  // Fixed createUser function
  const createUser = async (userData) => {
    console.log('Creating user with data:', userData);
    try {
      const data = await apiCall('/api/auth/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (data.success) {
        console.log(`User created successfully: ${data.user?.email || userData.email}`);
        return data;
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error(`Create user error: ${error.message}`);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Only detect F-number pattern, don't verify yet
    if (name === 'email') {
      const isCurrentlyFnumber = isFnumberPattern(value);
      setIsFnumber(isCurrentlyFnumber);
      
      // Clear password field for F-number users
      if (isCurrentlyFnumber) {
        setFormData(prev => ({ ...prev, password: '' }));
      }
    }
  };

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
    setIsFnumber(isFnumberPattern(user.email));
    
    setModalOpen(true);
    setError(null);
  };

  const openPasswordModal = (user) => {
    setCurrentUser(user);
    setNewPassword('');
    setPasswordModalOpen(true);
    setError(null);
  };

  // Fixed handleSubmit function - main fix is here
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setFnumberVerifying(false);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.username || !formData.department || !formData.role) {
        throw new Error('All fields are required');
      }

      // Password validation: required for non-F-number users in add mode
      if (mode === 'add' && !isFnumber && (!formData.password || formData.password.length < 6)) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (mode === 'add') {
        let userData;
        let ldapUserData = null;
        
        if (isFnumber) {
          // For F-number users, verify first before creating
          setFnumberVerifying(true);
          console.log('Verifying F-number:', formData.email.trim());
          
          try {
            const verificationResult = await verifyFnumber(formData.email.trim());
            console.log('Verification result:', verificationResult);
            
            // FIXED: Check verification success more carefully - similar to working code
            // The working code checks verifyData.isValid, so let's check for success indicators
            if (verificationResult.error || (!verificationResult.success && !verificationResult.isValid)) {
              throw new Error(verificationResult.error || verificationResult.message || 'F-number verification failed');
            }

            // If we have isValid field (like the working code), check it
            if (verificationResult.hasOwnProperty('isValid') && !verificationResult.isValid) {
              throw new Error('User not found in required group');
            }
            
            // Extract user data from LDAP response
            if (verificationResult.data) {
              ldapUserData = verificationResult.data;
            }
            
            // Prepare user data for F-number users
            userData = {
              name: formData.name || ldapUserData?.name || '',
              email: ldapUserData?.email || formData.email, // Use LDAP email if available
              username: formData.username || ldapUserData?.userId || '',
              department: formData.department,
              role: formData.role,
              isFnumberUser: true,
              fnumber: formData.email.trim(),
              ldapData: ldapUserData // Include LDAP data for backend processing
            };
            
            console.log('F-number user data prepared:', userData);
            
          } catch (verifyError) {
            console.error('F-number verification error:', verifyError);
            throw new Error(`F-number verification failed: ${verifyError.message}`);
          } finally {
            setFnumberVerifying(false);
          }
        } else {
          // Regular user with password
          userData = {
            ...formData,
            isFnumberUser: false
          };
        }
        
        console.log('Creating user with final data:', userData);
        
        // Create the user - this should now be called after successful verification
        const createResult = await createUser(userData);
        console.log('User creation result:', createResult);
        
      } else {
        // Edit mode
        const updateData = {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          department: formData.department,
          role: formData.role
        };
        await updateUser(currentUser.id, updateData);
      }

      // Success - close modal and refresh
      setModalOpen(false);
      resetForm();
      setCurrentUser(null);
      await fetchUsers();
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setFnumberVerifying(false);
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
  <div className="user-management-container">
    
    <div className="header-section">
      <div>
        <h2 className="header-title">
          <Users size={20} /> 
          User Management
        </h2>
        {pagination.total > 0 && (
          <p className="user-count">
            {pagination.total} total users
          </p>
        )}
      </div>
      
      <div className="header-buttons">
        <button 
          onClick={openAddModal}
          className="btn-primary"
        >
          <UserPlus size={16} /> Register New User
        </button>
        
        <button 
          onClick={fetchUsers}
          disabled={isLoading}
          className="btn-refresh"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
    </div>

    {error && (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          onClick={() => { setError(null); fetchUsers(); }}
          className="btn-error-retry"
        >
          Try again
        </button>
      </div>
    )}

    {/* Search and Filter */}
    <div className="search-container">
      <Search className="search-icon" size={18} />
      <input
        type="text"
        placeholder="Search users by name, email, username, department or role..."
        className="search-input"
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>

    {/* Users Table */}
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr className="table-header">
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length > 0 ? (
            users.map((user, index) => (
              <tr key={user.id} className="table-row">
                <td className="table-cell">{user.name}</td>
                <td className="table-cell">{user.username}</td>
                <td className="table-cell">{user.email}</td>
                <td className="table-cell">{user.department}</td>
                <td className="table-cell">{user.role}</td>
                <td className="table-cell text-right">
                  <div className="action-buttons">
                    <button 
                      onClick={() => openEditModal(user)}
                      title="Edit user"
                      className="btn-edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => openPasswordModal(user)}
                      title="Change password"
                      className="btn-password"
                    >
                      <Key size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      title="Delete user"
                      className="btn-delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="empty-state">
                {searchTerm ? 'No users match your search' : 'No users found'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    {pagination.pages > 1 && (
      <div className="pagination-container">
        <button 
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="btn-pagination"
        >
          Previous
        </button>
        
        <span className="pagination-info">
          Page {pagination.page} of {pagination.pages}
        </span>
        
        <button 
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
          className="btn-pagination"
        >
          Next
        </button>
      </div>
    )}

    {/* Add/Edit User Modal */}
    {modalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">
            {mode === 'add' ? 'Register New User' : 'Edit User'}
          </h2>
          
          {error && (
            <div className="modal-error">
              {error}
            </div>
          )}

          {/* Show F-number info during verification */}
          {mode === 'add' && isFnumber && fnumberVerifying && (
            <div className="verification-status verification-loading">
              <div className="loading-spinner"></div>
              Verifying F-number...
            </div>
          )}
          
          <div className="form-container">
            <div className="form-group">
              <label>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>
                Email {mode === 'add' && '(Enter F-number for LDAP users or regular email)'} *
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder={mode === 'add' ? "Enter F-number (e.g., F123456) or email address" : "Enter email address"}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter username"
                className="form-input"
              />
            </div>
            
            {/* Password field - hidden for F-number users in add mode */}
            {!(mode === 'add' && isFnumber) && (
              <div className="form-group">
                <label>
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
                  className="form-input"
                />
              </div>
            )}

            {/* Show note for F-number users */}
            {mode === 'add' && isFnumber && (
              <div className="info-note">
                <Info size={14} />
                F-number users will use LDAP authentication. F-number will be verified when you submit the form.
              </div>
            )}
            
            <div className="form-group">
              <label>
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Select Department</option>
                {Object.values(DEPARTMENTS).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="form-select"
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
          
          <div className="modal-buttons">
            <button
              onClick={() => {
                setModalOpen(false);
                setError(null);
                resetForm();
                setCurrentUser(null);
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || fnumberVerifying}
              className="btn-submit"
            >
              {isLoading || fnumberVerifying ? 'Processing...' : (mode === 'add' ? 'Register User' : 'Save Changes')}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Change Password Modal */}
    {passwordModalOpen && currentUser && (
      <div className="modal-overlay">
        <div className="password-modal-content">
          <h2 className="modal-title">Change Password</h2>
          <p className="password-user-info">
            Update password for <strong>{currentUser.name}</strong> ({currentUser.username})
          </p>
          
          {error && (
            <div className="modal-error">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label>
              New Password *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Enter new password (min 6 characters)"
              minLength="6"
              className="form-input"
            />
          </div>
          
          <div className="modal-buttons">
            <button
              onClick={() => {
                setPasswordModalOpen(false);
                setError(null);
                setNewPassword('');
                setCurrentUser(null);
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordSubmit}
              disabled={isLoading}
              className="btn-update-password"
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
        
        .verification-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background-color: #e3f2fd;
          border: 1px solid #2196f3;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}
    </style>
  </div>
);
}

export default UsersManagement;





