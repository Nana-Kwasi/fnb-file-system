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
  
  const { invoices } = useInvoices();
  const { user } = useAuth();

  const generateReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    setShowReport(true);
  };

  // Filter invoices based on date range and process data
  const getFilteredData = () => {
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
    });
  };

  // Process data for the chart
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
  const exportToPDF = () => {
    const doc = new jsPDF();
    const filteredData = getFilteredData();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Invoice Report', 20, 20);
    
    // Add date range
    doc.setFontSize(12);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 20, 30);
    
    // Add table
    doc.autoTable({
      startY: 40,
      head: [['File Name', 'Type', 'Date', 'Time', 'Status', 'Uploaded By']],
      body: filteredData.map(file => [
        file.name,
        file.type,
        file.date,
        file.time,
        file.status,
        file.uploadedBy === user.email ? 'Me' : file.uploadedBy
      ]),
    });
    
    // Save the PDF
    doc.save(`invoice-report-${startDate}-to-${endDate}.pdf`);
  };

  const exportToExcel = () => {
    const filteredData = getFilteredData();
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(file => ({
      'File Name': file.name,
      'Type': file.type,
      'Date': file.date,
      'Time': file.time,
      'Status': file.status,
      'Uploaded By': file.uploadedBy === user.email ? 'Me' : file.uploadedBy
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    
    // Save the file
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
              className="generate-button "
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
                      <td>{file.status}</td>
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