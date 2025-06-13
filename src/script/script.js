// CREATE TABLE users (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL UNIQUE,
//     username VARCHAR(255) NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     department VARCHAR(50) NOT NULL CHECK (department IN (
//         'FINANCE', 'IT', 'HR', 'OPERATIONS', 'GLOBALMARKET', 
//         'MARKETTING', 'LEGAL', 'COMPLIANCE', 'EXCOBERS', 'TAX', 'COST_CONTROL'
//     )),
//     role VARCHAR(50) NOT NULL CHECK (role IN (
//         'HEAD_OF_FINANCE', 'CFO', 'CEO', 'PC', 'EXCO', 'TAX_MANAGER',
//         'COST_CONTROL', 'APPROVAL_USER_1', 'APPROVAL_USER_2', 
//         'PAYMENT_USER', 'DEPARTMENT_USER'
//     )),
//     status VARCHAR(20) DEFAULT 'active',
//     is_active BOOLEAN DEFAULT true,
//     last_login TIMESTAMP WITH TIME ZONE,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );

// -- Create user_sessions table
// CREATE TABLE user_sessions (
//     id SERIAL PRIMARY KEY,
//     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//     token TEXT NOT NULL UNIQUE,
//     expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );

// -- Create login_logs table
// CREATE TABLE login_logs (
//     id SERIAL PRIMARY KEY,
//     user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
//     email VARCHAR(255),
//     login_status VARCHAR(20) NOT NULL CHECK (login_status IN ('success', 'failed', 'logout')),
//     ip_address INET,
//     user_agent TEXT,
//     country VARCHAR(100),
//     city VARCHAR(100),
//     device_type VARCHAR(50),
//     browser VARCHAR(100),
//     os VARCHAR(100),
//     failure_reason TEXT,
//     session_id VARCHAR(255),
//     login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     logout_time TIMESTAMP WITH TIME ZONE,
//     session_duration INTERVAL,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );








// CREATE TABLE users (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL UNIQUE,
//     username VARCHAR(255) NOT NULL, -- Removed UNIQUE constraint as per your code
//     password VARCHAR(255) NOT NULL,
//     department VARCHAR(50) NOT NULL CHECK (department IN (
//         'FINANCE', 'IT', 'HR', 'OPERATIONS', 'GLOBALMARKET', 
//         'MARKETTING', 'LEGAL', 'COMPLIANCE', 'EXCOBERS', 'TAX', 'COST_CONTROL'
//     )),
//     role VARCHAR(50) NOT NULL CHECK (role IN (
//         'HEAD_OF_FINANCE', 'CFO', 'CEO', 'PC', 'EXCO', 'TAX_MANAGER',
//         'COST_CONTROL', 'APPROVAL_USER_1', 'APPROVAL_USER_2', 
//         'PAYMENT_USER', 'DEPARTMENT_USER'
//     )),
//     status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
//     is_active BOOLEAN DEFAULT true,
//     last_login TIMESTAMP,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// -- 2. User sessions table
// CREATE TABLE user_sessions (
//     id SERIAL PRIMARY KEY,
//     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//     token TEXT NOT NULL UNIQUE,
//     expires_at TIMESTAMP NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     is_active BOOLEAN DEFAULT true
// );

// -- 3. Login logs table (comprehensive logging)
// CREATE TABLE login_logs (
//     id SERIAL PRIMARY KEY,
//     session_id UUID DEFAULT uuid_generate_v4(),
//     user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
//     email VARCHAR(255),
//     login_status VARCHAR(20) NOT NULL CHECK (login_status IN ('success', 'failed', 'logout')),
//     login_method VARCHAR(20) DEFAULT 'traditional' CHECK (login_method IN ('traditional', 'ldap', '2fa')),
//     ip_address INET,
//     user_agent TEXT,
//     country VARCHAR(100),
//     city VARCHAR(100),
//     device_type VARCHAR(50),
//     browser VARCHAR(100),
//     os VARCHAR(100),
//     failure_reason TEXT,
//     login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     logout_time TIMESTAMP,
//     session_duration INTERVAL,
//     is_suspicious BOOLEAN DEFAULT false,
//     risk_score INTEGER DEFAULT 0,
//     additional_data JSONB
// );

// -- 4. Suspicious activities table (for security monitoring)
// CREATE TABLE suspicious_activities (
//     id SERIAL PRIMARY KEY,
//     user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
//     email VARCHAR(255),
//     activity_type VARCHAR(50) NOT NULL,
//     description TEXT,
//     ip_address INET,
//     user_agent TEXT,
//     country VARCHAR(100),
//     risk_score INTEGER DEFAULT 0,
//     is_resolved BOOLEAN DEFAULT false,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     resolved_at TIMESTAMP,
//     resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
// );CREATE TABLE users (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL UNIQUE,
//     username VARCHAR(255) NOT NULL, -- Removed UNIQUE constraint as per your code
//     password VARCHAR(255) NOT NULL,
//     department VARCHAR(50) NOT NULL CHECK (department IN (
//         'FINANCE', 'IT', 'HR', 'OPERATIONS', 'GLOBALMARKET', 
//         'MARKETTING', 'LEGAL', 'COMPLIANCE', 'EXCOBERS', 'TAX', 'COST_CONTROL'
//     )),
//     role VARCHAR(50) NOT NULL CHECK (role IN (
//         'HEAD_OF_FINANCE', 'CFO', 'CEO', 'PC', 'EXCO', 'TAX_MANAGER',
//         'COST_CONTROL', 'APPROVAL_USER_1', 'APPROVAL_USER_2', 
//         'PAYMENT_USER', 'DEPARTMENT_USER'
//     )),
//     status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
//     is_active BOOLEAN DEFAULT true,
//     last_login TIMESTAMP,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// -- 2. User sessions table
// CREATE TABLE user_sessions (
//     id SERIAL PRIMARY KEY,
//     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//     token TEXT NOT NULL UNIQUE,
//     expires_at TIMESTAMP NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     is_active BOOLEAN DEFAULT true
// );

// -- 3. Login logs table (comprehensive logging)
// CREATE TABLE login_logs (
//     id SERIAL PRIMARY KEY,
//     session_id UUID DEFAULT uuid_generate_v4(),
//     user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
//     email VARCHAR(255),
//     login_status VARCHAR(20) NOT NULL CHECK (login_status IN ('success', 'failed', 'logout')),
//     login_method VARCHAR(20) DEFAULT 'traditional' CHECK (login_method IN ('traditional', 'ldap', '2fa')),
//     ip_address INET,
//     user_agent TEXT,
//     country VARCHAR(100),
//     city VARCHAR(100),
//     device_type VARCHAR(50),
//     browser VARCHAR(100),
//     os VARCHAR(100),
//     failure_reason TEXT,
//     login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     logout_time TIMESTAMP,
//     session_duration INTERVAL,
//     is_suspicious BOOLEAN DEFAULT false,
//     risk_score INTEGER DEFAULT 0,
//     additional_data JSONB
// );

// -- 4. Suspicious activities table (for security monitoring)
// CREATE TABLE suspicious_activities (
//     id SERIAL PRIMARY KEY,
//     user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
//     email VARCHAR(255),
//     activity_type VARCHAR(50) NOT NULL,
//     description TEXT,
//     ip_address INET,
//     user_agent TEXT,
//     country VARCHAR(100),
//     risk_score INTEGER DEFAULT 0,
//     is_resolved BOOLEAN DEFAULT false,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     resolved_at TIMESTAMP,
//     resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
// );



// CREATE TABLE invoices (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     name VARCHAR(255) NOT NULL,
//     type VARCHAR(100) NOT NULL,
//     amount DECIMAL(15,2) NOT NULL,
//     sender VARCHAR(255) NOT NULL,
//     department VARCHAR(100) NOT NULL,
//     uploaded_by UUID NOT NULL,
//     size_kb DECIMAL(10,2),
//     content TEXT NOT NULL, -- Base64 encoded file content
//     required_approvers TEXT[] DEFAULT '{}', -- Array of required approver roles
//     status VARCHAR(50) DEFAULT 'PENDING',
//     current_approval_stage VARCHAR(50) DEFAULT 'INITIAL_APPROVAL',
//     approvals TEXT[] DEFAULT '{}', -- Array of approver roles who have approved
//     rejections TEXT[] DEFAULT '{}', -- Array of approver roles who have rejected
//     paid_by VARCHAR(255),
//     paid_date TIMESTAMP,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
// );
// -- Create users table (referenced by invoices and purchase_orders)
// CREATE TABLE users (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     username VARCHAR(255) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     department VARCHAR(100) NOT NULL,
//     role VARCHAR(100) NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// -- Create invoices table
// CREATE TABLE invoices (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     name VARCHAR(255) NOT NULL,
//     type VARCHAR(100) NOT NULL,
//     amount DECIMAL(15,2) NOT NULL,
//     sender VARCHAR(255) NOT NULL,
//     department VARCHAR(100) NOT NULL,
//     uploaded_by UUID NOT NULL,
//     size_kb DECIMAL(10,2),
//     content TEXT NOT NULL, -- Base64 encoded file content
//     required_approvers TEXT[] DEFAULT '{}', -- Array of required approver roles
//     status VARCHAR(50) DEFAULT 'PENDING',
//     current_approval_stage VARCHAR(50) DEFAULT 'INITIAL_APPROVAL',
//     approvals TEXT[] DEFAULT '{}', -- Array of approver roles who have approved
//     rejections TEXT[] DEFAULT '{}', -- Array of approver roles who have rejected
//     paid_by VARCHAR(255),
//     paid_date TIMESTAMP,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
// );

// -- Create purchase_orders table
// CREATE TABLE purchase_orders (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     name VARCHAR(255) NOT NULL,
//     type VARCHAR(100) NOT NULL,
//     sender VARCHAR(255) NOT NULL,
//     username VARCHAR(255),
//     department VARCHAR(100) NOT NULL,
//     uploaded_by UUID NOT NULL,
//     original_uploader VARCHAR(255),
//     size_kb DECIMAL(10,2),
//     content TEXT NOT NULL, -- Base64 encoded original file content
//     status VARCHAR(50) DEFAULT 'COST_CONTROL_REVIEW',
    
//     -- Worked file fields (filled by COST_CONTROL)
//     worked_content TEXT,
//     worked_file_name VARCHAR(255),
//     worked_file_type VARCHAR(100),
//     cost_control_worked_by VARCHAR(255),
//     cost_control_worked_date TIMESTAMP,
    
//     -- Signed file fields (filled by HEAD_OF_FINANCE)
//     signed_content TEXT,
//     signed_file_name VARCHAR(255),
//     signed_file_type VARCHAR(100),
//     head_of_finance_signed_by VARCHAR(255),
//     signed_date TIMESTAMP,
    
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
// );

// -- Create indexes for better performance
// CREATE INDEX idx_invoices_uploaded_by ON invoices(uploaded_by);
// CREATE INDEX idx_invoices_department ON invoices(department);
// CREATE INDEX idx_invoices_status ON invoices(status);
// CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

// CREATE INDEX idx_purchase_orders_uploaded_by ON purchase_orders(uploaded_by);
// CREATE INDEX idx_purchase_orders_department ON purchase_orders(department);
// CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
// CREATE INDEX idx_purchase_orders_created_at ON purchase_orders(created_at DESC);



// //logs
// Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
// Token response status: 200
// Token response data: {
//   "statusCode": 0,
//   "statusMessage": "Success",
//   "serverTimestamp": "2025-06-11T14:27:59.076028122",
//   "data": {
//     "clientId": "f1fb6909-d015-47e1-ad61-93708e570396",
//     "code": "fl_123",
//     "email": "files@gmail.com",
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMWZiNjkwOS1kMDE1LTQ3ZTEtYWQ2MS05MzcwOGU1NzAzOTYiLCJpYXQiOjE3NDk2NTIwNzksImV4cCI6MTc0OTY1MjM3OX0.2QcUnKeidSNY32FXpqakaYBlTFS3QiQQL7nRla81c9w",
//     "tokenExpiryDate": "2025-06-11T14:32:59.070275809"
//   }
// }
// Successfully obtained token
// Searching for user at: https://172.29.18.126/adproxyservice/prod/ldap/search
// Request configuration: {
//   "url": "https://172.29.18.126/adproxyservice/prod/ldap/search",
//   "method": "post",
//   "headers": {
//     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMWZiNjkwOS1kMDE1LTQ3ZTEtYWQ2MS05MzcwOGU1NzAzOTYiLCJpYXQiOjE3NDk2NTIwNzksImV4cCI6MTc0OTY1MjM3OX0.2QcUnKeidSNY32FXpqakaYBlTFS3QiQQL7nRla81c9w",
//     "Content-Type": "application/json"
//   },
//   "data": {
//     "fnumber": "f8877557"
//   }
// }
// Search response status: 200
// Search response data: {
//   "statusCode": 0,
//   "statusMessage": "Success",
//   "serverTimestamp": "2025-06-11T14:28:01.045779286",
//   "data": {
//     "userId": "F8877557",
//     "mobile": "+233592486117",
//     "email": "Francis.Kontoh@firstnationalbank.com.gh",
//     "userPrincipalName": "F8877557@fnb.co.za",
//     "title": "Internship",
//     "name": "Kontoh, Francis",
//     "manager": "CN=Eshun\\, Kwesi,OU=DomainUsers,DC=fnb,DC=co,DC=za",
//     "memberOf": [
//       "CN=AppsDevelopmentTeam_PROD_IT_FNBGhana,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=APPSTEAM_DEV_IT_Works,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=W365_VDI_2vCPU8GB256GB_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=CLOUD_VDI_FULLACCESS_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=GlobalWorkDay_CloudApps_All_Users,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=GlobalERP_CloudApps_All_Employees,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=Myappstore_Prod_AllUsers_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=GlobalERP_CloudApps_All_Users,OU=Office365,OU=DomainUsers,DC=fnb,DC=co,DC=za",
//       "CN=SSO_PROD_FNB_2FABYPASS,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=DLP_Level-1-FullLockdown_prod_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=2V_production_FNB_Staff,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=Users for 2FA testing,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=One Drive Test,OU=DomainGroups,DC=fnb,DC=co,DC=za",
//       "CN=InternetUsers - All,OU=InterNet Access,OU=Security,OU=Groups,OU=FNBUsers,DC=fnb,DC=co,DC=za"
//     ]
//   }
// }


// //log
// === CREATE USER DEBUG ===
// Request body: {
//   name: 'Francis Kontoh',
//   email: 'f8877557',
//   username: 'admin',
//   department: 'IT',
//   role: 'DEPARTMENT_USER',
//   isFnumberUser: true,
//   fnumber: 'f8877557',
//   ldapData: null
// }
// ❌ Missing required fields
// POST /api/auth/users 400 4.410 ms - 53


// // no special query
// const createUser = async (req, res) => {
//   console.log('=== CREATE USER DEBUG ===');
//   console.log('Request body:', req.body);
  
//   try {
//     const { 
//       name, 
//       email, 
//       username, 
//       password, 
//       department, 
//       role, 
//       isFnumberUser, 
//       fnumber,
//       ldapData 
//     } = req.body;

//     // Validation - password is not required for F-number users
//     if (!name || !email || !username || !department || !role) {
//       console.log('❌ Missing required fields');
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       });
//     }

//     // Password validation: required only for non-F-number users
//     if (!isFnumberUser && (!password || password.trim() === '')) {
//       console.log('❌ Password required for non-F-number users');
//       return res.status(400).json({
//         success: false,
//         message: 'Password is required for non-F-number users'
//       });
//     }

//     if (!VALID_ROLES.includes(role)) {
//       console.log('❌ Invalid role:', role);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid role'
//       });
//     }

//     if (!VALID_DEPARTMENTS.includes(department)) {
//       console.log('❌ Invalid department:', department);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid department'
//       });
//     }

//     // Check ONLY if email already exists
//     console.log('🔍 Checking for existing email only...');
//     const existingUserResult = await query(
//       'SELECT id, email FROM users WHERE email = $1',
//       [email]
//     );

//     console.log('Existing email check result:', {
//       rowCount: existingUserResult.rows.length,
//       existingUsers: existingUserResult.rows
//     });

//     if (existingUserResult.rows.length > 0) {
//       const existingUser = existingUserResult.rows[0];
//       console.log('❌ Email already exists:', existingUser);
//       return res.status(409).json({
//         success: false,
//         message: `User already exists with email: ${email}`
//       });
//     }

//     let hashedPassword = null;
    
//     // Handle password based on user type
//     if (isFnumberUser) {
//       console.log('📋 Creating F-number user - no password stored (NULL)');
//       console.log('F-number details:', { fnumber, ldapData });
//       // F-number users don't need passwords - they authenticate via LDAP
//       hashedPassword = null;
      
//     } else {
//       console.log('🔐 Hashing password for regular user...');
//       hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
//       console.log('Password hashed successfully, length:', hashedPassword.length);
//     }

//     // Create user
//     console.log('✏️ Creating user in database...');
//     console.log(`ℹ️ User type: ${isFnumberUser ? 'F-number (LDAP)' : 'Regular'}`);
    
//     // Single query that works for both user types
//     const insertQuery = `INSERT INTO users (name, email, username, password, department, role, is_fnumber_user, fnumber)
//                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//                          RETURNING id, name, email, username, department, role, is_fnumber_user, fnumber, created_at`;

//     const insertValues = [
//       name, 
//       email, 
//       username, 
//       hashedPassword, // null for F-number users, hashed password for regular users
//       department, 
//       role, 
//       isFnumberUser || false, // true for F-number users, false for regular users
//       fnumber || null // fnumber for F-number users, null for regular users
//     ];

//     const newUserResult = await query(insertQuery, insertValues);

//     console.log('✅ User created successfully:', newUserResult.rows[0]);
//     console.log('=== END CREATE USER DEBUG ===');

//     res.status(201).json({
//       success: true,
//       message: `${isFnumberUser ? 'F-number' : 'Regular'} user created successfully`,
//       user: newUserResult.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Create user error:', error);
//     console.log('Error code:', error.code);
//     console.log('Error detail:', error.detail);
//     console.log('=== END CREATE USER DEBUG ===');
    
//     if (error.code === '23505') { // Unique violation
//       if (error.constraint && error.constraint.includes('email')) {
//         res.status(409).json({
//           success: false,
//           message: 'Email already exists'
//         });
//       } else if (error.constraint && error.constraint.includes('username')) {
//         console.log('⚠️ Username constraint still exists in database');
//         res.status(500).json({
//           success: false,
//           message: 'Database configuration error - username constraint should be removed'
//         });
//       } else {
//         res.status(409).json({
//           success: false,
//           message: 'User creation failed due to duplicate data'
//         });
//       }
//     } else {
//       res.status(500).json({
//         success: false,
//         message: 'Failed to create user: ' + error.message
//       });
//     }
//   }
// };

// // special query
// const createUser = async (req, res) => {
//   console.log('=== CREATE USER DEBUG ===');
//   console.log('Request body:', req.body);
  
//   try {
//     const { 
//       name, 
//       email, 
//       username, 
//       password, 
//       department, 
//       role, 
//       isFnumberUser, 
//       fnumber,
//       ldapData 
//     } = req.body;

//     // Validation - password is not required for F-number users
//     if (!name || !email || !username || !department || !role) {
//       console.log('❌ Missing required fields');
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       });
//     }

//     // Password validation: required only for non-F-number users
//     if (!isFnumberUser && (!password || password.trim() === '')) {
//       console.log('❌ Password required for non-F-number users');
//       return res.status(400).json({
//         success: false,
//         message: 'Password is required for non-F-number users'
//       });
//     }

//     if (!VALID_ROLES.includes(role)) {
//       console.log('❌ Invalid role:', role);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid role'
//       });
//     }

//     if (!VALID_DEPARTMENTS.includes(department)) {
//       console.log('❌ Invalid department:', department);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid department'
//       });
//     }

//     // Check ONLY if email already exists
//     console.log('🔍 Checking for existing email only...');
//     const existingUserResult = await query(
//       'SELECT id, email FROM users WHERE email = $1',
//       [email]
//     );

//     console.log('Existing email check result:', {
//       rowCount: existingUserResult.rows.length,
//       existingUsers: existingUserResult.rows
//     });

//     if (existingUserResult.rows.length > 0) {
//       const existingUser = existingUserResult.rows[0];
//       console.log('❌ Email already exists:', existingUser);
//       return res.status(409).json({
//         success: false,
//         message: `User already exists with email: ${email}`
//       });
//     }

//     let hashedPassword = null;
    
//     // Handle password based on user type
//     if (isFnumberUser) {
//       console.log('📋 Creating F-number user - no password stored (NULL)');
//       console.log('F-number details:', { fnumber, ldapData });
//       // F-number users don't need passwords - they authenticate via LDAP
//       hashedPassword = null;
      
//     } else {
//       console.log('🔐 Hashing password for regular user...');
//       hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
//       console.log('Password hashed successfully, length:', hashedPassword.length);
//     }

//     // Create user
//     console.log('✏️ Creating user in database...');
//     console.log(`ℹ️ User type: ${isFnumberUser ? 'F-number (LDAP)' : 'Regular'}`);
    
//     // You might want to add additional columns for F-number users
//     const insertQuery = isFnumberUser 
//       ? `INSERT INTO users (name, email, username, password, department, role, is_fnumber_user, fnumber)
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//          RETURNING id, name, email, username, department, role, is_fnumber_user, fnumber, created_at`
//       : `INSERT INTO users (name, email, username, password, department, role, is_fnumber_user)
//          VALUES ($1, $2, $3, $4, $5, $6, $7)
//          RETURNING id, name, email, username, department, role, is_fnumber_user, created_at`;

//     const insertValues = isFnumberUser 
//       ? [name, email, username, hashedPassword, department, role, true, fnumber]
//       : [name, email, username, hashedPassword, department, role, false];

//     const newUserResult = await query(insertQuery, insertValues);

//     console.log('✅ User created successfully:', newUserResult.rows[0]);
//     console.log('=== END CREATE USER DEBUG ===');

//     res.status(201).json({
//       success: true,
//       message: `${isFnumberUser ? 'F-number' : 'Regular'} user created successfully`,
//       user: newUserResult.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Create user error:', error);
//     console.log('Error code:', error.code);
//     console.log('Error detail:', error.detail);
//     console.log('=== END CREATE USER DEBUG ===');
    
//     if (error.code === '23505') { // Unique violation
//       if (error.constraint && error.constraint.includes('email')) {
//         res.status(409).json({
//           success: false,
//           message: 'Email already exists'
//         });
//       } else if (error.constraint && error.constraint.includes('username')) {
//         console.log('⚠️ Username constraint still exists in database');
//         res.status(500).json({
//           success: false,
//           message: 'Database configuration error - username constraint should be removed'
//         });
//       } else {
//         res.status(409).json({
//           success: false,
//           message: 'User creation failed due to duplicate data'
//         });
//       }
//     } else {
//       res.status(500).json({
//         success: false,
//         message: 'Failed to create user: ' + error.message
//       });
//     }
//   }
// };


// // sql 
// -- Add columns to support F-number users
// ALTER TABLE users 
// ADD COLUMN is_fnumber_user BOOLEAN DEFAULT FALSE,
// ADD COLUMN fnumber VARCHAR(20) NULL;

// -- Optional: Add index for faster F-number lookups
// CREATE INDEX idx_users_fnumber ON users(fnumber) WHERE fnumber IS NOT NULL;




// //2fa log on frontend
// AuthContext.js:487 
//  Track 2FA status error: Error: No active 2FA session found
//     at track2FAStatus (AuthContext.js:471:1)
//     at Login.js:90:1
// track2FAStatus	@	AuthContext.js:487
// (anonymous)	@	Login.js:90
// setInterval		
// startPolling2FAStatus	@	Login.js:88
// handleSubmit	@	Login.js:63
// Login.js:110 
//  2FA status polling error: Error: No active 2FA session found
//     at track2FAStatus (AuthContext.js:471:1)
//     at Login.js:90:1
// (anonymous)	@	Login.js:110
// setInterval		
// startPolling2FAStatus	@	Login.js:88
// handleSubmit	@	Login.js:63


// //2fa log on frontend

// ✅ Logout logged for session: 13fb75f1-2b34-472a-804c-b3a25d1842c6
// POST /api/auth/logout 200 11.993 ms - 46
// [LDAP-AUTH] Authentication attempt for user: F8877557
// Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
// Token response status: 200
// [LDAP-AUTH] Successfully obtained token for authentication
// [LDAP-AUTH] Sending authentication request to LDAP service
// [LDAP-AUTH] Auth response status: 200
// [LDAP-AUTH] Authentication successful for user: F8877557
// [LDAP-AUTH] Returning token for 2FA verification
// POST /api/auth/ldap/authenticate 200 2263.716 ms - 318
// [LDAP-AUTH] Authentication attempt for user: F8877557
// Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
// Token response status: 200
// [LDAP-AUTH] Successfully obtained token for authentication
// [LDAP-AUTH] Sending authentication request to LDAP service
// [LDAP-AUTH] Auth response status: 200
// [LDAP-AUTH] Authentication successful for user: F8877557
// [LDAP-AUTH] Returning token for 2FA verification
// POST /api/auth/ldap/authenticate 200 2156.909 ms - 318





// /**
//  * Track 2FA verification status
//  * @param {string} sessionId - 2FA session ID (required - don't rely on stored state)
//  * @returns {Promise<Object>} 2FA status
//  */
//   const track2FAStatus = async (sessionId) => {
//   try {
//     // Always require explicit sessionId parameter
//     if (!sessionId) {
//       throw new Error('2FA session ID is required for status tracking');
//     }

//     const response = await apiRequest('/api/auth/track-2fa-status', {
//       method: 'POST',
//       body: JSON.stringify({ twoFASessionId: sessionId }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Failed to track 2FA status');
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Track 2FA status error:', error);
//     throw error;
//   }
// };




// // NEW backend  : Track 2FA Status function
//   const track2FAStatus = async (req, res) => {
//   const { twoFASessionId, fnumber } = req.body; // Changed from 'token' to 'twoFASessionId'

//   if (!twoFASessionId) {
//     return res.status(400).json({ 
//       success: false, 
//       error: '2FA session ID is required' 
//     });
//   }

//   try {
//     console.log("[TRACK] Checking 2FA verification status for session:", 
//       twoFASessionId.substring(0, 10) + "..." + twoFASessionId.substring(twoFASessionId.length - 10));
    
//     const authToken = await getAuthToken();
//     console.log('[TRACK] Successfully obtained token for status tracking');
    
//     console.log('[TRACK] Sending status check to LDAP service');
//     const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
//       token: twoFASessionId, // The LDAP service still expects 'token'
//       code: ""
//     }, { 
//       headers: {
//         'Authorization': authToken,
//         'Content-Type': 'application/json'
//       },
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
//     });
    
//     console.log('[TRACK] Status response code:', verifyResponse.status);
    
//     const statusCode = verifyResponse.data.status_code;
//     const statusMessage = verifyResponse.data.status_message;
//     const dataStatus = verifyResponse.data.data?.status;
    
//     console.log(`[TRACK] Status code: ${statusCode}, Message: ${statusMessage}, Data status: ${dataStatus}`);
    
//     // Determine if verification was successful, rejected, or still pending
//     let verified = false;
//     let rejected = false;
    
//     if (statusCode === "000" || statusCode === "0" || statusCode === 0) {
//       verified = true;
//       console.log('[TRACK] 2FA was accepted on device');
//     } 
//     else if (statusCode === "002" || statusMessage?.toLowerCase().includes("pending")) {
//       console.log('[TRACK] 2FA still pending user action');
//       // Keep verified = false, rejected = false (still waiting)
//     }
//     else {
//       rejected = true;
//       console.log('[TRACK] 2FA was rejected or failed');
//     }
    
//     const responseFnumber = verifyResponse.data.data?.fnumber || fnumber;
    
//     return res.status(200).json({
//       success: true,
//       verified,
//       rejected,
//       statusCode,
//       statusMessage,
//       dataStatus,
//       fnumber: responseFnumber,
//       sessionId: twoFASessionId
//     });
    
//   } catch (err) {
//     console.error('[TRACK] Status tracking error:', err.message);
    
//     if (err.response) {
//       console.error('[TRACK] Error response status:', err.response.status);
//       console.error('[TRACK] Error response data:', JSON.stringify(err.response.data, null, 2));
//     }
    
//     return res.status(500).json({ 
//       success: false, 
//       error: `Server error during status tracking: ${err.message}` 
//     });
//   }
// };



// //login

//    const startPolling2FAStatus = (sessionId) => {
//   const interval = setInterval(async () => {
//     try {
//       // Make sure we pass the sessionId explicitly
//       const statusResult = await track2FAStatus(sessionId);
      
//       if (statusResult.success && statusResult.verified) {
//         // 2FA was accepted on phone
//         clearInterval(interval);
//         setPollingInterval(null);
//         setShowTwoFAModal(false);
//         setLoading(true);
//         navigate("/dashboard");
//       } else if (statusResult.success && statusResult.rejected) {
//         // 2FA was rejected
//         clearInterval(interval);
//         setPollingInterval(null);
//         setShowTwoFAModal(false);
//         setError("2FA verification was declined. Please try again.");
//       }
//       // If neither verified nor rejected, continue polling
//     } catch (err) {
//       console.error('2FA status polling error:', err);
//       // Handle session expiry or other fatal errors
//       if (err.message.includes('session') || err.message.includes('expired')) {
//         clearInterval(interval);
//         setPollingInterval(null);
//         setShowTwoFAModal(false);
//         setError("2FA session expired. Please login again.");
//       }
//     }
//   }, 2000);

//   setPollingInterval(interval);

//   // Auto-stop polling after 5 minutes
//   setTimeout(() => {
//     clearInterval(interval);
//     setPollingInterval(null);
//     if (showTwoFAModal) {
//       setShowTwoFAModal(false);
//       setError("2FA verification timed out. Please try again.");
//     }
//   }, 300000);
// };

// //new logs
// AuthContext.js:486 
//  Track 2FA status error: Error: 2FA session ID is required for status tracking
//     at track2FAStatus (AuthContext.js:470:1)
//     at Login.js:91:1
// track2FAStatus	@	AuthContext.js:486
// (anonymous)	@	Login.js:91
// setInterval		
// startPolling2FAStatus	@	Login.js:88
// handleSubmit	@	Login.js:63
// Login.js:109 
//  2FA status polling error: Error: 2FA session ID is required for status tracking
//     at track2FAStatus (AuthContext.js:470:1)
//     at Login.js:91:1
// (anonymous)	@	Login.js:109
// setInterval		
// startPolling2FAStatus	@	Login.js:88
// handleSubmit	@	Login.js:63




// //auth 2fa

// const track2FAStatus = async (sessionId) => {
//   try {
//     // Debug logging
//     console.log('[FRONTEND] track2FAStatus called with sessionId:', sessionId ? 'Present' : 'Missing');
    
//     // Always require explicit sessionId parameter
//     if (!sessionId) {
//       console.error('[FRONTEND] No sessionId provided to track2FAStatus');
//       throw new Error('2FA session ID is required for status tracking');
//     }

//     console.log('[FRONTEND] Making API request to track 2FA status');
    
//     const response = await apiRequest('/api/auth/track-2fa-status', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ 
//         twoFASessionId: sessionId 
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('[FRONTEND] API response not ok:', errorData);
//       throw new Error(errorData.message || 'Failed to track 2FA status');
//     }

//     const data = await response.json();
//     console.log('[FRONTEND] 2FA status response:', {
//       verified: data.verified,
//       rejected: data.rejected,
//       statusCode: data.statusCode
//     });
    
//     return data;
//   } catch (error) {
//     console.error('[FRONTEND] Track 2FA status error:', error);
//     throw error;
//   }
// };

// //login  polling 2fa
//   const startPolling2FAStatus = (sessionId) => {
//   console.log('[LOGIN] Starting 2FA polling with sessionId:', sessionId ? 'Present' : 'Missing');
  
//   if (!sessionId) {
//     console.error('[LOGIN] No sessionId provided to startPolling2FAStatus');
//     setError("2FA session ID missing. Please try logging in again.");
//     return;
//   }

//   const interval = setInterval(async () => {
//     try {
//       console.log('[LOGIN] Polling 2FA status...');
      
//       // Make sure we pass the sessionId explicitly
//       const statusResult = await track2FAStatus(sessionId);
      
//       console.log('[LOGIN] Status result:', {
//         success: statusResult.success,
//         verified: statusResult.verified,
//         rejected: statusResult.rejected
//       });
      
//       if (statusResult.success && statusResult.verified) {
//         // 2FA was accepted on phone
//         console.log('[LOGIN] 2FA verified successfully');
//         clearInterval(interval);
//         setPollingInterval(null);
//         setShowTwoFAModal(false);
//         setLoading(true);
//         navigate("/dashboard");
//       } else if (statusResult.success && statusResult.rejected) {
//         // 2FA was rejected
//         console.log('[LOGIN] 2FA was rejected');
//         clearInterval(interval);
//         setPollingInterval(null);
//         setShowTwoFAModal(false);
//         setError("2FA verification was declined. Please try again.");
//       }
//       // If neither verified nor rejected, continue polling
//     } catch (err) {
//       console.error('[LOGIN] 2FA status polling error:', err);
      
//       // Handle session expiry or other fatal errors
//       if (err.message.includes('session') || err.message.includes('expired')) {
//         clearInterval(interval);
//         setPollingInterval(null);
//         setShowTwoFAModal(false);
//         setError("2FA session expired. Please login again.");
//       } else if (err.message.includes('2FA session ID is required')) {
//         // Handle missing session ID error
//         clearInterval(interval);
//         setPollingInterval(null);
//         setShowTwoFAModal(false);
//         setError("2FA session error. Please login again.");
//       }
//     }
//   }, 2000);

//   setPollingInterval(interval);

//   // Auto-stop polling after 5 minutes
//   setTimeout(() => {
//     console.log('[LOGIN] 2FA polling timeout reached');
//     clearInterval(interval);
//     setPollingInterval(null);
//     if (showTwoFAModal) {
//       setShowTwoFAModal(false);
//       setError("2FA verification timed out. Please try again.");
//     }
//   }, 300000);
// };

// //neww logs
// 2FA session ID missing. Please try logging in again.

// //auth

// const track2FAStatus = async (sessionId) => {
//   try {
//     // Always require explicit sessionId parameter
//     if (!sessionId) {
//       throw new Error('2FA session ID is required for status tracking');
//     }

//     const response = await apiRequest('/api/auth/track-2fa-status', {
//       method: 'POST',
//       body: JSON.stringify({ 
//         token: sessionId,  // Changed from twoFASessionId to token
//         fnumber: null      // Add fnumber if needed
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Failed to track 2FA status');
//     }

//     const data = await response.json();
    
//     // Map the backend response to frontend expectations
//     return {
//       success: true,
//       verified: data.verificationStatus === "success",
//       rejected: data.verificationStatus === "failed",
//       pending: data.verificationStatus === "pending"
//     };
//   } catch (error) {
//     console.error('Track 2FA status error:', error);
//     throw error;
//   }
// };

// //loggin 


// const statusResult = await track2FAStatus(sessionId);

// console.log('[LOGIN] Status result:', {
//   success: statusResult.success,
//   verified: statusResult.verified,
//   rejected: statusResult.rejected,
//   pending: statusResult.pending
// });

// if (statusResult.success && statusResult.verified) {
//   // 2FA was accepted on phone
//   console.log('[LOGIN] 2FA verified successfully');
//   clearInterval(interval);
//   setPollingInterval(null);
//   setShowTwoFAModal(false);
//   setLoading(true);
//   navigate("/dashboard");
// } else if (statusResult.success && statusResult.rejected) {
//   // 2FA was rejected
//   console.log('[LOGIN] 2FA was rejected');
//   clearInterval(interval);
//   setPollingInterval(null);
//   setShowTwoFAModal(false);
//   setError("2FA verification was declined. Please try again.");
// }



// //backend 2fa new

// const track2FAStatus = async (req, res) => {
//   // Accept both 'token' and 'twoFASessionId' for compatibility
//   const { token, twoFASessionId, fnumber } = req.body;
  
//   // Use whichever is provided
//   const sessionToken = token || twoFASessionId;

//   if (!sessionToken) {
//     return res.status(400).json({
//       success: false,
//       error: 'Token is required'
//     });
//   }

//   try {
//     console.log("[TRACK] Checking 2FA verification status for token:",
//       sessionToken.substring(0, 10) + "..." + sessionToken.substring(sessionToken.length - 10));

//     const authToken = await getAuthToken();
//     console.log('[TRACK] Successfully obtained token for status tracking');

//     console.log('[TRACK] Sending status check to LDAP service');
//     const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
//       token: sessionToken,
//       code: ""
//     }, {
//       headers: {
//         'Authorization': authToken,
//         'Content-Type': 'application/json'
//       },
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false })
//     });

//     console.log('[TRACK] Status response code:', verifyResponse.status);

//     const statusCode = verifyResponse.data.status_code;
//     const statusMessage = verifyResponse.data.status_message;
//     const dataStatus = verifyResponse.data.data?.status;

//     console.log(`[TRACK] Status code: ${statusCode}, Message: ${statusMessage}, Data status: ${dataStatus}`);

//     let verificationStatus = "pending";

//     if (statusCode === "000" || statusCode === "0" || statusCode === 0) {
//       verificationStatus = "success";
//     }
//     else if (statusCode !== "002" && statusMessage?.toLowerCase() !== "pending authentication") {
//       verificationStatus = "failed";
//     }

//     const responseFnumber = verifyResponse.data.data?.fnumber || fnumber;

//     return res.status(200).json({
//       success: true,
//       statusCode,
//       statusMessage,
//       dataStatus,
//       verificationStatus,
//       fnumber: responseFnumber
//     });

//   } catch (err) {
//     console.error('[TRACK] Status tracking error:', err.message);

//     if (err.response) {
//       console.error('[TRACK] Error response status:', err.response.status);
//       console.error('[TRACK] Error response data:', JSON.stringify(err.response.data, null, 2));
//     }

//     return res.status(500).json({
//       success: false,
//       error: `Server error during status tracking: ${err.message}`
//     });
//   }
// };


// // qeury
// PS C:\Users\f8877557\file-database-backend> node server.js
// Initializing database connection pool...
// Testing database connection...
// Server running on port 5000
// ✓ New database client connected (PID: 36300)
// ✓ Database client acquired from pool (PID: 36300)
// ✓ Client acquired successfully (PID: 36300)
// ✓ Database connection successful!
//   - Current time: Thu Jun 12 2025 16:33:50 GMT+0000 (Coordinated Universal Time)
//   - Database: PostgreSQL 15.12,
//   - Pool status: 1 total, 0 idle, 0 waiting
// [LDAP-AUTH] Authentication attempt for user: F8877557
// Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
// Token response status: 200
// [LDAP-AUTH] Successfully obtained token for authentication
// [LDAP-AUTH] Sending authentication request to LDAP service
// [LDAP-AUTH] Auth response status: 200
// [LDAP-AUTH] Authentication successful for user: F8877557
// [LDAP-AUTH] Returning token for 2FA verification
// POST /api/auth/ldap/authenticate 200 3857.921 ms - 318
// [LDAP-AUTH] Returning token for 2FA verification
// POST /api/auth/ldap/authenticate 200 3857.921 ms - 318
// [TRACK] Checking 2FA verification status for token: c97a941f-4...f847ee33e0
// Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
// POST /api/auth/ldap/authenticate 200 3857.921 ms - 318
// [TRACK] Checking 2FA verification status for token: c97a941f-4...f847ee33e0
// Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
// [TRACK] Checking 2FA verification status for token: c97a941f-4...f847ee33e0
// Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
// Token response status: 200
// Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
// Token response status: 200
// Token response status: 200
// [TRACK] Successfully obtained token for status tracking
// [TRACK] Sending status check to LDAP service
// [TRACK] Sending status check to LDAP service
// [TRACK] Checking 2FA verification status for token: c97a941f-4...f847ee33e0
// [TRACK] Checking 2FA verification status for token: c97a941f-4...f847ee33e0
// Requesting token from: https://172.29.18.126/adproxyservice/prod/client/renew-token
// [TRACK] Status response code: 200
// [TRACK] Status code: 000, Message: Successful authentication, Data status: Success
// POST /api/auth/track-2fa-status 200 2549.063 ms - 154
// Token response status: 200
// [TRACK] Successfully obtained token for status tracking
// [TRACK] Sending status check to LDAP service
// [TRACK] Status response code: 200
// [TRACK] Status code: 000, Message: Successful authentication, Data status: Success
// POST /api/auth/track-2fa-status 200 2031.193 ms - 154




// //new qeury
// // Replace the user query section in your verify2FA function with this:

// console.log(`[2FA] User identified as: ${fnumber}`);

// // Query users table to get user info using f-number
// console.log(`[2FA] Querying users table for f-number: ${fnumber}`);

// // For F-number users, both email and fnumber columns contain the same f-number (format: f8877557)
// const userResult = await query(`
//   SELECT * FROM users 
//   WHERE is_fnumber_user = true 
//   AND is_active = true
//   AND (LOWER(email) = LOWER($1) OR LOWER(fnumber) = LOWER($1))
// `, [fnumber]);

// console.log(`[2FA] Query result count: ${userResult.rows.length}`);

// if (userResult.rows.length === 0) {
//   console.log(`[2FA] F-number user ${fnumber} not found in users table`);
  
//   // Debug: Let's see what F-number users exist
//   try {
//     const debugResult = await query(`
//       SELECT id, email, fnumber, is_fnumber_user 
//       FROM users 
//       WHERE is_fnumber_user = true 
//       AND is_active = true 
//       AND (email ILIKE $1 OR fnumber ILIKE $1)
//       LIMIT 5
//     `, [`%${fnumber.replace('f', '')}%`]);
    
//     console.log(`[2FA] Debug - F-number users found with similar patterns:`, debugResult.rows);
//   } catch (debugError) {
//     console.error(`[2FA] Debug query failed:`, debugError);
//   }
  
//   await loginLogService.logFailedLogin(
//     fnumber, 
//     'F-number user not found in system after 2FA', 
//     req
//   );
  
//   return res.status(404).json({
//     success: false,
//     error: 'User not found in system. Please contact administrator.',
//   });
// }

// const user = userResult.rows[0];
// console.log(`[2FA] F-number user found in database:`, {
//   id: user.id,
//   email: user.email,
//   fnumber: user.fnumber,
//   name: user.name,
//   role: user.role,
//   department: user.department,
//   is_fnumber_user: user.is_fnumber_user
// });

// // Verify this is indeed an F-number user
// if (!user.is_fnumber_user) {
//   console.error(`[2FA] User found but is_fnumber_user is false for ${fnumber}`);
//   return res.status(400).json({
//     success: false,
//     error: 'Invalid user type for F-number authentication.',
//   });
// }


// //new api for query
// // Add this to your authController.js

