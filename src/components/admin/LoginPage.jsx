import React, { useState } from "react";
// We'll add styles to this file
import "../styles/SeasonalDeals.css"; 

export default function LoginPage({ onLogin, error }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  // Update state as the user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Call the onLogin function passed from the parent component
    onLogin(credentials);
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email (admin@example.com)"
          value={credentials.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password (password123)"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        {/* Display an error message if one exists */}
        {error && <p className="login-error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}