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
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if the segment is large enough (more than 5%)
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="chart-label"
      >
        {`${value}`}
      </text>
    );
  };

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
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={chart.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {chart.data.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} files`, 'Count']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{
                        paddingTop: '10px',
                        fontSize: '12px'
                      }}
                    />
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