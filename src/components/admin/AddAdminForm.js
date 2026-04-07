import React, { useState } from 'react';
import axios from 'axios';

// --- 🌐 DYNAMIC API URL ---
// Uses your Amplify Environment Variable for Production
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";
const ADD_USER_URL = `${API_BASE}/api/admin/add-user`;

function AddAdminForm({ token }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        ADD_USER_URL,
        { username, password },
        {
          headers: {
            // Ensure the 'Bearer ' prefix is correctly formatted
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Using optional chaining and safety checks for the response
      const successMsg = response.data?.message || "Admin user created successfully!";
      setMessage(successMsg);
      setUsername(''); 
      setPassword('');
    } catch (err) {
      // Improved error logging for debugging during deployment
      console.error("Add Admin Error:", err);
      setError(err.response?.data?.error || 'Failed to connect to the admin server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <div className="admin-form-card">
        <h3>Create New Admin User</h3>
        <p className="admin-subtitle">Add a trusted team member to manage ShopEase.</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {message && <div className="pd-success-alert">{message}</div>}
          {error && <div className="pd-error-alert">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="new-username">New Username</label>
            <input
              className="auth-input"
              type="text"
              id="new-username"
              placeholder="e.g. admin_josh"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              className="auth-input"
              type="password"
              id="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-pd-buy" 
            style={{ width: '100%', marginTop: '10px' }} 
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Add Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddAdminForm;