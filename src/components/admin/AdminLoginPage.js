import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AdminLogin.css'; 
import Footer from '../Footer'; 
import Navbar from '../Navbar'; 

// --- 🌐 DYNAMIC API URL ---
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const API_ENDPOINT = `${API_BASE}/api/admin/login`;

function AdminLoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Now hitting the EC2 URL directly
      const response = await axios.post(API_ENDPOINT, {
        username,
        password,
      });

      if (response.data.success) {
        // Pass the token (and user data if your backend sends it) to the parent state
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      console.error("Login attempt failed:", err);
      // Detailed error handling for EC2 connection issues
      if (!err.response) {
        setError('Cannot connect to server. Ensure EC2 backend is running.');
      } else {
        setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          
          <div className="admin-login-header">
            <div className="admin-badge">Secure Access</div>
            <h2>Admin Portal</h2>
            <p>Access the ShopEase Management Dashboard</p>
          </div>

          {/* Error Banner */}
          {error && <div className="admin-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_id"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? (
                <div className="btn-content">
                  <span className="btn-spinner"></span> 
                  Authenticating...
                </div>
              ) : 'Sign In to Dashboard'}
            </button>
          </form>
          
          <div className="admin-login-footer">
            <p>Authorized personnel only. Sessions are monitored.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminLoginPage;