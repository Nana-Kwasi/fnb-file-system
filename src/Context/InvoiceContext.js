import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InvoiceContext = createContext(null);

export const INVOICE_STATUS = {
  PENDING: 'PENDING',
  REVIEW_1: 'First Approve',
  REVIEW_2: 'Second Approve',
  REVIEW_3: 'Third Approve',
  REVIEW_4: 'Fourth Approve',
  REVIEW_5: 'Fifth Approve',
  PAID: 'Paid',
};

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }
  }, []);

  const addInvoice = async (file, amount) => {
    if (!user) return null;

    return new Promise((resolve) => {
      const newInvoice = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        status: INVOICE_STATUS.PENDING,
        number: amount,
        sender: user.email,
        department: user.department,
        uploadedBy: user.email,
        size: (file.size / 1024).toFixed(2),
        lastModified: file.lastModified,
        content: null
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedInvoice = { ...newInvoice, content: e.target.result };
        setInvoices(prevInvoices => {
          const newInvoices = [...prevInvoices, updatedInvoice];
          localStorage.setItem('invoices', JSON.stringify(newInvoices));
          return newInvoices;
        });
        resolve(updatedInvoice);
      };
      reader.readAsDataURL(file);
    });
  };

  const addMultipleInvoices = async (files, amount) => {
    if (!user) return null;
    return Promise.all(files.map(file => addInvoice(file, amount)));
  };

  const updateInvoiceStatus = (invoiceId, newStatus) => {
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
    );
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
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
        case 'FINANCE_REVIEWER_5':
          return invoices.filter(i => i.status === INVOICE_STATUS.REVIEW_4);
        default:
          return [];
      }
    } else {
      return invoices.filter(i => i.department === user.department);
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
        case 'FINANCE_REVIEWER_5':
          return invoice.status === INVOICE_STATUS.REVIEW_4;
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

  return (
    <InvoiceContext.Provider value={{
      invoices: getVisibleInvoices(),
      addInvoice,
      addMultipleInvoices,
      updateInvoiceStatus,
      canEditInvoice,
      downloadInvoice,
      INVOICE_STATUS
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