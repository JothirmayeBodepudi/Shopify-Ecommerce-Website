// src/components/pages/ProfileForm.js

import React, { useState } from "react";
import { useAuth } from "react-oidc-context";

const ProfileForm = () => {
  const auth = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // This is a crucial security step. You must call a secure backend endpoint
    // to update user attributes. Do NOT use the Cognito SDK directly on the frontend.
    const API_ENDPOINT = "http://localhost:3000/api/update-profile";

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.user.access_token}`, // Pass the access token for authentication
        },
        body: JSON.stringify({
          name: formData.name,
          phone_number: formData.phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user profile.");
      }

      // Re-authenticate the user to refresh their profile data
      await auth.signinSilent();
      window.location.reload(); // A simple way to trigger a re-render and check the profile status
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Complete Your Profile</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;