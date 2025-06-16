
    //new pool
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
          // 2FA was accepted on phone - authentication is complete
          console.log('[LOGIN] 2FA verified successfully');
          clearInterval(interval);
          setPollingInterval(null);
          setShowTwoFAModal(false);
          setLoading(true);
          
          try {
            // **FIX: Get user data directly since 2FA is already verified**
            if (statusResult.fnumber || identifier) {
              const fnumberToUse = statusResult.fnumber || identifier;
              console.log('[LOGIN] Fetching user data for fnumber:', fnumberToUse);
              
              const userData = await getUserByFnumber(fnumberToUse);
              
              if (userData.success && userData.user) {
                console.log('[LOGIN] User data fetched successfully');
                
                // Set user data in context - this should trigger authentication state
                setUser(userData.user);
                
                // Store auth data in localStorage (similar to verify2FA function)
                localStorage.setItem('user', JSON.stringify(userData.user));
                localStorage.setItem('token', sessionId); // Use sessionId as token
                localStorage.setItem('sessionId', sessionId);
                
                setLoading(false);
                navigate("/dashboard");
              } else {
                throw new Error('Failed to fetch user data');
              }
            } else {
              // **ALTERNATIVE: Try calling verify2FA with a special indicator**
              console.log('[LOGIN] Calling verify2FA to complete authentication...');
              const verifyResult = await verify2FA('VERIFIED_VIA_POLLING', sessionId);
              
              if (verifyResult.success) {
                console.log('[LOGIN] Full authentication completed successfully');
                setLoading(false);
                navigate("/dashboard");
              } else {
                throw new Error('Failed to complete authentication via verify2FA');
              }
            }
          } catch (authError) {
            console.error('[LOGIN] Error completing authentication:', authError);
            setLoading(false);
            setError("2FA verified but failed to complete login. Please try again.");
          }
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




//new login
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
          console.log('[LOGIN] Session ID value:', sessionId);
          
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
            // 2FA was accepted on phone - DON'T call verify2FA, just handle the success
            console.log('[LOGIN] 2FA verified successfully via mobile app');
            clearInterval(interval);
            setPollingInterval(null);
            setShowTwoFAModal(false);
            setLoading(true);
            
            // **FIX: Handle 2FA success without calling verify2FA**
            try {
              if (statusResult.fnumber) {
                console.log('[LOGIN] Fetching user data for fnumber:', statusResult.fnumber);
                const userData = await getUserByFnumber(statusResult.fnumber);
                
                if (userData.success) {
                  console.log('[LOGIN] User data fetched successfully:', userData.user);
                  // Update auth context with complete user data
                  setUser(userData.user);
                  
                  // Navigate to dashboard
                  navigate("/dashboard");
                } else {
                  console.warn('[LOGIN] Failed to fetch user data:', userData.error);
                  setError("Login successful but failed to load user profile. Please try again.");
                  setLoading(false);
                }
              } else {
                console.error('[LOGIN] No fnumber in status result');
                setError("Login successful but missing user information. Please try again.");
                setLoading(false);
              }
            } catch (userFetchError) {
              console.error('[LOGIN] Error fetching user data:', userFetchError);
              setError("Login successful but failed to load user profile. Please try again.");
              setLoading(false);
            }
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
  }





  //LOGIN
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
  const { login, authenticateLdap, verify2FA, track2FAStatus, isFnumber } = useAuth();

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
            // 2FA was accepted on phone - NOW COMPLETE THE LOGIN PROCESS
            console.log('[LOGIN] 2FA verified successfully - completing login');
            clearInterval(interval);
            setPollingInterval(null);
            setShowTwoFAModal(false);
            setLoading(true);
            
            try {
              // CRITICAL FIX: Use verify2FA to complete the authentication and get tokens
              console.log('[LOGIN] Calling verify2FA to complete authentication...');
              const verifyResult = await verify2FA("", sessionId); // Empty code since it's already verified
              
              if (verifyResult.success) {
                console.log('[LOGIN] Authentication completed successfully with tokens');
                navigate("/dashboard");
              } else {
                console.error('[LOGIN] Failed to complete authentication:', verifyResult);
                setError("Failed to complete login. Please try again.");
              }
            } catch (completeError) {
              console.error('[LOGIN] Error completing authentication:', completeError);
              setError("Failed to complete login. Please try again.");
            } finally {
              setLoading(false);
            }
            
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

  // Rest of your component JSX remains the same...
  return (
    <div className="login-container">
      {/* Your existing JSX here */}
    </div>
  );
};

export default Login;


//AUHT CONTEXT
/**
 * Verify 2FA code - Second step for LDAP login
 * @param {string} code - 2FA verification code (can be empty for automatic verification)
 * @param {string} sessionId - 2FA session ID (optional, uses stored if not provided)
 * @returns {Promise<Object>} 2FA verification result
 */
const verify2FA = async (code, sessionId = null) => {
  try {
    const activeSessionId = sessionId || twoFASessionId;
    
    if (!activeSessionId) {
      throw new Error('No active 2FA session found');
    }

    console.log('[AUTH_CONTEXT] Sending 2FA verification request with:', {
      code: code ? 'PROVIDED' : 'EMPTY_FOR_AUTO_VERIFY',
      sessionId: activeSessionId ? 'PROVIDED' : 'MISSING'
    });

    // Prepare request body - handle both manual code entry and automatic verification
    const requestBody = {
      token: activeSessionId, // Backend expects 'token' not 'twoFASessionId'
      fnumber: pendingLdapAuth?.fnumber // Include f-number if available
    };

    // Only include code if it's provided (for manual entry)
    if (code && code.trim() !== '') {
      requestBody.code = code;
    }

    const response = await apiRequest('/api/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[AUTH_CONTEXT] 2FA verification failed:', errorData);
      throw new Error(errorData.error || errorData.message || '2FA verification failed');
    }

    const data = await response.json();
    console.log('[AUTH_CONTEXT] 2FA verification response:', data);

    if (data.success) {
      console.log('[AUTH_CONTEXT] Setting user data:', data.user);
      console.log('[AUTH_CONTEXT] Setting token:', data.token ? 'PROVIDED' : 'MISSING');
      console.log('[AUTH_CONTEXT] Setting sessionId:', data.sessionId ? 'PROVIDED' : 'MISSING');
      
      // Complete login process with proper error handling
      if (!data.user || !data.token) {
        console.error('[AUTH_CONTEXT] Incomplete authentication data received:', {
          hasUser: !!data.user,
          hasToken: !!data.token,
          hasSessionId: !!data.sessionId
        });
        throw new Error('Incomplete authentication data received from server');
      }

      // Set authentication state
      setUser(data.user);
      setToken(data.token);
      setSessionId(data.sessionId);
      
      // Store in localStorage with error handling
      try {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        if (data.sessionId) {
          localStorage.setItem('sessionId', data.sessionId);
        }
        console.log('[AUTH_CONTEXT] Authentication data stored in localStorage successfully');
      } catch (storageError) {
        console.error('[AUTH_CONTEXT] Failed to store data in localStorage:', storageError);
        // Don't throw here, as the login can still proceed
      }
      
      // Clear 2FA state
      setTwoFASessionId(null);
      setPendingLdapAuth(null);
      
      console.log('[AUTH_CONTEXT] 2FA verification completed successfully');
    } else {
      console.error('[AUTH_CONTEXT] 2FA verification failed - success is false:', data);
    }

    return data;
  } catch (error) {
    console.error('[AUTH_CONTEXT] 2FA verification error:', error);
    throw error;
  }
};