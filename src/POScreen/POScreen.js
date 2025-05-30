import React, { useState, useCallback, useEffect } from 'react';
import { Download, CheckSquare, Upload, Send, Eye } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { useInvoices } from '../Context/InvoiceContext';

const FileUploadButton = ({ fileId, onFileUpload, fileType, hasBeenUploaded, buttonText }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onFileUpload(fileId, selectedFile);
      setSelectedFile(null);
    }
  };

  if (hasBeenUploaded) {
    return (
      <div className="relative group">
        <button
          disabled
          className="bg-gray-300 text-gray-500 rounded px-3 py-1 flex items-center gap-2 opacity-50 cursor-not-allowed"
        >
          <Upload size={16} />
          <span>{buttonText}</span>
        </button>
        <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded whitespace-nowrap z-10">
          File already uploaded
        </div>
      </div>
    );
  }

  if (selectedFile) {
    return (
      <button
        onClick={handleUpload}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 flex items-center gap-2"
      >
        <Send size={16} />
        <span>Send {selectedFile.name.substring(0, 15)}...</span>
      </button>
    );
  }

  return (
    <>
      <input
        type="file"
        id={`file-${fileType}-${fileId}`}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx"
      />
      <button
        onClick={() => document.getElementById(`file-${fileType}-${fileId}`).click()}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 flex items-center gap-2"
      >
        <Upload size={16} />
        <span>{buttonText}</span>
      </button>
    </>
  );
};

