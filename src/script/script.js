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