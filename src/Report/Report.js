import React, { useState } from 'react';
import { useInvoices } from '../Context/InvoiceContext';
import { useAuth } from '../Context/AuthContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showReport, setShowReport] = useState(false);
  
  const { invoices, poFiles, INVOICE_STATUS, PO_STATUS } = useInvoices();
  const { user } = useAuth();

  const generateReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    setShowReport(true);
  };
  const getFilteredInvoices = () => {
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
    });
  };

  const getFilteredPOs = () => {
    return poFiles.filter(po => {
      const poDate = new Date(po.date);
      return poDate >= new Date(startDate) && poDate <= new Date(endDate);
    });
  };

   const getFinanceApprovedInvoices = () => {
    const filteredInvoices = getFilteredInvoices();
    const role = user.role;
    
    // Map roles to the corresponding status they approve to
    const roleApprovedStatusMap = {
      'FINANCE_REVIEWER_1': INVOICE_STATUS.REVIEW_1,
      'FINANCE_REVIEWER_2': INVOICE_STATUS.REVIEW_2,
      'FINANCE_REVIEWER_3': INVOICE_STATUS.REVIEW_3,
      'FINANCE_REVIEWER_4': INVOICE_STATUS.PAID
    };
  
    const approvedStatus = roleApprovedStatusMap[role];
    
    if (!approvedStatus) {
      return [];
    }
  
    // Return invoices that match either:
    // 1. The exact status this reviewer approves to
    // 2. Any status after this reviewer's approval stage
    return filteredInvoices.filter(invoice => {
      const statusValues = Object.values(INVOICE_STATUS);
      const approvedStatusIndex = statusValues.indexOf(approvedStatus);
      const currentStatusIndex = statusValues.indexOf(invoice.status);
      
      return currentStatusIndex >= approvedStatusIndex;
    });
  };

  const getFinanceApprovedPOs = () => {
    const filteredPOs = getFilteredPOs();
    return filteredPOs.filter(po => po.status === PO_STATUS.APPROVED);
  };

  const getChartData = () => {
    const filteredInvoices = user.department === 'FINANCE' ? 
      getFinanceApprovedInvoices() : getFilteredInvoices();
    const filteredPOs = user.department === 'FINANCE' ? 
      getFinanceApprovedPOs() : getFilteredPOs();
    
    const dailyData = {};

    filteredInvoices.forEach(invoice => {
      if (!dailyData[invoice.date]) {
        dailyData[invoice.date] = { date: invoice.date, invoices: 0, pos: 0 };
      }
      dailyData[invoice.date].invoices += 1;
    });

    filteredPOs.forEach(po => {
      if (!dailyData[po.date]) {
        dailyData[po.date] = { date: po.date, invoices: 0, pos: 0 };
      }
      dailyData[po.date].pos += 1;
    });

    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getStageNumber = (status) => {
    switch (status) {
      case INVOICE_STATUS.PENDING: return '0/5';
      case INVOICE_STATUS.REVIEW_1: return '1/5';
      case INVOICE_STATUS.REVIEW_2: return '2/5';
      case INVOICE_STATUS.REVIEW_3: return '3/5';
      case INVOICE_STATUS.REVIEW_4: return '4/5';
      case INVOICE_STATUS.REVIEW_5: return '5/5';
      case INVOICE_STATUS.PAID: return 'Completed';
      default: return '0/5';
    }
  };

  const getNextReviewer = (status) => {
    const MOCK_USERS = [
      { role: 'FINANCE_REVIEWER_1', username: 'Quachi' },
      { role: 'FINANCE_REVIEWER_2', username: 'Vanessa' },
      { role: 'FINANCE_REVIEWER_3', username: 'Alex' },
      { role: 'FINANCE_REVIEWER_4', username: 'BAffour' },
      { role: 'FINANCE_REVIEWER_5', username: 'Patrick' }
    ];

    switch (status) {
      case INVOICE_STATUS.PENDING:
        return MOCK_USERS.find(u => u.role === 'FINANCE_REVIEWER_1')?.username;
      case INVOICE_STATUS.REVIEW_1:
        return MOCK_USERS.find(u => u.role === 'FINANCE_REVIEWER_2')?.username;
      case INVOICE_STATUS.REVIEW_2:
        return MOCK_USERS.find(u => u.role === 'FINANCE_REVIEWER_3')?.username;
      case INVOICE_STATUS.REVIEW_3:
        return MOCK_USERS.find(u => u.role === 'FINANCE_REVIEWER_4')?.username;
      case INVOICE_STATUS.REVIEW_4:
        return MOCK_USERS.find(u => u.role === 'FINANCE_REVIEWER_5')?.username;
      default:
        return 'Complete';
    }
  };

  const formatStatus = (status, type) => {
    if (type === 'invoice') {
      const stageNumber = getStageNumber(status);
      const nextReviewer = getNextReviewer(status);
      return `${stageNumber} (${nextReviewer})`;
    }
    return status;
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const filteredInvoices = user.department === 'FINANCE' ? getFinanceApprovedInvoices() : getFilteredInvoices();
    const filteredPOs = user.department === 'FINANCE' ? getFinanceApprovedPOs() : getFilteredPOs();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    const addHeaderBanner = () => {
      doc.setFillColor(44, 62, 80);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Document Report', margin, 16);
    };

    const addMetadata = () => {
      const leftColX = margin;
      let currentY = 35;
      const lineSpacing = 7;

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Report Details:', leftColX, currentY);
      
      currentY += lineSpacing + 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, leftColX, currentY);
      
      currentY += lineSpacing;
      doc.text(`Date Range: ${startDate} to ${endDate}`, leftColX, currentY);
      
      currentY += lineSpacing;
      doc.text(`Total Invoices: ${filteredInvoices.length}`, leftColX, currentY);
      
      currentY += lineSpacing;
      doc.text(`Total POs: ${filteredPOs.length}`, leftColX, currentY);

      return currentY;
    };

    const addTable = (startY, data, title) => {
      const tableHeaders = user.department === 'FINANCE' 
        ? [['Date', 'Time', 'Files Approved', 'Sender']]
        : [['File Name', 'Type', 'Date', 'Time', 'Status', 'Uploaded By']];

      const tableData = user.department === 'FINANCE'
        ? data.map(file => [
            file.date,
            file.time,
            file.name,
            file.sender
          ])
        : data.map(file => [
            file.name,
            file.type,
            file.date,
            file.time,
            formatStatus(file.status, title.toLowerCase().includes('invoice') ? 'invoice' : 'po'),
            file.uploadedBy === user.email ? 'Me' : file.uploadedBy
          ]);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(title, margin, startY);

      doc.autoTable({
        startY: startY + 5,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        margin: { top: 10, right: margin, left: margin }
      });

      return doc.lastAutoTable.finalY;
    };

    addHeaderBanner();
    const metadataEndY = addMetadata();
    const invoiceTableEndY = addTable(metadataEndY + 20, filteredInvoices, 'Invoices');
    addTable(invoiceTableEndY + 20, filteredPOs, 'Purchase Orders');
    
    doc.save(`fnb-document-report-${startDate}-to-${endDate}.pdf`);
  };

  const exportToExcel = () => {
    const filteredInvoices = user.department === 'FINANCE' ? getFinanceApprovedInvoices() : getFilteredInvoices();
    const filteredPOs = user.department === 'FINANCE' ? getFinanceApprovedPOs() : getFilteredPOs();

    const invoiceWorksheet = XLSX.utils.json_to_sheet(
      user.department === 'FINANCE'
        ? filteredInvoices.map(file => ({
            'Date': file.date,
            'Time': file.time,
            'Files Approved': file.name,
            'Sender': file.sender
          }))
        : filteredInvoices.map(file => ({
            'File Name': file.name,
            'Type': file.type,
            'Date': file.date,
            'Time': file.time,
            'Status': formatStatus(file.status, 'invoice'),
            'Uploaded By': file.uploadedBy === user.email ? 'Me' : file.uploadedBy
          }))
    );

    const poWorksheet = XLSX.utils.json_to_sheet(
      user.department === 'FINANCE'
        ? filteredPOs.map(file => ({
            'Date': file.date,
            'Time': file.time,
            'Files Approved': file.name,
            'Sender': file.sender
          }))
        : filteredPOs.map(file => ({
            'File Name': file.name,
            'Type': file.type,
            'Date': file.date,
            'Time': file.time,
            'Status': formatStatus(file.status, 'po'),
            'Uploaded By': file.uploadedBy === user.email ? 'Me' : file.uploadedBy
          }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, invoiceWorksheet, 'Invoices');
    XLSX.utils.book_append_sheet(workbook, poWorksheet, 'Purchase Orders');
    
    XLSX.writeFile(workbook, `document-report-${startDate}-to-${endDate}.xlsx`);
  };

  return (
    <div className="reports-container">
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
        maxWidth: '800px'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>Report Date Range</h2>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          flexWrap: 'nowrap'
        }}>
          <div style={{
            flex: '0 1 auto',
            minWidth: '150px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
          <div style={{
            flex: '0 1 auto',
            minWidth: '150px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
          <div style={{
            marginLeft: '10px'
          }}>
            <button 
              onClick={generateReport}
              style={{
                backgroundColor: '#3182ce',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap',
                height: '38px'
              }}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {showReport && (
        <>
          <div className="date-range-card">
            <h2 className="text-xl font-semibold mb-4">Usage Trends</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="invoices" stroke="#8884d8" name="Invoices" />
                  <Line type="monotone" dataKey="pos" stroke="#82ca9d" name="Purchase Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="date-range-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Report Details</h2>
              <div className="export-buttons">
                <button onClick={exportToPDF} className="export-button bg-red-600 text-white hover:bg-red-700">
                  <FileText size={16} />
                  Export as PDF
                </button>
                <button onClick={exportToExcel} className="export-button bg-green-600 text-white hover:bg-green-700">
                  <FileSpreadsheet size={16} />
                  Export as Excel
                </button>
              </div>
            </div>

            <div className="table-container">
              <h3 className="text-lg font-semibold mb-3">Invoices</h3>
              <table className="reports-table">
                <thead>
                  <tr>
                    {user.department === 'FINANCE' ? (
                      <>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Files Approved</th>
                        <th>Sender</th>
                      </>
                    ) : (
                      <>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Uploaded By</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(user.department === 'FINANCE' ? getFinanceApprovedInvoices() : getFilteredInvoices()).map((file, index) => (
                    <tr key={index}>
                      {user.department === 'FINANCE' ? (
                        <>
                          <td>{file.date}</td>
                          <td>{file.time}</td>
                          <td>{file.name}</td>
                          <td>{file.sender}</td>
                        </>
                      ) : (
                        <>
                          <td>{file.name}</td>
                          <td>{file.type}</td>
                          <td>{file.date}</td>
                          <td>{file.time}</td>
                          <td>
                            <span className={`status-badge ${file.status.toLowerCase()}`}>
                              {formatStatus(file.status, 'invoice')}
                            </span>
                          </td>
                          <td>
                            {file.uploadedBy === user.email ? 'Me' : file.uploadedBy}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-container mt-8">
              <h3 className="text-lg font-semibold mb-3">Purchase Orders</h3>
              <table className="reports-table">
                <thead>
                  <tr>
                    {user.department === 'FINANCE' ? (
                      <>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Files Approved</th>
                        <th>Sender</th>
                      </>
                    ) : (
                      <>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Uploaded By</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(user.department === 'FINANCE' ? getFinanceApprovedPOs() : getFilteredPOs()).map((file, index) => (
                    <tr key={index}>
                      {user.department === 'FINANCE' ? (
                        <>
                          <td>{file.date}</td>
                          <td>{file.time}</td>
                          <td>{file.name}</td>
                          <td>{file.sender}</td>
                        </>
                      ) : (
                        <>
                          <td>{file.name}</td>
                          <td>{file.type}</td>
                          <td>{file.date}</td>
                          <td>{file.time}</td>
                          <td>
                            <span className={`status-badge ${file.status.toLowerCase()}`}>
                              {formatStatus(file.status, 'po')}
                            </span>
                          </td>
                          <td>
                            {file.uploadedBy === user.email ? 'Me' : file.uploadedBy}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;