// /**
//  * Get user data by F-number
//  * This function queries the users table to find a user by their F-number
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const getUserByFnumber = async (req, res) => {
//   const { fnumber } = req.body;

//   // Validate input
//   if (!fnumber) {
//     return res.status(400).json({
//       success: false,
//       error: 'F-number is required'
//     });
//   }

//   // Validate F-number format (f followed by 7 digits)
//   const fnumberRegex = /^f\d{7}$/i;
//   if (!fnumberRegex.test(fnumber)) {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid F-number format. Expected format: f1234567'
//     });
//   }

//   try {
//     console.log(`[GET_USER_BY_FNUMBER] Querying user data for F-number: ${fnumber}`);

//     // Query users table to get user info using f-number
//     // For F-number users, both email and fnumber columns contain the same f-number (format: f8877557)
//     const userResult = await query(`
//       SELECT 
//         id, 
//         name, 
//         email, 
//         username, 
//         department, 
//         role, 
//         status, 
//         is_active, 
//         last_login, 
//         created_at, 
//         updated_at, 
//         is_fnumber_user, 
//         fnumber
//       FROM users 
//       WHERE is_fnumber_user = true 
//       AND is_active = true
//       AND (LOWER(email) = LOWER($1) OR LOWER(fnumber) = LOWER($1))
//     `, [fnumber]);

//     console.log(`[GET_USER_BY_FNUMBER] Query result count: ${userResult.rows.length}`);

//     if (userResult.rows.length === 0) {
//       console.log(`[GET_USER_BY_FNUMBER] F-number user ${fnumber} not found in users table`);
      
//       // Debug: Let's see what F-number users exist with similar patterns
//       try {
//         const debugResult = await query(`
//           SELECT id, email, fnumber, is_fnumber_user 
//           FROM users 
//           WHERE is_fnumber_user = true 
//           AND is_active = true 
//           AND (email ILIKE $1 OR fnumber ILIKE $1)
//           LIMIT 5
//         `, [`%${fnumber.replace('f', '')}%`]);
        
//         console.log(`[GET_USER_BY_FNUMBER] Debug - F-number users found with similar patterns:`, debugResult.rows);
//       } catch (debugError) {
//         console.error(`[GET_USER_BY_FNUMBER] Debug query failed:`, debugError);
//       }
      
//       return res.status(404).json({
//         success: false,
//         error: 'F-number user not found in system. Please contact administrator.',
//         fnumber: fnumber
//       });
//     }

//     const user = userResult.rows[0];
//     console.log(`[GET_USER_BY_FNUMBER] F-number user found in database:`, {
//       id: user.id,
//       email: user.email,
//       fnumber: user.fnumber,
//       name: user.name,
//       role: user.role,
//       department: user.department,
//       is_fnumber_user: user.is_fnumber_user
//     });

//     // Verify this is indeed an F-number user
//     if (!user.is_fnumber_user) {
//       console.error(`[GET_USER_BY_FNUMBER] User found but is_fnumber_user is false for ${fnumber}`);
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid user type for F-number authentication.',
//         fnumber: fnumber
//       });
//     }

//     // Check if user is active
//     if (!user.is_active) {
//       console.error(`[GET_USER_BY_FNUMBER] User found but is not active for ${fnumber}`);
//       return res.status(403).json({
//         success: false,
//         error: 'User account is not active. Please contact administrator.',
//         fnumber: fnumber
//       });
//     }

//     // Return user data (exclude sensitive information)
//     const userData = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       username: user.username,
//       department: user.department,
//       role: user.role,
//       status: user.status,
//       is_active: user.is_active,
//       last_login: user.last_login,
//       created_at: user.created_at,
//       updated_at: user.updated_at,
//       is_fnumber_user: user.is_fnumber_user,
//       fnumber: user.fnumber
//     };

//     console.log(`[GET_USER_BY_FNUMBER] Successfully retrieved user data for F-number: ${fnumber}`);
    
//     return res.status(200).json({
//       success: true,
//       message: 'User data retrieved successfully',
//       user: userData,
//       fnumber: fnumber
//     });

//   } catch (error) {
//     console.error('[GET_USER_BY_FNUMBER] Database error:', error.message);
    
//     return res.status(500).json({
//       success: false,
//       error: `Server error while retrieving user data: ${error.message}`,
//       fnumber: fnumber
//     });
//   }
// };

// // Export the function
// module.exports = {
//   // ... your existing exports
//   getUserByFnumber
// };

// //verify2fa

// const verify2FA = async (req, res) => {
//   const { token, code, fnumber: requestFnumber } = req.body;

//   if (!token) {
//     return res.status(400).json({ 
//       success: false, 
//       error: 'Token is required' 
//     });
//   }

//   try {
//     console.log("[2FA] Starting 2FA verification process");
//     if (code) {
//       console.log("[2FA] Verifying with code:", code);
//     } else {
//       console.log("[2FA] Checking 2FA status without code");
//     }
    
//     const authToken = await getAuthToken();
//     console.log('[2FA] Successfully obtained token for 2FA verification');
    
//     console.log('[2FA] Sending verification request to LDAP service');
//     const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
//       token,
//       code: code || ""
//     }, { 
//       headers: {
//         'Authorization': authToken,
//         'Content-Type': 'application/json'
//       },
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
//     });
    
//     console.log('[2FA] Verify response status:', verifyResponse.status);
//     console.log('[2FA] Verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
//     if (!verifyResponse.data || 
//         (verifyResponse.data.status_code !== '000' && 
//          verifyResponse.data.status_code !== '0' && 
//          verifyResponse.data.status_code !== 0)) {
//       console.error('[2FA] 2FA verification failed:', JSON.stringify(verifyResponse.data, null, 2));
      
//       const fnumber = verifyResponse.data.fnumber || 
//                      (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
//                      requestFnumber;
      
//       if (fnumber) {
//         await loginLogService.logFailedLogin(
//           fnumber, 
//           '2FA verification failed', 
//           req
//         );
//       }
      
//       return res.status(401).json({ 
//         success: false, 
//         error: verifyResponse.data?.status_message || '2FA verification failed',
//         data: verifyResponse.data 
//       });
//     }
    
//     console.log('[2FA] 2FA verification successful');
    
//     const fnumber = verifyResponse.data.fnumber || 
//                    (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
//                    requestFnumber;
                   
//     if (!fnumber) {
//       console.error('[2FA] No fnumber found in response or request');
//       return res.status(400).json({
//         success: false,
//         error: 'Unable to identify user. Missing F-number in response.',
//       });
//     }
    
//     console.log(`[2FA] User identified as: ${fnumber}`);

//     // Call the new getUserByFnumber API internally
//     console.log(`[2FA] Calling getUserByFnumber API for: ${fnumber}`);
    
//     try {
//       // Make internal API call to get user data
//       const userResponse = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/auth/get-user-by-fnumber`, {
//         fnumber: fnumber
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//           // Include any necessary authentication headers if needed for internal calls
//         }
//       });

//       if (!userResponse.data || !userResponse.data.success) {
//         console.error(`[2FA] Failed to get user data from getUserByFnumber API:`, userResponse.data);
        
//         await loginLogService.logFailedLogin(
//           fnumber, 
//           'User not found in system after 2FA verification', 
//           req
//         );
        
//         return res.status(404).json({
//           success: false,
//           error: userResponse.data?.error || 'User not found in system. Please contact administrator.',
//         });
//       }

//       const user = userResponse.data.user;
//       console.log(`[2FA] User data retrieved successfully from API:`, {
//         id: user.id,
//         email: user.email,
//         fnumber: user.fnumber,
//         name: user.name,
//         role: user.role,
//         department: user.department
//       });

//     } catch (apiError) {
//       console.error(`[2FA] Error calling getUserByFnumber API:`, apiError.message);
      
//       // If the internal API call fails, we still need to handle the error gracefully
//       await loginLogService.logFailedLogin(
//         fnumber, 
//         `Failed to retrieve user data: ${apiError.message}`, 
//         req
//       );
      
//       return res.status(500).json({
//         success: false,
//         error: 'Failed to retrieve user information. Please try again.',
//       });
//     }
    
//     // Generate session token using existing generateToken function
//     const sessionToken = generateToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role
//     });
    
//     // Store session in user_sessions table
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     await query(
//       'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
//       [user.id, sessionToken, expiresAt]
//     );
    
//     // Log successful login
//     let logInfo = { sessionId: null };
//     try {
//       logInfo = await loginLogService.logSuccessfulLogin(user, req);
//       console.log('[2FA] Login logged successfully');
//     } catch (logError) {
//       console.error('[2FA] Failed to log successful login:', logError.message);
//     }
    
//     // Update user's last login
//     try {
//       await query(
//         'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
//         [user.id]
//       );
//     } catch (updateError) {
//       console.error('[2FA] Failed to update last login time:', updateError.message);
//     }
    
//     console.log(`[2FA] Session token generated for user: ${fnumber}`);
//     console.log('[2FA] 2FA verification process complete, returning success response');
    
//     const userInfo = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       username: user.username,
//       department: user.department,
//       role: user.role
//     };
    
//     return res.status(200).json({
//       success: true,
//       message: '2FA verification successful - Login complete',
//       user: userInfo,
//       token: sessionToken,
//       sessionId: logInfo.sessionId,
//       verifyResponseData: verifyResponse.data 
//     });
    
//   } catch (err) {
//     console.error('[2FA] 2FA verification error:', err.message);
    
//     const fnumber = requestFnumber;
//     if (fnumber) {
//       await loginLogService.logFailedLogin(
//         fnumber, 
//         `2FA system error: ${err.message}`, 
//         req
//       );
//     }
    
//     if (err.response) {
//       console.error('[2FA] Error response status:', err.response.status);
//       console.error('[2FA] Error response data:', JSON.stringify(err.response.data, null, 2));
//     }
    
//     return res.status(500).json({ 
//       success: false, 
//       error: `Server error during 2FA verification: ${err.message}` 
//     });
//   }
// };

// //updated route

// const express = require('express');
// const router = express.Router();
// const {
//   loginUser,
//   logoutUser,
//   getUserProfile,
//   getAllUsers,
//   createUser,
//   updateUser,
//   updateUserPassword,
//   deleteUser,
//   getLoginLogs,
//   getSuspiciousActivities,
//   // LDAP APIs
//   authenticateLdapUser,
//   verify2FA,
//   track2FAStatus,
//   verifyFnumber,
//   // NEW API
//   getUserByFnumber
// } = require('../controllers/authController');
// const { authenticateToken, requireAdmin } = require('../middleware/auth');
// const LoginLogService = require('../controllers/LoginLogService');
// const { query } = require('../db');

// // Initialize login log service
// const db = { query };
// const loginLogService = new LoginLogService(db);

// // ==========================================
// // PUBLIC ROUTES (No authentication required)
// // ==========================================

// // Traditional login route (now handles both email and F-number login)
// router.post('/login', loginUser);

// // Registration route for testing
// router.post('/register', createUser);

// // ==========================================
// // PUBLIC LDAP/2FA ROUTES (Login flow)
// // ==========================================

// // LDAP Authentication - First step of LDAP login
// router.post('/ldap/authenticate', authenticateLdapUser);

// // 2FA Verification - Second step of LDAP login (public route)
// router.post('/verify-2fa', verify2FA);

// // Track 2FA Status - Check verification status (public route)
// router.post('/track-2fa-status', track2FAStatus);

// // NEW API: Get user by F-number (internal/public - used by verify2FA)
// // This can be public since it requires valid F-number and doesn't expose sensitive data
// router.post('/get-user-by-fnumber', getUserByFnumber);

// // ==========================================
// // PROTECTED ROUTES (Authentication required)
// // ==========================================

// // User session management
// router.post('/logout', authenticateToken, logoutUser);
// router.get('/profile', authenticateToken, getUserProfile);

// // ==========================================
// // ADMIN-ONLY ROUTES - User Management
// // ==========================================

// // User CRUD operations
// router.get('/users', authenticateToken, requireAdmin, getAllUsers);
// router.post('/users', authenticateToken, requireAdmin, createUser);
// router.put('/users/:id', authenticateToken, requireAdmin, updateUser);
// router.patch('/users/:id/password', authenticateToken, requireAdmin, updateUserPassword);
// router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

// // ==========================================
// // ADMIN-ONLY ROUTES - LDAP Management
// // ==========================================

// // F-number verification (admin-only for user management screen)
// router.post('/ldap/verify-fnumber', authenticateToken, requireAdmin, verifyFnumber);

// // ==========================================
// // ADMIN-ONLY ROUTES - Login Monitoring
// // ==========================================

// // Login logs and monitoring
// router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const {
//       user_id,
//       email,
//       login_status,
//       ip_address,
//       start_date,
//       end_date,
//       country,
//       device_type,
//       page = 1,
//       limit = 50
//     } = req.query;

//     const filters = {
//       user_id,
//       email,
//       login_status,
//       ip_address,
//       start_date,
//       end_date,
//       country,
//       device_type,
//       limit: parseInt(limit),
//       offset: (parseInt(page) - 1) * parseInt(limit)
//     };

//     // Remove undefined values
//     Object.keys(filters).forEach(key => {
//       if (filters[key] === undefined || filters[key] === '') {
//         delete filters[key];
//       }
//     });

//     const logs = await loginLogService.getLoginLogs(filters);
//     const stats = await loginLogService.getLoginStats({
//       start_date,
//       end_date
//     });

//     res.json({
//       success: true,
//       data: logs,
//       stats,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit)
//       }
//     });

//   } catch (error) {
//     console.error('Get login logs error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve login logs'
//     });
//   }
// });

// // Get login statistics (admin only)
// router.get('/logs/stats', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { start_date, end_date } = req.query;
    
//     const stats = await loginLogService.getLoginStats({
//       start_date,
//       end_date
//     });

//     res.json({
//       success: true,
//       data: stats
//     });

//   } catch (error) {
//     console.error('Get login stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve login statistics'
//     });
//   }
// });

// // Get suspicious activities (admin only)
// router.get('/logs/suspicious', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const activities = await loginLogService.getSuspiciousActivities();

//     res.json({
//       success: true,
//       data: activities
//     });

//   } catch (error) {
//     console.error('Get suspicious activities error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve suspicious activities'
//     });
//   }
// });

// // Export login logs to CSV (admin only)
// router.get('/logs/export', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const logs = await loginLogService.getLoginLogs(req.query);
    
//     // Convert to CSV format
//     const csv = convertToCSV(logs);
    
//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', `attachment; filename=login_logs_${new Date().toISOString().split('T')[0]}.csv`);
//     res.send(csv);
//   } catch (error) {
//     console.error('Export error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Export failed'
//     });
//   }
// });

// // Helper function to convert JSON to CSV
// function convertToCSV(data) {
//   if (!data || data.length === 0) return '';
  
//   const headers = [
//     'ID', 'User ID', 'Email', 'User Name', 'Username', 'Role', 'Department',
//     'Login Status', 'IP Address', 'User Agent', 'Login Time', 'Logout Time', 
//     'Session Duration', 'Failure Reason'
//   ];
  
//   const csvRows = [headers.join(',')];
  
//   data.forEach(row => {
//     const values = [
//       row.id,
//       row.user_id || '',
//       `"${row.email}"`,
//       `"${row.user_name || ''}"`,
//       `"${row.username || ''}"`,
//       `"${row.role || ''}"`,
//       `"${row.department || ''}"`,
//       row.login_status,
//       row.ip_address,
//       `"${row.user_agent || ''}"`,
//       row.login_timestamp,
//       row.logout_timestamp || '',
//       row.session_duration || '',
//       `"${row.failure_reason || ''}"`
//     ];
//     csvRows.push(values.join(','));
//   });
  
//   return csvRows.join('\n');
// }

// module.exports = router;

// //auth context
// // Add this method to your AuthContext.js (inside the AuthProvider component)

// /**
//  * Get user data by F-number
//  * @param {string} fnumber - F-number to query (e.g., f8877557)
//  * @returns {Promise<Object>} User data response
//  */
// const getUserByFnumber = async (fnumber) => {
//   try {
//     if (!fnumber) {
//       throw new Error('F-number is required');
//     }

//     // Validate F-number format
//     if (!/^f\d{7}$/i.test(fnumber)) {
//       throw new Error('Invalid F-number format. Expected format: f1234567');
//     }

//     console.log('[AUTH_CONTEXT] Getting user data for F-number:', fnumber);

//     const response = await apiRequest('/api/auth/get-user-by-fnumber', {
//       method: 'POST',
//       body: JSON.stringify({ fnumber }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Failed to get user data');
//     }

//     const data = await response.json();
//     console.log('[AUTH_CONTEXT] User data retrieved successfully:', data.success);
    
//     return data;
//   } catch (error) {
//     console.error('Get user by F-number error:', error);
//     throw error;
//   }
// };

// // Also update the return statement in your AuthProvider to include the new method:

// return (
//   <AuthContext.Provider 
//     value={{
//       // Auth state
//       user,
//       token,
//       sessionId,
//       loading,
      
//       // LDAP/2FA state
//       twoFASessionId,
//       pendingLdapAuth,
      
//       // Auth methods
//       login,
//       logout,
//       isAdmin,
//       hasRole,
//       apiRequest,
//       isFnumber,
      
//       // LDAP/2FA methods
//       authenticateLdap,
//       verify2FA,
//       track2FAStatus,
//       verifyFnumber,
//       getUserByFnumber, // NEW METHOD
      
//       // Login Logs methods
//       getLoginLogs,
//       getLoginStats,
//       getSuspiciousActivities,
//       exportLoginLogs,
//       downloadLoginLogsCSV,
      
//       // User Management methods
//       getAllUsers,
//       createUser,
//       updateUser,
//       updateUserPassword,
//       deleteUser,
      
//       // Constants
//       ROLES,
//       DEPARTMENTS,
//     }}
//   >
//     {children}
//   </AuthContext.Provider>
// );






// //auth controller
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// const { query, getClient } = require('../db');
// const { generateToken, isAdmin } = require('../middleware/auth'); // Import isAdmin from middleware
// const LoginLogService = require('../controllers/LoginLogService');

// const SALT_ROUNDS = 10;
// const VALID_ROLES = [
//   'HEAD_OF_FINANCE', 'CFO', 'CEO', 'PC', 'EXCO', 'TAX_MANAGER',
//   'COST_CONTROL', 'APPROVAL_USER_1', 'APPROVAL_USER_2', 
//   'PAYMENT_USER', 'DEPARTMENT_USER'
// ];

// const VALID_DEPARTMENTS = [
//   'FINANCE', 'IT', 'HR', 'OPERATIONS', 'GLOBALMARKET', 
//   'MARKETTING', 'LEGAL', 'COMPLIANCE', 'EXCOBERS', 'TAX', 'COST_CONTROL'
// ];

// // LDAP Configuration
// const JWT_SECRET = 'your-secret-key-should-be-in-env-file';
// const LDAP_AUTH_URL = "https://172.29.18.126/adproxyservice/prod/ldap/authenticate";
// const LDAP_VERIFY_2FA_URL = "https://172.29.18.126/adproxyservice/prod/ldap/verify2fa";
// const TOKEN_URL = 'https://172.29.18.126/adproxyservice/prod/client/renew-token';
// const CLIENT_ID = "f1fb6909-d015-47e1-ad61-93708e570396";

// // Initialize login log service
// const db = { query }; // Wrap query function for service compatibility
// const loginLogService = new LoginLogService(db);

// const getAuthToken = async () => {
//   try {
//     console.log('Requesting token from:', TOKEN_URL);
    
//     const tokenResponse = await axios.post(TOKEN_URL, {
//       clientId: CLIENT_ID,
//       duration: 300
//     }, { 
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
//     });

//     console.log('Token response status:', tokenResponse.status);
    
//     if (!tokenResponse.data || tokenResponse.data.statusCode !== 0 || !tokenResponse.data.data || !tokenResponse.data.data.token) {
//       console.error('Invalid token response:', tokenResponse.data);
//       throw new Error(`Failed to obtain authorization token: ${
//         tokenResponse.data && tokenResponse.data.statusMessage 
//           ? tokenResponse.data.statusMessage 
//           : 'Unknown error'
//       }`);
//     }

//     const rawToken = tokenResponse.data.data.token;
//     return `Bearer ${rawToken}`;
//   } catch (err) {
//     console.error('Error getting auth token:', err.message);
//     if (err.response) {
//       console.error('Error response status:', err.response.status);
//       console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
//     }
//     throw err;
//   }
// };

// // Helper function to detect if login is f-number format
// const isFnumberFormat = (identifier) => {
//   return /^f\d+$/i.test(identifier);
// };

// // NEW: Verify F-number function from LDAP system
// const verifyFnumber = async (req, res) => {
//   const { fnumber } = req.body;

//   if (!fnumber) {
//     return res.status(400).json({ error: 'F-number is required' });
//   }

//   try {
//     const createTokenUrl = TOKEN_URL;
//     console.log('Requesting token from:', createTokenUrl);
    
//     const tokenResponse = await axios.post(createTokenUrl, {
//       clientId: CLIENT_ID,
//       duration: 300
//     }, { 
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
//     });

//     console.log('Token response status:', tokenResponse.status);
//     console.log('Token response data:', JSON.stringify(tokenResponse.data, null, 2));

//     if (!tokenResponse.data || tokenResponse.data.statusCode !== 0 || !tokenResponse.data.data || !tokenResponse.data.data.token) {
//       console.error('Invalid token response:', tokenResponse.data);
//       return res.status(400).json({ 
//         isValid: false, 
//         error: `Failed to obtain authorization token: ${
//           tokenResponse.data && tokenResponse.data.statusMessage 
//             ? tokenResponse.data.statusMessage 
//             : 'Unknown error'
//         }` 
//       });
//     }

//     const rawToken = tokenResponse.data.data.token;
//     const authToken = `Bearer ${rawToken}`;
//     console.log('Successfully obtained token');

//     const searchApiUrl = 'https://172.29.18.126/adproxyservice/prod/ldap/search';
//     console.log('Searching for user at:', searchApiUrl);
    
//     const requestConfig = {
//       url: searchApiUrl,
//       method: 'post',
//       data: { fnumber: fnumber },
//       headers: {
//         'Authorization': authToken,
//         'Content-Type': 'application/json'
//       },
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false })
//     };
    
//     console.log('Request configuration:', JSON.stringify({
//       url: requestConfig.url,
//       method: requestConfig.method,
//       headers: requestConfig.headers,
//       data: requestConfig.data
//     }, null, 2));
    
//     const response = await axios(requestConfig);
    
//     console.log('Search response status:', response.status);
//     console.log('Search response data:', JSON.stringify(response.data, null, 2));

//     if (response.data.statusCode !== 0) {
//       return res.status(400).json({ 
//         isValid: false, 
//         error: `Search API error: ${response.data.statusMessage}` 
//       });
//     }

//     return res.status(200).json({
//       isValid: true,
//       userData: {
//         name: response.data.data.name,
//         email: response.data.data.email,
//         title: response.data.data.title,
//         memberOf: response.data.data.memberOf
//       }
//     });

//   } catch (err) {
//     console.error('F-number verification error details:', err.message);
    
//     if (err.response) {
//       console.error('Error response status:', err.response.status);
//       console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
//     }
    
//     return res.status(500).json({ 
//       isValid: false, 
//       error: `Server error during F-number verification: ${err.message}` 
//     });
//   }
// };

// // NEW: LDAP Authentication function
// const authenticateLdapUser = async (req, res) => {
//   const { fnumber, password } = req.body;

//   if (!fnumber || !password) {
//     return res.status(400).json({ 
//       success: false, 
//       error: 'F-number and password are required' 
//     });
//   }

//   try {
//     console.log(`[LDAP-AUTH] Authentication attempt for user: ${fnumber}`);
    
//     const authToken = await getAuthToken();
//     console.log('[LDAP-AUTH] Successfully obtained token for authentication');
    
//     console.log('[LDAP-AUTH] Sending authentication request to LDAP service');
//     const authResponse = await axios.post(LDAP_AUTH_URL, {
//       fnumber,
//       password
//     }, { 
//       headers: {
//         'Authorization': authToken,
//         'Content-Type': 'application/json'
//       },
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
//     });
    
//     console.log('[LDAP-AUTH] Auth response status:', authResponse.status);
    
//     // Check for invalid credentials scenarios
//     if (authResponse.data && 
//         (authResponse.data.status_code === '401' || 
//          authResponse.data.status_code === 401 ||
//          (authResponse.data.status_message && 
//           authResponse.data.status_message.toLowerCase().includes('invalid credentials')))) {
//       console.log('[LDAP-AUTH] Invalid credentials for user:', fnumber);
      
//       await loginLogService.logFailedLogin(
//         fnumber, 
//         'Invalid LDAP credentials', 
//         req
//       );
      
//       return res.status(401).json({ 
//         success: false, 
//         error: 'Invalid credentials. Please check your F-number and password.' 
//       });
//     }
    
//     // Check for any other error conditions
//     if (!authResponse.data || 
//         (authResponse.data.status_code !== '000' && 
//          authResponse.data.status_code !== '0' && 
//          authResponse.data.status_code !== 0)) {
//       console.error('[LDAP-AUTH] Authentication failed:', JSON.stringify(authResponse.data, null, 2));
      
//       await loginLogService.logFailedLogin(
//         fnumber, 
//         `LDAP authentication failed: ${authResponse.data?.status_message}`, 
//         req
//       );
      
//       return res.status(401).json({ 
//         success: false, 
//         error: authResponse.data?.status_message || 'Authentication failed. Please try again.' 
//       });
//     }
    
//     // Check if we have a valid token in the response
//     if (!authResponse.data.token) {
//       console.error('[LDAP-AUTH] Authentication response missing token');
//       return res.status(500).json({ 
//         success: false, 
//         error: 'Authentication system error. Please try again later.' 
//       });
//     }
    
//     console.log('[LDAP-AUTH] Authentication successful for user:', fnumber);
//     console.log('[LDAP-AUTH] Returning token for 2FA verification');
    
//     return res.status(200).json({
//       success: true,
//       message: 'Authentication successful, proceed with 2FA verification',
//       token: authResponse.data.token, 
//       data: authResponse.data,
//       requiresTwoFA: true
//     });
    
//   } catch (err) {
//     console.error('[LDAP-AUTH] Authentication error:', err.message);
    
//     await loginLogService.logFailedLogin(
//       fnumber, 
//       `LDAP system error: ${err.message}`, 
//       req
//     );
    
//     if (err.response && err.response.data) {
//       const errorData = err.response.data;
      
//       if (errorData.status_code === 401 || 
//           (errorData.status_message && 
//            errorData.status_message.toLowerCase().includes('invalid')) ||
//           (errorData.error && 
//            errorData.error.toLowerCase().includes('credentials'))) {
        
//         console.log('[LDAP-AUTH] Server reported invalid credentials');
//         return res.status(401).json({ 
//           success: false, 
//           error: 'Invalid credentials. Please check your F-number and password.' 
//         });
//       }
      
//       console.error('[LDAP-AUTH] Error response status:', err.response.status);
//       console.error('[LDAP-AUTH] Error response data:', JSON.stringify(err.response.data, null, 2));
//     }
    
//     return res.status(500).json({ 
//       success: false, 
//       error: `Authentication failed. Please try again later.` 
//     });
//   }
// };


// const verify2FA = async (req, res) => {
//   const { token, code, fnumber: requestFnumber } = req.body;

//   if (!token) {
//     return res.status(400).json({ 
//       success: false, 
//       error: 'Token is required' 
//     });
//   }

//   try {
//     console.log("[2FA] Starting 2FA verification process");
//     if (code) {
//       console.log("[2FA] Verifying with code:", code);
//     } else {
//       console.log("[2FA] Checking 2FA status without code");
//     }
    
//     const authToken = await getAuthToken();
//     console.log('[2FA] Successfully obtained token for 2FA verification');
    
//     console.log('[2FA] Sending verification request to LDAP service');
//     const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
//       token,
//       code: code || ""
//     }, { 
//       headers: {
//         'Authorization': authToken,
//         'Content-Type': 'application/json'
//       },
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
//     });
    
//     console.log('[2FA] Verify response status:', verifyResponse.status);
//     console.log('[2FA] Verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
//     if (!verifyResponse.data || 
//         (verifyResponse.data.status_code !== '000' && 
//          verifyResponse.data.status_code !== '0' && 
//          verifyResponse.data.status_code !== 0)) {
//       console.error('[2FA] 2FA verification failed:', JSON.stringify(verifyResponse.data, null, 2));
      
//       const fnumber = verifyResponse.data.fnumber || 
//                      (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
//                      requestFnumber;
      
//       if (fnumber) {
//         await loginLogService.logFailedLogin(
//           fnumber, 
//           '2FA verification failed', 
//           req
//         );
//       }
      
