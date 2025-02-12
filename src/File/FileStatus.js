import React from 'react';
import "../file.css"

const FileStatusCircles = ({ invoices, INVOICE_STATUS }) => {
  const getStatusCounts = () => {
    const counts = {
      paid: invoices.filter(inv => inv.status === INVOICE_STATUS.PAID).length,
      review1: invoices.filter(inv => inv.status === INVOICE_STATUS.REVIEW_1).length,
      review2: invoices.filter(inv => inv.status === INVOICE_STATUS.REVIEW_2).length,
      review3: invoices.filter(inv => inv.status === INVOICE_STATUS.REVIEW_3).length,
    };
    
    const total = invoices.length || 1;
    
    return {
      counts,
      percentages: {
        review1: (counts.review1 / total) * 100,
        review2: (counts.review2 / total) * 100,
        review3: (counts.review3 / total) * 100,
        paid: (counts.paid / total) * 100,
      }
    };
  };

  const { counts, percentages } = getStatusCounts();

  const circles = [
    
    { 
      label: 'First Stage', 
      count: counts.review1,
      percentage: percentages.review1,
      circleClass: 'first-stage',
    },
    { 
      label: 'Second Stage', 
      count: counts.review2,
      percentage: percentages.review2,
      circleClass: 'second-stage',
    },
    { 
      label: 'Third Stage', 
      count: counts.review3,
      percentage: percentages.review3,
      circleClass: 'third-stage',
    },
    { 
        label: 'Paid Files', 
        count: counts.paid,
        percentage: percentages.paid,
        circleClass: 'paid',
      },

  ];

  return (
    <div className="file-status-container">
      <div className="circles-grid">
        {circles.map((circle, index) => (
          <div key={index} className="circle-item">
            <div className={`status-circle ${circle.circleClass}`}>
              <div className={`circle-count ${circle.circleClass}`}>
                {circle.count}
              </div>
            </div>
            <p className="circle-label">{circle.label}</p>
            <p className="circle-percentage">{circle.percentage.toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileStatusCircles;