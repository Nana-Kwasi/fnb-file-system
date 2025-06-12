CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL CHECK (department IN (
        'FINANCE', 'IT', 'HR', 'OPERATIONS', 'GLOBALMARKET', 
        'MARKETTING', 'LEGAL', 'COMPLIANCE', 'EXCOBERS', 'TAX', 'COST_CONTROL'
    )),
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'HEAD_OF_FINANCE', 'CFO', 'CEO', 'PC', 'EXCO', 'TAX_MANAGER',
        'COST_CONTROL', 'APPROVAL_USER_1', 'APPROVAL_USER_2', 
        'PAYMENT_USER', 'DEPARTMENT_USER'
    )),
    status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create login_logs table
CREATE TABLE login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    login_status VARCHAR(20) NOT NULL CHECK (login_status IN ('success', 'failed', 'logout')),
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    failure_reason TEXT,
    session_id VARCHAR(255),
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE,
    session_duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);








CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL, -- Removed UNIQUE constraint as per your code
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL CHECK (department IN (
        'FINANCE', 'IT', 'HR', 'OPERATIONS', 'GLOBALMARKET', 
        'MARKETTING', 'LEGAL', 'COMPLIANCE', 'EXCOBERS', 'TAX', 'COST_CONTROL'
    )),
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'HEAD_OF_FINANCE', 'CFO', 'CEO', 'PC', 'EXCO', 'TAX_MANAGER',
        'COST_CONTROL', 'APPROVAL_USER_1', 'APPROVAL_USER_2', 
        'PAYMENT_USER', 'DEPARTMENT_USER'
    )),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User sessions table
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- 3. Login logs table (comprehensive logging)
CREATE TABLE login_logs (
    id SERIAL PRIMARY KEY,
    session_id UUID DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    login_status VARCHAR(20) NOT NULL CHECK (login_status IN ('success', 'failed', 'logout')),
    login_method VARCHAR(20) DEFAULT 'traditional' CHECK (login_method IN ('traditional', 'ldap', '2fa')),
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    failure_reason TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    session_duration INTERVAL,
    is_suspicious BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0,
    additional_data JSONB
);

-- 4. Suspicious activities table (for security monitoring)
CREATE TABLE suspicious_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(100),
    risk_score INTEGER DEFAULT 0,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL, -- Removed UNIQUE constraint as per your code
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL CHECK (department IN (
        'FINANCE', 'IT', 'HR', 'OPERATIONS', 'GLOBALMARKET', 
        'MARKETTING', 'LEGAL', 'COMPLIANCE', 'EXCOBERS', 'TAX', 'COST_CONTROL'
    )),
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'HEAD_OF_FINANCE', 'CFO', 'CEO', 'PC', 'EXCO', 'TAX_MANAGER',
        'COST_CONTROL', 'APPROVAL_USER_1', 'APPROVAL_USER_2', 
        'PAYMENT_USER', 'DEPARTMENT_USER'
    )),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User sessions table
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- 3. Login logs table (comprehensive logging)
CREATE TABLE login_logs (
    id SERIAL PRIMARY KEY,
    session_id UUID DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    login_status VARCHAR(20) NOT NULL CHECK (login_status IN ('success', 'failed', 'logout')),
    login_method VARCHAR(20) DEFAULT 'traditional' CHECK (login_method IN ('traditional', 'ldap', '2fa')),
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    failure_reason TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    session_duration INTERVAL,
    is_suspicious BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0,
    additional_data JSONB
);

-- 4. Suspicious activities table (for security monitoring)
CREATE TABLE suspicious_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(100),
    risk_score INTEGER DEFAULT 0,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);



CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL,
    size_kb DECIMAL(10,2),
    content TEXT NOT NULL, -- Base64 encoded file content
    required_approvers TEXT[] DEFAULT '{}', -- Array of required approver roles
    status VARCHAR(50) DEFAULT 'PENDING',
    current_approval_stage VARCHAR(50) DEFAULT 'INITIAL_APPROVAL',
    approvals TEXT[] DEFAULT '{}', -- Array of approver roles who have approved
    rejections TEXT[] DEFAULT '{}', -- Array of approver roles who have rejected
    paid_by VARCHAR(255),
    paid_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);