//       return res.status(401).json({ 
//         success: false, 
//         error: verifyResponse.data?.status_message || '2FA verification failed',
//         data: verifyResponse.data 
//       });
//     }
    
//     console.log('[2FA] 2FA verification successful');
    
//     const fnumber = verifyResponse.data.fnumber || 
//                    (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
//                    requestFnumber;
                   
//     if (!fnumber) {
//       console.error('[2FA] No fnumber found in response or request');
//       return res.status(400).json({
//         success: false,
//         error: 'Unable to identify user. Missing F-number in response.',
//       });
//     }
    
//     console.log(`[2FA] User identified as: ${fnumber}`);

//     // Call the new getUserByFnumber API internally
//     console.log(`[2FA] Calling getUserByFnumber API for: ${fnumber}`);
    
//     try {
//       // Make internal API call to get user data
//       const userResponse = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/auth/get-user-by-fnumber`, {
//         fnumber: fnumber
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//           // Include any necessary authentication headers if needed for internal calls
//         }
//       });

//       if (!userResponse.data || !userResponse.data.success) {
//         console.error(`[2FA] Failed to get user data from getUserByFnumber API:`, userResponse.data);
        
//         await loginLogService.logFailedLogin(
//           fnumber, 
//           'User not found in system after 2FA verification', 
//           req
//         );
        
//         return res.status(404).json({
//           success: false,
//           error: userResponse.data?.error || 'User not found in system. Please contact administrator.',
//         });
//       }

//       const user = userResponse.data.user;
//       console.log(`[2FA] User data retrieved successfully from API:`, {
//         id: user.id,
//         email: user.email,
//         fnumber: user.fnumber,
//         name: user.name,
//         role: user.role,
//         department: user.department
//       });

//     } catch (apiError) {
//       console.error(`[2FA] Error calling getUserByFnumber API:`, apiError.message);
      
//       // If the internal API call fails, we still need to handle the error gracefully
//       await loginLogService.logFailedLogin(
//         fnumber, 
//         `Failed to retrieve user data: ${apiError.message}`, 
//         req
//       );
      
//       return res.status(500).json({
//         success: false,
//         error: 'Failed to retrieve user information. Please try again.',
//       });
//     }
    
//     // Generate session token using existing generateToken function
//     const sessionToken = generateToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role
//     });
    
//     // Store session in user_sessions table
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     await query(
//       'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
//       [user.id, sessionToken, expiresAt]
//     );
    
//     // Log successful login
//     let logInfo = { sessionId: null };
//     try {
//       logInfo = await loginLogService.logSuccessfulLogin(user, req);
//       console.log('[2FA] Login logged successfully');
//     } catch (logError) {
//       console.error('[2FA] Failed to log successful login:', logError.message);
//     }
    
//     // Update user's last login
//     try {
//       await query(
//         'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
//         [user.id]
//       );
//     } catch (updateError) {
//       console.error('[2FA] Failed to update last login time:', updateError.message);
//     }
    
//     console.log(`[2FA] Session token generated for user: ${fnumber}`);
//     console.log('[2FA] 2FA verification process complete, returning success response');
    
//     const userInfo = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       username: user.username,
//       department: user.department,
//       role: user.role
//     };
    
//     return res.status(200).json({
//       success: true,
//       message: '2FA verification successful - Login complete',
//       user: userInfo,
//       token: sessionToken,
//       sessionId: logInfo.sessionId,
//       verifyResponseData: verifyResponse.data 
//     });
    
//   } catch (err) {
//     console.error('[2FA] 2FA verification error:', err.message);
    
//     const fnumber = requestFnumber;
//     if (fnumber) {
//       await loginLogService.logFailedLogin(
//         fnumber, 
//         `2FA system error: ${err.message}`, 
//         req
//       );
//     }
    
//     if (err.response) {
//       console.error('[2FA] Error response status:', err.response.status);
//       console.error('[2FA] Error response data:', JSON.stringify(err.response.data, null, 2));
//     }
    
//     return res.status(500).json({ 
//       success: false, 
//       error: `Server error during 2FA verification: ${err.message}` 
//     });
//   }
// };
// /**
//  * Get user data by F-number
//  * This function queries the users table to find a user by their F-number
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const getUserByFnumber = async (req, res) => {
//   const { fnumber } = req.body;

//   // Validate input
//   if (!fnumber) {
//     return res.status(400).json({
//       success: false,
//       error: 'F-number is required'
//     });
//   }

//   // Validate F-number format (f followed by 7 digits)
//   const fnumberRegex = /^f\d{7}$/i;
//   if (!fnumberRegex.test(fnumber)) {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid F-number format. Expected format: f1234567'
//     });
//   }

//   try {
//     console.log(`[GET_USER_BY_FNUMBER] Querying user data for F-number: ${fnumber}`);

//     // Query users table to get user info using f-number
//     // For F-number users, both email and fnumber columns contain the same f-number (format: f8877557)
//     const userResult = await query(`
//       SELECT 
//         id, 
//         name, 
//         email, 
//         username, 
//         department, 
//         role, 
//         status, 
//         is_active, 
//         last_login, 
//         created_at, 
//         updated_at, 
//         is_fnumber_user, 
//         fnumber
//       FROM users 
//       WHERE is_fnumber_user = true 
//       AND is_active = true
//       AND (LOWER(email) = LOWER($1) OR LOWER(fnumber) = LOWER($1))
//     `, [fnumber]);

//     console.log(`[GET_USER_BY_FNUMBER] Query result count: ${userResult.rows.length}`);

//     if (userResult.rows.length === 0) {
//       console.log(`[GET_USER_BY_FNUMBER] F-number user ${fnumber} not found in users table`);
      
//       // Debug: Let's see what F-number users exist with similar patterns
//       try {
//         const debugResult = await query(`
//           SELECT id, email, fnumber, is_fnumber_user 
//           FROM users 
//           WHERE is_fnumber_user = true 
//           AND is_active = true 
//           AND (email ILIKE $1 OR fnumber ILIKE $1)
//           LIMIT 5
//         `, [`%${fnumber.replace('f', '')}%`]);
        
//         console.log(`[GET_USER_BY_FNUMBER] Debug - F-number users found with similar patterns:`, debugResult.rows);
//       } catch (debugError) {
//         console.error(`[GET_USER_BY_FNUMBER] Debug query failed:`, debugError);
//       }
      
//       return res.status(404).json({
//         success: false,
//         error: 'F-number user not found in system. Please contact administrator.',
//         fnumber: fnumber
//       });
//     }

//     const user = userResult.rows[0];
//     console.log(`[GET_USER_BY_FNUMBER] F-number user found in database:`, {
//       id: user.id,
//       email: user.email,
//       fnumber: user.fnumber,
//       name: user.name,
//       role: user.role,
//       department: user.department,
//       is_fnumber_user: user.is_fnumber_user
//     });

//     // Verify this is indeed an F-number user
//     if (!user.is_fnumber_user) {
//       console.error(`[GET_USER_BY_FNUMBER] User found but is_fnumber_user is false for ${fnumber}`);
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid user type for F-number authentication.',
//         fnumber: fnumber
//       });
//     }

//     // Check if user is active
//     if (!user.is_active) {
//       console.error(`[GET_USER_BY_FNUMBER] User found but is not active for ${fnumber}`);
//       return res.status(403).json({
//         success: false,
//         error: 'User account is not active. Please contact administrator.',
//         fnumber: fnumber
//       });
//     }

//     // Return user data (exclude sensitive information)
//     const userData = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       username: user.username,
//       department: user.department,
//       role: user.role,
//       status: user.status,
//       is_active: user.is_active,
//       last_login: user.last_login,
//       created_at: user.created_at,
//       updated_at: user.updated_at,
//       is_fnumber_user: user.is_fnumber_user,
//       fnumber: user.fnumber
//     };

//     console.log(`[GET_USER_BY_FNUMBER] Successfully retrieved user data for F-number: ${fnumber}`);
    
//     return res.status(200).json({
//       success: true,
//       message: 'User data retrieved successfully',
//       user: userData,
//       fnumber: fnumber
//     });

//   } catch (error) {
//     console.error('[GET_USER_BY_FNUMBER] Database error:', error.message);
    
//     return res.status(500).json({
//       success: false,
//       error: `Server error while retrieving user data: ${error.message}`,
//       fnumber: fnumber
//     });
//   }
// };


// const track2FAStatus = async (req, res) => {
//   // Accept both 'token' and 'twoFASessionId' for compatibility
//   const { token, twoFASessionId, fnumber } = req.body;
  
//   // Use whichever is provided
//   const sessionToken = token || twoFASessionId;

//   if (!sessionToken) {
//     return res.status(400).json({
//       success: false,
//       error: 'Token is required'
//     });
//   }

//   try {
//     console.log("[TRACK] Checking 2FA verification status for token:",
//       sessionToken.substring(0, 10) + "..." + sessionToken.substring(sessionToken.length - 10));

//     const authToken = await getAuthToken();
//     console.log('[TRACK] Successfully obtained token for status tracking');

//     console.log('[TRACK] Sending status check to LDAP service');
//     const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
//       token: sessionToken,
//       code: ""
//     }, {
//       headers: {
//         'Authorization': authToken,
//         'Content-Type': 'application/json'
//       },
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false })
//     });

//     console.log('[TRACK] Status response code:', verifyResponse.status);

//     const statusCode = verifyResponse.data.status_code;
//     const statusMessage = verifyResponse.data.status_message;
//     const dataStatus = verifyResponse.data.data?.status;

//     console.log(`[TRACK] Status code: ${statusCode}, Message: ${statusMessage}, Data status: ${dataStatus}`);

//     let verificationStatus = "pending";

//     if (statusCode === "000" || statusCode === "0" || statusCode === 0) {
//       verificationStatus = "success";
//     }
//     else if (statusCode !== "002" && statusMessage?.toLowerCase() !== "pending authentication") {
//       verificationStatus = "failed";
//     }

//     const responseFnumber = verifyResponse.data.data?.fnumber || fnumber;

//     return res.status(200).json({
//       success: true,
//       statusCode,
//       statusMessage,
//       dataStatus,
//       verificationStatus,
//       fnumber: responseFnumber
//     });

//   } catch (err) {
//     console.error('[TRACK] Status tracking error:', err.message);

//     if (err.response) {
//       console.error('[TRACK] Error response status:', err.response.status);
//       console.error('[TRACK] Error response data:', JSON.stringify(err.response.data, null, 2));
//     }

//     return res.status(500).json({
//       success: false,
//       error: `Server error during status tracking: ${err.message}`
//     });
//   }
// };



// // UPDATED: Hybrid Login User function (supports both email/password and f-number/password)
// const loginUser = async (req, res) => {
//   let identifier = 'unknown';
  
//   try {
//     const { email, password } = req.body;
//     identifier = email;
    
//     console.log('=== HYBRID LOGIN ATTEMPT DEBUG ===');
//     console.log('Identifier:', identifier);
//     console.log('Password provided:', !!password);
//     console.log('Password length:', password?.length);

//     // Basic validation
//     if (!identifier || !password) {
//       console.log('❌ Missing identifier or password');
//       await loginLogService.logFailedLogin(
//         identifier || 'unknown', 
//         'Missing identifier or password', 
//         req
//       );
//       return res.status(400).json({
//         success: false,
//         message: 'Email/F-number and password are required'
//       });
//     }

//     // Determine if this is f-number or email login
//     const isLdapLogin = isFnumberFormat(identifier);
//     console.log('Login type detected:', isLdapLogin ? 'LDAP (F-number)' : 'Traditional (Email)');

//     if (isLdapLogin) {
//       // Route to LDAP authentication
//       console.log('🔄 Routing to LDAP authentication...');
//       req.body.fnumber = identifier;
//       return await authenticateLdapUser(req, res);
//     }

//     // Continue with traditional email/password authentication
//     console.log('🔄 Processing traditional email/password authentication...');
    
//     const userResult = await query(
//       'SELECT * FROM users WHERE email = $1 AND is_active = true',
//       [identifier]
//     );

//     console.log('Database query result:', {
//       rowCount: userResult.rows.length,
//       userFound: userResult.rows.length > 0
//     });

//     if (userResult.rows.length === 0) {
//       console.log('❌ No user found with email:', identifier);
//       await loginLogService.logFailedLogin(
//         identifier, 
//         'User not found', 
//         req
//       );
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     const user = userResult.rows[0];
//     console.log('✅ User found:');
//     console.log('- ID:', user.id);
//     console.log('- Email:', user.email);
//     console.log('- Role:', user.role);
//     console.log('- Has password hash:', !!user.password);

//     // Check if user is active
//     if (user.status && user.status !== 'active') {
//       await loginLogService.logFailedLogin(
//         identifier, 
//         `User account is ${user.status}`, 
//         req
//       );
//       return res.status(401).json({
//         success: false,
//         message: 'Account is not active'
//       });
//     }

//     console.log('🔍 Attempting password comparison...');
    
//     try {
//       const passwordMatch = await bcrypt.compare(password, user.password);
//       console.log('🔐 Password comparison result:', passwordMatch);
      
//       if (!passwordMatch) {
//         console.log('❌ Password mismatch for user:', identifier);
        
//         await loginLogService.logFailedLogin(
//           identifier, 
//           'Invalid password', 
//           req
//         );
        
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid credentials'
//         });
//       }
      
//       console.log('✅ Password match successful!');
//     } catch (bcryptError) {
//       console.log('❌ bcrypt.compare error:', bcryptError.message);
//       await loginLogService.logFailedLogin(
//         identifier, 
//         `bcrypt error: ${bcryptError.message}`, 
//         req
//       );
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     console.log('✅ Traditional login successful for user:', identifier);

//     // Generate token and continue with normal login flow
//     const token = generateToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role
//     });

//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     await query(
//       'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
//       [user.id, token, expiresAt]
//     );

//     // Log successful login
//     let logInfo = { sessionId: null };
//     try {
//       logInfo = await loginLogService.logSuccessfulLogin(user, req);
//       console.log('✅ Login logged successfully');
//     } catch (logError) {
//       console.error('⚠️ Failed to log successful login, but continuing:', logError.message);
//     }

//     // Update user's last login
//     try {
//       await query(
//         'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
//         [user.id]
//       );
//     } catch (updateError) {
//       console.error('⚠️ Failed to update last login time:', updateError.message);
//     }

//     const userInfo = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       username: user.username,
//       department: user.department,
//       role: user.role
//     };

//     console.log('✅ Sending successful login response');
//     console.log('=== END HYBRID LOGIN DEBUG ===');

