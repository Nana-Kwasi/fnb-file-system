import React, { useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Upload as UploadIcon } from 'lucide-react';
import { useInvoices } from '../Context/InvoiceContext';
import { useAuth } from '../Context/AuthContext';
import '../upload.css';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileFilter, setFileFilter] = useState('all');
  const { addInvoice, invoices } = useInvoices();
  const { user, } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (fileFilter === 'pdf' && !file.type.includes('pdf')) {
      alert('Please select a PDF file');
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      addInvoice(selectedFile, 0);
      setSelectedFile(null);
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

  const currentFiles = invoices.filter(file => 
    fileFilter === 'all' || (fileFilter === 'pdf' && file.type.includes('pdf'))
  );

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
          />
          <label htmlFor="fileInput" className="file-label">
            <UploadIcon size={30} />
            Choose File
          </label>
          {selectedFile && (
            <>
              <span className="file-name">{selectedFile.name}</span>
              <button onClick={handleSubmit} className="submit-button">
                Upload
              </button>
            </>
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

        <div className="table-container">
          <h3 className="chart-title">Current Files ({currentFiles.length})</h3>
          <table className="upload-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Size (KB)</th>
                <th>Date</th>
                <th>Time</th>
                <th>Uploader</th>
                <th>Status</th>

              </tr>
            </thead>
            <tbody>
              {currentFiles.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{file.type}</td>
                  <td>{file.size}</td>
                  <td>{file.date}</td>
                  <td>{file.time}</td>
                  <td>{file.sender === user.email ? 'Me' : file.sender}</td>

                  <td>
                    <span className="status-badge">
                      {file.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Upload;