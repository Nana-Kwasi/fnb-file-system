import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InvoiceContext = createContext(null);

export const INVOICE_STATUS = {
  PENDING: 'PENDING',
  INITIAL_APPROVAL: 'INITIAL_APPROVAL', 
  TAX_APPROVAL: 'TAX_APPROVAL', 
  COST_CONTROL_CAPTURE: 'COST_CONTROL_CAPTURE', 
  FIRST_APPROVAL: 'FIRST_APPROVAL', 
  SECOND_APPROVAL: 'SECOND_APPROVAL', 
  PAYMENT: 'PAYMENT',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
};

export const PO_STATUS = {
  PENDING: 'PENDING',
  COST_CONTROL_REVIEW: 'COST_CONTROL_REVIEW', // New status for cost control review
  HEAD_OF_FINANCE_REVIEW: 'HEAD_OF_FINANCE_REVIEW', // New status for head of finance review
  SIGNED: 'SIGNED'
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Helper function to determine required approvers based on amount
const getRequiredApprovers = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  
  if (numAmount <= 20000) {
    return ['HEAD_OF_FINANCE'];
  } else if (numAmount > 20000 && numAmount <= 50000) {
    return ['HEAD_OF_FINANCE', 'CFO'];
  } else if (numAmount > 50000 && numAmount <= 100000) {
    return ['HEAD_OF_FINANCE', 'CFO', 'CEO'];
  } else if (numAmount > 100000 && numAmount <= 300000) {
    return ['HEAD_OF_FINANCE', 'CFO', 'CEO'];
  } else if (numAmount > 300000 && numAmount <= 2000000) {
    return ['PC'];
  } else {
    return ['EXCO'];
  }
};

