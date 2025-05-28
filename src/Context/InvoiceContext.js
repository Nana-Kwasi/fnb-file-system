import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InvoiceContext = createContext(null);

export const INVOICE_STATUS = {
  PENDING: 'PENDING',
  REVIEW_1: 'First Approve',
  REVIEW_2: 'Second Approve',
  REVIEW_3: 'Third Approve',
  PAID: 'Paid',
};

export const PO_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  SIGNED: 'SIGNED'
};
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const checkStorageAvailability = (dataSize) => {
  try {
    const testKey = 'storage-test';
    localStorage.setItem(testKey, '0');
    localStorage.removeItem(testKey);

    const totalSize = Object.keys(localStorage).reduce((total, key) => {
      return total + localStorage[key].length;
    }, 0);

    const estimatedAvailable = 5 * 1024 * 1024 - totalSize; 
    return estimatedAvailable >= dataSize;
  } catch (e) {
    return false;
  }
};
export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [poFiles, setPoFiles] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedInvoices = localStorage.getItem('invoices');
    const storedPOFiles = localStorage.getItem('poFiles');
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
    localStorage.setItem(key, value);
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
            content: e.target.result
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
            status: PO_STATUS.PENDING,
            sender: user.email,
            username: user.username,
            department: user.department,
            uploadedBy: user.email,
            size: (file.size / 1024).toFixed(2),
            lastModified: file.lastModified,
            content: e.target.result,
            signedContent: null
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

  const updateInvoiceStatus = (invoiceId, newStatus) => {
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
    );
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

  const getVisibleInvoices = () => {
    if (!user) return [];
  
    if (user.department === 'FINANCE') {
      switch (user.role) {
        case 'FINANCE_REVIEWER_1':
          return invoices.filter(i => i.status === INVOICE_STATUS.PENDING);
        case 'FINANCE_REVIEWER_2':
          return invoices.filter(i => i.status === INVOICE_STATUS.REVIEW_1);
        case 'FINANCE_REVIEWER_3':
          return invoices.filter(i => i.status === INVOICE_STATUS.REVIEW_2);
        case 'FINANCE_REVIEWER_4':
          return invoices.filter(i => i.status === INVOICE_STATUS.REVIEW_3);
        default:
          return [];
      }
    } else {
      return invoices.filter(i => i.department === user.department);
    }
  };

  const getVisiblePOFiles = () => {
    if (!user) return [];

    if (user.department === 'FINANCE') {
      return poFiles;
    } else {
      return poFiles.filter(file => file.department === user.department);
    }
  };

  const canEditInvoice = (invoice) => {
    if (!user) return false;
  
    if (user.department === 'FINANCE') {
      switch (user.role) {
        case 'FINANCE_REVIEWER_1':
          return invoice.status === INVOICE_STATUS.PENDING;
        case 'FINANCE_REVIEWER_2':
          return invoice.status === INVOICE_STATUS.REVIEW_1;
        case 'FINANCE_REVIEWER_3':
          return invoice.status === INVOICE_STATUS.REVIEW_2;
        case 'FINANCE_REVIEWER_4':
          return invoice.status === INVOICE_STATUS.REVIEW_3;
        default:
          return false;
      }
    }
    return false;
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

  const downloadPOFile = (file, signed = false) => {
    const content = signed ? file.signedContent : file.content;
    const fileName = signed ? file.signedFileName || `signed_${file.name}` : file.name;
    const fileType = signed ? file.signedFileType : file.type;
    
    if (!content) {
      console.error('No content available for download');
      return;
    }
  
    if (fileType === 'application/pdf') {
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

  const uploadSignedPOFile = async (fileId, signedFile) => {
    if (signedFile.size > MAX_FILE_SIZE) {
      alert(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return null;
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
                  status: PO_STATUS.SIGNED, 
                  signedContent,
                  signedFileName: signedFile.name,
                  signedFileType: signedFile.type
                } 
              : file
          );
          setPoFiles(updatedFiles);
          const success = safelySetLocalStorage('poFiles', JSON.stringify(updatedFiles));
          if (!success) {
            reject(new Error('Storage quota exceeded'));
            return;
          }
          resolve(signedContent);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(signedFile);
    });
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
      canEditInvoice,
      downloadInvoice,
      downloadPOFile,
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