//     res.json({
//       success: true,
//       message: 'Login successful',
//       user: userInfo,
//       token,
//       sessionId: logInfo.sessionId
//     });

//   } catch (error) {
//     console.error('❌ Login error:', error);
    
//     try {
//       await loginLogService.logFailedLogin(
//         identifier || 'unknown',
//         `System error: ${error.message}`, 
//         req
//       );
//     } catch (logError) {
//       console.error('Failed to log system error:', logError);
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Login failed'
//     });
//   }
// };

// // Logout user with enhanced logging
// const logoutUser = async (req, res) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     const sessionId = req.headers['x-session-id'] || req.body.sessionId;

//     if (token) {
//       await query('DELETE FROM user_sessions WHERE token = $1', [token]);
//     }

//     // Log logout if session ID is available
//     if (sessionId) {
//       await loginLogService.logLogout(sessionId);
//     }

//     res.json({
//       success: true,
//       message: 'Logout successful'
//     });

//   } catch (error) {
//     console.error('Logout error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Logout failed'
//     });
//   }
// };

// const getUserProfile = async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       user: req.user
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get user profile'
//     });
//   }
// };

// const getAllUsers = async (req, res) => {
//   try {
//     const { page = 1, limit = 50, search = '' } = req.query;
//     const offset = (page - 1) * limit;

//     let whereClause = 'WHERE is_active = true';
//     let queryParams = [];
//     let paramIndex = 1;

//     if (search) {
//       whereClause += ` AND (
//         name ILIKE $${paramIndex} OR 
//         email ILIKE $${paramIndex} OR 
//         username ILIKE $${paramIndex} OR 
//         department ILIKE $${paramIndex} OR 
//         role ILIKE $${paramIndex}
//       )`;
//       queryParams.push(`%${search}%`);
//       paramIndex++;
//     }

//     // Get total count
//     const countResult = await query(
//       `SELECT COUNT(*) FROM users ${whereClause}`,
//       queryParams
//     );
//     const totalUsers = parseInt(countResult.rows[0].count);

//     // Get users with pagination
//     const usersResult = await query(
//       `SELECT id, name, email, username, department, role, created_at, updated_at
//        FROM users ${whereClause}
//        ORDER BY created_at DESC
//        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
//       [...queryParams, limit, offset]
//     );

//     res.json({
//       success: true,
//       users: usersResult.rows,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: totalUsers,
//         pages: Math.ceil(totalUsers / limit)
//       }
//     });

//   } catch (error) {
//     console.error('Get users error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get users'
//     });
//   }
// };

// // no special query
// const createUser = async (req, res) => {
//   console.log('=== CREATE USER DEBUG ===');
//   console.log('Request body:', req.body);
  
//   try {
//     const { 
//       name, 
//       email, 
//       username, 
//       password, 
//       department, 
//       role, 
//       isFnumberUser, 
//       fnumber,
//       ldapData 
//     } = req.body;

//     // Validation - password is not required for F-number users
//     if (!name || !email || !username || !department || !role) {
//       console.log('❌ Missing required fields');
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       });
//     }

//     // Password validation: required only for non-F-number users
//     if (!isFnumberUser && (!password || password.trim() === '')) {
//       console.log('❌ Password required for non-F-number users');
//       return res.status(400).json({
//         success: false,
//         message: 'Password is required for non-F-number users'
//       });
//     }

//     if (!VALID_ROLES.includes(role)) {
//       console.log('❌ Invalid role:', role);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid role'
//       });
//     }

//     if (!VALID_DEPARTMENTS.includes(department)) {
//       console.log('❌ Invalid department:', department);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid department'
//       });
//     }

//     // Check ONLY if email already exists
//     console.log('🔍 Checking for existing email only...');
//     const existingUserResult = await query(
//       'SELECT id, email FROM users WHERE email = $1',
//       [email]
//     );

//     console.log('Existing email check result:', {
//       rowCount: existingUserResult.rows.length,
//       existingUsers: existingUserResult.rows
//     });

//     if (existingUserResult.rows.length > 0) {
//       const existingUser = existingUserResult.rows[0];
//       console.log('❌ Email already exists:', existingUser);
//       return res.status(409).json({
//         success: false,
//         message: `User already exists with email: ${email}`
//       });
//     }

//     let hashedPassword = null;
    
//     // Handle password based on user type
//     if (isFnumberUser) {
//       console.log('📋 Creating F-number user - no password stored (NULL)');
//       console.log('F-number details:', { fnumber, ldapData });
//       // F-number users don't need passwords - they authenticate via LDAP
//       hashedPassword = null;
      
//     } else {
//       console.log('🔐 Hashing password for regular user...');
//       hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
//       console.log('Password hashed successfully, length:', hashedPassword.length);
//     }

//     // Create user
//     console.log('✏️ Creating user in database...');
//     console.log(`ℹ️ User type: ${isFnumberUser ? 'F-number (LDAP)' : 'Regular'}`);
    
//     // Single query that works for both user types
//     const insertQuery = `INSERT INTO users (name, email, username, password, department, role, is_fnumber_user, fnumber)
//                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//                          RETURNING id, name, email, username, department, role, is_fnumber_user, fnumber, created_at`;

//     const insertValues = [
//       name, 
//       email, 
//       username, 
//       hashedPassword, // null for F-number users, hashed password for regular users
//       department, 
//       role, 
//       isFnumberUser || false, // true for F-number users, false for regular users
//       fnumber || null // fnumber for F-number users, null for regular users
//     ];

//     const newUserResult = await query(insertQuery, insertValues);

//     console.log('✅ User created successfully:', newUserResult.rows[0]);
//     console.log('=== END CREATE USER DEBUG ===');

//     res.status(201).json({
//       success: true,
//       message: `${isFnumberUser ? 'F-number' : 'Regular'} user created successfully`,
//       user: newUserResult.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Create user error:', error);
//     console.log('Error code:', error.code);
//     console.log('Error detail:', error.detail);
//     console.log('=== END CREATE USER DEBUG ===');
    
//     if (error.code === '23505') { // Unique violation
//       if (error.constraint && error.constraint.includes('email')) {
//         res.status(409).json({
//           success: false,
//           message: 'Email already exists'
//         });
//       } else if (error.constraint && error.constraint.includes('username')) {
//         console.log('⚠️ Username constraint still exists in database');
//         res.status(500).json({
//           success: false,
//           message: 'Database configuration error - username constraint should be removed'
//         });
//       } else {
//         res.status(409).json({
//           success: false,
//           message: 'User creation failed due to duplicate data'
//         });
//       }
//     } else {
//       res.status(500).json({
//         success: false,
//         message: 'Failed to create user: ' + error.message
//       });
//     }
//   }
// };
// // Updated updateUser function - Remove username uniqueness check
// const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, username, department, role } = req.body;

//     // Validation
//     if (!name || !email || !username || !department || !role) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       });
//     }

//     if (!VALID_ROLES.includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid role'
//       });
//     }

//     if (!VALID_DEPARTMENTS.includes(department)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid department'
//       });
//     }

//     // Check ONLY if email already exists for other users (REMOVED username checking)
//     const existingUserResult = await query(
//       'SELECT id FROM users WHERE email = $1 AND id != $2',
//       [email, id]
//     );

//     if (existingUserResult.rows.length > 0) {
//       return res.status(409).json({
//         success: false,
//         message: 'Email already exists'
//       });
//     }

//     // Update user - Username duplicates are allowed (including "Admin")
//     console.log(`ℹ️ Updating user with username "${username}" (duplicates permitted)`);
    
//     const updatedUserResult = await query(
//       `UPDATE users 
//        SET name = $1, email = $2, username = $3, department = $4, role = $5, updated_at = CURRENT_TIMESTAMP
//        WHERE id = $6 AND is_active = true
//        RETURNING id, name, email, username, department, role, updated_at`,
//       [name, email, username, department, role, id]
//     );

//     if (updatedUserResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'User updated successfully',
//       user: updatedUserResult.rows[0]
//     });

//   } catch (error) {
//     console.error('Update user error:', error);
    
//     if (error.code === '23505') { 
//       if (error.constraint && error.constraint.includes('email')) {
//         res.status(409).json({
//           success: false,
//           message: 'Email already exists'
//         });
//       } else if (error.constraint && error.constraint.includes('username')) {
//         console.log('⚠️ Username constraint still exists in database');
//         res.status(500).json({
//           success: false,
//           message: 'Database configuration error - username constraint should be removed'
//         });
//       } else {
//         res.status(409).json({
//           success: false,
//           message: 'User update failed due to duplicate data'
//         });
//       }
//     } else {
//       res.status(500).json({
//         success: false,
//         message: 'Failed to update user'
//       });
//     }
//   }
// };

// const updateUserPassword = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { password } = req.body;

//     if (!password || password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: 'Password must be at least 6 characters long'
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

//     const result = await query(
//       'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND is_active = true',
//       [hashedPassword, id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     await query('DELETE FROM user_sessions WHERE user_id = $1', [id]);

//     res.json({
//       success: true,
//       message: 'Password updated successfully'
//     });

//   } catch (error) {
//     console.error('Update password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update password'
//     });
//   }
// };

// // Delete user (admin only) - FIXED VERSION
// const deleteUser = async (req, res) => {
//   console.log('=== DELETE USER DEBUG ===');
//   const { id } = req.params;
//   console.log('Attempting to delete user with ID:', id);

//   try {
//     // First check if user exists
//     const userExists = await query('SELECT id, name, email FROM users WHERE id = $1', [id]);
//     console.log('User exists check:', {
//       found: userExists.rows.length > 0,
//       user: userExists.rows[0]
//     });

//     if (userExists.rows.length === 0) {
//       console.log('❌ User not found');
//       return res.status(404).json({ 
//         success: false,
//         message: 'User not found' 
//       });
//     }

//     // Delete user sessions first to maintain referential integrity
//     console.log('🗑️ Deleting user sessions...');
//     await query('DELETE FROM user_sessions WHERE user_id = $1', [id]);

//     // Delete the user - FIXED: Using correct query function
//     console.log('🗑️ Deleting user from database...');
//     const result = await query('DELETE FROM users WHERE id = $1', [id]);
    
//     console.log('Delete result:', {
//       rowCount: result.rowCount,
//       success: result.rowCount > 0
//     });

//     if (result.rowCount === 0) {
//       console.log('❌ No rows affected - user may not exist');
//       return res.status(404).json({ 
//         success: false,
//         message: 'User not found or could not be deleted' 
//       });
//     }

//     console.log('✅ User deleted successfully');
//     console.log('=== END DELETE USER DEBUG ===');

//     res.json({ 
//       success: true,
//       message: 'User deleted successfully' 
//     });

//   } catch (err) {
//     console.error('❌ User deletion error:', err);
//     console.log('Error code:', err.code);
//     console.log('Error detail:', err.detail);
//     console.log('=== END DELETE USER DEBUG ===');
    
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error during user deletion: ' + err.message 
//     });
//   }
// };

// // NEW: Get login logs (admin only)
// const getLoginLogs = async (req, res) => {
//   try {
//     // Check if user has admin privileges using the consistent function from middleware
//     if (!isAdmin(req.user)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied'
//       });
//     }

//     const {
//       user_id,
//       email,
//       login_status,
//       ip_address,
//       start_date,
//       end_date,
//       country,
//       device_type,
//       page = 1,
//       limit = 50
//     } = req.query;

//     const filters = {
//       user_id,
//       email,
//       login_status,
//       ip_address,
//       start_date,
//       end_date,
//       country,
//       device_type,
//       limit: parseInt(limit),
//       offset: (parseInt(page) - 1) * parseInt(limit)
//     };

//     // Remove undefined values
//     Object.keys(filters).forEach(key => {
//       if (filters[key] === undefined || filters[key] === '') {
//         delete filters[key];
//       }
//     });

//     const logs = await loginLogService.getLoginLogs(filters);
//     const stats = await loginLogService.getLoginStats({
//       start_date,
//       end_date
//     });

//     res.json({
//       success: true,
//       data: logs,
//       stats,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit)
//       }
//     });

//   } catch (error) {
//     console.error('Get login logs error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve login logs'
//     });
//   }
// };

// // NEW: Get suspicious activities (admin only)
// const getSuspiciousActivities = async (req, res) => {
//   try {
//     // Check if user has admin privileges using the consistent function from middleware
//     if (!isAdmin(req.user)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied'
//       });
//     }

//     const activities = await loginLogService.getSuspiciousActivities();

//     res.json({
//       success: true,
//       data: activities
//     });

//   } catch (error) {
//     console.error('Get suspicious activities error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve suspicious activities'
//     });
//   }
// };

// module.exports = {
//   loginUser,
//   logoutUser,
//   getUserProfile,
//   getAllUsers,
//   createUser,
//   updateUser,
//   updateUserPassword,
//   deleteUser,
//   getLoginLogs,
//   getSuspiciousActivities,
//   authenticateLdapUser,
//   track2FAStatus,
//   verify2FA,
//   verifyFnumber,
//   getUserByFnumber

// };


// const verify2FA = async (req, res) => {
//   const { token, code, fnumber: requestFnumber } = req.body;

//   if (!token) {
//     return res.status(400).json({ 
//       success: false, 
//       error: 'Token is required' 
//     });
//   }

//   try {
//     console.log("[2FA] Starting 2FA verification process");
//     if (code) {
//       console.log("[2FA] Verifying with code:", code);
//     } else {
//       console.log("[2FA] Checking 2FA status without code");
//     }
    
//     const authToken = await getAuthToken();
//     console.log('[2FA] Successfully obtained token for 2FA verification');
    
//     console.log('[2FA] Sending verification request to LDAP service');
//     const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
//       token,
//       code: code || ""
//     }, { 
//       headers: {
//         'Authorization': authToken,
//         'Content-Type': 'application/json'
//       },
//       httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
//     });
    
//     console.log('[2FA] Verify response status:', verifyResponse.status);
//     console.log('[2FA] Verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
//     if (!verifyResponse.data || 
//         (verifyResponse.data.status_code !== '000' && 
//          verifyResponse.data.status_code !== '0' && 
//          verifyResponse.data.status_code !== 0)) {
//       console.error('[2FA] 2FA verification failed:', JSON.stringify(verifyResponse.data, null, 2));
      
//       const fnumber = verifyResponse.data.fnumber || 
//                      (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
//                      requestFnumber;
      
