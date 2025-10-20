import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "../styles/DealerRegistration.css";
import Footer from "../Footer";

export default function DealerRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.dealerId) {
        // --- (UPDATED) ---
        // Changed the success message to be more user-friendly
        setMessage("✅ Registration successful! Redirecting to login...");
        
        // Redirect to the login page after a short delay
        setTimeout(() => {
          navigate("/dealer-login");
        }, 3000); // Wait 3 seconds
      } else {
        setMessage("❌ " + (data.error || "Something went wrong!"));
      }
    } catch (error) {
      setMessage("❌ Server error!");
    }
  };

  return (
    <>
      <Navbar />
      <div className="dealer-form-container">
        <h2>Dealer Registration</h2>
        <form onSubmit={handleSubmit} className="dealer-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} required />
          <textarea name="address" placeholder="Business Address" value={formData.address} onChange={handleChange} required />
          <button type="submit">Register</button>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate('/dealer-login')}>
            Log In Here
          </span>
        </p>

        {message && <p className={message.includes('✅') ? 'success-message' : 'error-message'}>{message}</p>}
      </div>
<Footer />
    </>
  );
}