-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE invoices (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) DEFAULT 0,
  sender VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  size VARCHAR(20) NOT NULL,
  last_modified BIGINT NOT NULL,
  file_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create po_files table
CREATE TABLE po_files (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  sender VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  size VARCHAR(20) NOT NULL,
  last_modified BIGINT NOT NULL,
  file_content TEXT NOT NULL,
  signed_content TEXT,
  signed_file_name VARCHAR(255),
  signed_file_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert mock users
INSERT INTO users (email, password, name, username, department, role) VALUES
('finance1fnb@gmail.com', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'Finance Reviewer 1', 'Quachi', 'FINANCE', 'FINANCE_REVIEWER_1'),
('finance2fnb@gmail.com', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'Finance Reviewer 2', 'Vanessa', 'FINANCE', 'FINANCE_REVIEWER_2'),
('finance3fnb@gmail.com', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'Finance Reviewer 3', 'Alex', 'FINANCE', 'FINANCE_REVIEWER_3'),
('finance4b@fnb.co.za', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'Finance Payment Officer', 'Michael', 'FINANCE', 'FINANCE_REVIEWER_4'),
('excobers1@fnb.co.za', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'Excobers Reviewer', 'John Executive', 'EXCOBERS', 'EXCOBERS_REVIEWER'),
('excobers2@fnb.co.za', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'Excobers Reviewer', 'Jane Executive', 'EXCOBERS', 'EXCOBERS_REVIEWER'),
('samueltetteh@fnb.co.za', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'IT User', 'Samuel Tetteh', 'IT', 'DEPARTMENT_USER'),
('eshunkwesi@fnb.co.za', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'IT User', 'Eshun Kwesi', 'IT', 'DEPARTMENT_USER'),
('franciskontoh@fnb.co.za', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'IT User', 'Francis Kontoh', 'IT', 'DEPARTMENT_USER'),
('operationsfnb@gmail.com', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'Operations', 'Nii', 'OPERATIONS', 'DEPARTMENT_USER'),
('operations1fnb@gmail.com', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'Operations', 'Nii', 'OPERATIONS', 'DEPARTMENT_USER'),
('legal@gmail.com', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'Legal', 'Kontoh', 'LEGAL', 'DEPARTMENT_USER'),
('compliance@gmail.com', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'COMPLIANCE', 'Jeffery', 'COMPLIANCE', 'DEPARTMENT_USER'),
('market@gmail.com', '$2b$10$DJjX8/0QHQZSGTYfeF01GeGrOvKJ3r48QOd6FeC/CX96Yh6YpAATy', 'MARKETTING', 'Dickson', 'MARKETTING', 'DEPARTMENT_USER');

// server
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// Import routes
const invoiceRoutes = require('./routes/invoiceRoutes');
const poRoutes = require('./routes/poRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Routes
app.use('/api/invoices', invoiceRoutes);
app.use('/api/po', poRoutes);
app.use('/api/users', userRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FNB File System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

// invoice route
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const { validateToken } = require('../middleware/auth');

// Constants for invoice status
const INVOICE_STATUS = {
  PENDING: 'PENDING',
  REVIEW_1: 'First Approve',
  REVIEW_2: 'Second Approve',
  REVIEW_3: 'Third Approve',
  PAID: 'Paid',
};

/**
 * Get invoices visible to the user based on department and role
 */
router.get('/', validateToken, async (req, res) => {
  try {
    const { department, role } = req.user;
    
    let query;
    const queryParams = [];
    
    if (department === 'FINANCE') {
      // For finance roles, filter by appropriate status
      switch (role) {
        case 'FINANCE_REVIEWER_1':
          query = 'SELECT * FROM invoices WHERE status = $1';
          queryParams.push(INVOICE_STATUS.PENDING);
          break;
        case 'FINANCE_REVIEWER_2':
          query = 'SELECT * FROM invoices WHERE status = $1';
          queryParams.push(INVOICE_STATUS.REVIEW_1);
          break;
        case 'FINANCE_REVIEWER_3':
          query = 'SELECT * FROM invoices WHERE status = $1';
          queryParams.push(INVOICE_STATUS.REVIEW_2);
          break;
        case 'FINANCE_REVIEWER_4':
          query = 'SELECT * FROM invoices WHERE status = $1';
          queryParams.push(INVOICE_STATUS.REVIEW_3);
          break;
        default:
          query = 'SELECT * FROM invoices';
          break;
      }
    } else {
      // For department users, only show their department's invoices
      query = 'SELECT * FROM invoices WHERE department = $1';
      queryParams.push(department);
    }
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

/**
 * Add a new invoice
 */
router.post('/', validateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { file } = req.files;
    const { amount } = req.body;
    const parsedAmount = amount ? parseFloat(amount) : 0;
    
    // Convert file to base64
    const fileContent = file.data.toString('base64');
    const base64File = `data:${file.mimetype};base64,${fileContent}`;
    
    const { email, department } = req.user;
    
    // Generate a unique id
    const id = uuidv4();
    
    const query = `
      INSERT INTO invoices (
        id, name, type, date, time, status, amount, sender, department, 
        uploaded_by, size, last_modified, file_content
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    
    const values = [
      id,
      file.name,
      file.mimetype,
      date,
      time,
      INVOICE_STATUS.PENDING,
      parsedAmount,
      email,
      department,
      email,
      (file.size / 1024).toFixed(2),
      file.lastModifiedDate ? file.lastModifiedDate.getTime() : Date.now(),
      base64File
    ];
    
    const result = await client.query(query, values);
    
    // Return everything except the file content to reduce response size
    const { file_content, ...invoice } = result.rows[0];
    
    await client.query('COMMIT');
    res.status(201).json(invoice);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding invoice:', error);
    
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Invoice already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add invoice' });
    }
  } finally {
    client.release();
  }
});

/**
 * Add multiple invoices
 */
router.post('/batch', validateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    if (!req.files || !req.files.files) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const filesArray = Array.isArray(req.files.files) 
      ? req.files.files 
      : [req.files.files];
    
    const { amounts } = req.body;
    const amountsObj = amounts ? JSON.parse(amounts) : {};
    
    const { email, department } = req.user;
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    
    const addedInvoices = [];
    
    for (const file of filesArray) {
      // Convert file to base64
      const fileContent = file.data.toString('base64');
      const base64File = `data:${file.mimetype};base64,${fileContent}`;
      
      // Generate a unique id
      const id = uuidv4();
      
      const query = `
        INSERT INTO invoices (
          id, name, type, date, time, status, amount, sender, department, 
          uploaded_by, size, last_modified, file_content
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, name, type, date, time, status, amount, sender, department, uploaded_by, size, last_modified
      `;
      
      const amount = amountsObj[file.name] ? parseFloat(amountsObj[file.name]) : 0;
      
      const values = [
        id,
        file.name,
        file.mimetype,
        date,
        time,
        INVOICE_STATUS.PENDING,
        amount,
        email,
        department,
        email,
        (file.size / 1024).toFixed(2),
        file.lastModifiedDate ? file.lastModifiedDate.getTime() : Date.now(),
        base64File
      ];
      
      const result = await client.query(query, values);
      addedInvoices.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    res.status(201).json(addedInvoices);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding invoices:', error);
    res.status(500).json({ error: 'Failed to add invoices' });
  } finally {
    client.release();
  }
});

/**
 * Update invoice status
 */
router.put('/:id/status', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!Object.values(INVOICE_STATUS).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Check if user can update this invoice based on role
    const invoice = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    
    if (invoice.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const currentInvoice = invoice.rows[0];
    const { role } = req.user;
    
    // Validate user can edit this invoice
    let canEdit = false;
    
    if (req.user.department === 'FINANCE') {
      switch (role) {
        case 'FINANCE_REVIEWER_1':
          canEdit = currentInvoice.status === INVOICE_STATUS.PENDING;
          break;
        case 'FINANCE_REVIEWER_2':
          canEdit = currentInvoice.status === INVOICE_STATUS.REVIEW_1;
          break;
        case 'FINANCE_REVIEWER_3':
          canEdit = currentInvoice.status === INVOICE_STATUS.REVIEW_2;
          break;
        case 'FINANCE_REVIEWER_4':
          canEdit = currentInvoice.status === INVOICE_STATUS.REVIEW_3;
          break;
        default:
          canEdit = false;
      }
    }
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Not authorized to update this invoice' });
    }
    
    const result = await pool.query(
      'UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    // Return everything except the file content
    const { file_content, ...updatedInvoice } = result.rows[0];
    
    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

/**
 * Download invoice file
 */
router.get('/:id/download', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT name, type, file_content FROM invoices WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const { name, type, file_content } = result.rows[0];
    
    // Extract the base64 content (remove data:mimetype;base64, prefix)
    const base64Data = file_content.split(',')[1];
    
    // Set response headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.setHeader('Content-Type', type);
    
    // Send the file
    const buffer = Buffer.from(base64Data, 'base64');
    res.send(buffer);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

module.exports = router;

//