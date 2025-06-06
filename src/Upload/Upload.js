import React, { useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Upload as UploadIcon } from 'lucide-react';
import { useInvoices } from '../Context/InvoiceContext';
import { useAuth } from '../Context/AuthContext';
import "../upload.css"

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPOFiles, setSelectedPOFiles] = useState([]);
  const [fileFilter, setFileFilter] = useState('all');
  const [poFileFilter, setPoFileFilter] = useState('all');
  const [fileAmounts, setFileAmounts] = useState({});
  const { addMultipleInvoices, addMultiplePOFiles, invoices, poFiles } = useInvoices();
  const { user } = useAuth();

  const truncateFileName = (fileName, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);
    return `${truncatedName}...${extension}`;
  };

  const handleFileSelect = (event, isPO = false) => {
    const files = Array.from(event.target.files);
    event.target.value = '';

    if (files.length > 4) {
      alert('Maximum 4 files can be uploaded at once');
      return;
    }

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      alert(`The following files are too large and cannot be selected:\n${fileNames}\nMaximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const estimatedBase64Size = totalSize * 1.37; 

    try {
      const testKey = 'storage-test';
      localStorage.setItem(testKey, '0');
      localStorage.removeItem(testKey);

      const currentStorageUsed = Object.keys(localStorage).reduce((total, key) => {
        return total + localStorage[key].length;
      }, 0);

      const estimatedAvailable = 5 * 1024 * 1024 - currentStorageUsed; 

      if (estimatedBase64Size > estimatedAvailable) {
        alert('Not enough storage space available. Please delete some existing files before uploading new ones.');
        return;
      }
    } catch (e) {
      alert('Storage is not available. Please check your browser settings.');
      return;
    }

    const currentFilter = isPO ? poFileFilter : fileFilter;
    if (currentFilter === 'pdf' && files.some(file => !file.type.includes('pdf'))) {
      alert('Please select only PDF files');
      return;
    }

    if (isPO) {
      setSelectedPOFiles(files);
    } else {
      setSelectedFiles(files);
      const initialAmounts = files.reduce((acc, file) => {
        acc[file.name] = '';
        return acc;
      }, {});
      setFileAmounts(initialAmounts);
    }
  };


  const handleAmountChange = (fileName, value) => {
    setFileAmounts(prev => ({
      ...prev,
      [fileName]: value
    }));
  };

  const isAmountsValid = () => {
    return Object.values(fileAmounts).every(amount => amount !== '' && amount !== null);
  };

  const handleSubmit = async (isPO = false) => {
    if (isPO && selectedPOFiles.length > 0) {
      await addMultiplePOFiles(selectedPOFiles);
      setSelectedPOFiles([]);
    } else if (!isPO && selectedFiles.length > 0) {
      if (!isAmountsValid()) {
        alert('Please enter amounts for all selected files');
        return;
      }
      await addMultipleInvoices(selectedFiles, fileAmounts);
      setSelectedFiles([]);
      setFileAmounts({});
    }
  };

  const fileTypes = invoices.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {});

  const poFileTypes = poFiles ? poFiles.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {}) : {};

  const pieData = Object.entries(fileTypes).map(([type, count]) => ({
    name: type.split('/')[1] || type,
    value: count
  }));

  const poPieData = Object.entries(poFileTypes).map(([type, count]) => ({
    name: type.split('/')[1] || type,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const activityData = invoices.slice(0, 5).map(file => ({
    name: file.name.substring(0, 10) + '...',
    size: parseFloat(file.size)
  }));

  const poActivityData = poFiles ? poFiles.slice(0, 5).map(file => ({
    name: file.name.substring(0, 10) + '...',
    size: parseFloat(file.size)
  })) : [];

  return (
    <div className="upload-container">
      <div className="upload-wrapper">
        <h2 className="upload-title">File Upload Dashboard</h2>
        
        <div className="upload-sections">
          <div className="upload-section">
            <h3>Invoice Upload</h3>
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
                onChange={(e) => handleFileSelect(e, false)}
                className="file-input"
                id="invoiceInput"
                accept={fileFilter === 'pdf' ? '.pdf' : undefined}
                multiple
              />
              <label htmlFor="invoiceInput" className="file-label">
                <UploadIcon size={30} />
                Choose Invoice Files
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
                  <button onClick={() => handleSubmit(false)} className="submit-button">
                    Upload Invoices
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="upload-section">
            <h3>PO Upload</h3>
            <div className="upload-controls">
              <select 
                value={poFileFilter} 
                onChange={(e) => setPoFileFilter(e.target.value)}
                className="file-filter"
              >
                <option value="all">All Files</option>
                <option value="pdf">PDF Only</option>
              </select>
              <input
                type="file"
                onChange={(e) => handleFileSelect(e, true)}
                className="file-input"
                id="poInput"
                accept={poFileFilter === 'pdf' ? '.pdf' : undefined}
                multiple
              />
              <label htmlFor="poInput" className="file-label">
                <UploadIcon size={30} />
                Choose PO Files
              </label>
              {selectedPOFiles.length > 0 && (
                <div className="selected-files-container">
                  {selectedPOFiles.map((file, index) => (
                    <div key={index} className="file-name-row">
                      <span className="file-name">{truncateFileName(file.name)}</span>
                    </div>
                  ))}
                  <button onClick={() => handleSubmit(true)} className="submit-button">
                    Upload PO Files
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <h3 className="chart-title">Invoice Types Distribution</h3>
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
            <h3 className="chart-title">PO Types Distribution</h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={poPieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {poPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Recent Invoice Uploads by Size (KB)</h3>
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

          <div className="chart-container">
            <h3 className="chart-title">Recent PO Uploads by Size (KB)</h3>
            <ResponsiveContainer>
              <BarChart data={poActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="size" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;










// import React, { useState, useRef } from 'react';
// import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
// import { Upload as UploadIcon } from 'lucide-react';
// import { useInvoices } from '../Context/InvoiceContext';
// import { useAuth } from '../Context/AuthContext';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import '../upload.css';
// import '../Request.css';

// const Upload = () => {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [fileFilter, setFileFilter] = useState('all');
//   const [fileAmounts, setFileAmounts] = useState({});
//   const { addMultipleInvoices, invoices } = useInvoices();
//   const { user } = useAuth();
//   const [showForm, setShowForm] = useState(false);
//   const [isFormValid, setIsFormValid] = useState(false);
//   const formRef = useRef(null);

//   const truncateFileName = (fileName, maxLength = 20) => {
//     if (fileName.length <= maxLength) return fileName;
//     const extension = fileName.split('.').pop();
//     const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
//     const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);
//     return `${truncatedName}...${extension}`;
//   };

//   const handleFileSelect = (event) => {
//     const files = Array.from(event.target.files);
//     if (files.length > 4) {
//       alert('Maximum 4 files can be uploaded at once');
//       return;
//     }
//     if (fileFilter === 'pdf' && files.some(file => !file.type.includes('pdf'))) {
//       alert('Please select only PDF files');
//       return;
//     }
//     setSelectedFiles(files);
//     const initialAmounts = files.reduce((acc, file) => {
//       acc[file.name] = '';
//       return acc;
//     }, {});
//     setFileAmounts(initialAmounts);
//     setShowForm(true);
//   };

//   const handleAmountChange = (fileName, value) => {
//     setFileAmounts(prev => ({
//       ...prev,
//       [fileName]: value
//     }));
//   };

//   const validateForm = () => {
//     if (!formRef.current) return false;
    
//     const budgetedInputs = formRef.current.querySelectorAll('input[name="budgeted"]');
//     const quotationInputs = formRef.current.querySelectorAll('input[name="quotation"]');
//     const approvedInputs = formRef.current.querySelectorAll('input[name="approved"]');
//     const amountInput = formRef.current.querySelector('.amount-input');

//     const isBudgetedSelected = Array.from(budgetedInputs).some(input => input.checked);
//     const isQuotationSelected = Array.from(quotationInputs).some(input => input.checked);
//     const isApprovedSelected = Array.from(approvedInputs).some(input => input.checked);
//     const isAmountFilled = amountInput && amountInput.value.trim() !== '';

//     const isValid = isBudgetedSelected && isQuotationSelected && isApprovedSelected && isAmountFilled;
//     setIsFormValid(isValid);
//     return isValid;
//   };

//   const generatePDF = async () => {
//     if (!formRef.current) return null;
    
//     const canvas = await html2canvas(formRef.current);
//     const imgData = canvas.toDataURL('image/png');
    
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();
    
//     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//     return pdf;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       alert('Please fill all required fields in the form');
//       return;
//     }

//     const pdf = await generatePDF();
//     if (!pdf) {
//       alert('Error generating PDF');
//       return;
//     }

//     const pdfBlob = pdf.output('blob');
//     const pdfFile = new File([pdfBlob], 'purchase_requisition.pdf', { type: 'application/pdf' });
    
//     const allFiles = [...selectedFiles, pdfFile];
//     await addMultipleInvoices(allFiles, fileAmounts);
    
//     setSelectedFiles([]);
//     setFileAmounts({});
//     setShowForm(false);
//     setIsFormValid(false);
//   };

//   const fileTypes = invoices.reduce((acc, file) => {
//     acc[file.type] = (acc[file.type] || 0) + 1;
//     return acc;
//   }, {});

//   const pieData = Object.entries(fileTypes).map(([type, count]) => ({
//     name: type.split('/')[1] || type,
//     value: count
//   }));

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

//   const activityData = invoices.slice(0, 5).map(file => ({
//     name: file.name.substring(0, 10) + '...',
//     size: parseFloat(file.size)
//   }));

//   const totalFiles = invoices.length;
//   return (
//     <div className="page-container">
//       <div className="upload-container">
//         <div className="upload-wrapper">
//           <h2 className="upload-title">File Upload Dashboard</h2>
          
//           <div className="upload-controls">
//             <select 
//               value={fileFilter} 
//               onChange={(e) => setFileFilter(e.target.value)}
//               className="file-filter"
//             >
//               <option value="all">All Files</option>
//               <option value="pdf">PDF Only</option>
//             </select>
//             <input
//               type="file"
//               onChange={handleFileSelect}
//               className="file-input"
//               id="fileInput"
//               accept={fileFilter === 'pdf' ? '.pdf' : undefined}
//               multiple
//             />
//             <label htmlFor="fileInput" className="file-label">
//               <UploadIcon size={30} />
//               Choose Files
//             </label>
            
//             {selectedFiles.length > 0 && (
//               <div className="selected-files-container">
//                 {selectedFiles.map((file, index) => (
//                   <div key={index} className="file-amount-row">
//                     <span className="file-name">{truncateFileName(file.name)}</span>
//                     <input
//                       type="number"
//                       placeholder="Enter amount"
//                       value={fileAmounts[file.name] || ''}
//                       onChange={(e) => handleAmountChange(file.name, e.target.value)}
//                       className="amount-input"
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="charts-grid">
//             <div className="chart-container">
//               <h3 className="chart-title">File Types Distribution</h3>
//               <ResponsiveContainer>
//                 <PieChart>
//                   <Pie
//                     data={pieData}
//                     innerRadius={60}
//                     outerRadius={80}
//                     paddingAngle={5}
//                     dataKey="value"
//                   >
//                     {pieData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <text
//                     x="50%"
//                     y="50%"
//                     textAnchor="middle"
//                     dominantBaseline="middle"
//                     className="total-files-text"
//                   >
//                     {totalFiles}
//                   </text>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>

//             <div className="chart-container">
//               <h3 className="chart-title">Recent Uploads by Size (KB)</h3>
//               <ResponsiveContainer>
//                 <BarChart data={activityData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="size" fill="#8884d8" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
//       </div>

//       {showForm && (
//         <div className="form-section-container">
//           <div ref={formRef} onChange={validateForm}>
//             <div className="purchase-form-container">
//               <div className="watermark">
//                 First National Bank
//                 Requisition Form
//               </div>
              
//               <div className="form-header">
//                 <div className="header-left">
//                   <p className="acrobat-text">Please complete this form with Fnb file system.</p>
//                 </div>
//                 <img src="/FNB LOGO.png" alt="First National Bank Logo" className="fnb-logo" />
//               </div>

//               <div className="form-title-section">
//                 <h1>PURCHASE REQUISITION FORM</h1>
//                 <div className="date-box">
//                   {new Date().toLocaleDateString('en-GB', {
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric'
//                   })}
//                 </div>
//               </div>

//               <div className="form-section">
//                 <div className="section-header">PURCHASE ORDER DETAILS</div>
//                 <div className="form-content">
//                   <div className="form-row">
//                     <label>HAS THE EXPENSE BEEN BUDGETED FOR?</label>
//                     <div className="radio-group">
//                       <label className="radio-label">
//                         <input type="radio" name="budgeted" />
//                         <span>YES</span>
//                       </label>
//                       <label className="radio-label">
//                         <input type="radio" name="budgeted" />
//                         <span>NO</span>
//                       </label>
//                     </div>
//                   </div>

//                   <div className="form-row">
//                     <label>DO YOU HAVE MORE THAN ONE QUOTATION:</label>
//                     <div className="radio-group">
//                       <label className="radio-label">
//                         <input type="radio" name="quotation" />
//                         <span>YES</span>
//                       </label>
//                       <label className="radio-label">
//                         <input type="radio" name="quotation" />
//                         <span>NO</span>
//                       </label>
//                     </div>
//                   </div>

//                   <div className="form-row">
//                     <label>WHAT IS THE TOTAL AMOUNT ON THE QUOTATION:</label>
//                     <input type="text" className="amount-input" />
//                   </div>
//                 </div>
//               </div>

//               <div className="form-section incomplete-section">
//                 <div className="section-header highlight">INCOMPLETE PURCHASE ORDER DETAIL</div>
//                 <div className="form-content empty-content"></div>
//               </div>

//               <div className="form-section">
//                 <div className="form-content">
//                   <div className="form-row">
//                     <label>HAVE YOUR QUOTATION BEEN APPROVED:</label>
//                     <div className="radio-group">
//                       <label className="radio-label">
//                         <input type="radio" name="approved" />
//                         <span>YES</span>
//                       </label>
//                       <label className="radio-label">
//                         <input type="radio" name="approved" />
//                         <span>NO</span>
//                       </label>
//                     </div>
//                   </div>
//                   <p className="answer-last">(PLEASE ANSWER THIS QUESTION LAST)</p>
//                 </div>
//               </div>

//               <div className="form-footer">
//                 <div className="signature-line">
//                   <div className="signature-block">
//                     <span>I,</span>
//                     <span className="name">Kwesi Ofori Eshun</span>
//                   </div>
//                   <div className="certification-text">
//                     CERTIFY THAT THE ABOVE INFORMATION IS ACCURATE TO THE BEST OF MY KNOWLEDGE.
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {isFormValid && (
//             <div className="submit-button-container">
//               <button onClick={handleSubmit} className="submit-button">
//                 Upload Files and Submit Form
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Upload;