//       if (fnumber) {
//         await loginLogService.logFailedLogin(
//           fnumber, 
//           '2FA verification failed', 
//           req
//         );
//       }
      
//       return res.status(401).json({ 
//         success: false, 
//         error: verifyResponse.data?.status_message || '2FA verification failed',
//         data: verifyResponse.data 
//       });
//     }
    
//     console.log('[2FA] 2FA verification successful');
    
//     const fnumber = verifyResponse.data.fnumber || 
//                    (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
//                    requestFnumber;
                   
//     if (!fnumber) {
//       console.error('[2FA] No fnumber found in response or request');
//       return res.status(400).json({
//         success: false,
//         error: 'Unable to identify user. Missing F-number in response.',
//       });
//     }
    
//     console.log(`[2FA] User identified as: ${fnumber}`);

//     // Call getUserByFnumber logic directly instead of making HTTP request
//     console.log(`[2FA] Getting user data for: ${fnumber}`);
    
//     // Validate F-number format (f followed by 7 digits)
//     const fnumberRegex = /^f\d{7}$/i;
//     if (!fnumberRegex.test(fnumber)) {
//       await loginLogService.logFailedLogin(
//         fnumber, 
//         'Invalid F-number format', 
//         req
//       );
      
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid F-number format. Expected format: f1234567'
//       });
//     }

//     try {
//       // Query users table directly instead of making HTTP call
//       const userResult = await query(`
//         SELECT 
//           id, 
//           name, 
//           email, 
//           username, 
//           department, 
//           role, 
//           status, 
//           is_active, 
//           last_login, 
//           created_at, 
//           updated_at, 
//           is_fnumber_user, 
//           fnumber
//         FROM users 
//         WHERE is_fnumber_user = true 
//         AND is_active = true
//         AND (LOWER(email) = LOWER($1) OR LOWER(fnumber) = LOWER($1))
//       `, [fnumber]);

//       console.log(`[2FA] Query result count: ${userResult.rows.length}`);

//       if (userResult.rows.length === 0) {
//         console.log(`[2FA] F-number user ${fnumber} not found in users table`);
        
//         await loginLogService.logFailedLogin(
//           fnumber, 
//           'User not found in system after 2FA verification', 
//           req
//         );
        
//         return res.status(404).json({
//           success: false,
//           error: 'F-number user not found in system. Please contact administrator.',
//           fnumber: fnumber
//         });
//       }

//       const user = userResult.rows[0];
//       console.log(`[2FA] User data retrieved successfully:`, {
//         id: user.id,
//         email: user.email,
//         fnumber: user.fnumber,
//         name: user.name,
//         role: user.role,
//         department: user.department
//       });

//       // Verify this is indeed an F-number user
//       if (!user.is_fnumber_user) {
//         console.error(`[2FA] User found but is_fnumber_user is false for ${fnumber}`);
//         await loginLogService.logFailedLogin(
//           fnumber, 
//           'Invalid user type for F-number authentication', 
//           req
//         );
        
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid user type for F-number authentication.',
//           fnumber: fnumber
//         });
//       }

//       // Check if user is active
//       if (!user.is_active) {
//         console.error(`[2FA] User found but is not active for ${fnumber}`);
//         await loginLogService.logFailedLogin(
//           fnumber, 
//           'User account is not active', 
//           req
//         );
        
//         return res.status(403).json({
//           success: false,
//           error: 'User account is not active. Please contact administrator.',
//           fnumber: fnumber
//         });
//       }

//     } catch (dbError) {
//       console.error(`[2FA] Database error while getting user:`, dbError.message);
      
//       await loginLogService.logFailedLogin(
//         fnumber, 
//         `Database error: ${dbError.message}`, 
//         req
//       );
      
//       return res.status(500).json({
//         success: false,
//         error: 'Failed to retrieve user information. Please try again.',
//       });
//     }
    
//     // Generate session token using existing generateToken function
//     const sessionToken = generateToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role
//     });
    
//     // Store session in user_sessions table
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     await query(
//       'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
//       [user.id, sessionToken, expiresAt]
//     );
    
//     // Log successful login
//     let logInfo = { sessionId: null };
//     try {
//       logInfo = await loginLogService.logSuccessfulLogin(user, req);
//       console.log('[2FA] Login logged successfully');
//     } catch (logError) {
//       console.error('[2FA] Failed to log successful login:', logError.message);
//     }
    
//     // Update user's last login
//     try {
//       await query(
//         'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
//         [user.id]
//       );
//     } catch (updateError) {
//       console.error('[2FA] Failed to update last login time:', updateError.message);
//     }
    
//     console.log(`[2FA] Session token generated for user: ${fnumber}`);
//     console.log('[2FA] 2FA verification process complete, returning success response');
    
//     const userInfo = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       username: user.username,
//       department: user.department,
//       role: user.role
//     };
    
//     return res.status(200).json({
//       success: true,
//       message: '2FA verification successful - Login complete',
//       user: userInfo,
//       token: sessionToken,
//       sessionId: logInfo.sessionId,
//       verifyResponseData: verifyResponse.data 
//     });
    
//   } catch (err) {
//     console.error('[2FA] 2FA verification error:', err.message);
    
//     const fnumber = requestFnumber;
//     if (fnumber) {
//       await loginLogService.logFailedLogin(
//         fnumber, 
//         `2FA system error: ${err.message}`, 
//         req
//       );
//     }
    
//     if (err.response) {
//       console.error('[2FA] Error response status:', err.response.status);
//       console.error('[2FA] Error response data:', JSON.stringify(err.response.data, null, 2));
//     }
    
//     return res.status(500).json({ 
//       success: false, 
//       error: `Server error during 2FA verification: ${err.message}` 
//     });
//   }
// };






//Verify2fa
const verify2FA = async (req, res) => {
  const { token, code, fnumber: requestFnumber } = req.body;

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token is required' 
    });
  }

  try {
    console.log("[2FA] Starting 2FA verification process");
    if (code) {
      console.log("[2FA] Verifying with code:", code);
    } else {
      console.log("[2FA] Checking 2FA status without code");
    }
    
    const authToken = await getAuthToken();
    console.log('[2FA] Successfully obtained token for 2FA verification');
    
    console.log('[2FA] Sending verification request to LDAP service');
    const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
      token,
      code: code || ""
    }, { 
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[2FA] Verify response status:', verifyResponse.status);
    console.log('[2FA] Verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
    if (!verifyResponse.data || 
        (verifyResponse.data.status_code !== '000' && 
         verifyResponse.data.status_code !== '0' && 
         verifyResponse.data.status_code !== 0)) {
      console.error('[2FA] 2FA verification failed:', JSON.stringify(verifyResponse.data, null, 2));
      
      const fnumber = verifyResponse.data.fnumber || 
                     (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
                     requestFnumber;
      
      if (fnumber) {
        await loginLogService.logFailedLogin(
          fnumber, 
          '2FA verification failed', 
          req
        );
      }
      
      return res.status(401).json({ 
        success: false, 
        error: verifyResponse.data?.status_message || '2FA verification failed',
        data: verifyResponse.data 
      });
    }
    
    console.log('[2FA] 2FA verification successful');
    
    const fnumber = verifyResponse.data.fnumber || 
                   (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
                   requestFnumber;
                   
    if (!fnumber) {
      console.error('[2FA] No fnumber found in response or request');
      return res.status(400).json({
        success: false,
        error: 'Unable to identify user. Missing F-number in response.',
      });
    }
    
    console.log(`[2FA] User identified as: ${fnumber}`);

    // **FIX: Use getUserByFnumber function instead of direct query**
    let userResult;
    try {
      console.log(`[2FA] Calling getUserByFnumber for: ${fnumber}`);
      
      // Assuming you have a getUserByFnumber function in your auth controller
      // You need to import/require this function or move it to a shared utility
      userResult = await getUserByFnumber(fnumber);
      
      if (!userResult.success) {
        console.log(`[2FA] getUserByFnumber failed:`, userResult.error);
        
        await loginLogService.logFailedLogin(
          fnumber, 
          userResult.error || 'User not found in system after 2FA verification', 
          req
        );
        
        return res.status(404).json({
          success: false,
          error: userResult.error || 'F-number user not found in system. Please contact administrator.',
          fnumber: fnumber
        });
      }

      const user = userResult.user;
      console.log(`[2FA] User data retrieved successfully via getUserByFnumber:`, {
        id: user.id,
        email: user.email,
        fnumber: user.fnumber,
        name: user.name,
        role: user.role,
        department: user.department
      });

    } catch (getUserError) {
      console.error(`[2FA] Error calling getUserByFnumber:`, getUserError.message);
      
      await loginLogService.logFailedLogin(
        fnumber, 
        `getUserByFnumber error: ${getUserError.message}`, 
        req
      );
      
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve user information. Please try again.',
      });
    }
    
    const user = userResult.user;
    
    // Generate session token using existing generateToken function
    const sessionToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Store session in user_sessions table
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt]
    );
    
    // Log successful login
    let logInfo = { sessionId: null };
    try {
      logInfo = await loginLogService.logSuccessfulLogin(user, req);
      console.log('[2FA] Login logged successfully');
    } catch (logError) {
      console.error('[2FA] Failed to log successful login:', logError.message);
    }
    
    // Update user's last login
    try {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      console.error('[2FA] Failed to update last login time:', updateError.message);
    }
    
    console.log(`[2FA] Session token generated for user: ${fnumber}`);
    console.log('[2FA] 2FA verification process complete, returning success response');
    
    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      department: user.department,
      role: user.role,
      fnumber: user.fnumber, // Make sure fnumber is included
      is_fnumber_user: user.is_fnumber_user
    };
    
    return res.status(200).json({
      success: true,
      message: '2FA verification successful - Login complete',
      user: userInfo,
      token: sessionToken,
      sessionId: logInfo.sessionId,
      verifyResponseData: verifyResponse.data 
    });
    
  } catch (err) {
    console.error('[2FA] 2FA verification error:', err.message);
    
    const fnumber = requestFnumber;
    if (fnumber) {
      await loginLogService.logFailedLogin(
        fnumber, 
        `2FA system error: ${err.message}`, 
        req
      );
    }
    
    if (err.response) {
      console.error('[2FA] Error response status:', err.response.status);
      console.error('[2FA] Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      success: false, 
      error: `Server error during 2FA verification: ${err.message}` 
    });
  }
};



//login
const startPolling2FAStatus = (sessionId) => {
    console.log('[LOGIN] Starting 2FA polling with sessionId:', sessionId ? 'Present' : 'Missing');
    console.log('[LOGIN] Actual sessionId value:', sessionId);
    
    if (!sessionId) {
      console.error('[LOGIN] No sessionId provided to startPolling2FAStatus');
      setError("2FA session ID missing. Please try logging in again.");
      return;
    }
  
    const interval = setInterval(async () => {
      try {
        console.log('[LOGIN] Polling 2FA status with sessionId:', sessionId);
        
        const statusResult = await track2FAStatus(sessionId);
        
        console.log('[LOGIN] Status result:', {
          success: statusResult.success,
          verificationStatus: statusResult.verificationStatus,
          statusCode: statusResult.statusCode,
          statusMessage: statusResult.statusMessage
        });
        
        if (statusResult.success) {
          if (statusResult.verificationStatus === "success") {
            // 2FA was accepted on phone
            console.log('[LOGIN] 2FA verified successfully');
            clearInterval(interval);
            setPollingInterval(null);
            setShowTwoFAModal(false);
            setLoading(true);
            
            // **ENHANCEMENT: Fetch user data after 2FA success**
            try {
              if (statusResult.fnumber) {
                console.log('[LOGIN] Fetching user data for fnumber:', statusResult.fnumber);
                const userData = await getUserByFnumber(statusResult.fnumber);
                
                if (userData.success) {
                  console.log('[LOGIN] User data fetched successfully:', userData.user);
                  // Update auth context with complete user data
                  setUser(userData.user);
                } else {
                  console.warn('[LOGIN] Failed to fetch user data:', userData.error);
                }
              }
            } catch (userFetchError) {
              console.error('[LOGIN] Error fetching user data:', userFetchError);
              // Don't block login if user data fetch fails
            }
            
            navigate("/dashboard");
          } else if (statusResult.verificationStatus === "failed") {
            // 2FA was rejected
            console.log('[LOGIN] 2FA was rejected');
            clearInterval(interval);
            setPollingInterval(null);
            setShowTwoFAModal(false);
            setError("2FA verification was declined. Please try again.");
          }
          // If pending, continue polling
        }
      } catch (err) {
        console.error('[LOGIN] 2FA status polling error:', err);
        
        // Handle session expiry or other fatal errors
        if (err.message.includes('session') || err.message.includes('expired')) {
          clearInterval(interval);
          setPollingInterval(null);
          setShowTwoFAModal(false);
          setError("2FA session expired. Please login again.");
        } else if (err.message.includes('2FA session ID is required')) {
          // Handle missing session ID error
          clearInterval(interval);
          setPollingInterval(null);
          setShowTwoFAModal(false);
          setError("2FA session error. Please login again.");
        }
      }
    }, 2000);
  
    setPollingInterval(interval);
  
    // Auto-stop polling after 5 minutes
    setTimeout(() => {
      console.log('[LOGIN] 2FA polling timeout reached');
      clearInterval(interval);
      setPollingInterval(null);
      if (showTwoFAModal) {
        setShowTwoFAModal(false);
        setError("2FA verification timed out. Please try again.");
      }
    }, 300000);
  };


// modify 2fa function

// Replace the direct database query with:
console.log(`[2FA] Getting user data for: ${fnumber}`);

try {
  // Call the getUserByFnumber function directly (assuming it's in the same file/module)
  const userData = await getUserByFnumber(fnumber);
  
  if (!userData.success) {
    console.log(`[2FA] F-number user ${fnumber} not found`);
    await loginLogService.logFailedLogin(
      fnumber, 
      'F-number user not found in system after 2FA', 
      req
    );
    
    return res.status(404).json({
      success: false,
      error: 'User not found in system. Please contact administrator.',
    });
  }

  const user = userData.user; // Assuming getUserByFnumber returns { success: true, user: {...} }
  
  // Continue with the rest of your logic...
  console.log(`[2FA] F-number user found:`, {
    id: user.id,
    email: user.email,
    fnumber: user.fnumber,
    name: user.name,
    role: user.role,
    department: user.department
  });

} catch (error) {
  console.error(`[2FA] Error getting user data:`, error.message);
  return res.status(500).json({
    success: false,
    error: 'Failed to retrieve user information. Please try again.',
  });
}

