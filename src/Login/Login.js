// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../Context/AuthContext";
// import "../login.css";

// const Login = () => {
//   const [identifier, setIdentifier] = useState(""); 
//   const [password, setPassword] = useState("");
//   const [twoFACode, setTwoFACode] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showTwoFA, setShowTwoFA] = useState(false);
//   const [showTwoFAModal, setShowTwoFAModal] = useState(false);
//   const [twoFASessionId, setTwoFASessionId] = useState(null);
//   const [showManualCodeInput, setShowManualCodeInput] = useState(false);
//   const [pollingInterval, setPollingInterval] = useState(null);
  
//   const navigate = useNavigate();
//   const { login, authenticateLdap, verify2FA, track2FAStatus, isFnumber } = useAuth();

//   // Cleanup polling interval on component unmount
//   useEffect(() => {
//     return () => {
//       if (pollingInterval) {
//         clearInterval(pollingInterval);
//       }
//     };
//   }, [pollingInterval]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     // Basic validation
//     if (!identifier || !password) {
//       setError("F-number and password are required");
//       setLoading(false);
//       return;
//     }

//     // Identifier length validation
//     if (identifier.length > 50) {
//       setError("F-number is too long");
//       setLoading(false);
//       return;
//     }

//     try {
//       const isUsingFnumber = isFnumber(identifier);
      
//       if (isUsingFnumber) {
//         // LDAP Authentication Flow
//         const ldapResult = await authenticateLdap(identifier, password);
        
//         if (ldapResult.success) {
//           // LDAP authentication successful, now initiate 2FA
//           setTwoFASessionId(ldapResult.twoFASessionId);
//           setShowTwoFAModal(true);
//           setError("");
          
//           // Start polling for 2FA status
//           startPolling2FAStatus(ldapResult.twoFASessionId);
//         }
//       } else {
//         // Traditional email login
//         const result = await login(identifier, password);
        
