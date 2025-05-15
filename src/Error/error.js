// auth controller

const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';


const login = async (req, res) => {
  const { email, password, branch } = req.body;

  try {
    console.log(`Login attempt: ${email} for branch ${branch}`);

    if (!email || !password || !branch) {
      return res.status(400).json({ error: 'Email, password, and branch are required' });
    }

    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    let user = adminResult.rows[0];
    let userTable = 'admin_users';

    if (!user) {
      const userResult = await pool.query(
        'SELECT * FROM users_table WHERE email = $1',
        [email]
      );
      user = userResult.rows[0];
      userTable = 'users_table';
    }

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const branchesKey = userTable === 'admin_users' ? 'branches' : 'branch';
    const userBranches = userTable === 'admin_users' ? user[branchesKey] : [user[branchesKey]];

    if (!userBranches.includes(branch)) {
      console.log(`User ${email} attempted to access unauthorized branch: ${branch}`);
      return res.status(403).json({ error: 'You do not have access to this branch' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      user_id: user.id,
      email: user.email,
      branch: branch,
      role: user.role || 'user',
      user_table: userTable
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        branch: branch,
        role: user.role || 'user',
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};


const registerUser = async (req, res) => {
  const { email, password, branches, role } = req.body;

  try {
   
    
    
    if (!email || !password || !branches || !Array.isArray(branches)) {
      return res.status(400).json({ error: 'Email, password, and branches array are required' });
    }

   
    const checkUser = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const result = await pool.query(
      'INSERT INTO admin_users (email, password, branches, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, role, created_at',
      [email, hashedPassword, branches, role || 'user']
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
        created_at: result.rows[0].created_at
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};


const verifyToken = (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
// 1. Create a new backend endpoint for admin verification only

// In your authController.js
const verifyAdminCredentials = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Verify admin credentials
    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    const user = adminResult.rows[0];

    if (!user) {
      console.log(`Admin not found: ${email}`);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for admin: ${email}`);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Get available branches for this admin
    const branches = user.branches || [];
    
    // Generate a temporary token for branch selection
    const tempToken = jwt.sign({ 
      user_id: user.id,
      email: user.email,
      role: user.role || 'admin',
      temp: true // Flag to indicate this is a temporary token
    }, JWT_SECRET, { expiresIn: '5m' });

    // Return success with available branches and temporary token
    return res.json({
      success: true,
      token: tempToken,
      branches: branches.map(branch => ({ branchName: branch, branchCode: branch })) // Format branches like your API
    });

  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(500).json({ success: false, error: 'Server error during verification' });
  }
};

module.exports = {
  login,
  registerUser,
  verifyToken,
  verifyAdminCredentials
};

// server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const visitorsRouter = require('./route/visitors');
const authRouter = require('./route/auth'); 
const usersRouter = require('./route/users')
// const cron = require('node-cron');

const app = express();

// CORS configuration
app.use(cors());

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount the routers
app.use('/visitors', visitorsRouter);
app.use('/auth', authRouter); // Mount the auth router at /auth
app.use('/users', usersRouter)

// Catch-all 404 handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message
  });
});



const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`Auth endpoints available at: http://localhost:${PORT}/auth/login`);
});

// users controller


const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';
const LDAP_AUTH_URL = "https://172.29.18.126/adproxyservice/prod/ldap/authenticate";
const LDAP_VERIFY_2FA_URL = "https://172.29.18.126/adproxyservice/prod/ldap/verify2fa";
const TOKEN_URL = 'https://172.29.18.126/adproxyservice/prod/client/renew-token';
const CLIENT_ID = "8CA09F75-720F-4641-9B70-5344850DF34E";

const getAuthToken = async () => {
  try {
    console.log('Requesting token from:', TOKEN_URL);
    
    const tokenResponse = await axios.post(TOKEN_URL, {
      clientId: CLIENT_ID,
      duration: 300
    }, { 
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });

    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.data || tokenResponse.data.statusCode !== 0 || !tokenResponse.data.data || !tokenResponse.data.data.token) {
      console.error('Invalid token response:', tokenResponse.data);
      throw new Error(`Failed to obtain authorization token: ${
        tokenResponse.data && tokenResponse.data.statusMessage 
          ? tokenResponse.data.statusMessage 
          : 'Unknown error'
      }`);
    }

    const rawToken = tokenResponse.data.data.token;
    return `Bearer ${rawToken}`;
  } catch (err) {
    console.error('Error getting auth token:', err.message);
    if (err.response) {
      console.error('Error response status:', err.response.status);
      console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    throw err;
  }
};
const authenticateUser = async (req, res) => {
  const { fnumber, password } = req.body;

  if (!fnumber || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'F-number and password are required' 
    });
  }

  try {
    console.log(`[AUTH] Authentication attempt for user: ${fnumber}`);
    
    const authToken = await getAuthToken();
    console.log('[AUTH] Successfully obtained token for authentication');
    
    console.log('[AUTH] Sending authentication request to LDAP service');
    const authResponse = await axios.post(LDAP_AUTH_URL, {
      fnumber,
      password
    }, { 
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[AUTH] Auth response status:', authResponse.status);
    
    // First, let's check for invalid credentials scenarios
    if (authResponse.data && 
        (authResponse.data.status_code === '401' || 
         authResponse.data.status_code === 401 ||
         (authResponse.data.status_message && 
          authResponse.data.status_message.toLowerCase().includes('invalid credentials')))) {
      console.log('[AUTH] Invalid credentials for user:', fnumber);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials. Please check your F-number and password.' 
      });
    }
    
    // Check for any other error conditions
    if (!authResponse.data || 
        (authResponse.data.status_code !== '000' && 
         authResponse.data.status_code !== '0' && 
         authResponse.data.status_code !== 0)) {
      console.error('[AUTH] Authentication failed:', JSON.stringify(authResponse.data, null, 2));
      return res.status(401).json({ 
        success: false, 
        error: authResponse.data?.status_message || 'Authentication failed. Please try again.' 
      });
    }
    
    // Check if we have a valid token in the response
    if (!authResponse.data.token) {
      console.error('[AUTH] Authentication response missing token');
      return res.status(500).json({ 
        success: false, 
        error: 'Authentication system error. Please try again later.' 
      });
    }
    
    console.log('[AUTH] Authentication successful for user:', fnumber);
    console.log('[AUTH] Returning token for 2FA verification');
    
    // Log all data when authentication is successful
    console.log('[AUTH] Full auth response data:', JSON.stringify(authResponse.data, null, 2));
    
    return res.status(200).json({
      success: true,
      message: 'Authentication successful, proceed with 2FA verification',
      token: authResponse.data.token, 
      data: authResponse.data 
    });
    
  } catch (err) {
    console.error('[AUTH] Authentication error:', err.message);
    
    // If there's a specific error related to credentials in the response
    if (err.response && err.response.data) {
      const errorData = err.response.data;
      
      // Check for common error patterns that indicate invalid credentials
      if (errorData.status_code === 401 || 
          (errorData.status_message && 
           errorData.status_message.toLowerCase().includes('invalid')) ||
          (errorData.error && 
           errorData.error.toLowerCase().includes('credentials'))) {
        
        console.log('[AUTH] Server reported invalid credentials');
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials. Please check your F-number and password.' 
        });
      }
      
      console.error('[AUTH] Error response status:', err.response.status);
      console.error('[AUTH] Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      success: false, 
      error: `Authentication failed. Please try again later.` 
    });
  }
};

const checkUserBranches = async (req, res) => {
  const { fnumber } = req.body;
  
  if (!fnumber) {
    return res.status(400).json({
      success: false,
      error: 'F-number is required'
    });
  }
  
  try {
    console.log(`[BRANCH] Checking branches for user: ${fnumber}`);
    
    // Convert to lowercase to match database format
    const lowerCaseFnumber = fnumber.toLowerCase();
    
    console.log(`[BRANCH] Querying database with value: ${lowerCaseFnumber}`);
    
    // Use the email column since that's where the F-number is stored
    const result = await pool.query(
      'SELECT id, email, branch, branch_code FROM users_table WHERE email = $1',
      [lowerCaseFnumber]
    );
    
    if (result.rows.length === 0) {
      console.log(`[BRANCH] User ${fnumber} not found in system`);
      return res.status(404).json({
        success: false,
        error: 'User not found in system. Please contact administrator.',
        userExists: false,
        fnumber
      });
    }
    
    // Format the branches for the response
    const branches = result.rows.map(row => ({
      branchName: row.branch,
      branchCode: row.branch_code
    }));
    
    console.log(`[BRANCH] User ${fnumber} has access to ${branches.length} branches:`,
      JSON.stringify(branches, null, 2));
    
    // Generate a session token if needed
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    return res.status(200).json({
      success: true,
      userExists: true,
      fnumber,
      branches,
      sessionToken // Include session token in response
    });
    
  } catch (err) {
    console.error('[BRANCH] Error checking user branches:', err.message);
    return res.status(500).json({
      success: false,
      error: `Server error during branch checking: ${err.message}`
    });
  }
};

const track2FAStatus = async (req, res) => {
  const { token, fnumber } = req.body;

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token is required' 
    });
  }

  try {
    console.log("[TRACK] Checking 2FA verification status for token:", 
      token.substring(0, 10) + "..." + token.substring(token.length - 10));
    
    const authToken = await getAuthToken();
    console.log('[TRACK] Successfully obtained token for status tracking');
    
    console.log('[TRACK] Sending status check to LDAP service');
    const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
      token,
      code: "" // Empty code to just check status
    }, { 
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[TRACK] Status response code:', verifyResponse.status);
    
    // Return just the status information, no database checks
    const statusCode = verifyResponse.data.status_code;
    const statusMessage = verifyResponse.data.status_message;
    const dataStatus = verifyResponse.data.data?.status;
    
    // Log the specific status information
    console.log(`[TRACK] Status code: ${statusCode}, Message: ${statusMessage}, Data status: ${dataStatus}`);
    
    // Determine verification status
    let verificationStatus = "pending";
    
    // Check if verification is successful
    if (statusCode === "000" || statusCode === "0" || statusCode === 0) {
      verificationStatus = "success";
    } 
    // Check if verification failed
    else if (statusCode !== "002" && statusMessage?.toLowerCase() !== "pending authentication") {
      verificationStatus = "failed";
    }
    
    // Get the fnumber from the response if available
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



const verify2FA = async (req, res) => {
  const { token, code, fnumber: requestFnumber } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    console.log("[2FA] Starting 2FA verification process");
    if (code) {
      console.log("[2FA] Verifying with code:", code);
    } else {
      console.log("[2FA] Checking 2FA status without code");
    }
    console.log("[2FA] Using token:", token.substring(0, 10) + "..." + token.substring(token.length - 10));
    
    const authToken = await getAuthToken();
    console.log('[2FA] Successfully obtained token for 2FA verification');
    
    console.log('[2FA] Sending verification request to LDAP service');
    const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
      token,
      code: code || "" // Send empty string if no code provided
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
    
    // Generate a session token
    const sessionToken = jwt.sign(
      { 
        fnumber: fnumber
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    console.log(`[2FA] Session token generated for user: ${fnumber}`);
    console.log('[2FA] 2FA verification process complete, returning success response');
    
    // Log all data when 2FA verification is successful
    console.log('[2FA] Full verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
    return res.status(200).json({
      success: true,
      message: '2FA verification successful',
      fnumber,
      sessionToken,
      verifyResponseData: verifyResponse.data 
    });
    
  } catch (err) {
    console.error('[2FA] 2FA verification error:', err.message);
    
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







const finalizeLogin = async (req, res) => {
  const { fnumber, branch, sessionToken } = req.body;

  if (!fnumber || !branch || !sessionToken) {
    return res.status(400).json({ error: 'F-number, branch, and session token are required' });
  }
  
  try {
    let decodedToken;
    try {
      decodedToken = jwt.verify(sessionToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid session token' });
    }
    
    // Ensure the user exists and has access to the selected branch
    const result = await pool.query(
      'SELECT * FROM users_table WHERE email = $1 AND branch = $2',
      [fnumber, branch]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have access to the selected branch' });
    }
    
    const user = result.rows[0];
    
    // Create a new JWT token for the authenticated session
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        branch: user.branch, 
        branchCode: user.branch_code, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        branch: user.branch,
        branchCode: user.branch_code,
        role: user.role
      }
    });
    
  } catch (err) {
    console.error('Login finalization error:', err);
    return res.status(500).json({ error: 'Server error during login finalization' });
  }
};

// Get user's branches




const verifyFnumber = async (req, res) => {
  const { fnumber } = req.body;

  if (!fnumber) {
    return res.status(400).json({ error: 'F-number is required' });
  }

  try {
    const createTokenUrl = 'https://172.29.18.126/adproxyservice/prod/client/renew-token';
    console.log('Requesting token from:', createTokenUrl);
    
    const tokenResponse = await axios.post(createTokenUrl, {
      clientId: "8CA09F75-720F-4641-9B70-5344850DF34E",
      duration: 300
    }, { 
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response data:', JSON.stringify(tokenResponse.data, null, 2));

    // Check if token exists in the response
    if (!tokenResponse.data || tokenResponse.data.statusCode !== 0 || !tokenResponse.data.data || !tokenResponse.data.data.token) {
      console.error('Invalid token response:', tokenResponse.data);
      return res.status(400).json({ 
        isValid: false, 
        error: `Failed to obtain authorization token: ${
          tokenResponse.data && tokenResponse.data.statusMessage 
            ? tokenResponse.data.statusMessage 
            : 'Unknown error'
        }` 
      });
    }

    const rawToken = tokenResponse.data.data.token;
    const authToken = `Bearer ${rawToken}`;
    console.log('Successfully obtained token');
    console.log('Using authorization header:', authToken);

    const searchApiUrl = 'https://172.29.18.126/adproxyservice/prod/ldap/search';
    console.log('Searching for user at:', searchApiUrl);
    
    console.log('Attempting API call with Bearer token in Authorization header');
    try {
      const requestConfig = {
        url: searchApiUrl,
        method: 'post',
        data: { fnumber: fnumber },
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        httpsAgent: new require('https').Agent({ rejectUnauthorized: false })
      };
      
      console.log('Request configuration:', JSON.stringify({
        url: requestConfig.url,
        method: requestConfig.method,
        headers: requestConfig.headers,
        data: requestConfig.data
      }, null, 2));
      
      const response = await axios(requestConfig);
      
      console.log('Search response status:', response.status);
      console.log('Search response data:', JSON.stringify(response.data, null, 2));

      if (response.data.statusCode !== 0) {
        return res.status(400).json({ 
          isValid: false, 
          error: `Search API error: ${response.data.statusMessage}` 
        });
      }

      
      return res.status(200).json({
        isValid: true,
        userData: {
          name: response.data.data.name,
          email: response.data.data.email,
          title: response.data.data.title,
          memberOf: response.data.data.memberOf
        }
      });
    } catch (err) {
      console.error('Search API call failed:', err.message);
      
      // If there's a response in the error, log it
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
      }
      
      throw new Error(`Failed to authenticate with the search API: ${err.message}`);
    }
  } catch (err) {
    console.error('F-number verification error details:', err.message);
    
    if (err.response) {
      console.error('Error response status:', err.response.status);
      console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      isValid: false, 
      error: `Server error during F-number verification: ${err.message}` 
    });
  }
};

const createUser = async (req, res) => {
  const { email, branch, branchCode, role = 'user' } = req.body;

  try {
    if (!email || !branch) {
      return res.status(400).json({ error: 'F-number and branch are required' });
    }

    const checkUser = await pool.query('SELECT * FROM users_table WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }


    const result = await pool.query(
      'INSERT INTO users_table (email, branch, branch_code, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, branch, role, created_at',
      [email, branch, branchCode, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        branch: result.rows[0].branch,
        role: result.rows[0].role,
        created_at: result.rows[0].created_at
      }
    });
  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: 'Server error during user creation' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, branch, branchCode, role, is_active } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users_table SET email = $1, branch = $2, branch_code = $3, role = $4, is_active = COALESCE($5, is_active) WHERE id = $6 RETURNING *',
      [email, branch, branchCode, role, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        branch: result.rows[0].branch,
        role: result.rows[0].role,
        is_active: result.rows[0].is_active
      }
    });
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ error: 'Server error during user update' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, branch, role, created_at, is_active FROM users_table');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users_table WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('User deletion error:', err);
    res.status(500).json({ error: 'Server error during user deletion' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  verifyFnumber,
  authenticateUser,
  verify2FA,
  finalizeLogin,
  track2FAStatus,
  checkUserBranches
};

// visitors log controller
const getAllVisitorLogs = async (req, res) => {
  try {
    console.log("Fetching all visitor logs");
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log
    `);
    console.log(`Found ${result.rows.length} visitor logs`);
    console.log("Sample data:", result.rows.slice(0, 2)); // Log first 2 entries
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send('Server error');
  }
};


const getVisitorLogsByPhoneNumber = async (req, res) => {
  const { telephone } = req.query;
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log 
      WHERE telephone = $1
    `, [telephone]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
const checkTelephoneExists = async (req, res) => {
  const { telephone } = req.params;
  
  // Basic validation
  if (!telephone || telephone.trim() === '') {
    return res.status(400).json({ 
      error: 'Telephone number is required',
      exists: false
    });
  }

  try {
    console.log(`Checking if telephone exists: ${telephone}`);
    
    // First check if the pool connection is working
    const testQuery = await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Then perform the actual query
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM visitor_log WHERE telephone = $1) as "exists"', 
      [telephone]
    );
    
    console.log('Query result:', result.rows[0]);
    
    res.json({ 
      exists: result.rows[0].exists,
      message: result.rows[0].exists ? 'Telephone number already registered' : 'Telephone number is available'
    });
  } catch (err) {
    console.error('Error checking telephone:', err);
    res.status(500).json({ 
      error: 'Failed to check telephone number', 
      details: err.message,
      exists: false
    });
  }
};

const getVisitorLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log 
      WHERE id = $1
    `, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


const getAllBranches = async (req, res) => {
  try {
    console.log("Fetching all unique branches");
    const result = await pool.query(
      'SELECT DISTINCT branchName, branch FROM visitor_log WHERE branchName IS NOT NULL AND branch IS NOT NULL'
    );
    
    const branches = result.rows.map(row => ({
      branchName: row.branchname,
      branchCode: row.branch
    }));
    
    console.log(`Found ${branches.length} unique branches`);
    res.json(branches);
  } catch (err) {
    console.error("Database query error fetching branches:", err);
    res.status(500).send('Server error');
  }
};

const getVisitorLogsByBranchCode = async (req, res) => {
  const { branchCode } = req.query;
  
  if (!branchCode) {
    return res.status(400).json({ error: 'Branch code is required' });
  }
  
  try {
    console.log(`Fetching visitor logs for branch code: ${branchCode}`);
    const result = await pool.query(
      `SELECT 
        id,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        timeIn,
        timeOut,
        department,
        company,
        picture,
        telephone,
        reason,
        purpose,
        name,
        branch,
        branchName
      FROM visitor_log 
      WHERE branch = $1`,
      [branchCode]
    );
    
    console.log(`Found ${result.rows.length} visitor logs for branch code ${branchCode}`);
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error fetching branch logs:", err);
    res.status(500).send('Server error');
  }
};



const createVisitorLog = async (req, res) => {
  const { date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName // New field
  } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO visitor_log (date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12) RETURNING *',
      [date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


const updateVisitorLog = async (req, res) => {
  const { id } = req.params;
  const { timeOut } = req.body;
  try {
    const result = await pool.query(
      'UPDATE visitor_log SET timeOut = $1 WHERE id = $2 RETURNING *',
      [timeOut, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating visitor log:', err);
    res.status(500).send('Server error');
  }
};

const deleteVisitorLog = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM visitor_log WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllVisitorLogs,
  getVisitorLogsByPhoneNumber,
  getVisitorLogById,
  createVisitorLog,
  updateVisitorLog,
  deleteVisitorLog,
  checkTelephoneExists, 
  getAllBranches,              
  getVisitorLogsByBranchCode 
};

// auth route
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.registerUser);
router.post('/verify', authController.verifyToken);
router.post('/verify-admin', authController.verifyAdminCredentials);

module.exports = router

// rout users
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/Users Controller')
const authMiddleware = require('../middleware/auth'); 


router.post('/verify-fnumber', authMiddleware, usersController.verifyFnumber);

router.post('/', authMiddleware, usersController.createUser);
router.post('/authenticate', usersController.authenticateUser);
router.post('/verify2fa', usersController.verify2FA);
router.post('/finalize-login', usersController.finalizeLogin);
router.post('/checkUserBranches', usersController.checkUserBranches);
router.post('/track2FAStatus', usersController.track2FAStatus);











// api route for invoice
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, isFinanceRole } = require('../middleware/auth');

// Set up file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/invoices');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Invoice status constants
const INVOICE_STATUS = {
  PENDING: 'PENDING',
  REVIEW_1: 'First Approve',
  REVIEW_2: 'Second Approve',
  REVIEW_3: 'Third Approve',
  PAID: 'Paid',
};

// Database mock (replace with actual database operations)
let invoices = [];

// Upload a single invoice
router.post('/api/invoices/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { amount } = req.body;
    
    const newInvoice = {
      id: uuidv4(),
      name: req.file.originalname,
      type: req.file.mimetype,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: INVOICE_STATUS.PENDING,
      amount: amount ? parseFloat(amount) : 0,
      sender: req.user.email,
      department: req.user.department,
      uploadedBy: req.user.email,
      size: (req.file.size / 1024).toFixed(2),
      lastModified: Date.now(),
      filePath: req.file.path
    };

    invoices.push(newInvoice);

    return res.status(201).json({
      success: true,
      invoice: {
        ...newInvoice,
        filePath: undefined // Don't expose the file path to the client
      }
    });
  } catch (error) {
    console.error('Error uploading invoice:', error);
    return res.status(500).json({ success: false, message: 'Error uploading invoice', error: error.message });
  }
});

// Upload multiple invoices
router.post('/api/invoices/upload/multiple', authenticateToken, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    let amounts = {};
    if (req.body.amounts) {
      try {
        amounts = JSON.parse(req.body.amounts);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid amounts JSON' });
      }
    }

    const uploadedInvoices = req.files.map(file => {
      const amount = amounts[file.originalname] || 0;
      
      const newInvoice = {
        id: uuidv4(),
        name: file.originalname,
        type: file.mimetype,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        status: INVOICE_STATUS.PENDING,
        amount: parseFloat(amount),
        sender: req.user.email,
        department: req.user.department,
        uploadedBy: req.user.email,
        size: (file.size / 1024).toFixed(2),
        lastModified: Date.now(),
        filePath: file.path
      };

      invoices.push(newInvoice);
      return {
        ...newInvoice,
        filePath: undefined // Don't expose the file path to the client
      };
    });

    return res.status(201).json({
      success: true,
      invoices: uploadedInvoices
    });
  } catch (error) {
    console.error('Error uploading multiple invoices:', error);
    return res.status(500).json({ success: false, message: 'Error uploading invoices', error: error.message });
  }
});

// Get all invoices visible to the user
router.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    
    // Filtering
    let filteredInvoices = [...invoices];
    
    if (req.query.status) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === req.query.status);
    }
    
    if (req.query.department) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.department === req.query.department);
    }
    
    // Role-based filtering
    if (req.user.department === 'FINANCE') {
      switch (req.user.role) {
        case 'FINANCE_REVIEWER_1':
          filteredInvoices = filteredInvoices.filter(i => i.status === INVOICE_STATUS.PENDING);
          break;
        case 'FINANCE_REVIEWER_2':
          filteredInvoices = filteredInvoices.filter(i => i.status === INVOICE_STATUS.REVIEW_1);
          break;
        case 'FINANCE_REVIEWER_3':
          filteredInvoices = filteredInvoices.filter(i => i.status === INVOICE_STATUS.REVIEW_2);
          break;
        case 'FINANCE_REVIEWER_4':
          filteredInvoices = filteredInvoices.filter(i => i.status === INVOICE_STATUS.REVIEW_3);
          break;
        default:
          break;
      }
    } else {
      // For department users, show only invoices from their department
      filteredInvoices = filteredInvoices.filter(i => i.department === req.user.department);
    }
    
    const total = filteredInvoices.length;
    
    // Apply pagination
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + limit);
    
    // Remove filePath from response
    const sanitizedInvoices = paginatedInvoices.map(invoice => {
      const { filePath, ...rest } = invoice;
      return rest;
    });
    
    return res.status(200).json({
      invoices: sanitizedInvoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ success: false, message: 'Error fetching invoices', error: error.message });
  }
});

// Get invoice by ID
router.get('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Check if user has access to this invoice
    const hasAccess = req.user.department === 'FINANCE' || invoice.department === req.user.department;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const { filePath, ...sanitizedInvoice } = invoice;
    
    return res.status(200).json({
      ...sanitizedInvoice,
      downloadUrl: `/api/invoices/${id}/download`
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return res.status(500).json({ success: false, message: 'Error fetching invoice', error: error.message });
  }
});

// Download invoice file
router.get('/api/invoices/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Check if user has access to this invoice
    const hasAccess = req.user.department === 'FINANCE' || invoice.department === req.user.department;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    return res.download(invoice.filePath, invoice.name);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    return res.status(500).json({ success: false, message: 'Error downloading invoice', error: error.message });
  }
});


router.patch('/api/invoices/:id/status', authenticateToken, isFinanceRole, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!Object.values(INVOICE_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    let canUpdate = false;
    switch (req.user.role) {
      case 'FINANCE_REVIEWER_1':
        canUpdate = invoices[invoiceIndex].status === INVOICE_STATUS.PENDING && status === INVOICE_STATUS.REVIEW_1;
        break;
      case 'FINANCE_REVIEWER_2':
        canUpdate = invoices[invoiceIndex].status === INVOICE_STATUS.REVIEW_1 && status === INVOICE_STATUS.REVIEW_2;
        break;
      case 'FINANCE_REVIEWER_3':
        canUpdate = invoices[invoiceIndex].status === INVOICE_STATUS.REVIEW_2 && status === INVOICE_STATUS.REVIEW_3;
        break;
      case 'FINANCE_REVIEWER_4':
        canUpdate = invoices[invoiceIndex].status === INVOICE_STATUS.REVIEW_3 && status === INVOICE_STATUS.PAID;
        break;
      default:
        canUpdate = false;
    }
    
    if (!canUpdate) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to update this invoice to the requested status' 
      });
    }
    
    // Update the invoice status
    invoices[invoiceIndex].status = status;
    invoices[invoiceIndex].updatedAt = new Date().toISOString();
    
    return res.status(200).json({
      success: true,
      invoice: {
        id: invoices[invoiceIndex].id,
        status: invoices[invoiceIndex].status,
        updatedAt: invoices[invoiceIndex].updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return res.status(500).json({ success: false, message: 'Error updating invoice status', error: error.message });
  }
});

module.exports = router;


// const express = require('express');

const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, isFinanceRole } = require('../middleware/auth');

// Set up file storage for PO files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/purchaseorders');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// PO status constants
const PO_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  SIGNED: 'SIGNED'
};

// Database mock (replace with actual database operations)
let poFiles = [];

// Upload a single PO file
router.post('/api/purchaseorders/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const newPO = {
      id: uuidv4(),
      name: req.file.originalname,
      type: req.file.mimetype,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: PO_STATUS.PENDING,
      sender: req.user.email,
      username: req.user.username,
      department: req.user.department,
      uploadedBy: req.user.email,
      size: (req.file.size / 1024).toFixed(2),
      lastModified: Date.now(),
      filePath: req.file.path,
      signedFilePath: null
    };

    poFiles.push(newPO);

    return res.status(201).json({
      success: true,
      poFile: {
        ...newPO,
        filePath: undefined, // Don't expose the file path to the client
        signedFilePath: undefined
      }
    });
  } catch (error) {
    console.error('Error uploading PO file:', error);
    return res.status(500).json({ success: false, message: 'Error uploading PO file', error: error.message });
  }
});

// Upload multiple PO files
router.post('/api/purchaseorders/upload/multiple', authenticateToken, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadedPOFiles = req.files.map(file => {
      const newPO = {
        id: uuidv4(),
        name: file.originalname,
        type: file.mimetype,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        status: PO_STATUS.PENDING,
        sender: req.user.email,
        username: req.user.username,
        department: req.user.department,
        uploadedBy: req.user.email,
        size: (file.size / 1024).toFixed(2),
        lastModified: Date.now(),
        filePath: file.path,
        signedFilePath: null
      };

      poFiles.push(newPO);
      return {
        ...newPO,
        filePath: undefined, // Don't expose the file path to the client
        signedFilePath: undefined
      };
    });

    return res.status(201).json({
      success: true,
      poFiles: uploadedPOFiles
    });
  } catch (error) {
    console.error('Error uploading multiple PO files:', error);
    return res.status(500).json({ success: false, message: 'Error uploading PO files', error: error.message });
  }
});

// Get all PO files visible to the user
router.get('/api/purchaseorders', authenticateToken, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    
    // Filtering
    let filteredPOFiles = [...poFiles];
    
    if (req.query.status) {
      filteredPOFiles = filteredPOFiles.filter(file => file.status === req.query.status);
    }
    
    if (req.query.department) {
      filteredPOFiles = filteredPOFiles.filter(file => file.department === req.query.department);
    }
    
    // Role-based filtering
    if (req.user.department === 'FINANCE') {
      // Finance users can see all PO files
    } else {
      // For department users, show only PO files from their department
      filteredPOFiles = filteredPOFiles.filter(file => file.department === req.user.department);
    }
    
    const total = filteredPOFiles.length;
    
    // Apply pagination
    const paginatedPOFiles = filteredPOFiles.slice(startIndex, startIndex + limit);
    
    // Remove filePaths from response
    const sanitizedPOFiles = paginatedPOFiles.map(file => {
      const { filePath, signedFilePath, ...rest } = file;
      return {
        ...rest,
        hasSignedFile: !!signedFilePath
      };
    });
    
    return res.status(200).json({
      poFiles: sanitizedPOFiles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching PO files:', error);
    return res.status(500).json({ success: false, message: 'Error fetching PO files', error: error.message });
  }
});

// Get PO file by ID
router.get('/api/purchaseorders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const poFile = poFiles.find(file => file.id === id);
    
    if (!poFile) {
      return res.status(404).json({ success: false, message: 'PO file not found' });
    }
    
    // Check if user has access to this PO file
    const hasAccess = req.user.department === 'FINANCE' || poFile.department === req.user.department;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const { filePath, signedFilePath, ...sanitizedPOFile } = poFile;
    
    return res.status(200).json({
      ...sanitizedPOFile,
      downloadUrl: `/api/purchaseorders/${id}/download`,
      hasSignedFile: !!signedFilePath,
      signedDownloadUrl: signedFilePath ? `/api/purchaseorders/${id}/download/signed` : null
    });
  } catch (error) {
    console.error('Error fetching PO file:', error);
    return res.status(500).json({ success: false, message: 'Error fetching PO file', error: error.message });
  }
});

// Download original PO file
router.get('/api/purchaseorders/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const poFile = poFiles.find(file => file.id === id);
    
    if (!poFile) {
      return res.status(404).json({ success: false, message: 'PO file not found' });
    }
    
    // Check if user has access to this PO file
    const hasAccess = req.user.department === 'FINANCE' || poFile.department === req.user.department;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    return res.download(poFile.filePath, poFile.name);
  } catch (error) {
    console.error('Error downloading PO file:', error);
    return res.status(500).json({ success: false, message: 'Error downloading PO file', error: error.message });
  }
});

// Download signed PO file
router.get('/api/purchaseorders/:id/download/signed', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const poFile = poFiles.find(file => file.id === id);
    
    if (!poFile) {
      return res.status(404).json({ success: false, message: 'PO file not found' });
    }
    
    if (!poFile.signedFilePath) {
      return res.status(404).json({ success: false, message: 'Signed PO file not found' });
    }
    
    // Check if user has access to this PO file
    const hasAccess = req.user.department === 'FINANCE' || poFile.department === req.user.department;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Extract filename or generate one for the signed file
    const signedFileName = poFile.signedFileName || `signed_${poFile.name}`;
    
    return res.download(poFile.signedFilePath, signedFileName);
  } catch (error) {
    console.error('Error downloading signed PO file:', error);
    return res.status(500).json({ success: false, message: 'Error downloading signed PO file', error: error.message });
  }
});

// Update PO file status (Approve)
router.patch('/api/purchaseorders/:id/approve', authenticateToken, isFinanceRole, async (req, res) => {
  try {
    const { id } = req.params;
    
    const poFileIndex = poFiles.findIndex(file => file.id === id);
    
    if (poFileIndex === -1) {
      return res.status(404).json({ success: false, message: 'PO file not found' });
    }
    
    // Only pending files can be approved
    if (poFiles[poFileIndex].status !== PO_STATUS.PENDING) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending PO files can be approved' 
      });
    }
    
    // Update the PO file status
    poFiles[poFileIndex].status = PO_STATUS.APPROVED;
    poFiles[poFileIndex].approvedAt = new Date().toISOString();
    poFiles[poFileIndex].approvedBy = req.user.email;
    
    return res.status(200).json({
      success: true,
      poFile: {
        id: poFiles[poFileIndex].id,
        status: poFiles[poFileIndex].status,
        approvedAt: poFiles[poFileIndex].approvedAt,
        approvedBy: poFiles[poFileIndex].approvedBy
      }
    });
  } catch (error) {
    console.error('Error approving PO file:', error);
    return res.status(500).json({ success: false, message: 'Error approving PO file', error: error.message });
  }
});

// Upload signed PO file
router.post('/api/purchaseorders/:id/upload-signed', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const poFileIndex = poFiles.findIndex(file => file.id === id);
    
    if (poFileIndex === -1) {
      return res.status(404).json({ success: false, message: 'PO file not found' });
    }
    
    // Check if the user has permission to upload a signed file
    const hasAccess = req.user.department === 'FINANCE';
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Update the PO file with signed file info
    poFiles[poFileIndex].status = PO_STATUS.SIGNED;
    poFiles[poFileIndex].signedAt = new Date().toISOString();
    poFiles[poFileIndex].signedBy = req.user.email;
    poFiles[poFileIndex].signedFilePath = req.file.path;
    poFiles[poFileIndex].signedFileName = req.file.originalname;
    poFiles[poFileIndex].signedFileType = req.file.mimetype;
    
    return res.status(200).json({
      success: true,
      poFile: {
        id: poFiles[poFileIndex].id,
        status: poFiles[poFileIndex].status,
        signedAt: poFiles[poFileIndex].signedAt,
        signedBy: poFiles[poFileIndex].signedBy,
        signedFileName: poFiles[poFileIndex].signedFileName
      }
    });
  } catch (error) {
    console.error('Error uploading signed PO file:', error);
    return res.status(500).json({ success: false, message: 'Error uploading signed PO file', error: error.message });
  }
});

module.exports = router;

// auth.js - Authentication API routes

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const auth = require('../middleware/auth');

// Environment variables should be set in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '1d';

/**
 * @route   POST api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email, password, name, username, department, role FROM users WHERE email = $1',
      [email]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE },
      (err, token) => {
        if (err) throw err;
        
        // Return user info and token
        const userInfo = {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          department: user.department,
          role: user.role
        };
        
        res.json({ token, user: userInfo });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/auth/me
 * @desc    Get current user's info
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, username, department, role FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current password and new password' });
  }

  try {
    // Get user with password
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// users.js - User management API routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../db');
const auth = require('../middleware/auth');

// Roles and departments constants (matching frontend)
const ROLES = {
  FINANCE_REVIEWER_1: 'FINANCE_REVIEWER_1',
  FINANCE_REVIEWER_2: 'FINANCE_REVIEWER_2',
  FINANCE_REVIEWER_3: 'FINANCE_REVIEWER_3',
  FINANCE_REVIEWER_4: 'FINANCE_REVIEWER_4',
  EXCOBERS_REVIEWER: 'EXCOBERS_REVIEWER',
  DEPARTMENT_USER: 'DEPARTMENT_USER',
};

const DEPARTMENTS = {
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

// Middleware to check if user is an admin (assuming Finance reviewers have admin privileges)
const isAdmin = async (req, res, next) => {
  try {
    // Get user details
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is a finance reviewer (admin)
    const isFinanceReviewer = user.role.startsWith('FINANCE_REVIEWER_');
    if (!isFinanceReviewer) {
      return res.status(403).json({ message: 'Not authorized to manage users' });
    }

    next();
  } catch (err) {
    console.error('Admin check error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST api/users
 * @desc    Add a new user
 * @access  Private/Admin
 */
router.post('/', auth, isAdmin, async (req, res) => {
  const { name, email, password, username, department, role } = req.body;

  // Validate request body
  if (!name || !email || !password || !username || !department || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate department and role
  if (!Object.values(DEPARTMENTS).includes(department)) {
    return res.status(400).json({ message: 'Invalid department' });
  }

  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users 
       (name, email, password, username, department, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING id, name, email, username, department, role`,
      [name, email, hashedPassword, username, department, role]
    );

    const newUser = userResult.rows[0];
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Add user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const usersResult = await pool.query(
      'SELECT id, name, email, username, department, role, created_at, updated_at FROM users'
    );

    res.json(usersResult.rows);
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, username, department, role, created_at, updated_at FROM users WHERE id = $1',
      [req.params.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { name, email, username, department, role } = req.body;
  const userId = req.params.id;

  // Validate request body
  if (!name || !email || !username || !department || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate department and role
  if (!Object.values(DEPARTMENTS).includes(department)) {
    return res.status(400).json({ message: 'Invalid department' });
  }

  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const userResult = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, username = $3, department = $4, role = $5, updated_at = NOW() 
       WHERE id = $6 
       RETURNING id, name, email, username, department, role`,
      [name, email, username, department, role, userId]
    );

    const updatedUser = userResult.rows[0];
    res.json(updatedUser);
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/users/:id/password
 * @desc    Update user password
 * @access  Private/Admin
 */
router.put('/:id/password', auth, isAdmin, async (req, res) => {
  const { password } = req.body;
  const userId = req.params.id;

  // Validate request body
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', auth, isAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/users/constants
 * @desc    Get roles and departments constants
 * @access  Private
 */
router.get('/constants', auth, async (req, res) => {
  res.json({ ROLES, DEPARTMENTS });
});

module.exports = router;

// db.js - Database connection
const { Pool } = require('pg');

// Use environment variables for database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fnb_app',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
};

// Initialize database tables if they don't exist
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL,
        department VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `);
    
    // Check if super admin user exists, if not create default admin
    const adminExists = await client.query(
      "SELECT id FROM users WHERE email = 'admin@fnb.co.za'"
    );
    
    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await client.query(`
        INSERT INTO users (name, email, password, username, department, role, created_at, updated_at)
        VALUES ('Admin', 'admin@fnb.co.za', $1, 'admin', 'FINANCE', 'FINANCE_REVIEWER_1', NOW(), NOW())
      `, [hashedPassword]);
      
      console.log('Default admin user created');
    }
    
    console.log('Database initialized successfully');
    client.release();
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
};

module.exports = { pool, testConnection, initDatabase };

//  middleware/auth.js

const jwt = require('jsonwebtoken');

// Environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload to request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// server.js - Main application entry point
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection, initDatabase } = require('./db');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FNB API' });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test database connection
  await testConnection();
  
  // Initialize database tables
  await initDatabase();
  
  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Server startup error:', err.message);
});



