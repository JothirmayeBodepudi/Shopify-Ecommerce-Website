import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AdminLogin.css'; 
import Footer from '../Footer'; 
import Navbar from '../Navbar'; 

const API_ENDPOINT = '/api/admin/login';

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
      const response = await axios.post(API_ENDPOINT, {
        username,
        password,
      });

      if (response.data.success) {
        onLogin(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
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
            <h2>Admin Portal</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>

          {/* Upgraded Error Banner */}
          {error && <div className="admin-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? <span className="btn-spinner"></span> : 'Sign In'}
            </button>
          </form>
          
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminLoginPage;