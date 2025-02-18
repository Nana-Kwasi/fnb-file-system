import React from 'react';
import { useAuth } from '../Context/AuthContext';
import "../file.css"

const FileStatusCircles = ({ invoices, INVOICE_STATUS }) => {
  const { user } = useAuth();

  const getFinanceUserCounts = () => {
    if (!invoices || invoices.length === 0) {
      return {
        approvedCount: 0,
        pendingCount: 0,
        approvedPercentage: 0,
        pendingPercentage: 0
      };
    }

    let approvedCount = 0;
    let pendingCount = 0;
    
    switch (user.role) {
      case 'FINANCE_REVIEWER_1':
        approvedCount = invoices.filter(inv => 
          inv.status !== INVOICE_STATUS.PENDING && 
          inv.status !== INVOICE_STATUS.REJECTED &&
          inv.approvedBy?.includes(user.email)
        ).length;
        pendingCount = invoices.filter(inv => 
          inv.status === INVOICE_STATUS.PENDING &&
          !inv.approvedBy?.includes(user.email)
        ).length;
        break;

      case 'FINANCE_REVIEWER_2':
        approvedCount = invoices.filter(inv => 
          inv.status !== INVOICE_STATUS.REVIEW_1 && 
          inv.status !== INVOICE_STATUS.REJECTED &&
          inv.approvedBy?.includes(user.email)
        ).length;
        pendingCount = invoices.filter(inv => 
          inv.status === INVOICE_STATUS.REVIEW_1 &&
          !inv.approvedBy?.includes(user.email)
        ).length;
        break;

      case 'FINANCE_REVIEWER_3':
        approvedCount = invoices.filter(inv => 
          inv.status !== INVOICE_STATUS.REVIEW_2 && 
          inv.status !== INVOICE_STATUS.REJECTED &&
          inv.approvedBy?.includes(user.email)
        ).length;
        pendingCount = invoices.filter(inv => 
          inv.status === INVOICE_STATUS.REVIEW_2 &&
          !inv.approvedBy?.includes(user.email)
        ).length;
        break;

      case 'FINANCE_REVIEWER_4':
        approvedCount = invoices.filter(inv => 
          inv.status !== INVOICE_STATUS.REVIEW_3 && 
          inv.status !== INVOICE_STATUS.REJECTED &&
          inv.approvedBy?.includes(user.email)
        ).length;
        pendingCount = invoices.filter(inv => 
          inv.status === INVOICE_STATUS.REVIEW_3 &&
          !inv.approvedBy?.includes(user.email)
        ).length;
        break;

      default:
        break;
    }

    const total = approvedCount + pendingCount || 1;

    return {
      approvedCount,
      pendingCount,
      approvedPercentage: (approvedCount / total) * 100,
      pendingPercentage: (pendingCount / total) * 100
    };
  };

  const getDepartmentUserCounts = () => {
    const departmentInvoices = invoices.filter(inv => inv.department === user.department);
    
    const approvedCount = departmentInvoices.filter(inv => inv.status === INVOICE_STATUS.PAID).length;
    const pendingCount = departmentInvoices.filter(inv => inv.status !== INVOICE_STATUS.PAID).length;
    
    const total = approvedCount + pendingCount;
    
    return {
      approvedCount,
      pendingCount,
      approvedPercentage: total > 0 ? (approvedCount / total) * 100 : 0,
      pendingPercentage: total > 0 ? (pendingCount / total) * 100 : 0,
    };
  };

  const stats = user.department === 'FINANCE' 
    ? getFinanceUserCounts() 
    : getDepartmentUserCounts();

  const circles = [
    ...(user.department !== 'FINANCE' ? [{
      label: 'Department Files Approved',
      count: stats.approvedCount,
      percentage: stats.approvedPercentage,
      circleClass: 'paid'
    }] : []),
    {
      label: user.department === 'FINANCE' ? 'Files Pending Your Approval' : 'Department Files Pending',
      count: stats.pendingCount,
      percentage: stats.pendingPercentage,
      circleClass: 'first-stage'
    }
  ];

  return (
    <div className="file-status-container">
      <div className="circles-grid">
        {circles.map((circle, index) => (
          <div key={index} className="circle-item">
            <div className={`status-circle ${circle.circleClass}`}>
              <div className={`circle-count ${circle.circleClass}`}>
                {circle.count || 0}
              </div>
            </div>
            <div className="circle-label">
              {circle.label}
            </div>
            <div className="circle-percentage">
              {circle.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileStatusCircles;