import React, { useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Upload as UploadIcon } from 'lucide-react';
import { useInvoices } from '../Context/InvoiceContext';
import { useAuth } from '../Context/AuthContext';
import '../upload.css';

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileFilter, setFileFilter] = useState('all');
  const [fileAmounts, setFileAmounts] = useState({});
  const { addMultipleInvoices, invoices } = useInvoices();
  const { user } = useAuth();

  const truncateFileName = (fileName, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);
    return `${truncatedName}...${extension}`;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 4) {
      alert('Maximum 4 files can be uploaded at once');
      return;
    }
    if (fileFilter === 'pdf' && files.some(file => !file.type.includes('pdf'))) {
      alert('Please select only PDF files');
      return;
    }
    setSelectedFiles(files);
    const initialAmounts = files.reduce((acc, file) => {
      acc[file.name] = '';
      return acc;
    }, {});
    setFileAmounts(initialAmounts);
  };

  const handleAmountChange = (fileName, value) => {
    setFileAmounts(prev => ({
      ...prev,
      [fileName]: value
    }));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length > 0) {
      await addMultipleInvoices(selectedFiles, fileAmounts);
      setSelectedFiles([]);
      setFileAmounts({});
    }
  };

  const fileTypes = invoices.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(fileTypes).map(([type, count]) => ({
    name: type.split('/')[1] || type,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const activityData = invoices.slice(0, 5).map(file => ({
    name: file.name.substring(0, 10) + '...',
    size: parseFloat(file.size)
  }));

  const totalFiles = invoices.length;

  return (
    <div className="upload-container">
      <div className="upload-wrapper">
        <h2 className="upload-title">File Upload Dashboard</h2>
        
        <div className="upload-controls">
          <select 
            value={fileFilter} 
            onChange={(e) => setFileFilter(e.target.value)}
            className="file-filter"
          >
            <option value="all">All Files</option>
            <option value="pdf">PDF Only</option>
          </select>
          <input
            type="file"
            onChange={handleFileSelect}
            className="file-input"
            id="fileInput"
            accept={fileFilter === 'pdf' ? '.pdf' : undefined}
            multiple
          />
          <label htmlFor="fileInput" className="file-label">
            <UploadIcon size={30} />
            Choose Files
          </label>
          {selectedFiles.length > 0 && (
            <div className="selected-files-container">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-amount-row">
                  <span className="file-name">{truncateFileName(file.name)}</span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={fileAmounts[file.name] || ''}
                    onChange={(e) => handleAmountChange(file.name, e.target.value)}
                    className="amount-input"
                  />
                </div>
              ))}
              <button onClick={handleSubmit} className="submit-button">
                Upload
              </button>
            </div>
          )}
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <h3 className="chart-title">File Types Distribution</h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="total-files-text"
                >
                  {totalFiles}
                </text>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Recent Uploads by Size (KB)</h3>
            <ResponsiveContainer>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="size" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;