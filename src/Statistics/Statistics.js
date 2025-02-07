import React from 'react';
import { useInvoices } from '../Context/InvoiceContext';
import { useAuth } from '../Context/AuthContext';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import "../stats.css"

const Statistics = () => {
  const { invoices, INVOICE_STATUS } = useInvoices();
  const { user } = useAuth();

  // Add error checking for invoices
  if (!invoices || !Array.isArray(invoices)) {
    return <div className="statistics-page">Loading...</div>;
  }

  // Process data for pie charts with safe checks
  const getFifthStageFiles = () => invoices.filter(inv => inv?.status === INVOICE_STATUS.REVIEW_5);
  const getPendingFiles = () => invoices.filter(inv => inv?.status === INVOICE_STATUS.PENDING);
  const getFirstStageFiles = () => invoices.filter(inv => inv?.status === INVOICE_STATUS.REVIEW_1);
  const getSecondStageFiles = () => invoices.filter(inv => inv?.status === INVOICE_STATUS.REVIEW_2);
  const getThirdStageFiles = () => invoices.filter(inv => inv?.status === INVOICE_STATUS.REVIEW_3);
  const getFourthStageFiles = () => invoices.filter(inv => inv?.status === INVOICE_STATUS.REVIEW_4);
  const getUserFiles = () => invoices.filter(inv => inv?.uploadedBy === user?.email);
  const getDepartmentFiles = () => invoices.filter(inv => 
    inv?.department === user?.department && inv?.uploadedBy !== user?.email
  );

  // Prepare data for pie charts with actual counts
  const pieData = [
    {
      title: "Fifth Stage Files",
      data: [
        { name: "Fifth Stage", value: getFifthStageFiles().length || 0, color: "#4CAF50" },
        { name: "Other", value: Math.max(0, invoices.length - (getFifthStageFiles().length || 0)), color: "#E0E0E0" }
      ]
    },
    {
      title: "Pending Files",
      data: [
        { name: "Pending", value: getPendingFiles().length || 0, color: "#FFC107" },
        { name: "Other", value: Math.max(0, invoices.length - (getPendingFiles().length || 0)), color: "#E0E0E0" }
      ]
    },
    {
      title: "Review Stages",
      data: [
        { name: "First Approve", value: getFirstStageFiles().length || 0, color: "#3B82F6" },  // Blue
        { name: "Second Approve", value: getSecondStageFiles().length || 0, color: "#10B981" }, // Green
        { name: "Third Approve", value: getThirdStageFiles().length || 0, color: "#F59E0B" },  // Orange
        { name: "Fourth Approve", value: getFourthStageFiles().length || 0, color: "#EF4444" }  // Red
      ]
    },
    {
      title: "My Uploads",
      data: [
        { name: "My Files", value: getUserFiles().length || 0, color: "#9C27B0" },
        { name: "Other", value: Math.max(0, invoices.length - (getUserFiles().length || 0)), color: "#E0E0E0" }
      ]
    },
    {
      title: "Department Files",
      data: [
        { name: "Department Files", value: getDepartmentFiles().length || 0, color: "#FF5722" },
        { name: "Other", value: Math.max(0, invoices.length - (getDepartmentFiles().length || 0)), color: "#E0E0E0" }
      ]
    }
  ];

  // Filter out charts with no data
  const chartsWithData = pieData.filter(chart => 
    chart.data.some(item => item.value > 0)
  );

  return (
    <div className="statistics-page">
      <div className="statistics-grid">
        {chartsWithData.map((chart, index) => (
          <div key={index} className="statistics-card">
            <div className="card-header">
              <h3 className="card-title">{chart.title}</h3>
            </div>
            <div className="card-content">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chart.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {chart.data.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} files`, 'Count']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;