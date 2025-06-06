import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "../login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    // Email length validation (keeping your original logic)
    if (email.length > 50) {
      setError("Email is too long");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
        <h2>Welcome to FNB File System</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={50}
            required
            disabled={loading}
          />
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
        
        {/* Optional: Add test credentials for development */}
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>Example:</strong><br/>
          Email: user@fnb.co.za<br/>
          Password: 12345
        </div>
      </div>
    </div>
  );
};

export default Login;