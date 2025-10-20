import React, { useState } from 'react';
import axios from 'axios';

// The API URL for adding a new admin user
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
const ADD_USER_URL = '/api/admin/add-user';

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
            // Include the authorization token
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setMessage(response.data.message);
      setUsername(''); // Clear form on success
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <h3>Create New Admin User</h3>
      <form onSubmit={handleSubmit}>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="new-username">New Username</label>
          <input
            type="text"
            id="new-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Admin'}
        </button>
      </form>
    </div>
  );
}

export default AddAdminForm;