//new callback errro
PS C:\Users\f8877557\file-backend> node server.js
C:\Users\f8877557\file-backend\node_modules\express\lib\router\route.js:216
        throw new Error(msg);
        ^

Error: Route.post() requires a callback function but got a [object Undefined]
    at Route.<computed> [as post] (C:\Users\f8877557\file-backend\node_modules\express\lib\router\route.js:216:15)
    at proto.<computed> [as post] (C:\Users\f8877557\file-backend\node_modules\express\lib\router\index.js:521:19)
    at Object.<anonymous> (C:\Users\f8877557\file-backend\route\invoices.js:140:8)
    at Module._compile (node:internal/modules/cjs/loader:1562:14)
    at Object..js (node:internal/modules/cjs/loader:1699:10)
    at Module.load (node:internal/modules/cjs/loader:1313:32)
    at Function._load (node:internal/modules/cjs/loader:1123:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:217:24)
    at Module.require (node:internal/modules/cjs/loader:1335:12)

Node.js v22.13.1
PS C:\Users\f8877557\file-backend>

// This is a direct replacement for your invoices.js file
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, isFinanceRole } = require('../middleware/auth'); // Adjust path if needed

// Set up file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/invoices');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Invoice status constants
const INVOICE_STATUS = {
  PENDING: 'PENDING',
  REVIEW_1: 'First Approve',
  REVIEW_2: 'Second Approve',
  REVIEW_3: 'Third Approve',
  PAID: 'Paid',
};

