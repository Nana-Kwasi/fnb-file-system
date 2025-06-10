import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "../login.css";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // Can be email or f-number
  const [password, setPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [twoFASessionId, setTwoFASessionId] = useState(null);
  
  const navigate = useNavigate();
  const { login, verify2FA, isFnumber } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!identifier || !password) {
      setError("Email/F-number and password are required");
      setLoading(false);
      return;
    }

    // Identifier length validation
    if (identifier.length > 50) {
      setError("Email/F-number is too long");
      setLoading(false);
      return;
    }

    try {
      const result = await login(identifier, password);
      
      if (result.success) {
        if (result.requires2FA) {
          // LDAP login requires 2FA
          setShowTwoFA(true);
          setTwoFASessionId(result.twoFASessionId);
          setError(""); // Clear any previous errors
        } else {
          // Traditional login success
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "Login failed. Please check your credentials.");
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
    setShowTwoFA(false);
    setTwoFACode("");
    setTwoFASessionId(null);
    setError("");
  };

  // Determine if user is entering f-number or email
  const isUsingFnumber = isFnumber(identifier);

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
        <h2>Welcome to FNB File System</h2>
        
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
                disabled={loading}
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
              disabled={loading}
              minLength={6}
            />
            
            {error && <p className="error-message">{error}</p>}
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : "Login"}
            </button>
          </form>
        ) : (
          // 2FA verification form
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
        
        {/* Help section */}
        <div className="login-help">
          {/* <div className="auth-options">
            <h4>Authentication Options:</h4>
            <ul>
              <li><strong>Email Login:</strong> Use your regular email and password</li>
              <li><strong>LDAP Login:</strong> Use your f-number (e.g., f00000000) and LDAP password</li>
            </ul>
          </div> */}
          
          {/* Development credentials - remove in production */}
          <div className="dev-credentials">
            <strong> Required:</strong><br/>
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