import React, { createContext, useContext, useState, useEffect } from 'react';

export const ROLES = {
  HEAD_OF_FINANCE: 'HEAD_OF_FINANCE',
  CFO: 'CFO',
  CEO: 'CEO',
  PC: 'PC',
  EXCO: 'EXCO',
  TAX_MANAGER: 'TAX_MANAGER',
  COST_CONTROL: 'COST_CONTROL',
  APPROVAL_USER_1: 'APPROVAL_USER_1',
  APPROVAL_USER_2: 'APPROVAL_USER_2',
  PAYMENT_USER: 'PAYMENT_USER', // New role for payment processing
  DEPARTMENT_USER: 'DEPARTMENT_USER',
};

export const DEPARTMENTS = {
  FINANCE: 'FINANCE',
  IT: 'IT',
  HR: 'HR',
  OPERATIONS: 'OPERATIONS',
  GLOBALMARKET: 'GLOBALMARKET',
  MARKETTING: 'MARKETTING',
  LEGAL: 'LEGAL',
  COMPLIANCE: 'COMPLIANCE',
  EXCOBERS: 'EXCOBERS',
  TAX: 'TAX',
  COST_CONTROL: 'COST_CONTROL',
};

// Mock users for testing
const MOCK_USERS = [
    {
      email: 'headoffinance@fnb.co.za',
      password: 'password',
      name: 'Head of Finance',
      username: 'Quachi',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.HEAD_OF_FINANCE,
    },
    {
      email: 'cfo@fnb.co.za',
      password: 'password',
      name: 'Chief Financial Officer',
      username: 'Vanessa',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.CFO,
    },
    {
      email: 'ceo@fnb.co.za',
      password: 'password',
      name: 'Chief Executive Officer',
      username: 'Alex',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.CEO,
    },
    
    {
      email: 'pc@fnb.co.za',
      password: 'password',
      name: 'PC Officer',
      username: 'Michael',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.PC,
    },
    {
      email: 'exco@fnb.co.za',
      password: 'password',
      name: 'Executive Committee',
      username: 'John Executive',
      department: DEPARTMENTS.EXCOBERS,
      role: ROLES.EXCO,
    },
    {
      email: 'taxmanager@fnb.co.za',
      password: 'password',
      name: 'Tax Manager',
      username: 'Frank Baidoo',
      department: DEPARTMENTS.TAX,
      role: ROLES.TAX_MANAGER,
    },
    {
      email: 'costcontrol@fnb.co.za',
      password: 'password',
      name: 'Cost Control',
      username: 'Christiana Duah',
      department: DEPARTMENTS.COST_CONTROL,
      role: ROLES.COST_CONTROL,
    },
    {
      email: 'approval1@fnb.co.za',
      password: 'password',
      name: 'First Approval User',
      username: 'Approval User 1',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.APPROVAL_USER_1,
    },
    {
      email: 'approval2@fnb.co.za',
      password: 'password',
      name: 'Second Approval User',
      username: 'Approval User 2',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.APPROVAL_USER_2,
    },
    {
      email: 'samueltetteh@fnb.co.za',
      password: '12345',
      name: 'IT User',
      username: 'Samuel Tetteh',
      department: DEPARTMENTS.IT,
      role: ROLES.DEPARTMENT_USER,
    },
    {
      email: 'eshunkwesi@fnb.co.za',
      password: '1234567',
      name: 'IT User',
      username: 'Eshun Kwesi',
      department: DEPARTMENTS.IT,
      role: ROLES.DEPARTMENT_USER,
    },
    {
      email: 'franciskontoh@fnb.co.za',
      password: '123456',
      name: 'IT User',
      username: 'admin',
      department: DEPARTMENTS.IT,
      role: ROLES.DEPARTMENT_USER,
    },
    {
      email: 'operationsfnb@gmail.com',
      password: 'password',
      name: 'Operations',
      username: 'Nii',
      department: DEPARTMENTS.OPERATIONS,
      role: ROLES.DEPARTMENT_USER,
    },
    {
      email: 'operations1fnb@gmail.com',
      password: 'password',
      name: 'Operations',
      username: 'Nii',
      department: DEPARTMENTS.OPERATIONS,
      role: ROLES.DEPARTMENT_USER,
    },
    {
      email: 'legal@gmail.com',
      password: 'password',
      name: 'Legal',
      username: 'Kontoh',
      department: DEPARTMENTS.LEGAL,
      role: ROLES.DEPARTMENT_USER,
    },
    {
      email: 'compliance@gmail.com',
      password: 'password',
      name: 'COMPLIANCE',
      username: 'Jeffery',
      department: DEPARTMENTS.COMPLIANCE,
      role: ROLES.DEPARTMENT_USER,
    },
    {
      email: 'market@gmail.com',
      password: 'password',
      name: 'MARKETTING',
      username: 'Dickson',
      department: DEPARTMENTS.MARKETTING,
      role: ROLES.DEPARTMENT_USER,
  },
   {
  email: 'payment@fnb.co.za',
  password: 'password',
  name: 'Payment Officer',
  username: 'Payment Officer',
  department: DEPARTMENTS.FINANCE,
  role: ROLES.PAYMENT_USER,
}
  ];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: In a real environment, you would use localStorage here
    // For demo purposes, we'll use a variable to simulate storage
    const storedUser = null; // localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const userInfo = {
        name: foundUser.name,
        email: foundUser.email,
        username: foundUser.username,
        department: foundUser.department,
        role: foundUser.role,
      };
      setUser(userInfo);
      // Note: In a real environment, you would use localStorage here
      // localStorage.setItem('user', JSON.stringify(userInfo));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    // Note: In a real environment, you would use localStorage here
    // localStorage.removeItem('user');
    // localStorage.removeItem('token');
    // sessionStorage.removeItem('token');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider 
      value={{
        user,
        login,
        logout,
        loading,
        ROLES,
        DEPARTMENTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};