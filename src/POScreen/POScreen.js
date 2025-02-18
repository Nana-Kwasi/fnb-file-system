import React, { useState, useCallback, useEffect } from 'react';
import { Download, CheckSquare, Upload, Send } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { useInvoices } from '../Context/InvoiceContext';

const FileUploadButton = ({ fileId, onFileUpload, isSignedFile, hasBeenUploaded }) => {
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

  if (isSignedFile || hasBeenUploaded) {
    return (
      <div className="relative group">
        <button
          disabled
          className="bg-gray-300 text-gray-500 rounded px-3 py-1 flex items-center gap-2 opacity-50 cursor-not-allowed"
        >
          <Upload size={16} />
          <span>Upload Signed</span>
        </button>
        <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded whitespace-nowrap">
          Already sent signed file
        </div>
      </div>
    );
  }

  if (selectedFile) {
    return (
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white rounded px-3 py-1 flex items-center gap-2"
      >
        <Send size={16} />
        <span>Send {selectedFile.name}</span>
      </button>
    );
  }

  return (
    <>
      <input
        type="file"
        id={`file-${fileId}`}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx"
      />
      <button
        onClick={() => document.getElementById(`file-${fileId}`).click()}
        className="bg-gray-500 text-white rounded px-3 py-1 flex items-center gap-2"
      >
        <Upload size={16} />
        <span>Upload Signed</span>
      </button>
    </>
  );
};

const POScreen = () => {
  const [selectedForApproval, setSelectedForApproval] = useState(() => {
    const saved = localStorage.getItem('selectedForApproval');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const saved = localStorage.getItem('uploadedFiles');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [approvedFiles, setApprovedFiles] = useState(() => {
    const saved = localStorage.getItem('approvedFiles');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const { user } = useAuth();
  const { 
    poFiles, 
    downloadPOFile,
    uploadSignedPOFile,
    updatePOFileStatus,
    PO_STATUS 
  } = useInvoices();

  useEffect(() => {
    localStorage.setItem('selectedForApproval', JSON.stringify([...selectedForApproval]));
  }, [selectedForApproval]);

  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify([...uploadedFiles]));
  }, [uploadedFiles]);

  useEffect(() => {
    localStorage.setItem('approvedFiles', JSON.stringify([...approvedFiles]));
  }, [approvedFiles]);

  useEffect(() => {
    const approvedFromFiles = poFiles
      .filter(file => file.status === PO_STATUS.APPROVED)
      .map(file => file.id);
    
    setApprovedFiles(prev => {
      const newApproved = new Set([...prev, ...approvedFromFiles]);
      localStorage.setItem('approvedFiles', JSON.stringify([...newApproved]));
      return newApproved;
    });
  }, [poFiles, PO_STATUS.APPROVED]);

  const handleUpload = async (fileId, file) => {
    try {
      await uploadSignedPOFile(fileId, file);
      setUploadedFiles(prev => {
        const newUploaded = new Set(prev);
        newUploaded.add(fileId);
        return newUploaded;
      });
    } catch (error) {
      console.error('Error uploading signed PO:', error);
    }
  };

  const handleApprovalSelection = useCallback((fileId) => {
    if (!approvedFiles.has(fileId)) {
      setSelectedForApproval(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(fileId)) {
          newSelected.delete(fileId);
        } else {
          newSelected.add(fileId);
        }
        return newSelected;
      });
    }
  }, [approvedFiles]);

  const handleApprove = useCallback((fileId) => {
    updatePOFileStatus(fileId, PO_STATUS.APPROVED);
    setApprovedFiles(prev => {
      const newApproved = new Set(prev);
      newApproved.add(fileId);
      return newApproved;
    });
    setSelectedForApproval(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(fileId);
      return newSelected;
    });
  }, [updatePOFileStatus, PO_STATUS.APPROVED]);

  const isFileApproved = useCallback((file) => {
    return approvedFiles.has(file.id) || file.status === PO_STATUS.APPROVED;
  }, [approvedFiles, PO_STATUS.APPROVED]);

  const FinanceTable = useCallback(() => {
    const groupedPOFiles = poFiles.reduce((acc, file) => {
      if (!acc[file.department]) {
        acc[file.department] = [];
      }
      acc[file.department].push(file);
      return acc;
    }, {});

    return (
      <div className="table-container">
        {Object.entries(groupedPOFiles).map(([department, departmentFiles]) => (
          <div key={department} className="department-section mb-8">
            <h3 className="text-lg font-semibold mb-4">{department}</h3>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Select</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Uploader</th>
                    <th className="px-4 py-2">Download</th>
                    <th className="px-4 py-2">Upload Signed</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentFiles.map((file) => {
                    const fileApproved = isFileApproved(file);
                    return (
                      <tr key={file.id} className="border-t">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedForApproval.has(file.id)}
                            onChange={() => handleApprovalSelection(file.id)}
                            disabled={fileApproved}
                            className={`rounded border-gray-300 ${
                              fileApproved ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-2">{file.date}</td>
                        <td className="px-4 py-2">{file.time}</td>
                        <td className="px-4 py-2">{file.username}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => downloadPOFile(file)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Download size={16} />
                          </button>
                        </td>
                        <td className="px-4 py-2">
                          <FileUploadButton
                            fileId={file.id}
                            onFileUpload={handleUpload}
                            isSignedFile={file.signedContent !== null}
                            hasBeenUploaded={uploadedFiles.has(file.id)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          {fileApproved ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              Approved
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApprove(file.id)}
                              disabled={!selectedForApproval.has(file.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded disabled:bg-gray-300"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }, [poFiles, selectedForApproval, handleApprovalSelection, downloadPOFile, handleApprove, approvedFiles, uploadedFiles, isFileApproved]);

  const DepartmentTable = useCallback(() => {
    const departmentFiles = poFiles.filter(file => 
      file.department === user.department
    );

    return (
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Uploader</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Original</th>
              <th className="px-4 py-2">Signed</th>
            </tr>
          </thead>
          <tbody>
            {departmentFiles.map((file) => (
              <tr key={file.id} className="border-t">
                <td className="px-4 py-2">{file.date}</td>
                <td className="px-4 py-2">{file.time}</td>
                <td className="px-4 py-2">
                  {file.uploadedBy === user.email ? 'Me' : file.username}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded ${
                    file.status === PO_STATUS.SIGNED 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {file.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => downloadPOFile(file)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Download size={16} />
                  </button>
                </td>
                <td className="px-4 py-2">
                  {file.signedContent ? (
                    <button
                      onClick={() => downloadPOFile(file, true)}
                      className="text-gray-600 hover:text-gray-900"
                      title={`Download signed file: ${file.signedFileName || `signed_${file.name}`}`}
                    >
                      <Download size={16} />
                    </button>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [poFiles, user, downloadPOFile, PO_STATUS.SIGNED]);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Purchase Order Files</h2>
        {user?.department === 'FINANCE' && (
          <span className="text-gray-600">Finance Department PO Review</span>
        )}
      </div>

      {user?.department === 'FINANCE' ? (
        <FinanceTable />
      ) : (
        <DepartmentTable />
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