// Database mock (replace with actual database operations)
let invoices = [];

// Upload a single invoice
router.post('/api/invoices/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { amount } = req.body;
    
    const newInvoice = {
      id: uuidv4(),
      name: req.file.originalname,
      type: req.file.mimetype,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: INVOICE_STATUS.PENDING,
      amount: amount ? parseFloat(amount) : 0,
      sender: req.user.email,
      department: req.user.department,
      uploadedBy: req.user.email,
      size: (req.file.size / 1024).toFixed(2),
      lastModified: Date.now(),
      filePath: req.file.path
    };

    invoices.push(newInvoice);

    return res.status(201).json({
      success: true,
      invoice: {
        ...newInvoice,
        filePath: undefined // Don't expose the file path to the client
      }
    });
  } catch (error) {
    console.error('Error uploading invoice:', error);
    return res.status(500).json({ success: false, message: 'Error uploading invoice', error: error.message });
  }
});

// Upload multiple invoices
router.post('/api/invoices/upload/multiple', authenticateToken, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    let amounts = {};
    if (req.body.amounts) {
      try {
        amounts = JSON.parse(req.body.amounts);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid amounts JSON' });
      }
    }

    const uploadedInvoices = req.files.map(file => {
      const amount = amounts[file.originalname] || 0;
      
      const newInvoice = {
        id: uuidv4(),
        name: file.originalname,
        type: file.mimetype,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        status: INVOICE_STATUS.PENDING,
        amount: parseFloat(amount),
        sender: req.user.email,
        department: req.user.department,
        uploadedBy: req.user.email,
        size: (file.size / 1024).toFixed(2),
        lastModified: Date.now(),
        filePath: file.path
      };

      invoices.push(newInvoice);
      return {
        ...newInvoice,
        filePath: undefined // Don't expose the file path to the client
      };
    });

    return res.status(201).json({
      success: true,
      invoices: uploadedInvoices
    });
  } catch (error) {
    console.error('Error uploading multiple invoices:', error);
    return res.status(500).json({ success: false, message: 'Error uploading invoices', error: error.message });
  }
});

