import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import "../logs.css"

const Logs = () => {
  const { 
    getLoginLogs, 
    getLoginStats, 
    getSuspiciousActivities, 
    downloadLoginLogsCSV,
    isAdmin,
    user
  } = useAuth();

  // State management
  const [logs, setLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState([]); // New state for grouped logs
  const [allUserLogs, setAllUserLogs] = useState({}); // Store all logs by user
  const [stats, setStats] = useState(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserLogs, setSelectedUserLogs] = useState([]); // All logs for selected user
  const [showModal, setShowModal] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    email: '',
    login_status: '',
    ip_address: '',
    start_date: '',
    end_date: '',
    country: '',
    device_type: '',
    limit: 50
  });

  // Use the same admin check logic as Dashboard
  const isAdminUser = () => {
    // Check hardcoded admin usernames/emails first
    if (user?.username === 'Admin' || user?.username === 'admin' || 
        user?.email === 'Admin' || user?.email === 'admin') {
      return true;
    }
    
    // Use the isAdmin function from AuthContext
    return isAdmin();
  };

  // Group logs by user (email or username)
  const groupLogsByUser = (logsData) => {
    const grouped = {};
    
    logsData.forEach(log => {
      const userKey = log.email || log.username || log.user_name || 'Unknown';
      
      if (!grouped[userKey]) {
        grouped[userKey] = [];
      }
      grouped[userKey].push(log);
    });

    // Sort logs within each group by timestamp (most recent first)
    Object.keys(grouped).forEach(userKey => {
      grouped[userKey].sort((a, b) => 
        new Date(b.login_timestamp) - new Date(a.login_timestamp)
      );
    });

    // Create array of most recent log per user for table display
    const mostRecentLogs = Object.keys(grouped).map(userKey => {
      const userLogs = grouped[userKey];
      const mostRecent = userLogs[0];
      
      // Add count of total logs for this user
      return {
        ...mostRecent,
        totalLogsCount: userLogs.length,
        userKey: userKey
      };
    });

    // Sort by most recent login timestamp
    mostRecentLogs.sort((a, b) => 
      new Date(b.login_timestamp) - new Date(a.login_timestamp)
    );

    setAllUserLogs(grouped);
    setGroupedLogs(mostRecentLogs);
  };

  // Load data on component mount
  useEffect(() => {
    if (isAdminUser()) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [logsData, statsData, suspiciousData] = await Promise.all([
        getLoginLogs({ ...filters, page: currentPage }),
        getLoginStats(filters),
        getSuspiciousActivities()
      ]);

      const fetchedLogs = logsData.data || [];
      setLogs(fetchedLogs);
      
      // Group the logs by user
      groupLogsByUser(fetchedLogs);
      
      setStats(logsData.stats || statsData);
      setSuspiciousActivities(suspiciousData.data || []);
      
      if (logsData.pagination) {
        setTotalPages(logsData.pagination.pages || 1);
      }
    } catch (err) {
      setError(err.message);
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    loadDashboardData();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      email: '',
      login_status: '',
      ip_address: '',
      start_date: '',
      end_date: '',
      country: '',
      device_type: '',
      limit: 50
    });
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Reload data with new page
    setTimeout(loadDashboardData, 0);
  };

  // Export logs
  const handleExport = async () => {
    try {
      setLoading(true);
      await downloadLoginLogsCSV(filters);
    } catch (err) {
      setError('Export failed: ' + err.message);
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString();
  };

  // Format session duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const mins = Math.floor(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  // Handle user click to show modal with all user logs
  const handleUserClick = (log) => {
    const userKey = log.userKey || log.email || log.username || log.user_name || 'Unknown';
    const userLogs = allUserLogs[userKey] || [log];
    
    setSelectedUser(log);
    setSelectedUserLogs(userLogs);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSelectedUserLogs([]);
  };

  // Check admin access
  if (!isAdminUser()) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You need administrator privileges to view login logs.</p>
        <p>Current user: {user?.username || 'Unknown'}</p>
        <p>Current email: {user?.email || 'Unknown'}</p>
      </div>
    );
  }

  return (
    <div className="logs-container">
      <h1 className="logs-title">Login Logs Dashboard</h1>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stats-card total-logins">
            <h3>Total Logins</h3>
            <p>{stats.total_logins || 0}</p>
          </div>
          <div className="stats-card successful">
            <h3>Successful</h3>
            <p>{stats.successful_logins || 0}</p>
          </div>
          <div className="stats-card failed">
            <h3>Failed</h3>
            <p>{stats.failed_logins || 0}</p>
          </div>
          <div className="stats-card unique-users">
            <h3>Unique Users</h3>
            <p>{stats.unique_users || 0}</p>
          </div>
          <div className="stats-card unique-ips">
            <h3>Unique IPs</h3>
            <p>{stats.unique_ips || 0}</p>
          </div>
        </div>
      )}

      {/* Suspicious Activities Alert */}
      {suspiciousActivities.length > 0 && (
        <div className="suspicious-alert">
          <h3>⚠️ Suspicious Activities Detected ({suspiciousActivities.length})</h3>
          {suspiciousActivities.map((activity, index) => (
            <div key={index} className="suspicious-item">
              <strong>{activity.alert_type}:</strong> {activity.details} 
              <span className="suspicious-count"> (Count: {activity.count})</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h3 className="filters-title">Filters</h3>
        <div className="filters-grid">
          <input
            type="email"
            placeholder="Email"
            value={filters.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
            className="filter-input"
          />
          <select
            value={filters.login_status}
            onChange={(e) => handleFilterChange('login_status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
          <input
            type="text"
            placeholder="IP Address"
            value={filters.ip_address}
            onChange={(e) => handleFilterChange('ip_address', e.target.value)}
            className="filter-input"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            className="filter-input"
          />
          <input
            type="date"
            placeholder="End Date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Country"
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="filter-input"
          />
          <select
            value={filters.device_type}
            onChange={(e) => handleFilterChange('device_type', e.target.value)}
            className="filter-select"
          >
            <option value="">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>
        <div className="filter-buttons">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="btn btn-primary"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="btn btn-success"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      )}

      {/* Login Logs Table - Now showing grouped logs */}
      {!loading && groupedLogs.length > 0 && (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="logs-table">
              <thead className="table-header">
                <tr>
                  <th>User</th>
                  <th>Last Login Date</th>
                  <th>Last Login Time</th>
                  <th>Status</th>
                  <th>Total Logins</th>
                </tr>
              </thead>
              <tbody>
                {groupedLogs.map((log, index) => (
                  <tr key={log.id || index} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                    <td className="table-cell">
                      <div 
                        className="user-info"
                        onClick={() => handleUserClick(log)}
                        style={{ cursor: 'pointer' }}
                      >
                        {log.user_name || 'N/A'}
                      </div>
                      <div className="user-email">
                        {log.email || 'N/A'}
                      </div>
                    </td>
                    <td className="table-cell">
                      {formatDate(log.login_timestamp)}
                    </td>
                    <td className="table-cell">
                      {formatTime(log.login_timestamp)}
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${log.login_status === 'SUCCESS' ? 'status-success' : 'status-failed'}`}>
                        {log.login_status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="login-count-badge">
                        {log.totalLogsCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!loading && groupedLogs.length === 0 && (
        <div className="no-data">
          <h3>No Login Logs Found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal for User Details - Now shows all logs for the user */}
      {showModal && selectedUser && selectedUserLogs.length > 0 && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '80vh', overflow: 'auto' }}>
            <button
              onClick={closeModal}
              className="modal-close"
            >
              ×
            </button>
            
            <h2 className="modal-title">
              Login History for {selectedUser.user_name || selectedUser.email || 'User'}
            </h2>
            
            <div className="modal-section">
              <p><strong>Total Login Attempts:</strong> {selectedUserLogs.length}</p>
              
              {/* All logs for this user */}
              <div className="user-logs-list">
                {selectedUserLogs.map((userLog, index) => (
                  <div key={userLog.id || index} className="user-log-item" style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: userLog.login_status === 'SUCCESS' ? '#f8fff8' : '#fff8f8'
                  }}>
                    <div className="user-details-grid">
                      <div className="detail-row">
                        <span className="detail-label">Login Time:</span>
                        <span className="detail-value">{new Date(userLog.login_timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge ${userLog.login_status === 'SUCCESS' ? 'status-success' : 'status-failed'}`}>
                          {userLog.login_status}
                        </span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">IP Address:</span>
                        <span className="detail-value monospace">{userLog.ip_address || 'N/A'}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{userLog.country ? `${userLog.city || ''}, ${userLog.country}`.replace(/^, /, '') : 'N/A'}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Device:</span>
                        <span className="detail-value">{userLog.device_type || 'N/A'}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Browser:</span>
                        <span className="detail-value">{userLog.browser_name ? `${userLog.browser_name} ${userLog.browser_version || ''}` : 'N/A'}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">OS:</span>
                        <span className="detail-value">{userLog.os_name ? `${userLog.os_name} ${userLog.os_version || ''}` : 'N/A'}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Session Duration:</span>
                        <span className="detail-value">{formatDuration(userLog.session_duration)}</span>
                      </div>
                      
                      {userLog.failure_reason && (
                        <div className="detail-row">
                          <span className="detail-label">Failure Reason:</span>
                          <span className="detail-value" style={{ color: '#c62828' }}>{userLog.failure_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={closeModal}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;