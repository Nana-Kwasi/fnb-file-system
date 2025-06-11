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