-- Create users table (referenced by invoices and purchase_orders)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL,
    size_kb DECIMAL(10,2),
    content TEXT NOT NULL, -- Base64 encoded file content
    required_approvers TEXT[] DEFAULT '{}', -- Array of required approver roles
    status VARCHAR(50) DEFAULT 'PENDING',
    current_approval_stage VARCHAR(50) DEFAULT 'INITIAL_APPROVAL',
    approvals TEXT[] DEFAULT '{}', -- Array of approver roles who have approved
    rejections TEXT[] DEFAULT '{}', -- Array of approver roles who have rejected
    paid_by VARCHAR(255),
    paid_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create purchase_orders table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    department VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL,
    original_uploader VARCHAR(255),
    size_kb DECIMAL(10,2),
    content TEXT NOT NULL, -- Base64 encoded original file content
    status VARCHAR(50) DEFAULT 'COST_CONTROL_REVIEW',
    
    -- Worked file fields (filled by COST_CONTROL)
    worked_content TEXT,
    worked_file_name VARCHAR(255),
    worked_file_type VARCHAR(100),
    cost_control_worked_by VARCHAR(255),
    cost_control_worked_date TIMESTAMP,
    
    -- Signed file fields (filled by HEAD_OF_FINANCE)
    signed_content TEXT,
    signed_file_name VARCHAR(255),
    signed_file_type VARCHAR(100),
    head_of_finance_signed_by VARCHAR(255),
    signed_date TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_invoices_uploaded_by ON invoices(uploaded_by);
CREATE INDEX idx_invoices_department ON invoices(department);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

CREATE INDEX idx_purchase_orders_uploaded_by ON purchase_orders(uploaded_by);
CREATE INDEX idx_purchase_orders_department ON purchase_orders(department);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_at ON purchase_orders(created_at DESC);



//logs
Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
Token response status: 200
Token response data: {
  "statusCode": 0,
  "statusMessage": "Success",
  "serverTimestamp": "2025-06-11T14:27:59.076028122",
  "data": {
    "clientId": "f1fb6909-d015-47e1-ad61-93708e570396",
    "code": "fl_123",
    "email": "files@gmail.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMWZiNjkwOS1kMDE1LTQ3ZTEtYWQ2MS05MzcwOGU1NzAzOTYiLCJpYXQiOjE3NDk2NTIwNzksImV4cCI6MTc0OTY1MjM3OX0.2QcUnKeidSNY32FXpqakaYBlTFS3QiQQL7nRla81c9w",
    "tokenExpiryDate": "2025-06-11T14:32:59.070275809"
  }
}
Successfully obtained token
Searching for user at: https://172.29.18.126/adproxyservice/prod/ldap/search
Request configuration: {
  "url": "https://172.29.18.126/adproxyservice/prod/ldap/search",
  "method": "post",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMWZiNjkwOS1kMDE1LTQ3ZTEtYWQ2MS05MzcwOGU1NzAzOTYiLCJpYXQiOjE3NDk2NTIwNzksImV4cCI6MTc0OTY1MjM3OX0.2QcUnKeidSNY32FXpqakaYBlTFS3QiQQL7nRla81c9w",
    "Content-Type": "application/json"
  },
  "data": {
    "fnumber": "f8877557"
  }
}
Search response status: 200
Search response data: {
  "statusCode": 0,
  "statusMessage": "Success",
  "serverTimestamp": "2025-06-11T14:28:01.045779286",
  "data": {
    "userId": "F8877557",
    "mobile": "+233592486117",
    "email": "Francis.Kontoh@firstnationalbank.com.gh",
    "userPrincipalName": "F8877557@fnb.co.za",
    "title": "Internship",
    "name": "Kontoh, Francis",
    "manager": "CN=Eshun\\, Kwesi,OU=DomainUsers,DC=fnb,DC=co,DC=za",
    "memberOf": [
      "CN=AppsDevelopmentTeam_PROD_IT_FNBGhana,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=APPSTEAM_DEV_IT_Works,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=W365_VDI_2vCPU8GB256GB_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=CLOUD_VDI_FULLACCESS_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=GlobalWorkDay_CloudApps_All_Users,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=GlobalERP_CloudApps_All_Employees,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=Myappstore_Prod_AllUsers_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=GlobalERP_CloudApps_All_Users,OU=Office365,OU=DomainUsers,DC=fnb,DC=co,DC=za",
      "CN=SSO_PROD_FNB_2FABYPASS,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=DLP_Level-1-FullLockdown_prod_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=2V_production_FNB_Staff,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=Users for 2FA testing,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=One Drive Test,OU=DomainGroups,DC=fnb,DC=co,DC=za",
      "CN=InternetUsers - All,OU=InterNet Access,OU=Security,OU=Groups,OU=FNBUsers,DC=fnb,DC=co,DC=za"
    ]
  }
}


