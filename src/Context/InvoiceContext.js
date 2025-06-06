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
  COST_CONTROL_REVIEW: 'COST_CONTROL_REVIEW', 
  HEAD_OF_FINANCE_REVIEW: 'HEAD_OF_FINANCE_REVIEW',
  SIGNED: 'SIGNED'
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API Service Functions
const apiService = {
  // Get current token from localStorage
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },

  // Invoice API calls
  async getAllInvoices() {
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  },

  async uploadInvoice(file, amount) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('amount', amount);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/invoices/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload invoice');
    return response.json();
  },

  async uploadMultipleInvoices(files, amounts) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('amounts', JSON.stringify(amounts));

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/invoices/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload invoices');
    return response.json();
  },

  async updateInvoiceStatus(invoiceId, action) {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ action }),
    });
    if (!response.ok) throw new Error('Failed to update invoice status');
    return response.json();
  },

  async downloadInvoice(invoiceId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to download invoice');
    return response.blob();
  },

  async deleteInvoice(invoiceId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete invoice');
    return response.json();
  },

  // PO File API calls
  async getAllPOFiles() {
    try {
      console.log('Fetching PO files...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/po`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('PO fetch response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PO fetch error response:', errorText);
        throw new Error(`Failed to fetch PO files: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('PO files received:', data);
      
      return data;
    } catch (error) {
      console.error('Error in getAllPOFiles:', error);
      throw error;
    }
  },

  async uploadPOFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/po/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload PO file');
    return response.json();
  },

  async uploadMultiplePOFiles(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/po/upload/multiple`, { 
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload PO files');
    return response.json();
  },

  async uploadWorkedPOFile(fileId, workedFile) {
    const formData = new FormData();
    formData.append('file', workedFile);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/po/${fileId}/worked`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload worked PO file');
    return response.json();
  },

  async uploadSignedPOFile(fileId, signedFile) {
    const formData = new FormData();
    formData.append('file', signedFile);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/po/${fileId}/signed`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload signed PO file');
    return response.json();
  },

  async downloadPOFile(fileId, type = 'original') {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/po/${fileId}/download?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to download PO file');
    return response.blob();
  },

  async updatePOFileStatus(fileId, status) {
    const response = await fetch(`${API_BASE_URL}/api/po/${fileId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update PO file status');
    return response.json();
  },

  async deletePOFile(fileId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/po/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete PO file');
    return response.json();
  },
};

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [poFiles, setPoFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, ROLES } = useAuth();

  // Load data on component mount and when user changes
  useEffect(() => {
    if (user) {
      loadInvoices();
      loadPOFiles();
    }
  }, [user]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPOFiles = async () => {
    try {
      console.log('Loading PO files...');
      setLoading(true);
      setError(null);
      const data = await apiService.getAllPOFiles();
      console.log('Setting PO files:', data);
      setPoFiles(data);
    } catch (err) {
      console.error('Error loading PO files:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (file, amount) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      const newInvoice = await apiService.uploadInvoice(file, amount);
      // Add single invoice to state
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMultipleInvoices = async (files, amounts) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.uploadMultipleInvoices(files, amounts);
      
      // Handle response from multiple upload (response has uploaded array)
      if (response.uploaded && Array.isArray(response.uploaded)) {
        setInvoices(prev => [...prev, ...response.uploaded]);
        return response;
      } else {
        throw new Error('Invalid response format from multiple upload');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addPOFile = async (file) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      const newPOFile = await apiService.uploadPOFile(file);
      setPoFiles(prev => [...prev, newPOFile]);
      return newPOFile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMultiplePOFiles = async (files) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      const newPOFiles = await apiService.uploadMultiplePOFiles(files);
      setPoFiles(prev => [...prev, ...newPOFiles]);
      return newPOFiles;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadWorkedPOFile = async (fileId, workedFile) => {
    try {
      setLoading(true);
      setError(null);
      const updatedFile = await apiService.uploadWorkedPOFile(fileId, workedFile);
      setPoFiles(prev => prev.map(file => 
        file.id === fileId ? updatedFile : file
      ));
      return updatedFile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadSignedPOFile = async (fileId, signedFile) => {
    try {
      setLoading(true);
      setError(null);
      const updatedFile = await apiService.uploadSignedPOFile(fileId, signedFile);
      setPoFiles(prev => prev.map(file => 
        file.id === fileId ? updatedFile : file
      ));
      return updatedFile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId, newStatus, action = 'approve') => {
    try {
      setLoading(true);
      setError(null);
      const updatedInvoice = await apiService.updateInvoiceStatus(invoiceId, action);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId ? updatedInvoice : invoice
      ));
      return updatedInvoice;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePOFileStatus = async (fileId, newStatus) => {
    try {
      setLoading(true);
      setError(null);
      const updatedFile = await apiService.updatePOFileStatus(fileId, newStatus);
      setPoFiles(prev => prev.map(file => 
        file.id === fileId ? updatedFile : file
      ));
      return updatedFile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteInvoice(invoiceId);
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePOFile = async (fileId) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deletePOFile(fileId);
      setPoFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoice) => {
    try {
      const blob = await apiService.downloadInvoice(invoice.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = invoice.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const viewInvoice = async (invoice) => {
    try {
      const blob = await apiService.downloadInvoice(invoice.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const downloadPOFile = async (file, fileType = 'original') => {
    try {
      const blob = await apiService.downloadPOFile(file.id, fileType);
      let fileName;
      
      switch (fileType) {
        case 'worked':
          fileName = file.worked_file_name || `worked_${file.name}`;
          break;
        case 'signed':
          fileName = file.signed_file_name || `signed_${file.name}`;
          break;
        default:
          fileName = file.name;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Helper functions remain the same but work with API data structure
  const canEditInvoice = (invoice) => {
    if (!user) return false;

    switch (invoice.status) {
      case INVOICE_STATUS.PENDING:
      case INVOICE_STATUS.INITIAL_APPROVAL:
        return invoice.required_approvers?.includes(user.role) && 
               !invoice.approvals?.includes(user.role);
      
      case INVOICE_STATUS.TAX_APPROVAL:
        return user.role === ROLES.TAX_MANAGER && 
               !invoice.approvals?.includes(user.role);
      
      case INVOICE_STATUS.COST_CONTROL_CAPTURE:
        return user.role === ROLES.COST_CONTROL;
      
      case INVOICE_STATUS.FIRST_APPROVAL:
        return user.role === ROLES.APPROVAL_USER_1 && 
               !invoice.approvals?.includes(user.role);
      
      case INVOICE_STATUS.SECOND_APPROVAL:
        return user.role === ROLES.APPROVAL_USER_2 && 
               !invoice.approvals?.includes(user.role);
      
      case INVOICE_STATUS.PAYMENT:
        return user.role === ROLES.PAYMENT_USER;
      
      default:
        return false;
    }
  };

  const getNextReviewer = (invoice) => {
    if (!invoice) return 'Unknown';
    
    switch (invoice.status) {
      case INVOICE_STATUS.PENDING:
      case INVOICE_STATUS.INITIAL_APPROVAL:
        const pendingApprovers = invoice.required_approvers?.filter(
          approver => !invoice.approvals?.includes(approver)
        ) || [];
        if (pendingApprovers.length > 0) {
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

  const refreshData = async () => {
    await Promise.all([loadInvoices(), loadPOFiles()]);
  };
  
  return (
    <InvoiceContext.Provider value={{
      // Data
      invoices,
      poFiles,
      loading,
      error,
      
      // Invoice functions
      addInvoice,
      addMultipleInvoices,
      updateInvoiceStatus,
      deleteInvoice,
      downloadInvoice,
      viewInvoice,
      canEditInvoice,
      
      // PO File functions
      addPOFile,
      addMultiplePOFiles,
      uploadWorkedPOFile,
      uploadSignedPOFile,
      updatePOFileStatus,
      deletePOFile,
      downloadPOFile,
      
      // Utility functions
      getNextReviewer,
      getRoleDisplayName,
      refreshData,
      
      // Constants
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