// Get all invoices visible to the user
router.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    
    // Filtering
    let filteredInvoices = [...invoices];
    
    if (req.query.status) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === req.query.status);
    }
    
    if (req.query.department) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.department === req.query.department);
    }
    
    // Role-based filtering
    if (req.user.department === 'FINANCE') {
      switch (req.user.role) {
        case 'FINANCE_REVIEWER_1':
          filteredInvoices = filteredInvoices.filter(i => i.status === INVOICE_STATUS.PENDING);
          break;
        case 'FINANCE_REVIEWER_2':
          filteredInvoices = filteredInvoices.filter(i => i.status === INVOICE_STATUS.REVIEW_1);
          break;
        case 'FINANCE_REVIEWER_3':
          filteredInvoices = filteredInvoices.filter(i => i.status === INVOICE_STATUS.REVIEW_2);
          break;
        case 'FINANCE_REVIEWER_4':
          filteredInvoices = filteredInvoices.filter(i => i.status === INVOICE_STATUS.REVIEW_3);
          break;
        default:
          break;
      }
    } else {
      // For department users, show only invoices from their department
      filteredInvoices = filteredInvoices.filter(i => i.department === req.user.department);
    }
    
    const total = filteredInvoices.length;
    
    // Apply pagination
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + limit);
    
    // Remove filePath from response
    const sanitizedInvoices = paginatedInvoices.map(invoice => {
      const { filePath, ...rest } = invoice;
      return rest;
    });
    
    return res.status(200).json({
      invoices: sanitizedInvoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ success: false, message: 'Error fetching invoices', error: error.message });
  }
});