//log
=== CREATE USER DEBUG ===
Request body: {
  name: 'Francis Kontoh',
  email: 'f8877557',
  username: 'admin',
  department: 'IT',
  role: 'DEPARTMENT_USER',
  isFnumberUser: true,
  fnumber: 'f8877557',
  ldapData: null
}
❌ Missing required fields
POST /api/auth/users 400 4.410 ms - 53


// no special query
const createUser = async (req, res) => {
  console.log('=== CREATE USER DEBUG ===');
  console.log('Request body:', req.body);
  
  try {
    const { 
      name, 
      email, 
      username, 
      password, 
      department, 
      role, 
      isFnumberUser, 
      fnumber,
      ldapData 
    } = req.body;

    // Validation - password is not required for F-number users
    if (!name || !email || !username || !department || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Password validation: required only for non-F-number users
    if (!isFnumberUser && (!password || password.trim() === '')) {
      console.log('❌ Password required for non-F-number users');
      return res.status(400).json({
        success: false,
        message: 'Password is required for non-F-number users'
      });
    }

    if (!VALID_ROLES.includes(role)) {
      console.log('❌ Invalid role:', role);
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    if (!VALID_DEPARTMENTS.includes(department)) {
      console.log('❌ Invalid department:', department);
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }

    // Check ONLY if email already exists
    console.log('🔍 Checking for existing email only...');
    const existingUserResult = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    console.log('Existing email check result:', {
      rowCount: existingUserResult.rows.length,
      existingUsers: existingUserResult.rows
    });

    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];
      console.log('❌ Email already exists:', existingUser);
      return res.status(409).json({
        success: false,
        message: `User already exists with email: ${email}`
      });
    }

    let hashedPassword = null;
    
    // Handle password based on user type
    if (isFnumberUser) {
      console.log('📋 Creating F-number user - no password stored (NULL)');
      console.log('F-number details:', { fnumber, ldapData });
      // F-number users don't need passwords - they authenticate via LDAP
      hashedPassword = null;
      
    } else {
      console.log('🔐 Hashing password for regular user...');
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      console.log('Password hashed successfully, length:', hashedPassword.length);
    }

    // Create user
    console.log('✏️ Creating user in database...');
    console.log(`ℹ️ User type: ${isFnumberUser ? 'F-number (LDAP)' : 'Regular'}`);
    
    // Single query that works for both user types
    const insertQuery = `INSERT INTO users (name, email, username, password, department, role, is_fnumber_user, fnumber)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                         RETURNING id, name, email, username, department, role, is_fnumber_user, fnumber, created_at`;

    const insertValues = [
      name, 
      email, 
      username, 
      hashedPassword, // null for F-number users, hashed password for regular users
      department, 
      role, 
      isFnumberUser || false, // true for F-number users, false for regular users
      fnumber || null // fnumber for F-number users, null for regular users
    ];

    const newUserResult = await query(insertQuery, insertValues);

    console.log('✅ User created successfully:', newUserResult.rows[0]);
    console.log('=== END CREATE USER DEBUG ===');

    res.status(201).json({
      success: true,
      message: `${isFnumberUser ? 'F-number' : 'Regular'} user created successfully`,
      user: newUserResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Create user error:', error);
    console.log('Error code:', error.code);
    console.log('Error detail:', error.detail);
    console.log('=== END CREATE USER DEBUG ===');
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint && error.constraint.includes('email')) {
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      } else if (error.constraint && error.constraint.includes('username')) {
        console.log('⚠️ Username constraint still exists in database');
        res.status(500).json({
          success: false,
          message: 'Database configuration error - username constraint should be removed'
        });
      } else {
        res.status(409).json({
          success: false,
          message: 'User creation failed due to duplicate data'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create user: ' + error.message
      });
    }
  }
};

// special query
const createUser = async (req, res) => {
  console.log('=== CREATE USER DEBUG ===');
  console.log('Request body:', req.body);
  
  try {
    const { 
      name, 
      email, 
      username, 
      password, 
      department, 
      role, 
      isFnumberUser, 
      fnumber,
      ldapData 
    } = req.body;

    // Validation - password is not required for F-number users
    if (!name || !email || !username || !department || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Password validation: required only for non-F-number users
    if (!isFnumberUser && (!password || password.trim() === '')) {
      console.log('❌ Password required for non-F-number users');
      return res.status(400).json({
        success: false,
        message: 'Password is required for non-F-number users'
      });
    }

    if (!VALID_ROLES.includes(role)) {
      console.log('❌ Invalid role:', role);
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    if (!VALID_DEPARTMENTS.includes(department)) {
      console.log('❌ Invalid department:', department);
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }

    // Check ONLY if email already exists
    console.log('🔍 Checking for existing email only...');
    const existingUserResult = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    console.log('Existing email check result:', {
      rowCount: existingUserResult.rows.length,
      existingUsers: existingUserResult.rows
    });

    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];
      console.log('❌ Email already exists:', existingUser);
      return res.status(409).json({
        success: false,
        message: `User already exists with email: ${email}`
      });
    }

    let hashedPassword = null;
    
    // Handle password based on user type
    if (isFnumberUser) {
      console.log('📋 Creating F-number user - no password stored (NULL)');
      console.log('F-number details:', { fnumber, ldapData });
      // F-number users don't need passwords - they authenticate via LDAP
      hashedPassword = null;
      
    } else {
      console.log('🔐 Hashing password for regular user...');
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      console.log('Password hashed successfully, length:', hashedPassword.length);
    }

    // Create user
    console.log('✏️ Creating user in database...');
    console.log(`ℹ️ User type: ${isFnumberUser ? 'F-number (LDAP)' : 'Regular'}`);
    
    // You might want to add additional columns for F-number users
    const insertQuery = isFnumberUser 
      ? `INSERT INTO users (name, email, username, password, department, role, is_fnumber_user, fnumber)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, name, email, username, department, role, is_fnumber_user, fnumber, created_at`
      : `INSERT INTO users (name, email, username, password, department, role, is_fnumber_user)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, username, department, role, is_fnumber_user, created_at`;

    const insertValues = isFnumberUser 
      ? [name, email, username, hashedPassword, department, role, true, fnumber]
      : [name, email, username, hashedPassword, department, role, false];

    const newUserResult = await query(insertQuery, insertValues);

    console.log('✅ User created successfully:', newUserResult.rows[0]);
    console.log('=== END CREATE USER DEBUG ===');

    res.status(201).json({
      success: true,
      message: `${isFnumberUser ? 'F-number' : 'Regular'} user created successfully`,
      user: newUserResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Create user error:', error);
    console.log('Error code:', error.code);
    console.log('Error detail:', error.detail);
    console.log('=== END CREATE USER DEBUG ===');
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint && error.constraint.includes('email')) {
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      } else if (error.constraint && error.constraint.includes('username')) {
        console.log('⚠️ Username constraint still exists in database');
        res.status(500).json({
          success: false,
          message: 'Database configuration error - username constraint should be removed'
        });
      } else {
        res.status(409).json({
          success: false,
          message: 'User creation failed due to duplicate data'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create user: ' + error.message
      });
    }
  }
};


// sql 
-- Add columns to support F-number users
ALTER TABLE users 
ADD COLUMN is_fnumber_user BOOLEAN DEFAULT FALSE,
ADD COLUMN fnumber VARCHAR(20) NULL;

-- Optional: Add index for faster F-number lookups
CREATE INDEX idx_users_fnumber ON users(fnumber) WHERE fnumber IS NOT NULL;