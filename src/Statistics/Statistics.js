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
  const { invoices, poFiles, INVOICE_STATUS, PO_STATUS } = useInvoices();
  const { user } = useAuth();

  if (!invoices || !Array.isArray(invoices) || !poFiles || !Array.isArray(poFiles)) {
    return <div className="statistics-page">Loading...</div>;
  }

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

  const getPendingPOs = () => poFiles.filter(po => po?.status === PO_STATUS.PENDING);
  const getApprovedPOs = () => poFiles.filter(po => po?.status === PO_STATUS.APPROVED);
  const getSignedPOs = () => poFiles.filter(po => po?.status === PO_STATUS.SIGNED);
  const getUserPOs = () => poFiles.filter(po => po?.uploadedBy === user?.email);
  const getDepartmentPOs = () => poFiles.filter(po => 
    po?.department === user?.department && po?.uploadedBy !== user?.email
  );

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
        { name: "First Approve", value: getFirstStageFiles().length || 0, color: "#3B82F6" },
        { name: "Second Approve", value: getSecondStageFiles().length || 0, color: "#10B981" },
        { name: "Third Approve", value: getThirdStageFiles().length || 0, color: "#F59E0B" },
        { name: "Fourth Approve", value: getFourthStageFiles().length || 0, color: "#EF4444" }
      ]
    },
    {
      title: "My Uploads (Invoices)",
      data: [
        { name: "My Files", value: getUserFiles().length || 0, color: "#9C27B0" },
        { name: "Other", value: Math.max(0, invoices.length - (getUserFiles().length || 0)), color: "#E0E0E0" }
      ]
    },
    {
      title: "Department Files (Invoices)",
      data: [
        { name: "Department Files", value: getDepartmentFiles().length || 0, color: "#FF5722" },
        { name: "Other", value: Math.max(0, invoices.length - (getDepartmentFiles().length || 0)), color: "#E0E0E0" }
      ]
    },
    {
      title: "PO Status Distribution",
      data: [
        { name: "Pending", value: getPendingPOs().length || 0, color: "#FFC107" },
        { name: "Approved", value: getApprovedPOs().length || 0, color: "#4CAF50" },
        { name: "Signed", value: getSignedPOs().length || 0, color: "#2196F3" }
      ]
    },
    {
      title: "My PO Files",
      data: [
        { name: "My POs", value: getUserPOs().length || 0, color: "#673AB7" },
        { name: "Other", value: Math.max(0, poFiles.length - (getUserPOs().length || 0)), color: "#E0E0E0" }
      ]
    },
    {
      title: "Department PO Files",
      data: [
        { name: "Department POs", value: getDepartmentPOs().length || 0, color: "#795548" },
        { name: "Other", value: Math.max(0, poFiles.length - (getDepartmentPOs().length || 0)), color: "#E0E0E0" }
      ]
    }
  ];

  const chartsWithData = pieData.filter(chart => 
    chart.data.some(item => item.value > 0)
  );

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
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