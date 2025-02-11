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
import "../Report.css"

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showReport, setShowReport] = useState(false);
  
  const { invoices, INVOICE_STATUS } = useInvoices();
  const { user, ROLES } = useAuth();

  const generateReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    setShowReport(true);
  };

  const getFilteredData = () => {
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
    });
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    const dailyData = {};

    filteredData.forEach(invoice => {
      if (!dailyData[invoice.date]) {
        dailyData[invoice.date] = { date: invoice.date, total: 0 };
      }
      dailyData[invoice.date].total += 1;
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
      { role: ROLES.FINANCE_REVIEWER_1, username: 'Quachi' },
      { role: ROLES.FINANCE_REVIEWER_2, username: 'Vanessa' },
      { role: ROLES.FINANCE_REVIEWER_3, username: 'Alex' },
      { role: ROLES.FINANCE_REVIEWER_4, username: 'BAffour' },
      { role: ROLES.FINANCE_REVIEWER_5, username: 'Patrick' }
    ];

    switch (status) {
      case INVOICE_STATUS.PENDING:
        return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_1)?.username;
      case INVOICE_STATUS.REVIEW_1:
        return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_2)?.username;
      case INVOICE_STATUS.REVIEW_2:
        return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_3)?.username;
      case INVOICE_STATUS.REVIEW_3:
        return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_4)?.username;
      case INVOICE_STATUS.REVIEW_4:
        return MOCK_USERS.find(u => u.role === ROLES.FINANCE_REVIEWER_5)?.username;
      default:
        return 'Complete';
    }
  };

  const formatStatus = (status) => {
    const stageNumber = getStageNumber(status);
    const nextReviewer = getNextReviewer(status);
    return `${stageNumber} (${nextReviewer})`;
  };
  const exportToPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const filteredData = getFilteredData();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    const addHeaderBanner = () => {
      doc.setFillColor(44, 62, 80);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Invoice Report', margin, 16);
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
      doc.text(`Total Invoices: ${filteredData.length}`, leftColX, currentY);

      return currentY;
    };

    const addStatusSummary = (startY) => {
      const leftColX = margin;
      let currentY = startY + 10;
      const lineSpacing = 7;

      const statusCount = filteredData.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Status Summary:', leftColX, currentY);
      
      currentY += lineSpacing + 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      Object.entries(statusCount).forEach(([status, count]) => {
        doc.text(`${status}: ${count}`, leftColX, currentY);
        currentY += lineSpacing;
      });

      return currentY;
    };

    const addTable = (startY) => {
      const tableHeaders = [
        [
          { content: 'File Name', styles: { halign: 'left' } },
          { content: 'Type', styles: { halign: 'left' } },
          { content: 'Date', styles: { halign: 'center' } },
          { content: 'Time', styles: { halign: 'center' } },
          { content: 'Status', styles: { halign: 'center' } },
          { content: 'Uploaded By', styles: { halign: 'left' } }
        ]
      ];

      const tableData = filteredData.map(file => [
        { content: file.name, styles: { halign: 'left' } },
        { content: file.type, styles: { halign: 'left' } },
        { content: file.date, styles: { halign: 'center' } },
        { content: file.time, styles: { halign: 'center' } },
        { content: formatStatus(file.status), styles: { halign: 'center' } },
        { content: file.uploadedBy === user.email ? 'Me' : file.uploadedBy, styles: { halign: 'left' } }
      ]);

      doc.autoTable({
        startY: startY + 10,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
          lineWidth: 0.1,
          halign: 'center',
          valign: 'middle'
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 65 },
          5: { cellWidth: 45 }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 10, right: margin, left: margin },
        didDrawPage: function(data) {
          addHeaderBanner();
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Page ${data.pageNumber}`,
            pageWidth - margin - 15,
            pageHeight - margin,
            { align: 'right' }
          );
        }
      });
    };

    addHeaderBanner();
    const metadataEndY = addMetadata();
    const summaryEndY = addStatusSummary(metadataEndY);
    addTable(summaryEndY);
    
    doc.save(`fnb-invoice-report-${startDate}-to-${endDate}.pdf`);
  };

  const exportToExcel = () => {
    const filteredData = getFilteredData();
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(file => ({
      'File Name': file.name,
      'Type': file.type,
      'Date': file.date,
      'Time': file.time,
      'Status': formatStatus(file.status),
      'Uploaded By': file.uploadedBy === user.email ? 'Me' : file.uploadedBy
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    
    XLSX.writeFile(workbook, `invoice-report-${startDate}-to-${endDate}.xlsx`);
  };

  return (
    <div className="reports-container">
      <div className="date-range-card">
        <h2 className="text-xl font-semibold mb-4">Report Date Range</h2>
        <div className="date-inputs-container">
          <div className="date-input-group">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={generateReport}
              className="generate-button"
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
                  <Line type="monotone" dataKey="total" stroke="#8884d8" />
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
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Uploaded By</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().map((file, index) => (
                    <tr key={index}>
                      <td>{file.name}</td>
                      <td>{file.type}</td>
                      <td>{file.date}</td>
                      <td>{file.time}</td>
                      <td>
                        <span className={`status-badge ${file.status.toLowerCase()}`}>
                          {formatStatus(file.status)}
                        </span>
                      </td>
                      <td>
                        {file.uploadedBy === user.email ? 'Me' : file.uploadedBy}
                      </td>
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