//         if (result.success) {
//           if (result.requires2FA) {
//             setShowTwoFA(true);
//             setTwoFASessionId(result.twoFASessionId);
//             setError("");
//           } else {
//             navigate("/dashboard");
//           }
//         }
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setError(err.message || "Login failed. Please check your credentials.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startPolling2FAStatus = (sessionId) => {
//     console.log('[LOGIN] Starting 2FA polling with sessionId:', sessionId ? 'Present' : 'Missing');
    
//     if (!sessionId) {
//       console.error('[LOGIN] No sessionId provided to startPolling2FAStatus');
//       setError("2FA session ID missing. Please try logging in again.");
//       return;
//     }
  
//     const interval = setInterval(async () => {
//       try {
//         console.log('[LOGIN] Polling 2FA status...');
        
//         // Make sure we pass the sessionId explicitly
//         const statusResult = await track2FAStatus(sessionId);
        
//         console.log('[LOGIN] Status result:', {
//           success: statusResult.success,
//           verified: statusResult.verified,
//           rejected: statusResult.rejected,
//           pending: statusResult.pending
//         });
        
//         if (statusResult.success && statusResult.verified) {          // 2FA was accepted on phone
//           console.log('[LOGIN] 2FA verified successfully');
//           clearInterval(interval);
//           setPollingInterval(null);
//           setShowTwoFAModal(false);
//           setLoading(true);
//           navigate("/dashboard");
//         } else if (statusResult.success && statusResult.rejected) {
//           // 2FA was rejected
//           console.log('[LOGIN] 2FA was rejected');
//           clearInterval(interval);
//           setPollingInterval(null);
//           setShowTwoFAModal(false);
//           setError("2FA verification was declined. Please try again.");
//         }
//         // If neither verified nor rejected, continue polling
//       } catch (err) {
//         console.error('[LOGIN] 2FA status polling error:', err);
        
//         // Handle session expiry or other fatal errors
//         if (err.message.includes('session') || err.message.includes('expired')) {
//           clearInterval(interval);
//           setPollingInterval(null);
//           setShowTwoFAModal(false);
//           setError("2FA session expired. Please login again.");
//         } else if (err.message.includes('2FA session ID is required')) {
//           // Handle missing session ID error
//           clearInterval(interval);
//           setPollingInterval(null);
//           setShowTwoFAModal(false);
//           setError("2FA session error. Please login again.");
//         }
//       }
//     }, 2000);
  
//     setPollingInterval(interval);
  
//     // Auto-stop polling after 5 minutes
//     setTimeout(() => {
//       console.log('[LOGIN] 2FA polling timeout reached');
//       clearInterval(interval);
//       setPollingInterval(null);
//       if (showTwoFAModal) {
//         setShowTwoFAModal(false);
//         setError("2FA verification timed out. Please try again.");
//       }
//     }, 300000);
//   };

//   const handleManualCodeSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     if (!twoFACode) {
//       setError("2FA code is required");
//       setLoading(false);
//       return;
//     }

//     try {
//       const result = await verify2FA(twoFACode, twoFASessionId);
      
//       if (result.success) {
//         // Stop polling if it's running
//         if (pollingInterval) {
//           clearInterval(pollingInterval);
//           setPollingInterval(null);
//         }
//         setShowTwoFAModal(false);
//         setShowTwoFA(false);
//         navigate("/dashboard");
//       } else {
//         setError(result.message || "2FA verification failed");
//       }
//     } catch (err) {
//       console.error('2FA verification error:', err);
//       setError(err.message || "2FA verification failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handle2FASubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     if (!twoFACode) {
//       setError("2FA code is required");
//       setLoading(false);
//       return;
//     }

//     try {
//       const result = await verify2FA(twoFACode, twoFASessionId);
      
//       if (result.success) {
//         navigate("/dashboard");
//       } else {
//         setError(result.message || "2FA verification failed");
//       }
//     } catch (err) {
//       console.error('2FA verification error:', err);
//       setError(err.message || "2FA verification failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBackToLogin = () => {
//     // Stop polling if running
//     if (pollingInterval) {
//       clearInterval(pollingInterval);
//       setPollingInterval(null);
//     }
    
//     setShowTwoFA(false);
//     setShowTwoFAModal(false);
//     setTwoFACode("");
//     setTwoFASessionId(null);
//     setShowManualCodeInput(false);
//     setError("");
//   };

//   const handleCancelTwoFA = () => {
//     // Stop polling
//     if (pollingInterval) {
//       clearInterval(pollingInterval);
//       setPollingInterval(null);
//     }
    
//     setShowTwoFAModal(false);
//     setShowManualCodeInput(false);
//     setTwoFACode("");
//     setError("2FA verification cancelled. Please login again.");
//   };

//   // Determine if user is entering f-number or email
//   const isUsingFnumber = isFnumber(identifier);

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
//         <h2>Welcome to FNB File System</h2>
        
//         {!showTwoFA ? (
//           // Initial login form
//           <form onSubmit={handleSubmit}>
//             <div className="input-group">
//               <input
//                 type="text"
//                 placeholder="F-number"
//                 value={identifier}
//                 onChange={(e) => setIdentifier(e.target.value)}
//                 maxLength={50}
//                 required
//                 disabled={loading || showTwoFAModal}
//                 className={isUsingFnumber ? "fnumber-input" : "email-input"}
//               />
//               {isUsingFnumber && (
//                 <small className="input-hint">
//                   F-number format detected (LDAP authentication)
//                 </small>
//               )}
//             </div>
            
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               disabled={loading || showTwoFAModal}
//               minLength={6}
//             />
            
//             {error && <p className="error-message">{error}</p>}
            
//             <button 
//               type="submit" 
//               className="login-button"
//               disabled={loading || showTwoFAModal}
//             >
//               {loading ? <span className="spinner"></span> : "Login"}
//             </button>
//           </form>
//         ) : (
//           // Traditional 2FA verification form (for email login)
//           <form onSubmit={handle2FASubmit}>
//             <div className="two-fa-section">
//               <h3>Two-Factor Authentication</h3>
//               <p>Please enter the 6-digit code from your authenticator app</p>
              
//               <input
//                 type="text"
//                 placeholder="Enter 6-digit code"
//                 value={twoFACode}
//                 onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                 maxLength={6}
//                 required
//                 disabled={loading}
//                 className="two-fa-input"
//                 autoFocus
//               />
              
//               {error && <p className="error-message">{error}</p>}
              
//               <div className="two-fa-buttons">
//                 <button 
//                   type="submit" 
//                   className="login-button"
//                   disabled={loading || twoFACode.length !== 6}
//                 >
//                   {loading ? <span className="spinner"></span> : "Verify"}
//                 </button>
                
//                 <button 
//                   type="button" 
//                   className="back-button"
//                   onClick={handleBackToLogin}
//                   disabled={loading}
//                 >
//                   Back to Login
//                 </button>
//               </div>
//             </div>
//           </form>
//         )}

//         {/* 2FA Modal for LDAP Authentication */}
//         {showTwoFAModal && (
//           <div className="modal-overlay">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h3>Two-Factor Authentication</h3>
//               </div>
              
//               <div className="modal-body">
//                 <div className="waiting-section">
//                   <div className="pulse-animation">
//                     <div className="pulse-dot"></div>
//                   </div>
//                   <h4>Waiting for Authentication</h4>
//                   <p>A verification prompt has been sent to your mobile device.</p>
//                   <p>Please check your phone and <strong>accept</strong> the authentication request.</p>
//                 </div>

//                 <div className="modal-divider">
//                   <span>OR</span>
//                 </div>

//                 <div className="manual-code-section">
//                   {!showManualCodeInput ? (
//                     <button 
//                       type="button"
//                       className="link-button"
//                       onClick={() => setShowManualCodeInput(true)}
//                     >
//                       Enter verification code manually
//                     </button>
//                   ) : (
//                     <form onSubmit={handleManualCodeSubmit}>
//                       <div className="input-group">
//                         <label>Enter 6-digit verification code:</label>
//                         <input
//                           type="text"
//                           placeholder="000000"
//                           value={twoFACode}
//                           onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                           maxLength={6}
//                           required
//                           disabled={loading}
//                           className="two-fa-input"
//                           autoFocus
//                         />
//                       </div>
                      
//                       <div className="manual-code-buttons">
//                         <button 
//                           type="submit" 
//                           className="verify-button"
//                           disabled={loading || twoFACode.length !== 6}
//                         >
//                           {loading ? <span className="spinner"></span> : "Verify Code"}
//                         </button>
                        
//                         <button 
//                           type="button" 
//                           className="cancel-manual-button"
//                           onClick={() => {
//                             setShowManualCodeInput(false);
//                             setTwoFACode("");
//                           }}
//                           disabled={loading}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </form>
//                   )}
//                 </div>
//               </div>
              
//               {error && <p className="error-message">{error}</p>}
              
//               <div className="modal-footer">
//                 <button 
//                   type="button" 
//                   className="cancel-button"
//                   onClick={handleCancelTwoFA}
//                   disabled={loading}
//                 >
//                   Cancel Login
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {/* Help section */}
//         <div className="login-help">
//           <div className="dev-credentials">
//             <strong>Required:</strong><br/>
//             <small>
//               F-number:<br/>
//               Password: 
//             </small>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;



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
  const { login, authenticateLdap, verify2FA, track2FAStatus, isFnumber,setUser,getUserByFnumber } = useAuth();

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
          // This could be 'token', 'twoFASessionId', 'sessionId', etc.
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

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
        <h2>Welcome to First National Bank File System</h2>
        
        {!showTwoFA ? (
          // Initial login form
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="F-number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                maxLength={50}
                required
                disabled={loading || showTwoFAModal}
                className={isUsingFnumber ? "fnumber-input" : "email-input"}
              />
              {isUsingFnumber && (
                <small className="input-hint">
                  F-number format detected (LDAP authentication)
                </small>
              )}
            </div>
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || showTwoFAModal}
              minLength={6}
            />
            
            {error && <p className="error-message">{error}</p>}
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading || showTwoFAModal}
            >
              {loading ? <span className="spinner"></span> : "Login"}
            </button>
          </form>
        ) : (
          // Traditional 2FA verification form (for email login)
          <form onSubmit={handle2FASubmit}>
            <div className="two-fa-section">
              <h3>Two-Factor Authentication</h3>
              <p>Please enter the 6-digit code from your authenticator app</p>
              
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                disabled={loading}
                className="two-fa-input"
                autoFocus
              />
              
              {error && <p className="error-message">{error}</p>}
              
              <div className="two-fa-buttons">
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={loading || twoFACode.length !== 6}
                >
                  {loading ? <span className="spinner"></span> : "Verify"}
                </button>
                
                <button 
                  type="button" 
                  className="back-button"
                  onClick={handleBackToLogin}
                  disabled={loading}
                >
                  Back to Login
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2FA Modal for LDAP Authentication */}
        {showTwoFAModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Two-Factor Authentication</h3>
              </div>
              
              <div className="modal-body">
                <div className="waiting-section">
                  <div className="pulse-animation">
                    <div className="pulse-dot"></div>
                  </div>
                  <h4>Waiting for Authentication</h4>
                  <p>A verification prompt has been sent to your mobile device.</p>
                  <p>Please check your phone and <strong>accept</strong> the authentication request.</p>
                </div>

                <div className="modal-divider">
                  <span>OR</span>
                </div>

                <div className="manual-code-section">
                  {!showManualCodeInput ? (
                    <button 
                      type="button"
                      className="link-button"
                      onClick={() => setShowManualCodeInput(true)}
                    >
                      Enter verification code manually
                    </button>
                  ) : (
                    <form onSubmit={handleManualCodeSubmit}>
                      <div className="input-group">
                        <label>Enter 6-digit verification code:</label>
                        <input
                          type="text"
                          placeholder="000000"
                          value={twoFACode}
                          onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          required
                          disabled={loading}
                          className="two-fa-input"
                          autoFocus
                        />
                      </div>
                      
                      <div className="manual-code-buttons">
                        <button 
                          type="submit" 
                          className="verify-button"
                          disabled={loading || twoFACode.length !== 6}
                        >
                          {loading ? <span className="spinner"></span> : "Verify Code"}
                        </button>
                        
                        <button 
                          type="button" 
                          className="cancel-manual-button"
                          onClick={() => {
                            setShowManualCodeInput(false);
                            setTwoFACode("");
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              
              {error && <p className="error-message">{error}</p>}
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleCancelTwoFA}
                  disabled={loading}
                >
                  Cancel Login
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Help section */}
        <div className="login-help">
          <div className="dev-credentials">
            <strong>Required:</strong><br/>
            <small>
              F-number:<br/>
              Password: 
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;