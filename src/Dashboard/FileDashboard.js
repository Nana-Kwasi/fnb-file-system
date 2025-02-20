// import React, { useState, useEffect } from 'react';
// import { ArrowRight, Bell, BarChart3, Settings, Users, FileText, LogOut } from 'lucide-react';
// import "../filedashboard.css";

// const Dashboard = () => {
//   const [currentScreen, setCurrentScreen] = useState('dashboard');
//   const [currentDate, setCurrentDate] = useState(new Date());
  
//   const monthlySellData = [
//     { month: 'Jan', value1: 300000, value2: 250000 },
//     { month: 'Feb', value1: 450000, value2: 350000 },
//     { month: 'Mar', value1: 350000, value2: 400000 },
//     { month: 'Apr', value1: 250000, value2: 300000 },
//     { month: 'May', value1: 350000, value2: 250000 },
//     { month: 'Jun', value1: 200000, value2: 250000 },
//     { month: 'Jul', value1: 450000, value2: 350000 },
//   ];

//   const topStores = [
//     { name: 'Solaris Sparkle', location: 'Miami, Florida', quantity: '102 Quantity', amount: '12.50K' },
//     { name: 'Crimson Dusk', location: 'Denver, Colorado', quantity: '214 Quantity', amount: '07.85K' },
//     { name: 'Indigo Zephyr', location: 'Orlando, Florida', quantity: '143 Quantity', amount: '16.40K' },
//     { name: 'Roseate Crest', location: 'Las Vegas, Nevada', quantity: '185 Quantity', amount: '23.64K' },
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentDate(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formatDate = (date) => {
//     return date.toLocaleDateString('en-US', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const renderScreen = () => {
//     switch(currentScreen) {
//       case 'dashboard':
//         return (
//           <>
//             <div className="stats-cards">
//               <div className="stat-card purple">
//                 <h3>Total Earning</h3>
//                 <h2>242.65K</h2>
//                 <p>From the running month</p>
//               </div>
//               <div className="stat-card blue">
//                 <h3>Average Earning</h3>
//                 <h2>17.347K</h2>
//                 <p>Daily Earning of this month</p>
//               </div>
//               <div className="stat-card green">
//                 <h3>Conversation Rate</h3>
//                 <h2>74.86%</h2>
//                 <p className="increase">+6.04% greater that last month</p>
//               </div>
//             </div>

//             <div className="regular-sell">
//               <div className="section-header">
//                 <h2>Monthly Sell</h2>
//                 <button className="export-btn">Export</button>
//               </div>
//               <div className="chart">
//                 {monthlySellData.map((data, index) => (
//                   <div key={index} className="chart-column">
//                     <div className="bars">
//                       <div className="bar purple" style={{ height: `${(data.value1/500000) * 100}%` }} />
//                       <div className="bar green" style={{ height: `${(data.value2/500000) * 100}%` }} />
//                     </div>
//                     <span>{data.month}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="top-store">
//               <div className="section-header">
//                 <h2>Top Store</h2>
//                 <button className="share-btn">Share</button>
//               </div>
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Store Name</th>
//                     <th>Location</th>
//                     <th>Sell</th>
//                     <th>Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {topStores.map((store, index) => (
//                     <tr key={index}>
//                       <td>{store.name}</td>
//                       <td>{store.location}</td>
//                       <td>{store.quantity}</td>
//                       <td>{store.amount}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         );
//       case 'statistics':
//         return <div>Statistics Content</div>;
//       case 'transaction':
//         return <div>Transaction Content</div>;
//       case 'team':
//         return <div>Team Content</div>;
//       case 'reports':
//         return <div>Reports Content</div>;
//       case 'settings':
//         return <div>Settings Content</div>;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-wrapper">
//         <div className="sidebar">
//           <div className="logo">
//             <h1>Niond</h1>
//           </div>

//           <nav className="nav-menu">
//             <div 
//               className={`nav-item ${currentScreen === 'dashboard' ? 'active' : ''}`}
//               onClick={() => setCurrentScreen('dashboard')}
//             >
//               <BarChart3 size={20} />
//               <span>Dashboard</span>
//             </div>
//             <div 
//               className={`nav-item ${currentScreen === 'statistics' ? 'active' : ''}`}
//               onClick={() => setCurrentScreen('statistics')}
//             >
//               <BarChart3 size={20} />
//               <span>Statistics</span>
//             </div>
//             <div 
//               className={`nav-item ${currentScreen === 'transaction' ? 'active' : ''}`}
//               onClick={() => setCurrentScreen('transaction')}
//             >
//               <Users size={20} />
//               <span>Transaction</span>
//             </div>
//             <div 
//               className={`nav-item ${currentScreen === 'team' ? 'active' : ''}`}
//               onClick={() => setCurrentScreen('team')}
//             >
//               <Users size={20} />
//               <span>My Team</span>
//             </div>
//             <div 
//               className={`nav-item ${currentScreen === 'reports' ? 'active' : ''}`}
//               onClick={() => setCurrentScreen('reports')}
//             >
//               <FileText size={20} />
//               <span>Sell Reports</span>
//             </div>
//             <div 
//               className={`nav-item ${currentScreen === 'settings' ? 'active' : ''}`}
//               onClick={() => setCurrentScreen('settings')}
//             >
//               <Settings size={20} />
//               <span>Settings</span>
//             </div>
//           </nav>

//           <div className="user-profile">
//             <div className="profile-info">
//               <div>
//                 <h3>Nora Watson</h3>
//                 <p>Sales Manager</p>
//               </div>
//             </div>
//             <div className="logout-button">
//               <LogOut size={20} />
//               <span>Log Out</span>
//             </div>
//           </div>
//         </div>

//         <div className="main-content">
//           <div className="header">
//             <div className="header-title">
//               <h1>{currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1)}</h1>
//               <p>{formatDate(currentDate)}</p>
//             </div>
//           </div>

//           {renderScreen()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, LogOut, Download, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Statistics from '../Statistics/Statistics';
import Upload from '../Upload/Upload';
import Reports from '../Report/Report';
import POScreen from '../POScreen/POScreen';
import { useAuth } from '../Context/AuthContext';
import { useInvoices } from '../Context/InvoiceContext';
import "../filedashboard.css";
import FileStatusCircles from '../File/FileStatus';

const Dashboard = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const navigate = useNavigate();
  const { user, logout, ROLES } = useAuth();
  const { invoices, INVOICE_STATUS, canEditInvoice, updateInvoiceStatus, downloadInvoice } = useInvoices();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileSelection = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const getStageNumber = (status) => {
    switch (status) {
      case INVOICE_STATUS.PENDING: return '0/4';
      case INVOICE_STATUS.REVIEW_1: return '1/4';
      case INVOICE_STATUS.REVIEW_2: return '2/4';
      case INVOICE_STATUS.REVIEW_3: return '3/4';
      case INVOICE_STATUS.PAID: return '4/4';
      default: return '0/4';
    }
  };

  // const getNextReviewer = (status, amount) => {
  //   const MOCK_USERS = [
  //     { role: ROLES.FINANCE_REVIEWER_1, username: 'Quachi' },
  //     { role: ROLES.FINANCE_REVIEWER_2, username: 'Vanessa' },
  //     { role: ROLES.FINANCE_REVIEWER_3, username: 'Alex' },
  //     { role: ROLES.EXCOBERS_REVIEWER, username: 'John Executive' }
  //   ];

  //   switch (status) {
  //     case INVOICE_STATUS.PENDING:
  //       return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_1)?.username;
  //     case INVOICE_STATUS.REVIEW_1:
  //       return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_2)?.username;
  //     case INVOICE_STATUS.REVIEW_2:
  //       return parseFloat(amount) > 10000 ? 
  //         MOCK_USERS.find(u => u.role === ROLES.EXCOBERS_REVIEWER)?.username :
  //         MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_3)?.username;
  //     case INVOICE_STATUS.REVIEW_3:
  //       return 'Payment Processing';
  //     case INVOICE_STATUS.PAID:
  //       return 'PAID';
  //     default:
  //       return 'Unknown';
  //   }
  // };
  const getNextReviewer = (status) => {
    const MOCK_USERS = [
      { role: ROLES.FINANCE_REVIEWER_1, username: 'Quachi' },
      { role: ROLES.FINANCE_REVIEWER_2, username: 'Vanessa' },
      { role: ROLES.FINANCE_REVIEWER_3, username: 'Alex' },
      { role: ROLES.FINANCE_REVIEWER_4, username: 'Michael' }
    ];
  
    switch (status) {
      case INVOICE_STATUS.PENDING:
        return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_1)?.username;
      case INVOICE_STATUS.REVIEW_1:
        return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_2)?.username;
      case INVOICE_STATUS.REVIEW_2:
        return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_3)?.username;
      case INVOICE_STATUS.REVIEW_3:
        return 'Payment Processing';
      case INVOICE_STATUS.PAID:
        return 'PAID';
      default:
        return 'Unknown';
    }
  };
  
  const handleApproveAndDownload = (fileId) => {
    const invoice = invoices.find(inv => inv.id === fileId);
    if (invoice && selectedFiles.has(fileId)) {
      updateInvoiceStatus(fileId, getNextStatus(invoice.status));
      
      if (invoice.status === INVOICE_STATUS.PENDING) {
        
        downloadInvoice(invoice);
      } else if (invoice.status === INVOICE_STATUS.REVIEW_1 || invoice.status === INVOICE_STATUS.REVIEW_2) {
        const wantToDownload = window.confirm("Would you like to download this invoice?");
        if (wantToDownload) {
          downloadInvoice(invoice);
        }
      }
      
      setSelectedFiles(new Set());
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case INVOICE_STATUS.PENDING:
        return INVOICE_STATUS.REVIEW_1;
      case INVOICE_STATUS.REVIEW_1:
        return INVOICE_STATUS.REVIEW_2;
      case INVOICE_STATUS.REVIEW_2:
        return INVOICE_STATUS.REVIEW_3;
      case INVOICE_STATUS.REVIEW_3:
        return INVOICE_STATUS.PAID;
      default:
        return currentStatus;
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (!amount || isNaN(parseFloat(amount))) {
      return '0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHC'
    }).format(parseFloat(amount));
  };

  const getStats = () => {
    return {
      totalFiles: invoices.length,
      averageSize: `${(invoices.reduce((acc, inv) => acc + parseFloat(inv.size), 0) / (invoices.length || 1)).toFixed(1)} KB`,
      successRate: invoices.filter(i => i.status === INVOICE_STATUS.PAID).length / (invoices.length || 1) * 100
    };
  };

  const PaymentTable = () => (
    <div className='table-container'>
    <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Action</th>
          <th>Date</th>
          <th>Time</th>
          <th>Amount</th>
          <th>Pay</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((file) => (
          <tr key={file.id}>
            <td>
              {canEditInvoice(file) && (
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.id)}
                    onChange={() => handleFileSelection(file.id)}
                  />
                  <CheckSquare className="checkbox-icon" />
                </label>
              )}
            </td>
            <td>{file.date}</td>
            <td>{file.time}</td>
            <td>{formatAmount(file.amount)}</td>
            <td>
              {canEditInvoice(file) && selectedFiles.has(file.id) && (
                <button 
                  className="approve-selected-btn"
                  onClick={() => handleApproveAndDownload(file.id)}
                >
                  Pay
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </div>
  );

  const FinanceTable = () => {
    if (user?.role === ROLES.FINANCE_REVIEWER_4) {
      return <PaymentTable />;
    }
  
    const groupedInvoices = invoices.reduce((acc, invoice) => {
      if (!acc[invoice.department]) {
        acc[invoice.department] = [];
      }
      acc[invoice.department].push(invoice);
      return acc;
    }, {});
  
    return (
      <div className="table-container">
        {Object.entries(groupedInvoices).map(([department, departmentInvoices]) => (
          <div key={department} className="department-section">
            <h3 className="department-header">{department}</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Approve</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentInvoices.map((file) => (
                    <tr key={file.id}>
                      <td>{file.name}</td>
                      <td>{formatAmount(file.amount)}</td>
                      <td>{file.date}</td>
                      <td>{file.time}</td>
                      <td>
                        {canEditInvoice(file) && (
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(file.id)}
                              onChange={() => handleFileSelection(file.id)}
                            />
                            <CheckSquare className="checkbox-icon" />
                          </label>
                        )}
                      </td>
                      <td>
                        {canEditInvoice(file) && selectedFiles.has(file.id) && (
                          <button 
                            className="approve-selected-btn"
                            onClick={() => handleApproveAndDownload(file.id)}
                          >
                            {file.status === INVOICE_STATUS.REVIEW_3 ? 'Pay' : 'Approve'}
                          </button>
                        )}
                      </td>
                      <td>
                        {canEditInvoice(file) && (
                          <button
                            className="download-btn"
                            disabled={!selectedFiles.has(file.id)}
                          >
                            <Download size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const ExcobersTable = () => {
    const groupedInvoices = invoices.reduce((acc, invoice) => {
      if (!acc[invoice.department]) {
        acc[invoice.department] = [];
      }
      acc[invoice.department].push(invoice);
      return acc;
    }, {});
  
    return (
      <div className="table-container">
        {Object.entries(groupedInvoices).map(([department, departmentInvoices]) => (
          <div key={department} className="department-section">
            <h3 className="department-header">{department}</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Amount</th>
                    <th>Approve</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentInvoices.map((file) => (
                    <tr key={file.id}>
                      <td>
                        {canEditInvoice(file) && (
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(file.id)}
                              onChange={() => handleFileSelection(file.id)}
                            />
                            <CheckSquare className="checkbox-icon" />
                          </label>
                        )}
                      </td>
                      <td>{file.date}</td>
                      <td>{file.time}</td>
                      <td>{formatAmount(file.amount)}</td>
                      <td>
                        {canEditInvoice(file) && selectedFiles.has(file.id) && (
                          <button 
                            className="approve-selected-btn"
                            onClick={() => handleApproveAndDownload(file.id)}
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };
  const DepartmentTable = () => (
    <div className='table-container'>
    <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>File</th>
          {/* <th>Type</th> */}
          <th>Amount</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th>Uploader</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((file) => (
          <tr key={file.id}>
            <td>{file.name}</td>
            {/* <td>{file.type}</td> */}
            <td>{formatAmount(file.amount)}</td>
            <td>{file.date}</td>
            <td>{file.time}</td>
            <td>
              <span className={`status-badge ${file.status.toLowerCase()}`}>
                {getStageNumber(file.status)} → {getNextReviewer(file.status, file.amount)}
              </span>
            </td>
            <td>{file.sender === user.email ? 'Me' : file.sender}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </div>
  );

  const DashboardContent = () => {
    const stats = getStats();
    
    return (
      <>
        <div className="stats-cards">
          <div className="stat-card purple">
            <h3>Visible Files</h3>
            <h2>{stats.totalFiles}</h2>
            <p>Department: {user?.department}</p>
          </div>
          <div className="stat-card blue">
            <h3>Average Upload Size</h3>
            <h2>{stats.averageSize}</h2>
            <p>Per file this month</p>
          </div>
          <div className="stat-card green">
            <h3>Success Rate</h3>
            <h2>{stats.successRate.toFixed(2)}%</h2>
            <p>Files reaching PAID status</p>
          </div>
        </div>
        <FileStatusCircles invoices={invoices} INVOICE_STATUS={INVOICE_STATUS} />

        <div className="top-store">
          <div className="section-header">
            {/* <h2 style={{color:'green'}}>Files For Review</h2> */}
            {user?.department === 'FINANCE' && (
              <span>Finance Review Level: {user?.role.split('_')[2]}</span>
            )}
          </div>

          {user?.department === 'FINANCE' ? (
            <FinanceTable />
          ) : user?.department === 'EXCOBERS' ? (
            <ExcobersTable />
          ) : (
            <DepartmentTable />
          )}
        </div>
      </>
    );
  };

  const getNavigationItems = () => {
    const items = [
      {
        id: 'dashboard',
        icon: <BarChart3 size={20} />,
        label: 'Dashboard',
        visible: true
      },
      {
        id: 'statistics',
        icon: <BarChart3 size={20} />,
        label: 'Statistics',
        visible: true
      },
      {
        id: 'Upload',
        icon: <Users size={20} />,
        label: 'Upload',
        visible: user?.role === 'DEPARTMENT_USER'
      },
      {
        id: 'reports',
        icon: <FileText size={20} />,
        label: 'Reports',
        visible: true
      },
      {
        id: 'POScreen',
        icon: <FileText size={20} />,
        label: 'PO',
        visible: true
      }
    ];

    return items.filter(item => item.visible);
  };









  

  // const renderScreen = () => {
  //   switch(currentScreen) {
  //     case 'dashboard':
  //       return <DashboardContent />;
  //     case 'statistics':
  //       return <Statistics />;
  //     case 'Upload':
  //       return user?.role === 'DEPARTMENT_USER' ? <Upload /> : null;
  //     case 'reports':
  //       return <Reports />;
  //       case 'POScreen':
  //         return <POScreen />;
  //     default:
  //       return <DashboardContent />;
  //   }
  // };
  const renderScreen = () => {
    switch(currentScreen) {
      case 'dashboard':
        return <DashboardContent />;
      case 'statistics':
        return <Statistics />;
      case 'Upload':
        return user?.role === 'DEPARTMENT_USER' ? <Upload /> : null;
      case 'reports':
        return <Reports />;
      case 'POScreen':
        return <POScreen />;
      default:
        return <DashboardContent />;
    }
  };
  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="sidebar">
          <div className="logo">
            <h1 style={{color:'#FFB020'}}>FNB FILE SYSTEM</h1>
          </div>

          <nav className="nav-menu">
            {getNavigationItems().map(item => (
              <div 
                key={item.id}
                className={`nav-item ${currentScreen === item.id ? 'active' : ''}`}
                onClick={() => setCurrentScreen(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="user-profile">
            <div className="profile-info">
              <div>
                <h3>{user?.username || 'Unknown User'}</h3>
                <p>{user?.department}</p>
              </div>
            </div>
            <div className="logout-button" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Log Out</span>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="header">
            <div className="header-title">
              <h1>{currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1)}</h1>
              <p className='time'>{formatDate(currentDate)}</p>
            </div>
          </div>

          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;