const checkStorageAvailability = (dataSize) => {
  // Simulate storage check - in real app, this would check localStorage
  return true;
};

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [poFiles, setPoFiles] = useState([]);
  const { user, ROLES } = useAuth();

  useEffect(() => {
    // Note: In a real environment, you would use localStorage here
    // For demo purposes, we'll start with empty arrays
    const storedInvoices = null; // localStorage.getItem('invoices');
    const storedPOFiles = null; // localStorage.getItem('poFiles');
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }
    if (storedPOFiles) {
      setPoFiles(JSON.parse(storedPOFiles));
    }
  }, []);

  const safelySetLocalStorage = (key, value) => {
    const dataSize = value.length;
    if (!checkStorageAvailability(dataSize)) {
      throw new Error('STORAGE_QUOTA_EXCEEDED');
    }
    // Note: In real environment, you would use localStorage.setItem(key, value);
  };

  const addInvoice = async (file, amount) => {
    if (!user) return null;
    
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('FILE_TOO_LARGE');
    }
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataSize = e.target.result.length;
          if (!checkStorageAvailability(dataSize)) {
            reject(new Error('STORAGE_QUOTA_EXCEEDED'));
            return;
          }

          const requiredApprovers = getRequiredApprovers(amount);
          
          const newInvoice = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            status: INVOICE_STATUS.PENDING,
            amount: amount ? parseFloat(amount) : 0,
            sender: user.email,
            department: user.department,
            uploadedBy: user.email,
            size: (file.size / 1024).toFixed(2),
            lastModified: file.lastModified,
            content: e.target.result,
            requiredApprovers: requiredApprovers,
            approvals: [],
            rejections: [],
            currentApprovalStage: 'INITIAL_APPROVAL'
          };

          setInvoices(prevInvoices => {
            const newInvoices = [...prevInvoices, newInvoice];
            safelySetLocalStorage('invoices', JSON.stringify(newInvoices));
            return newInvoices;
          });
          resolve(newInvoice);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('FILE_READ_ERROR'));
      reader.readAsDataURL(file);
    });
  };

  const addMultipleInvoices = async (files, amounts) => {
    if (!user) return null;
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return false;
      }
      return true;
    });
    
    return Promise.all(validFiles.map(file => addInvoice(file, amounts[file.name])));
  };

  const addPOFile = async (file) => {
    if (!user) return null;
    
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('FILE_TOO_LARGE');
    }
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataSize = e.target.result.length;
          if (!checkStorageAvailability(dataSize)) {
            reject(new Error('STORAGE_QUOTA_EXCEEDED'));
            return;
          }

          const newPOFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            status: PO_STATUS.COST_CONTROL_REVIEW, // Start with cost control review
            sender: user.email,
            username: user.username,
            department: user.department,
            uploadedBy: user.email,
            originalUploader: user.email, // Track original uploader
            size: (file.size / 1024).toFixed(2),
            lastModified: file.lastModified,
            content: e.target.result,
            workedContent: null, // Content after cost control works on it
            workedFileName: null,
            workedFileType: null,
            signedContent: null, // Final signed content
            signedFileName: null,
            signedFileType: null,
            costControlWorkedBy: null,
            headOfFinanceSignedBy: null,
            costControlWorkedDate: null,
            signedDate: null
          };

          setPoFiles(prevFiles => {
            const newFiles = [...prevFiles, newPOFile];
            safelySetLocalStorage('poFiles', JSON.stringify(newFiles));
            return newFiles;
          });
          resolve(newPOFile);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('FILE_READ_ERROR'));
      reader.readAsDataURL(file);
    });
  };

  const addMultiplePOFiles = async (files) => {
    if (!user) return null;
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return false;
      }
      return true;
    });
    
    return Promise.all(validFiles.map(file => addPOFile(file)));
  };

  // Updated function to handle cost control worked file upload
  const uploadWorkedPOFile = async (fileId, workedFile) => {
    if (workedFile.size > MAX_FILE_SIZE) {
      throw new Error('FILE_TOO_LARGE');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workedContent = e.target.result;
          const updatedFiles = poFiles.map(file => 
            file.id === fileId 
              ? { 
                  ...file, 
                  status: PO_STATUS.HEAD_OF_FINANCE_REVIEW, // Move to head of finance review
                  workedContent,
                  workedFileName: workedFile.name,
                  workedFileType: workedFile.type,
                  costControlWorkedBy: user.email,
                  costControlWorkedDate: new Date().toISOString()
                } 
              : file
          );
          setPoFiles(updatedFiles);
          safelySetLocalStorage('poFiles', JSON.stringify(updatedFiles));
          resolve(workedContent);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(workedFile);
    });
  };

  // Updated function to handle signed file upload by head of finance
  const uploadSignedPOFile = async (fileId, signedFile) => {
    if (signedFile.size > MAX_FILE_SIZE) {
      throw new Error('FILE_TOO_LARGE');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const signedContent = e.target.result;
          const updatedFiles = poFiles.map(file => 
            file.id === fileId 
              ? { 
                  ...file, 
                  status: PO_STATUS.SIGNED, // Mark as completely signed
                  signedContent,
                  signedFileName: signedFile.name,
                  signedFileType: signedFile.type,
                  headOfFinanceSignedBy: user.email,
                  signedDate: new Date().toISOString()
                } 
              : file
          );
          setPoFiles(updatedFiles);
          safelySetLocalStorage('poFiles', JSON.stringify(updatedFiles));
          resolve(signedContent);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(signedFile);
    });
  };

  // Updated updateInvoiceStatus function to handle concurrent approvals and payment process
 const updateInvoiceStatus = (invoiceId, newStatus, action = 'approve') => {
  const updatedInvoices = invoices.map(invoice => {
    if (invoice.id === invoiceId) {
      const updatedInvoice = { ...invoice };
      
      if (action === 'approve') {
        // Add current user to approvals
        if (!updatedInvoice.approvals.includes(user.role)) {
          updatedInvoice.approvals.push(user.role);
        }
        
        // Determine next status based on current status and approvals
        if (updatedInvoice.status === INVOICE_STATUS.PENDING || 
            updatedInvoice.status === INVOICE_STATUS.INITIAL_APPROVAL) {
          
          const numAmount = parseFloat(updatedInvoice.amount) || 0;
          let requiredApprovalCount;
          
          // Determine required approval count based on amount
          if (numAmount > 50000 && numAmount <= 100000) {
            requiredApprovalCount = 2; // Any 2 out of 3 (CFO, CEO, Head of Finance)
          } else if (numAmount > 100000 && numAmount <= 300000) {
            requiredApprovalCount = 2; // Any 2 out of 3 (CFO, CEO, Head of Finance)
          } else if (numAmount > 20000 && numAmount <= 50000) {
            requiredApprovalCount = 2; 
          } else if (numAmount <= 20000) {
            requiredApprovalCount = 1; 
          } else if (numAmount > 300000 && numAmount <= 2000000) {
            requiredApprovalCount = 1; 
          } else {
            requiredApprovalCount = 1; 
          }
          
          const validApprovals = updatedInvoice.approvals.filter(approval => 
            updatedInvoice.requiredApprovers.includes(approval)
          );
          
          if (validApprovals.length >= requiredApprovalCount) {
            updatedInvoice.status = INVOICE_STATUS.TAX_APPROVAL;
            updatedInvoice.currentApprovalStage = 'TAX_APPROVAL';
          } else {
            updatedInvoice.status = INVOICE_STATUS.INITIAL_APPROVAL;
            updatedInvoice.currentApprovalStage = 'INITIAL_APPROVAL';
          }
        } else if (updatedInvoice.status === INVOICE_STATUS.TAX_APPROVAL) {
          updatedInvoice.status = INVOICE_STATUS.COST_CONTROL_CAPTURE;
          updatedInvoice.currentApprovalStage = 'COST_CONTROL_CAPTURE';
        } else if (updatedInvoice.status === INVOICE_STATUS.COST_CONTROL_CAPTURE) {
          updatedInvoice.status = INVOICE_STATUS.FIRST_APPROVAL;
          updatedInvoice.currentApprovalStage = 'FIRST_APPROVAL';
        } else if (updatedInvoice.status === INVOICE_STATUS.FIRST_APPROVAL) {
          updatedInvoice.status = INVOICE_STATUS.SECOND_APPROVAL;
          updatedInvoice.currentApprovalStage = 'SECOND_APPROVAL';
        } else if (updatedInvoice.status === INVOICE_STATUS.SECOND_APPROVAL) {
          updatedInvoice.status = INVOICE_STATUS.PAYMENT;
          updatedInvoice.currentApprovalStage = 'PAYMENT';
        } else {
          updatedInvoice.status = newStatus;
        }
      } else if (action === 'reject') {
        // Add current user to rejections
        if (!updatedInvoice.rejections.includes(user.role)) {
          updatedInvoice.rejections.push(user.role);
        }
        
        // If rejection happens at first or second approval stage, go back to cost control
        if (updatedInvoice.status === INVOICE_STATUS.FIRST_APPROVAL || 
            updatedInvoice.status === INVOICE_STATUS.SECOND_APPROVAL) {
          updatedInvoice.status = INVOICE_STATUS.COST_CONTROL_CAPTURE;
          updatedInvoice.currentApprovalStage = 'COST_CONTROL_CAPTURE';
          // Clear previous approvals for these stages
          updatedInvoice.approvals = updatedInvoice.approvals.filter(
            approval => !['APPROVAL_USER_1', 'APPROVAL_USER_2'].includes(approval)
          );
        } else {
          updatedInvoice.status = INVOICE_STATUS.REJECTED;
          updatedInvoice.currentApprovalStage = 'REJECTED';
        }
      } else if (action === 'pay') {
        // New payment action
        updatedInvoice.status = INVOICE_STATUS.PAID;
        updatedInvoice.currentApprovalStage = 'COMPLETED';
        updatedInvoice.paidBy = user.email;
        updatedInvoice.paidDate = new Date().toISOString();
      }
      
      return updatedInvoice;
    }
    return invoice;
  });
  
  setInvoices(updatedInvoices);
  safelySetLocalStorage('invoices', JSON.stringify(updatedInvoices));
};

  const updatePOFileStatus = (fileId, newStatus, signedContent = null) => {
    const updatedFiles = poFiles.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            status: newStatus,
            ...(signedContent && { signedContent })
          } 
        : file
    );
    setPoFiles(updatedFiles);
    safelySetLocalStorage('poFiles', JSON.stringify(updatedFiles));
  };

  const getVisiblePOFiles = () => {
    if (!user) return [];

    if (user.role === ROLES.COST_CONTROL) {
      return poFiles.filter(file => 
        file.status === PO_STATUS.COST_CONTROL_REVIEW || 
        file.status === PO_STATUS.SIGNED
      );
    }
        if (user.role === ROLES.HEAD_OF_FINANCE) {
      return poFiles.filter(file => 
        file.status === PO_STATUS.HEAD_OF_FINANCE_REVIEW || 
        file.status === PO_STATUS.SIGNED
      );
    }
    
    if (user.role === ROLES.DEPARTMENT_USER) {
      return poFiles.filter(file => 
        file.originalUploader === user.email
      );
    }
    
    // Other finance roles can see all files (for admin purposes)
    if (user.department === 'FINANCE') {
      return poFiles;
    }
    
    return [];
  };
