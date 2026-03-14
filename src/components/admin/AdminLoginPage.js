import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AdminLogin.css'; // Basic styling
import Footer from '../Footer'; // Make sure Footer is imported
import Navbar from '../Navbar'; // Make sure Navbar is imported

// --- CORRECTED API URL ---
// Use a relative path. The browser will send the request to the same domain
// the app is running on (Vercel URL in production, localhost in development).
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
      // Use the relative endpoint here
      const response = await axios.post(API_ENDPOINT, {
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

  // --- WRAPPED IN A REACT FRAGMENT ---
  return (
    <>
    <Navbar/>
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
      <Footer />
    </>
  );
}

export default AdminLoginPage;

