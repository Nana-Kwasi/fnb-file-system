





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
    console.log('[2FA] Final response being sent to frontend:', {
      success: true,
      user: userInfo, // Make sure this contains all necessary fields
      token: sessionToken,
      sessionId: logInfo.sessionId
    });
    
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
/**
 * Get user data by F-number
 * This function queries the users table to find a user by their F-number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserByFnumber = async (req, res) => {
  const { fnumber } = req.body;

  // Validate input
  if (!fnumber) {
    return res.status(400).json({
      success: false,
      error: 'F-number is required'
    });
  }

  // Validate F-number format (f followed by 7 digits)
  const fnumberRegex = /^f\d{7}$/i;
  if (!fnumberRegex.test(fnumber)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid F-number format. Expected format: f1234567'
    });
  }

  try {
    console.log(`[GET_USER_BY_FNUMBER] Querying user data for F-number: ${fnumber}`);

    // Query users table to get user info using f-number
    // For F-number users, both email and fnumber columns contain the same f-number (format: f8877557)
    const userResult = await query(`
      SELECT 
        id, 
        name, 
        email, 
        username, 
        department, 
        role, 
        status, 
        is_active, 
        last_login, 
        created_at, 
        updated_at, 
        is_fnumber_user, 
        fnumber
      FROM users 
      WHERE is_fnumber_user = true 
      AND is_active = true
      AND (LOWER(email) = LOWER($1) OR LOWER(fnumber) = LOWER($1))
    `, [fnumber]);

    console.log(`[GET_USER_BY_FNUMBER] Query result count: ${userResult.rows.length}`);

    if (userResult.rows.length === 0) {
      console.log(`[GET_USER_BY_FNUMBER] F-number user ${fnumber} not found in users table`);
      
      // Debug: Let's see what F-number users exist with similar patterns
      try {
        const debugResult = await query(`
          SELECT id, email, fnumber, is_fnumber_user 
          FROM users 
          WHERE is_fnumber_user = true 
          AND is_active = true 
          AND (email ILIKE $1 OR fnumber ILIKE $1)
          LIMIT 5
        `, [`%${fnumber.replace('f', '')}%`]);
        
        console.log(`[GET_USER_BY_FNUMBER] Debug - F-number users found with similar patterns:`, debugResult.rows);
      } catch (debugError) {
        console.error(`[GET_USER_BY_FNUMBER] Debug query failed:`, debugError);
      }
      
      return res.status(404).json({
        success: false,
        error: 'F-number user not found in system. Please contact administrator.',
        fnumber: fnumber
      });
    }

    const user = userResult.rows[0];
    console.log(`[GET_USER_BY_FNUMBER] F-number user found in database:`, {
      id: user.id,
      email: user.email,
      fnumber: user.fnumber,
      name: user.name,
      role: user.role,
      department: user.department,
      is_fnumber_user: user.is_fnumber_user
    });

    // Verify this is indeed an F-number user
    if (!user.is_fnumber_user) {
      console.error(`[GET_USER_BY_FNUMBER] User found but is_fnumber_user is false for ${fnumber}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid user type for F-number authentication.',
        fnumber: fnumber
      });
    }

    // Check if user is active
    if (!user.is_active) {
      console.error(`[GET_USER_BY_FNUMBER] User found but is not active for ${fnumber}`);
      return res.status(403).json({
        success: false,
        error: 'User account is not active. Please contact administrator.',
        fnumber: fnumber
      });
    }

    // Return user data (exclude sensitive information)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      department: user.department,
      role: user.role,
      status: user.status,
      is_active: user.is_active,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_fnumber_user: user.is_fnumber_user,
      fnumber: user.fnumber
    };

    console.log(`[GET_USER_BY_FNUMBER] Successfully retrieved user data for F-number: ${fnumber}`);
    
    return res.status(200).json({
      success: true,
      message: 'User data retrieved successfully',
      user: userData,
      fnumber: fnumber
    });

  } catch (error) {
    console.error('[GET_USER_BY_FNUMBER] Database error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: `Server error while retrieving user data: ${error.message}`,
      fnumber: fnumber
    });
  }
};


const track2FAStatus = async (req, res) => {
  // Accept both 'token' and 'twoFASessionId' for compatibility
  const { token, twoFASessionId, fnumber } = req.body;
  
  // Use whichever is provided
  const sessionToken = token || twoFASessionId;

  if (!sessionToken) {
    return res.status(400).json({
      success: false,
      error: 'Token is required'
    });
  }

  try {
    console.log("[TRACK] Checking 2FA verification status for token:",
      sessionToken.substring(0, 10) + "..." + sessionToken.substring(sessionToken.length - 10));

    const authToken = await getAuthToken();
    console.log('[TRACK] Successfully obtained token for status tracking');

    console.log('[TRACK] Sending status check to LDAP service');
    const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
      token: sessionToken,
      code: ""
    }, {
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false })
    });

    console.log('[TRACK] Status response code:', verifyResponse.status);

    const statusCode = verifyResponse.data.status_code;
    const statusMessage = verifyResponse.data.status_message;
    const dataStatus = verifyResponse.data.data?.status;

    console.log(`[TRACK] Status code: ${statusCode}, Message: ${statusMessage}, Data status: ${dataStatus}`);

    let verificationStatus = "pending";

    if (statusCode === "000" || statusCode === "0" || statusCode === 0) {
      verificationStatus = "success";
    }
    else if (statusCode !== "002" && statusMessage?.toLowerCase() !== "pending authentication") {
      verificationStatus = "failed";
    }

    const responseFnumber = verifyResponse.data.data?.fnumber || fnumber;

    return res.status(200).json({
      success: true,
      statusCode,
      statusMessage,
      dataStatus,
      verificationStatus,
      fnumber: responseFnumber
    });

  } catch (err) {
    console.error('[TRACK] Status tracking error:', err.message);

    if (err.response) {
      console.error('[TRACK] Error response status:', err.response.status);
      console.error('[TRACK] Error response data:', JSON.stringify(err.response.data, null, 2));
    }

    return res.status(500).json({
      success: false,
      error: `Server error during status tracking: ${err.message}`
    });
  }
};



// UPDATED: Hybrid Login User function (supports both email/password and f-number/password)
const loginUser = async (req, res) => {
  let identifier = 'unknown';
  
  try {
    const { email, password } = req.body;
    identifier = email;
    
    console.log('=== HYBRID LOGIN ATTEMPT DEBUG ===');
    console.log('Identifier:', identifier);
    console.log('Password provided:', !!password);
    console.log('Password length:', password?.length);

    // Basic validation
    if (!identifier || !password) {
      console.log('❌ Missing identifier or password');
      await loginLogService.logFailedLogin(
        identifier || 'unknown', 
        'Missing identifier or password', 
        req
      );
      return res.status(400).json({
        success: false,
        message: 'Email/F-number and password are required'
      });
    }

    // Determine if this is f-number or email login
    const isLdapLogin = isFnumberFormat(identifier);
    console.log('Login type detected:', isLdapLogin ? 'LDAP (F-number)' : 'Traditional (Email)');

    if (isLdapLogin) {
      // Route to LDAP authentication
      console.log('🔄 Routing to LDAP authentication...');
      req.body.fnumber = identifier;
      return await authenticateLdapUser(req, res);
    }

    // Continue with traditional email/password authentication
    console.log('🔄 Processing traditional email/password authentication...');
    
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [identifier]
    );

    console.log('Database query result:', {
      rowCount: userResult.rows.length,
      userFound: userResult.rows.length > 0
    });

    if (userResult.rows.length === 0) {
      console.log('❌ No user found with email:', identifier);
      await loginLogService.logFailedLogin(
        identifier, 
        'User not found', 
        req
      );
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];
    console.log('✅ User found:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Has password hash:', !!user.password);

    // Check if user is active
    if (user.status && user.status !== 'active') {
      await loginLogService.logFailedLogin(
        identifier, 
        `User account is ${user.status}`, 
        req
      );
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    console.log('🔍 Attempting password comparison...');
    
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log('🔐 Password comparison result:', passwordMatch);
      
      if (!passwordMatch) {
        console.log('❌ Password mismatch for user:', identifier);
        
        await loginLogService.logFailedLogin(
          identifier, 
          'Invalid password', 
          req
        );
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      console.log('✅ Password match successful!');
    } catch (bcryptError) {
      console.log('❌ bcrypt.compare error:', bcryptError.message);
      await loginLogService.logFailedLogin(
        identifier, 
        `bcrypt error: ${bcryptError.message}`, 
        req
      );
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Traditional login successful for user:', identifier);

    // Generate token and continue with normal login flow
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Log successful login
    let logInfo = { sessionId: null };
    try {
      logInfo = await loginLogService.logSuccessfulLogin(user, req);
      console.log('✅ Login logged successfully');
    } catch (logError) {
      console.error('⚠️ Failed to log successful login, but continuing:', logError.message);
    }

    // Update user's last login
    try {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      console.error('⚠️ Failed to update last login time:', updateError.message);
    }

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      department: user.department,
      role: user.role
    };

    console.log('✅ Sending successful login response');
    console.log('=== END HYBRID LOGIN DEBUG ===');

    res.json({
      success: true,
      message: 'Login successful',
      user: userInfo,
      token,
      sessionId: logInfo.sessionId
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    
    try {
      await loginLogService.logFailedLogin(
        identifier || 'unknown',
        `System error: ${error.message}`, 
        req
      );
    } catch (logError) {
      console.error('Failed to log system error:', logError);
    }
    
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};


const jwt = require('jsonwebtoken');
const { query } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

// Verify JWT token and authenticate user
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token first (this doesn't require DB access)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed'
        });
      }
    }

    // Check if session exists and is valid with retry logic
    let sessionResult;
    const maxRetries = 2;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        sessionResult = await query(
          `SELECT s.*, u.* 
           FROM user_sessions s 
           JOIN users u ON s.user_id = u.id 
           WHERE s.token = $1 AND s.expires_at > NOW() AND u.is_active = true`,
          [token]
        );
        break; // Success, exit retry loop
      } catch (dbError) {
        lastError = dbError;
        console.error(`Database query attempt ${attempt}/${maxRetries} failed:`, {
          error: dbError.message,
          code: dbError.code,
          token: token.substring(0, 10) + '...'
        });
        
        // If it's a connection-related error and we have retries left
        if (attempt < maxRetries && (
          dbError.code === 'ECONNRESET' || 
          dbError.code === 'ETIMEDOUT' ||
          dbError.message.includes('Connection terminated') ||
          dbError.message.includes('connection timeout')
        )) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        // For non-connection errors or if we've exhausted retries
        break;
      }
    }

    // If we still don't have a result, handle the error
    if (!sessionResult) {
      console.error('Authentication failed after retries:', lastError?.message);
      
      // Check if it's a connection-related error
      if (lastError && (
        lastError.code === 'ECONNRESET' || 
        lastError.code === 'ETIMEDOUT' ||
        lastError.message.includes('Connection terminated') ||
        lastError.message.includes('connection timeout')
      )) {
        return res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable. Please try again.',
          code: 'DATABASE_CONNECTION_ERROR'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Authentication service error'
      });
    }

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    const user = sessionResult.rows[0];

    // Attach user info to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      department: user.department,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Handle different types of errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }
};

// Helper function to check admin privileges - CENTRALIZED
const isAdmin = (user) => {
  // Check for hardcoded admin usernames/emails first
  if (user?.username === 'Admin' || user?.username === 'admin' || 
      user?.email === 'Admin' || user?.email === 'admin') {
    return true;
  }
  
  // Check admin roles - CONSISTENT ACROSS ALL FILES
  const adminRoles = ['HEAD_OF_FINANCE', 'CFO', 'CEO'];
  return user && adminRoles.includes(user.role);
};

// Require admin role - UPDATED to use centralized isAdmin function
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!isAdmin(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Require specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Require department access
const requireDepartment = (departments) => {
  return (req, res, next) => {
    if (!Array.isArray(departments)) {
      departments = [departments];
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!departments.includes(req.user.department)) {
      return res.status(403).json({
        success: false,
        message: 'Department access required'
      });
    }

    next();
  };
};

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
  requireRole,
  requireDepartment,
  isAdmin 
};




  // Return your JSX here (same as before)
  return (
    <div className="login-container">
      {/* Your existing JSX content */}
    </div>
  );
};



