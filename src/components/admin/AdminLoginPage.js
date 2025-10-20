import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AdminLogin.css'; // Basic styling

// --- REFACTORED API URL LOGIC ---

// Determine the correct base URL based on the environment (development vs. production)
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_BASE_URL  // Your live Vercel URL
  : process.env.REACT_APP_API_DEV_URL;   // Your local development URL (e.g., http://localhost:5001)

// The specific endpoint for this component
const LOGIN_ENDPOINT = '/api/admin/login';


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
      // Construct the full URL for the request
      const response = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
        username,
        password,
      });

      if (response.data.success) {
        // Pass the token to the parent App component
        onLogin(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Admin Panel Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default AdminLoginPage;