// Get invoice by ID
router.get('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Check if user has access to this invoice
    const hasAccess = req.user.department === 'FINANCE' || invoice.department === req.user.department;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const { filePath, ...sanitizedInvoice } = invoice;
    
    return res.status(200).json({
      ...sanitizedInvoice,
      downloadUrl: `/api/invoices/${id}/download`
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return res.status(500).json({ success: false, message: 'Error fetching invoice', error: error.message });
  }
});

// Download invoice file
router.get('/api/invoices/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Check if user has access to this invoice
    const hasAccess = req.user.department === 'FINANCE' || invoice.department === req.user.department;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    return res.download(invoice.filePath, invoice.name);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    return res.status(500).json({ success: false, message: 'Error downloading invoice', error: error.message });
  }
});

// Update invoice status
router.patch('/api/invoices/:id/status', authenticateToken, isFinanceRole, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!Object.values(INVOICE_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    let canUpdate = false;
    switch (req.user.role) {
      case 'FINANCE_REVIEWER_1':
        canUpdate = invoices[invoiceIndex].status === INVOICE_STATUS.PENDING && status === INVOICE_STATUS.REVIEW_1;
        break;
      case 'FINANCE_REVIEWER_2':
        canUpdate = invoices[invoiceIndex].status === INVOICE_STATUS.REVIEW_1 && status === INVOICE_STATUS.REVIEW_2;
        break;
      case 'FINANCE_REVIEWER_3':
        canUpdate = invoices[invoiceIndex].status === INVOICE_STATUS.REVIEW_2 && status === INVOICE_STATUS.REVIEW_3;
        break;
      case 'FINANCE_REVIEWER_4':
        canUpdate = invoices[invoiceIndex].status === INVOICE_STATUS.REVIEW_3 && status === INVOICE_STATUS.PAID;
        break;
      default:
        canUpdate = false;
    }
    
    if (!canUpdate) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to update this invoice to the requested status' 
      });
    }
    
    // Update the invoice status
    invoices[invoiceIndex].status = status;
    invoices[invoiceIndex].updatedAt = new Date().toISOString();
    
    return res.status(200).json({
      success: true,
      invoice: {
        id: invoices[invoiceIndex].id,
        status: invoices[invoiceIndex].status,
        updatedAt: invoices[invoiceIndex].updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return res.status(500).json({ success: false, message: 'Error updating invoice status', error: error.message });
  }
});