const getVisibleInvoices = () => {
  if (!user) return [];

  return invoices.filter(invoice => {
    // Department users can see their own department's invoices
    if (user.role === ROLES.DEPARTMENT_USER) {
      return invoice.department === user.department;
    }
    
    // For PENDING and INITIAL_APPROVAL status - concurrent approval system
    if (invoice.status === INVOICE_STATUS.PENDING || invoice.status === INVOICE_STATUS.INITIAL_APPROVAL) {
      const isRequiredApprover = invoice.requiredApprovers.includes(user.role);
      const hasUserApproved = invoice.approvals.includes(user.role);
      
      // Calculate required approval count based on amount
      let requiredApprovalCount;
      const numAmount = parseFloat(invoice.amount) || 0;
      
      if (numAmount > 50000 && numAmount <= 100000) {
        requiredApprovalCount = 2; // Any 2 out of 3 (CFO, CEO, Head of Finance)
      } else if (numAmount > 100000 && numAmount <= 300000) {
        requiredApprovalCount = 2; // Any 2 out of 3 (CFO, CEO, Head of Finance)
      } else if (numAmount > 20000 && numAmount <= 50000) {
        requiredApprovalCount = 2; // Any 2 out of 2 (CFO, Head of Finance)
      } else if (numAmount <= 20000) {
        requiredApprovalCount = 1; // Only Head of Finance
      } else if (numAmount > 300000 && numAmount <= 2000000) {
        requiredApprovalCount = 1; // Only PC
      } else {
        requiredApprovalCount = 1; // Only EXCO
      }
      
      // Count valid approvals from required approvers
      const validApprovals = invoice.approvals.filter(approval => 
        invoice.requiredApprovers.includes(approval)
      );
      
      // Show to required approvers who haven't approved yet AND total required approvals not met
      return isRequiredApprover && !hasUserApproved && validApprovals.length < requiredApprovalCount;
    }
    
    // Tax Manager approval
    if (user.role === ROLES.TAX_MANAGER) {
      return invoice.status === INVOICE_STATUS.TAX_APPROVAL && 
             !invoice.approvals.includes(user.role);
    }
    
    // Cost Control capture
    if (user.role === ROLES.COST_CONTROL) {
      return invoice.status === INVOICE_STATUS.COST_CONTROL_CAPTURE;
    }
    
    // First Approval User
    if (user.role === ROLES.APPROVAL_USER_1) {
      return invoice.status === INVOICE_STATUS.FIRST_APPROVAL && 
             !invoice.approvals.includes(user.role);
    }
    
    // Second Approval User
    if (user.role === ROLES.APPROVAL_USER_2) {
      return invoice.status === INVOICE_STATUS.SECOND_APPROVAL && 
             !invoice.approvals.includes(user.role);
    }
    
    // Payment User
    if (user.role === ROLES.PAYMENT_USER) {
      return invoice.status === INVOICE_STATUS.PAYMENT;
    }
    
    return false;
  });
};



  const canEditInvoice = (invoice) => {
    if (!user) return false;

    switch (invoice.status) {
      case INVOICE_STATUS.PENDING:
      case INVOICE_STATUS.INITIAL_APPROVAL:
        return invoice.requiredApprovers.includes(user.role) && 
               !invoice.approvals.includes(user.role);
      
      case INVOICE_STATUS.TAX_APPROVAL:
        return user.role === ROLES.TAX_MANAGER && 
               !invoice.approvals.includes(user.role);
      
      case INVOICE_STATUS.COST_CONTROL_CAPTURE:
        return user.role === ROLES.COST_CONTROL;
      
      case INVOICE_STATUS.FIRST_APPROVAL:
        return user.role === ROLES.APPROVAL_USER_1 && 
               !invoice.approvals.includes(user.role);
      
      case INVOICE_STATUS.SECOND_APPROVAL:
        return user.role === ROLES.APPROVAL_USER_2 && 
               !invoice.approvals.includes(user.role);
      
      case INVOICE_STATUS.PAYMENT:
        return user.role === ROLES.PAYMENT_USER;
      
      default:
        return false;
    }
  };

  const downloadInvoice = (invoice) => {
    if (!invoice.content) return;

    const link = document.createElement('a');
    link.href = invoice.content;
    link.download = invoice.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewInvoice = (invoice) => {
    if (!invoice.content) return;

    // Open invoice in new window for viewing
    const newWindow = window.open();
    if (invoice.type.includes('pdf')) {
      newWindow.document.write(`
        <iframe src="${invoice.content}" width="100%" height="100%" style="border: none;">
        </iframe>
      `);
    } else if (invoice.type.includes('image')) {
      newWindow.document.write(`
        <img src="${invoice.content}" style="max-width: 100%; height: auto;" />
      `);
    } else {
      newWindow.document.write(`
        <p>File type not supported for preview. Please download to view.</p>
        <a href="${invoice.content}" download="${invoice.name}">Download File</a>
      `);
    }
  };

  const downloadPOFile = (file, fileType = 'original') => {
    let content, fileName, mimeType;
    
    switch (fileType) {
      case 'worked':
        content = file.workedContent;
        fileName = file.workedFileName || `worked_${file.name}`;
        mimeType = file.workedFileType;
        break;
      case 'signed':
        content = file.signedContent;
        fileName = file.signedFileName || `signed_${file.name}`;
        mimeType = file.signedFileType;
        break;
      default:
        content = file.content;
        fileName = file.name;
        mimeType = file.type;
    }
    
    if (!content) {
      console.error('No content available for download');
      return;
    }
  
    if (mimeType === 'application/pdf') {
      const base64Data = content.split(',')[1];
      const blob = new Blob([atob(base64Data)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const link = document.createElement('a');
      link.href = content;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper function to get next reviewer name
  const getNextReviewer = (invoice) => {
    if (!invoice) return 'Unknown';
    
    switch (invoice.status) {
      case INVOICE_STATUS.PENDING:
      case INVOICE_STATUS.INITIAL_APPROVAL:
        const pendingApprovers = invoice.requiredApprovers.filter(
          approver => !invoice.approvals.includes(approver)
        );
        if (pendingApprovers.length > 0) {
          // Show all pending approvers
          return pendingApprovers.map(approver => getRoleDisplayName(approver)).join(', ');
        }
        return 'Tax Manager';
      
      case INVOICE_STATUS.TAX_APPROVAL:
        return 'Tax Manager';
      
      case INVOICE_STATUS.COST_CONTROL_CAPTURE:
        return 'Cost Control';
      
      case INVOICE_STATUS.FIRST_APPROVAL:
        return 'First Approval';
      
      case INVOICE_STATUS.SECOND_APPROVAL:
        return 'Second Approval';
      
      case INVOICE_STATUS.PAYMENT:
        return 'Payment Officer';
      
      case INVOICE_STATUS.PAID:
        return 'PAID';
      
      default:
        return 'Unknown';
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'HEAD_OF_FINANCE': 'Head of Finance',
      'CFO': 'CFO',
      'CEO': 'CEO',
      'PC': 'PC',
      'EXCO': 'EXCO',
      'TAX_MANAGER': 'Tax Manager',
      'COST_CONTROL': 'Cost Control',
      'APPROVAL_USER_1': 'First Approval',
      'APPROVAL_USER_2': 'Second Approval'
    };
    return roleNames[role] || role;
  };
  
  return (
    <InvoiceContext.Provider value={{
      invoices: getVisibleInvoices(),
      poFiles: getVisiblePOFiles(),
      addInvoice,
      addMultipleInvoices,
      addPOFile,
      addMultiplePOFiles,
      updateInvoiceStatus,
      updatePOFileStatus,
      uploadSignedPOFile,
      uploadWorkedPOFile, // New function for cost control worked files
      canEditInvoice,
      downloadInvoice,
      viewInvoice,
      downloadPOFile,
      getNextReviewer,
      getRoleDisplayName,
      INVOICE_STATUS,
      PO_STATUS
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};



// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useAuth } from './AuthContext';

// const InvoiceContext = createContext(null);
// const DB_NAME = 'InvoiceDB';
// const STORE_NAME = 'invoices';

// // Initialize IndexedDB
// const initDB = () => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(DB_NAME, 1);
    
//     request.onerror = () => reject(request.error);
//     request.onsuccess = () => resolve(request.result);
    
//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       if (!db.objectStoreNames.contains(STORE_NAME)) {
//         db.createObjectStore(STORE_NAME, { keyPath: 'id' });
//       }
//     };
//   });
// };

// export const INVOICE_STATUS = {
//   PENDING: 'PENDING',
//   REVIEW_1: 'First Approve',
//   REVIEW_2: 'Second Approve',
//   REVIEW_3: 'Third Approve',
//   PAID: 'Paid',
// };

// export const InvoiceProvider = ({ children }) => {
//   const [invoices, setInvoices] = useState([]);
//   const [db, setDB] = useState(null);
//   const { user } = useAuth();

//   // Initialize IndexedDB when component mounts
//   useEffect(() => {
//     initDB().then(database => setDB(database));
//   }, []);

//   // Load invoices from IndexedDB
//   useEffect(() => {
//     if (!db) return;

//     const transaction = db.transaction(STORE_NAME, 'readonly');
//     const store = transaction.objectStore(STORE_NAME);
//     const request = store.getAll();

//     request.onsuccess = () => {
//       setInvoices(request.result);
//     };
//   }, [db]);

//   const addInvoice = async (file, amount) => {
//     if (!user || !db) return null;
  
//     return new Promise((resolve) => {
//       const newInvoice = {
//         id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
//         name: file.name,
//         type: file.type,
//         date: new Date().toISOString().split('T')[0],
//         time: new Date().toLocaleTimeString(),
//         status: INVOICE_STATUS.PENDING,
//         amount: amount ? parseFloat(amount) : 0,
//         sender: user.email,
//         department: user.department,
//         uploadedBy: user.email,
//         size: (file.size / 1024).toFixed(2),
//         lastModified: file.lastModified,
//         content: null
//       };
  
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const updatedInvoice = { ...newInvoice, content: e.target.result };
        
//         const transaction = db.transaction(STORE_NAME, 'readwrite');
//         const store = transaction.objectStore(STORE_NAME);
//         store.add(updatedInvoice);

//         transaction.oncomplete = () => {
//           setInvoices(prevInvoices => [...prevInvoices, updatedInvoice]);
//           resolve(updatedInvoice);
//         };
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const addMultipleInvoices = async (files, amounts) => {
//     if (!user || !db) return null;
//     return Promise.all(files.map(file => addInvoice(file, amounts[file.name])));
//   };

//   const updateInvoiceStatus = (invoiceId, newStatus) => {
//     if (!db) return;

//     const transaction = db.transaction(STORE_NAME, 'readwrite');
//     const store = transaction.objectStore(STORE_NAME);
    
//     const request = store.get(invoiceId);
//     request.onsuccess = () => {
//       const invoice = request.result;
//       invoice.status = newStatus;
//       store.put(invoice);
      
//       transaction.oncomplete = () => {
//         setInvoices(prevInvoices =>
//           prevInvoices.map(inv => 
//             inv.id === invoiceId ? { ...inv, status: newStatus } : inv
//           )
//         );
//       };
//     };
//   };

//   const getVisibleInvoices = () => {
//     if (!user) return [];

//     if (user.department === 'FINANCE') {
//       switch (user.role) {
//         case 'FINANCE_REVIEWER_1':
//           return invoices.filter(i => i.status === INVOICE_STATUS.PENDING);
//         case 'FINANCE_REVIEWER_2':
//           return invoices.filter(i => i.status === INVOICE_STATUS.REVIEW_1);
//         case 'FINANCE_REVIEWER_3':
//           return invoices.filter(i => 
//             i.status === INVOICE_STATUS.REVIEW_2 && 
//             i.amount <= 10000
//           );
//         case 'FINANCE_REVIEWER_4':
//           return invoices.filter(i => i.status === INVOICE_STATUS.REVIEW_3);
//         default:
//           return [];
//       }
//     } else if (user.department === 'EXCOBERS') {
//       return invoices.filter(i => 
//         i.status === INVOICE_STATUS.REVIEW_2 && 
//         i.amount > 10000
//       );
//     } else {
//       return invoices.filter(i => i.department === user.department);
//     }
//   };

//   const canEditInvoice = (invoice) => {
//     if (!user) return false;

//     if (user.department === 'FINANCE') {
//       switch (user.role) {
//         case 'FINANCE_REVIEWER_1':
//           return invoice.status === INVOICE_STATUS.PENDING;
//         case 'FINANCE_REVIEWER_2':
//           return invoice.status === INVOICE_STATUS.REVIEW_1;
//         case 'FINANCE_REVIEWER_3':
//           return invoice.status === INVOICE_STATUS.REVIEW_2 && invoice.amount <= 10000;
//         case 'FINANCE_REVIEWER_4':
//           return invoice.status === INVOICE_STATUS.REVIEW_3;
//         default:
//           return false;
//       }
//     } else if (user.department === 'EXCOBERS') {
//       return invoice.status === INVOICE_STATUS.REVIEW_2 && invoice.amount > 10000;
//     }
//     return false;
//   };

//   const downloadInvoice = (invoice) => {
//     if (!invoice.content) return;

//     const link = document.createElement('a');
//     link.href = invoice.content;
//     link.download = invoice.name;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <InvoiceContext.Provider value={{
//       invoices: getVisibleInvoices(),
//       addInvoice,
//       addMultipleInvoices,
//       updateInvoiceStatus,
//       canEditInvoice,
//       downloadInvoice,
//       INVOICE_STATUS
//     }}>
//       {children}
//     </InvoiceContext.Provider>
//   );
// };

// export const useInvoices = () => {
//   const context = useContext(InvoiceContext);
//   if (!context) {
//     throw new Error('useInvoices must be used within an InvoiceProvider');
//   }
//   return context;
// };