const POScreen = () => {
  const { user, ROLES } = useAuth();
  const { 
    poFiles, 
    downloadPOFile,
    uploadSignedPOFile,
    uploadWorkedPOFile,
    updatePOFileStatus,
    PO_STATUS 
  } = useInvoices();

  const handleWorkedFileUpload = async (fileId, file) => {
    try {
      await uploadWorkedPOFile(fileId, file);
      alert('Worked file uploaded successfully!');
    } catch (error) {
      console.error('Error uploading worked PO:', error);
      alert('Error uploading worked file. Please try again.');
    }
  };

  const handleSignedFileUpload = async (fileId, file) => {
    try {
      await uploadSignedPOFile(fileId, file);
      alert('Signed file uploaded successfully!');
    } catch (error) {
      console.error('Error uploading signed PO:', error);
      alert('Error uploading signed file. Please try again.');
    }
  };

  // Cost Control Table - shows files that need their review and completed files
  const CostControlTable = useCallback(() => {
    const costControlFiles = poFiles.filter(file => 
      file.status === PO_STATUS.COST_CONTROL_REVIEW || 
      file.status === PO_STATUS.SIGNED
    );

    const groupedFiles = costControlFiles.reduce((acc, file) => {
      if (!acc[file.department]) {
        acc[file.department] = [];
      }
      acc[file.department].push(file);
      return acc;
    }, {});

    return (
      <div className="table-container">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-blue-600">Cost Control Dashboard</h3>
          <p className="text-sm text-gray-600">Review PO files and upload worked versions</p>
        </div>
        
        {Object.entries(groupedFiles).map(([department, departmentFiles]) => (
          <div key={department} className="department-section mb-8">
            <h4 className="text-md font-semibold mb-4 bg-gray-100 px-4 py-2 rounded">{department} Department</h4>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Uploader</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Original File</th>
                    <th className="px-4 py-2 text-left">Upload Worked</th>
                    <th className="px-4 py-2 text-left">Signed File</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentFiles.map((file) => (
                    <tr key={file.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{file.date}</td>
                      <td className="px-4 py-2">{file.time}</td>
                      <td className="px-4 py-2">{file.username}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          file.status === PO_STATUS.SIGNED 
                            ? 'bg-green-100 text-green-800'
                            : file.status === PO_STATUS.HEAD_OF_FINANCE_REVIEW
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {file.status === PO_STATUS.COST_CONTROL_REVIEW ? 'Needs Review' :
                           file.status === PO_STATUS.HEAD_OF_FINANCE_REVIEW ? 'With Finance Head' :
                           file.status === PO_STATUS.SIGNED ? 'Completed' : file.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => downloadPOFile(file, 'original')}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title={`Download: ${file.name}`}
                        >
                          <Download size={16} />
                          <span className="text-sm">Original</span>
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        {file.status === PO_STATUS.COST_CONTROL_REVIEW ? (
                          <FileUploadButton
                            fileId={file.id}
                            onFileUpload={handleWorkedFileUpload}
                            fileType="worked"
                            hasBeenUploaded={!!file.workedContent}
                            buttonText="Upload Worked"
                          />
                        ) : file.workedContent ? (
                          <button
                            onClick={() => downloadPOFile(file, 'worked')}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title={`Download worked file: ${file.workedFileName || `worked_${file.name}`}`}
                          >
                            <Download size={16} />
                            <span className="text-sm">Worked</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {file.signedContent ? (
                          <button
                            onClick={() => downloadPOFile(file, 'signed')}
                            className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                            title={`Download signed file: ${file.signedFileName || `signed_${file.name}`}`}
                          >
                            <Download size={16} />
                            <span className="text-sm">Signed</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        
        {Object.keys(groupedFiles).length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No PO files require your attention at this time.</p>
          </div>
        )}
      </div>
    );
  }, [poFiles, PO_STATUS, downloadPOFile, handleWorkedFileUpload]);

  // Head of Finance Table - shows files that cost control has worked on
  const HeadOfFinanceTable = useCallback(() => {
    const financeFiles = poFiles.filter(file => 
      file.status === PO_STATUS.HEAD_OF_FINANCE_REVIEW || 
      file.status === PO_STATUS.SIGNED
    );

    const groupedFiles = financeFiles.reduce((acc, file) => {
      if (!acc[file.department]) {
        acc[file.department] = [];
      }
      acc[file.department].push(file);
      return acc;
    }, {});

    return (
      <div className="table-container">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-green-600">Head of Finance Dashboard</h3>
          <p className="text-sm text-gray-600">Review worked files and upload signed versions</p>
        </div>
        
        {Object.entries(groupedFiles).map(([department, departmentFiles]) => (
          <div key={department} className="department-section mb-8">
            <h4 className="text-md font-semibold mb-4 bg-gray-100 px-4 py-2 rounded">{department} Department</h4>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Uploader</th>
                    <th className="px-4 py-2 text-left">Worked By</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Original File</th>
                    <th className="px-4 py-2 text-left">Worked File</th>
                    <th className="px-4 py-2 text-left">Upload Signed</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentFiles.map((file) => (
                    <tr key={file.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{file.date}</td>
                      <td className="px-4 py-2">{file.time}</td>
                      <td className="px-4 py-2">{file.username}</td>
                      <td className="px-4 py-2">
                        {file.costControlWorkedBy ? (
                          <span className="text-sm text-blue-600">
                            {file.costControlWorkedBy.split('@')[0]}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          file.status === PO_STATUS.SIGNED 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {file.status === PO_STATUS.HEAD_OF_FINANCE_REVIEW ? 'Needs Signing' :
                           file.status === PO_STATUS.SIGNED ? 'Completed' : file.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => downloadPOFile(file, 'original')}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title={`Download: ${file.name}`}
                        >
                          <Download size={16} />
                          <span className="text-sm">Original</span>
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        {file.workedContent ? (
                          <button
                            onClick={() => downloadPOFile(file, 'worked')}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title={`Download worked file: ${file.workedFileName || `worked_${file.name}`}`}
                          >
                            <Download size={16} />
                            <span className="text-sm">Worked</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {file.status === PO_STATUS.HEAD_OF_FINANCE_REVIEW ? (
                          <FileUploadButton
                            fileId={file.id}
                            onFileUpload={handleSignedFileUpload}
                            fileType="signed"
                            hasBeenUploaded={!!file.signedContent}
                            buttonText="Upload Signed"
                          />
                        ) : file.signedContent ? (
                          <button
                            onClick={() => downloadPOFile(file, 'signed')}
                            className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                            title={`Download signed file: ${file.signedFileName || `signed_${file.name}`}`}
                          >
                            <Download size={16} />
                            <span className="text-sm">Signed</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        
        {Object.keys(groupedFiles).length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No PO files require your attention at this time.</p>
          </div>
        )}
      </div>
    );
  }, [poFiles, PO_STATUS, downloadPOFile, handleSignedFileUpload]);

  // Department User Table - shows their own files and status
  const DepartmentTable = useCallback(() => {
    const departmentFiles = poFiles.filter(file => 
      file.originalUploader === user.email
    );

    return (
      <div className="table-container">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-indigo-600">My PO Files</h3>
          <p className="text-sm text-gray-600">Track the status of your submitted PO files</p>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">File Name</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Original File</th>
                <th className="px-4 py-2 text-left">Worked File</th>
                <th className="px-4 py-2 text-left">Signed File</th>
              </tr>
            </thead>
            <tbody>
              {departmentFiles.map((file) => (
                <tr key={file.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{file.date}</td>
                  <td className="px-4 py-2">{file.time}</td>
                  <td className="px-4 py-2" title={file.name}>
                    {file.name.length > 30 ? `${file.name.substring(0, 30)}...` : file.name}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      file.status === PO_STATUS.SIGNED 
                        ? 'bg-green-100 text-green-800'
                        : file.status === PO_STATUS.HEAD_OF_FINANCE_REVIEW
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {file.status === PO_STATUS.COST_CONTROL_REVIEW ? 'Under Review' :
                       file.status === PO_STATUS.HEAD_OF_FINANCE_REVIEW ? 'Being Signed' :
                       file.status === PO_STATUS.SIGNED ? 'Completed' : file.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => downloadPOFile(file, 'original')}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      title={`Download: ${file.name}`}
                    >
                      <Download size={16} />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    {file.workedContent ? (
                      <button
                        onClick={() => downloadPOFile(file, 'worked')}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        title={`Download worked file: ${file.workedFileName || `worked_${file.name}`}`}
                      >
                        <Download size={16} />
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {file.signedContent ? (
                      <button
                        onClick={() => downloadPOFile(file, 'signed')}
                        className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                        title={`Download signed file: ${file.signedFileName || `signed_${file.name}`}`}
                      >
                        <Download size={16} />
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {departmentFiles.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">You haven't uploaded any PO files yet.</p>
          </div>
        )}
      </div>
    );
  }, [poFiles, user.email, downloadPOFile, PO_STATUS]);

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Purchase Order Management</h2>
        <p className="text-gray-600 mt-1">
          {user?.role === ROLES.COST_CONTROL && "Review and process PO files"}
          {user?.role === ROLES.HEAD_OF_FINANCE && "Sign processed PO files"}
          {user?.role === ROLES.DEPARTMENT_USER && "Track your submitted PO files"}
        </p>
      </div>

      {user?.role === ROLES.COST_CONTROL && <CostControlTable />}
      {user?.role === ROLES.HEAD_OF_FINANCE && <HeadOfFinanceTable />}
      {user?.role === ROLES.DEPARTMENT_USER && <DepartmentTable />}
      
      {!user?.role && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Unable to determine user role. Please contact support.</p>
        </div>
      )}
    </div>
  );
};

export default POScreen;










// import React, { useState } from 'react';
// import { Download, CheckSquare, Upload, Send } from 'lucide-react';
// import { useAuth } from '../Context/AuthContext';
// import { useInvoices } from '../Context/InvoiceContext';

// const FileUploadButton = ({ fileId, onFileUpload }) => {
//   // Single file state for this specific button
//   const [selectedFile, setSelectedFile] = useState(null);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   const handleUpload = async () => {
//     if (selectedFile) {
//       await onFileUpload(fileId, selectedFile);
//       setSelectedFile(null); // Reset after upload
//     }
//   };

//   if (selectedFile) {
//     return (
//       <button
//         onClick={handleUpload}
//         className="bg-blue-500 text-white rounded px-3 py-1 flex items-center gap-2"
//       >
//         <Send size={16} />
//         <span>Send {selectedFile.name}</span>
//       </button>
//     );
//   }

//   return (
//     <>
//       <input
//         type="file"
//         id={`file-${fileId}`}
//         onChange={handleFileChange}
//         className="hidden"
//       />
//       <button
//         onClick={() => document.getElementById(`file-${fileId}`).click()}
//         className="bg-gray-500 text-white rounded px-3 py-1 flex items-center gap-2"
//       >
//         <Upload size={16} />
//         <span>Upload</span>
//       </button>
//     </>
//   );
// };

// const POScreen = () => {
//   const [selectedIds, setSelectedIds] = useState(new Set());
//   const { user } = useAuth();
//   const { poFiles, downloadPOFile, uploadSignedPOFile, updatePOFileStatus, PO_STATUS } = useInvoices();

//   const handleUpload = async (fileId, file) => {
//     try {
//       await uploadSignedPOFile(fileId, file);
//       // You might want to refresh your data here
//     } catch (error) {
//       console.error('Upload failed:', error);
//     }
//   };

//   const handleCheckbox = (id) => {
//     setSelectedIds(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(id)) {
//         newSet.delete(id);
//       } else {
//         newSet.add(id);
//       }
//       return newSet;
//     });
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Purchase Orders</h2>
      
//       <div className="bg-white rounded-lg shadow">
//         <table className="min-w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2">Select</th>
//               <th className="px-4 py-2">Date</th>
//               <th className="px-4 py-2">Department</th>
//               <th className="px-4 py-2">Download</th>
//               <th className="px-4 py-2">Upload</th>
//               <th className="px-4 py-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {poFiles.map(file => (
//               <tr key={file.id} className="border-t">
//                 <td className="px-4 py-2">
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.has(file.id)}
//                     onChange={() => handleCheckbox(file.id)}
//                   />
//                 </td>
//                 <td className="px-4 py-2">{file.date}</td>
//                 <td className="px-4 py-2">{file.department}</td>
//                 <td className="px-4 py-2">
//                   <button 
//                     onClick={() => downloadPOFile(file)}
//                     className="text-gray-600 hover:text-gray-900"
//                   >
//                     <Download size={16} />
//                   </button>
//                 </td>
//                 <td className="px-4 py-2">
//                   <FileUploadButton
//                     fileId={file.id}
//                     onFileUpload={handleUpload}
//                   />
//                 </td>
//                 <td className="px-4 py-2">
//                   {file.status === PO_STATUS.APPROVED ? (
//                     <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
//                       Approved
//                     </span>
//                   ) : (
//                     <button
//                       onClick={() => updatePOFileStatus(file.id, PO_STATUS.APPROVED)}
//                       disabled={!selectedIds.has(file.id)}
//                       className="bg-green-500 text-white px-3 py-1 rounded disabled:bg-gray-300"
//                     >
//                       Approve
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default POScreen;