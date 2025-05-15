import React, { createContext, useContext, useState, useEffect } from 'react';

export const ROLES = {
  FINANCE_REVIEWER_1: 'FINANCE_REVIEWER_1',
  FINANCE_REVIEWER_2: 'FINANCE_REVIEWER_2',
  FINANCE_REVIEWER_3: 'FINANCE_REVIEWER_3',
  FINANCE_REVIEWER_4: 'FINANCE_REVIEWER_4',
  EXCOBERS_REVIEWER: 'EXCOBERS_REVIEWER',
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
};

// Mock users for testing
const MOCK_USERS = [
    {
      email: 'finance1fnb@gmail.com',
      password: 'password',
      name: 'Finance Reviewer 1',
      username: 'Quachi',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.FINANCE_REVIEWER_1,
    },
    {
      email: 'finance2fnb@gmail.com',
      password: 'password',
      name: 'Finance Reviewer 2',
      username: 'Vanessa',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.FINANCE_REVIEWER_2,
    },
    {
      email: 'finance3fnb@gmail.com',
      password: 'password',
      name: 'Finance Reviewer 3',
      username: 'Alex',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.FINANCE_REVIEWER_3,
    },
    {
      email: 'finance4b@fnb.co.za',
      password: 'password',
      name: 'Finance Payment Officer',
      username: 'Michael',
      department: DEPARTMENTS.FINANCE,
      role: ROLES.FINANCE_REVIEWER_4,
    },
    {
      email: 'excobers1@fnb.co.za',
      password: 'password',
      name: 'Excobers Reviewer',
      username: 'John Executive',
      department: DEPARTMENTS.EXCOBERS,
      role: ROLES.EXCOBERS_REVIEWER,
    },
    {
      email: 'excobers2@fnb.co.za',
      password: 'password',
      name: 'Excobers Reviewer',
      username: 'Jane Executive',
      department: DEPARTMENTS.EXCOBERS,
      role: ROLES.EXCOBERS_REVIEWER,
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
  ];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
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
      localStorage.setItem('user', JSON.stringify(userInfo));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
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