// In your AuthContext


const track2FAStatus = async (sessionId) => {
  try {
    const response = await fetch('/api/auth/track-2fa-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ twoFASessionId: sessionId }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error tracking 2FA status:', error);
    throw error;
  }
};




//newwww
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "../login.css";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [twoFASessionId, setTwoFASessionId] = useState(null);
  const [showManualCodeInput, setShowManualCodeInput] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  
  const navigate = useNavigate();
  const { login, authenticateLdap, verify2FA, track2FAStatus, isFnumber, setUser, getUserByFnumber } = useAuth();

  // Cleanup polling interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!identifier || !password) {
      setError("F-number and password are required");
      setLoading(false);
      return;
    }

    // Identifier length validation
    if (identifier.length > 50) {
      setError("F-number is too long");
      setLoading(false);
      return;
    }

    try {
      const isUsingFnumber = isFnumber(identifier);
      
      if (isUsingFnumber) {
        // LDAP Authentication Flow
        const ldapResult = await authenticateLdap(identifier, password);
        
        console.log('[LOGIN] LDAP Result:', ldapResult);
        
        if (ldapResult.success) {
          // Extract the session ID from the LDAP response
          const sessionId = ldapResult.twoFASessionId || 
                           ldapResult.token || 
                           ldapResult.sessionId || 
                           ldapResult.data?.token ||
                           ldapResult.data?.sessionId;
          
          console.log('[LOGIN] Extracted session ID:', sessionId ? 'Present' : 'Missing');
          
          if (!sessionId) {
            console.error('[LOGIN] No session ID found in LDAP response:', ldapResult);
            setError("Authentication setup failed. Please try again.");
            setLoading(false);
            return;
          }
          
          setTwoFASessionId(sessionId);
          setShowTwoFAModal(true);
          setError("");
          
          // Start polling for 2FA status
          startPolling2FAStatus(sessionId);
        }
      } else {
        // Traditional email login
        const result = await login(identifier, password);
        
        if (result.success) {
          if (result.requires2FA) {
            setShowTwoFA(true);
            setTwoFASessionId(result.twoFASessionId);
            setError("");
          } else {
            navigate("/dashboard");
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const startPolling2FAStatus = (sessionId) => {
    console.log('[LOGIN] Starting 2FA polling with sessionId:', sessionId ? 'Present' : 'Missing');
    
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
            
            // **ENHANCED: Complete authentication flow after 2FA success**
            try {
              console.log('[LOGIN] Completing authentication after 2FA success');
              
              // Use verify2FA to complete the authentication and get proper tokens
              const finalResult = await verify2FA("AUTO_VERIFIED", sessionId);
              
              if (finalResult.success) {
                console.log('[LOGIN] Authentication completed successfully');
                // Navigation will be handled by the verify2FA success flow
                navigate("/dashboard");
              } else {
                throw new Error('Failed to complete authentication after 2FA');
              }
            } catch (authError) {
              console.error('[LOGIN] Error completing authentication:', authError);
              setError("2FA verified but failed to complete login. Please try again.");
            }
            
            setLoading(false);
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

  const handleManualCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!twoFACode) {
      setError("2FA code is required");
      setLoading(false);
      return;
    }

    try {
      const result = await verify2FA(twoFACode, twoFASessionId);
      
      if (result.success) {
        // Stop polling if it's running
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setShowTwoFAModal(false);
        setShowTwoFA(false);
        navigate("/dashboard");
      } else {
        setError(result.message || "2FA verification failed");
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.message || "2FA verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!twoFACode) {
      setError("2FA code is required");
      setLoading(false);
      return;
    }

    try {
      const result = await verify2FA(twoFACode, twoFASessionId);
      
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "2FA verification failed");
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.message || "2FA verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Stop polling if running
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    setShowTwoFA(false);
    setShowTwoFAModal(false);
    setTwoFACode("");
    setTwoFASessionId(null);
    setShowManualCodeInput(false);
    setError("");
  };

  const handleCancelTwoFA = () => {
    // Stop polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    setShowTwoFAModal(false);
    setShowManualCodeInput(false);
    setTwoFACode("");
    setError("2FA verification cancelled. Please login again.");
  };

  // Determine if user is entering f-number or email
  const isUsingFnumber = isFnumber(identifier);

  // Rest of your JSX remains the same...
  return (
    <div className="login-container">
      {/* Your existing JSX for the login form */}
    </div>
  );
};

// auth context
// Key fixes for the verify2FA method in AuthContext.js

const verify2FA = async (code, sessionId = null) => {
  try {
    const activeSessionId = sessionId || twoFASessionId;
    
    if (!activeSessionId) {
      throw new Error('No active 2FA session found');
    }

    console.log('[AUTH_CONTEXT] Sending 2FA verification request with:', {
      code: code ? 'PROVIDED' : 'MISSING',
      sessionId: activeSessionId ? 'PROVIDED' : 'MISSING'
    });

    const response = await apiRequest('/api/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ 
        code, 
        token: activeSessionId,
        fnumber: pendingLdapAuth?.fnumber
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[AUTH_CONTEXT] 2FA verification failed:', errorData);
      throw new Error(errorData.error || '2FA verification failed');
    }

    const data = await response.json();
    console.log('[AUTH_CONTEXT] 2FA verification response:', data);

    if (data.success) {
      console.log('[AUTH_CONTEXT] 2FA verification successful');
      
      // **CRITICAL FIX: Handle authentication completion properly**
      
      // Case 1: Backend returns complete authentication data
      if (data.user && data.token) {
        console.log('[AUTH_CONTEXT] Backend returned complete auth data');
        
        const authToken = data.token;
        const authSessionId = data.sessionId || activeSessionId;
        
        // Set auth state
        setUser(data.user);
        setToken(authToken);
        setSessionId(authSessionId);
        
        // **CRITICAL: Store in localStorage immediately**
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', authToken);
        localStorage.setItem('sessionId', authSessionId);
        
        console.log('[AUTH_CONTEXT] Auth data stored in localStorage');
        
        // Clear 2FA state
        setTwoFASessionId(null);
        setPendingLdapAuth(null);
        
        return {
          success: true,
          user: data.user,
          token: authToken,
          sessionId: authSessionId
        };
      }
      
      // Case 2: Need to fetch user data separately
      else if (data.fnumber || pendingLdapAuth?.fnumber) {
        const fnumberToUse = data.fnumber || pendingLdapAuth?.fnumber;
        console.log('[AUTH_CONTEXT] Fetching user data for fnumber:', fnumberToUse);
        
        try {
          // **CRITICAL FIX: Use the session token for subsequent requests**
          const tempToken = data.token || activeSessionId;
          
          // Temporarily set token for API requests
          const oldToken = token;
          setToken(tempToken);
          
          const userData = await getUserByFnumber(fnumberToUse);
          
          if (userData.success && userData.user) {
            console.log('[AUTH_CONTEXT] User data fetched successfully');
            
            const authToken = data.token || tempToken;
            const authSessionId = data.sessionId || activeSessionId;
            
            // Set final auth state
            setUser(userData.user);
            setToken(authToken);
            setSessionId(authSessionId);
            
            // **CRITICAL: Store in localStorage immediately**
            localStorage.setItem('user', JSON.stringify(userData.user));
            localStorage.setItem('token', authToken);
            localStorage.setItem('sessionId', authSessionId);
            
            console.log('[AUTH_CONTEXT] Complete auth data stored in localStorage');
            
            // Clear 2FA state
            setTwoFASessionId(null);
            setPendingLdapAuth(null);
            
            return {
              success: true,
              user: userData.user,
              token: authToken,
              sessionId: authSessionId
            };
          } else {
            // Restore old token if user fetch failed
            setToken(oldToken);
            throw new Error('Failed to fetch user data');
          }
        } catch (userFetchError) {
          console.error('[AUTH_CONTEXT] Error fetching user data:', userFetchError);
          throw new Error('2FA verified but failed to load user profile. Please try logging in again.');
        }
      } 
      
      // Case 3: Auto-verification from polling (use existing session)
      else if (code === "AUTO_VERIFIED") {
        console.log('[AUTH_CONTEXT] Handling auto-verification from polling');
        
        // Use existing session as auth token
        const authToken = activeSessionId;
        const authSessionId = activeSessionId;
        
        // If we have pending LDAP auth, fetch user data
        if (pendingLdapAuth?.fnumber) {
          try {
            // Temporarily set token for API requests
            const oldToken = token;
            setToken(authToken);
            
            const userData = await getUserByFnumber(pendingLdapAuth.fnumber);
            
            if (userData.success && userData.user) {
              console.log('[AUTH_CONTEXT] User data fetched for auto-verification');
              
              // Set final auth state
              setUser(userData.user);
              setToken(authToken);
              setSessionId(authSessionId);
              
              // **CRITICAL: Store in localStorage immediately**
              localStorage.setItem('user', JSON.stringify(userData.user));
              localStorage.setItem('token', authToken);
              localStorage.setItem('sessionId', authSessionId);
              
              console.log('[AUTH_CONTEXT] Auto-verification auth data stored');
              
              // Clear 2FA state
              setTwoFASessionId(null);
              setPendingLdapAuth(null);
              
              return {
                success: true,
                user: userData.user,
                token: authToken,
                sessionId: authSessionId
              };
            } else {
              setToken(oldToken);
              throw new Error('Failed to fetch user data for auto-verification');
            }
          } catch (error) {
            console.error('[AUTH_CONTEXT] Auto-verification user fetch error:', error);
            throw error;
          }
        } else {
          throw new Error('No pending LDAP authentication data found');
        }
      }
      
      else {
        throw new Error('2FA verified but missing authentication data');
      }
    }

    return data;
  } catch (error) {
    console.error('[AUTH_CONTEXT] 2FA verification error:', error);
    throw error;
  }
};

// **ENHANCED getUserByFnumber method**
const getUserByFnumber = async (fnumber) => {
  try {
    if (!fnumber) {
      throw new Error('F-number is required');
    }

    // **FIX: Clean and validate F-number format**
    let cleanFnumber = fnumber.toString().trim().toLowerCase();
    
    // Add 'f' prefix if missing
    if (!cleanFnumber.startsWith('f')) {
      cleanFnumber = 'f' + cleanFnumber;
    }
    
    // Validate F-number format
    if (!/^f\d{7}$/i.test(cleanFnumber)) {
      throw new Error('Invalid F-number format. Expected format: f1234567');
    }

    console.log('[AUTH_CONTEXT] Getting user data for F-number:', cleanFnumber);

    const response = await apiRequest('/api/auth/get-user-by-fnumber', {
      method: 'POST',
      body: JSON.stringify({ 
        fnumber: cleanFnumber  // **FIX: Ensure correct property name**
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[AUTH_CONTEXT] getUserByFnumber failed:', errorData);
      throw new Error(errorData.error || errorData.message || 'Failed to get user data');
    }

    const data = await response.json();
    console.log('[AUTH_CONTEXT] User data retrieved successfully:', data.success);
    
    return data;
  } catch (error) {
    console.error('[AUTH_CONTEXT] Get user by F-number error:', error);
    throw error;
  }
};




// **ENHANCED apiRequest method to handle token properly**
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // **FIX: Get current token dynamically**
  const currentToken = token || localStorage.getItem('token');
  const currentSessionId = sessionId || localStorage.getItem('sessionId');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
      ...(currentSessionId && { 'x-session-id': currentSessionId }),
      ...options.headers,
    },
    ...options,
  };

  console.log('[AUTH_CONTEXT] API Request:', {
    endpoint,
    hasToken: !!currentToken,
    hasSessionId: !!currentSessionId
  });

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};