// Add a comment to an invoice
router.post('/api/invoices/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }
    
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Check if user has access to this invoice
    const hasAccess = req.user.department === 'FINANCE' || invoices[invoiceIndex].department === req.user.department;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Initialize comments array if it doesn't exist
    if (!invoices[invoiceIndex].comments) {
      invoices[invoiceIndex].comments = [];
    }
    
    const newComment = {
      id: uuidv4(),
      text: comment,
      createdBy: req.user.email,
      createdAt: new Date().toISOString(),
      userRole: req.user.role
    };
    
    invoices[invoiceIndex].comments.push(newComment);
    
    return res.status(201).json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ success: false, message: 'Error adding comment', error: error.message });
  }
});

// Get comments for an invoice
router.get('/api/invoices/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Check if user has access to this invoice
    const hasAccess = req.user.department === 'FINANCE' || invoice.department === req.user.department;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const comments = invoice.comments || [];
    
    return res.status(200).json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ success: false, message: 'Error fetching comments', error: error.message });
  }
});

module.exports = router;


//line checker
// Line Checker - Run this to find exactly what's at line 140
const fs = require('fs');
const path = require('path');

// Path to the problematic file
const filePath = path.join(__dirname, 'route', 'invoices.js');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Check a range of lines around line 140
  console.log('--- Problematic Area ---');
  for (let i = 135; i <= 145; i++) {
    if (i-1 < lines.length) {
      console.log(`Line ${i}: ${lines[i-1]}`);
    }
  }
  
  // Check for incomplete router.post() calls
  console.log('\n--- Checking for incomplete router.post() calls ---');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('router.post(') && !line.includes('async') && !line.includes('=>')) {
      console.log(`Possible issue at line ${i+1}: ${line}`);
      
      // Check if this is part of a multi-line declaration
      if (!line.includes(');')) {
        let j = i + 1;
        let fullDeclaration = line;
        let foundCallback = false;
        
        // Look ahead to find closing parenthesis
        while (j < lines.length && !fullDeclaration.includes(');')) {
          fullDeclaration += lines[j].trim();
          if (lines[j].includes('function(') || lines[j].includes('=>') || lines[j].includes('async')) {
            foundCallback = true;
          }
          j++;
        }
        
        if (!foundCallback) {
          console.log(`Multi-line route without callback at lines ${i+1}-${j}`);
        }
      }
    }
  }
  
  console.log('\n--- Route Declarations ---');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('router.') && line.match(/\.(get|post|put|patch|delete)\(/)) {
      console.log(`Line ${i+1}: ${line}`);
    }
  }
  
} catch (error) {
  console.error('Error reading file:', error);
}