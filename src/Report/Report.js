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

  // Helper function to extract username from invoice/PO data
  const extractUsername = (item) => {
    // Priority order for username extraction
    if (item.sender && item.sender!== 'null' && item.sender.trim() !== '') {
      return item.sender;
    }
    if (item.username && item.username !== 'null' && item.username.trim() !== '') {
      return item.username;
    }
    if (item.uploaded_by && item.uploaded_by !== 'null' && item.uploaded_by.trim() !== '') {
      return item.uploaded_by;
    }
    if (item.original_uploader && item.original_uploader !== 'null' && item.original_uploader.trim() !== '') {
      return item.original_uploader;
    }
    if (item.uploader_id && item.uploader_id !== 'null' && item.uploader_id.trim() !== '') {
      return item.uploader_id;
    }
    return 'Unknown User';
  };

  // Helper functions to transform API data to expected format
  const transformInvoiceData = (invoice) => {
    return {
      ...invoice,
      name: invoice.name || invoice.file_name || 'Unknown File',
      // Extract date from created_at (format: "2025-06-06T08:18:05Z" -> "2025-06-06")
      date: invoice.created_at ? invoice.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      // Extract time from created_at
      time: invoice.created_at ? 
        new Date(invoice.created_at).toLocaleTimeString() : 
        new Date().toLocaleTimeString(),
      // Use the new username extraction function
      sender: extractUsername(invoice),
      type: invoice.type || 'PDF'
    };
  };

  const transformPOData = (po) => {
    return {
      ...po,
      name: po.name || po.file_name || 'Unknown File',
      // Extract date from created_at
      date: po.created_at ? po.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      // Extract time from created_at
      time: po.created_at ? 
        new Date(po.created_at).toLocaleTimeString() : 
        new Date().toLocaleTimeString(),
      // Use the new username extraction function
      sender: extractUsername(po),
      type: po.type || 'PDF'
    };
  };

  const generateReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    // Debug logging
    console.log('Generating report with:', { startDate, endDate });
    console.log('Invoices available:', invoices?.length || 0);
    console.log('PO files available:', poFiles?.length || 0);
    
    // Debug log to check username extraction
    if (invoices && invoices.length > 0) {
      console.log('Sample invoice data:', invoices[0]);
      console.log('Extracted username:', extractUsername(invoices[0]));
    }
    
    setShowReport(true);
  };

  const getFilteredInvoices = () => {
    if (!invoices || !Array.isArray(invoices)) return [];
    
    return invoices.map(transformInvoiceData).filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      return invoiceDate >= startDateObj && invoiceDate <= endDateObj;
    });
  };

  const getFilteredPOs = () => {
    if (!poFiles || !Array.isArray(poFiles)) return [];
    
    return poFiles.map(transformPOData).filter(po => {
      const poDate = new Date(po.date);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      return poDate >= startDateObj && poDate <= endDateObj;
    });
  };

  const getFinanceApprovedInvoices = () => {
    const filteredInvoices = getFilteredInvoices();
    const role = user?.role;
    
    // For finance users, show invoices they have authority over based on their role
    if (!role || user?.department !== 'FINANCE') {
      return filteredInvoices;
    }

    // Finance users should see invoices that are in progress or completed
    // This depends on your business logic - adjust the statuses as needed
    const financeRelevantStatuses = [
      INVOICE_STATUS.TAX_APPROVAL,
      INVOICE_STATUS.COST_CONTROL_CAPTURE,
      INVOICE_STATUS.FIRST_APPROVAL,
      INVOICE_STATUS.SECOND_APPROVAL,
      INVOICE_STATUS.PAYMENT,
      INVOICE_STATUS.PAID
    ];

    return filteredInvoices.filter(invoice => 
      financeRelevantStatuses.includes(invoice.status)
    );
  };

  const getFinanceApprovedPOs = () => {
    const filteredPOs = getFilteredPOs();
    
    if (user?.department !== 'FINANCE') {
      return filteredPOs;
    }

    // For finance users, show POs that are in their review stages or beyond
    const financeRelevantStatuses = [
      PO_STATUS.COST_CONTROL_REVIEW,
      PO_STATUS.HEAD_OF_FINANCE_REVIEW,
      PO_STATUS.SIGNED
    ];

    return filteredPOs.filter(po => 
      financeRelevantStatuses.includes(po.status)
    );
  };

  const getChartData = () => {
    const filteredInvoices = user?.department === 'FINANCE' ? 
      getFinanceApprovedInvoices() : getFilteredInvoices();
    const filteredPOs = user?.department === 'FINANCE' ? 
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

  const getStatusDisplayName = (status) => {
    const statusDisplayNames = {
      // Invoice statuses
      [INVOICE_STATUS.PENDING]: 'Pending',
      [INVOICE_STATUS.INITIAL_APPROVAL]: 'Initial Approval',
      [INVOICE_STATUS.TAX_APPROVAL]: 'Tax Approval',
      [INVOICE_STATUS.COST_CONTROL_CAPTURE]: 'Cost Control',
      [INVOICE_STATUS.FIRST_APPROVAL]: 'First Approval',
      [INVOICE_STATUS.SECOND_APPROVAL]: 'Second Approval',
      [INVOICE_STATUS.PAYMENT]: 'Payment Processing',
      [INVOICE_STATUS.PAID]: 'Paid',
      [INVOICE_STATUS.REJECTED]: 'Rejected',
      
      // PO statuses
      [PO_STATUS.PENDING]: 'Pending',
      [PO_STATUS.COST_CONTROL_REVIEW]: 'Cost Control Review',
      [PO_STATUS.HEAD_OF_FINANCE_REVIEW]: 'Finance Review',
      [PO_STATUS.SIGNED]: 'Signed'
    };
    
    return statusDisplayNames[status] || status;
  };

  const formatStatus = (status, type) => {
    return getStatusDisplayName(status);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const filteredInvoices = user?.department === 'FINANCE' ? getFinanceApprovedInvoices() : getFilteredInvoices();
    const filteredPOs = user?.department === 'FINANCE' ? getFinanceApprovedPOs() : getFilteredPOs();
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
      const tableHeaders = user?.department === 'FINANCE' 
        ? [['Date', 'Time', 'Files Approved', 'Sender']]
        : [['File Name', 'Type', 'Date', 'Time', 'Status', 'Sender']];

      const tableData = user?.department === 'FINANCE'
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
            file.sender === user?.username || file.sender === user?.email ? 'Me' : file.sender
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
    const filteredInvoices = user?.department === 'FINANCE' ? getFinanceApprovedInvoices() : getFilteredInvoices();
    const filteredPOs = user?.department === 'FINANCE' ? getFinanceApprovedPOs() : getFilteredPOs();

    const invoiceWorksheet = XLSX.utils.json_to_sheet(
      user?.department === 'FINANCE'
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
            'Sender': file.sender === user?.username || file.sender === user?.email ? 'Me' : file.sender
          }))
    );

    const poWorksheet = XLSX.utils.json_to_sheet(
      user?.department === 'FINANCE'
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
            'Sender': file.sender === user?.username || file.sender === user?.email ? 'Me' : file.sender
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
              <h3 className="text-lg font-semibold mb-3">Invoices ({(user?.department === 'FINANCE' ? getFinanceApprovedInvoices() : getFilteredInvoices()).length})</h3>
              <table className="reports-table">
                <thead>
                  <tr>
                    {user?.department === 'FINANCE' ? (
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
                        <th>Sender</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(user?.department === 'FINANCE' ? getFinanceApprovedInvoices() : getFilteredInvoices()).map((file, index) => (
                    <tr key={file.id || index}>
                      {user?.department === 'FINANCE' ? (
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
                            <span className={`status-badge ${file.status?.toLowerCase()}`}>
                              {formatStatus(file.status, 'invoice')}
                            </span>
                          </td>
                          <td>
                            {file.sender === user?.username || file.sender === user?.email ? 'Me' : file.sender}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(user?.department === 'FINANCE' ? getFinanceApprovedInvoices() : getFilteredInvoices()).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No invoices found for the selected date range.
                </div>
              )}
            </div>

            <div className="table-container mt-8">
              <h3 className="text-lg font-semibold mb-3">Purchase Orders ({(user?.department === 'FINANCE' ? getFinanceApprovedPOs() : getFilteredPOs()).length})</h3>
              <table className="reports-table">
                <thead>
                  <tr>
                    {user?.department === 'FINANCE' ? (
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
                        <th>Sender</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(user?.department === 'FINANCE' ? getFinanceApprovedPOs() : getFilteredPOs()).map((file, index) => (
                    <tr key={file.id || index}>
                      {user?.department === 'FINANCE' ? (
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
                            <span className={`status-badge ${file.status?.toLowerCase()}`}>
                              {formatStatus(file.status, 'po')}
                            </span>
                          </td>
                          <td>
                            {file.sender === user?.username || file.sender === user?.email ? 'Me' : file.sender}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(user?.department === 'FINANCE' ? getFinanceApprovedPOs() : getFilteredPOs()).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No purchase orders found for the selected date range.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;