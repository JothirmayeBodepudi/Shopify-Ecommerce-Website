import React, { useState } from "react";
import Navbar from "../Navbar"; // ✅ Correctly import Navbar component
import "../styles/Contact.css"; // ✅ CSS import is fine

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Thanks, ${formData.name}! Your message has been saved.`);
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert("Failed to save message.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Try again later.");
    }
  };

  return (
    <>
      <Navbar /> {/* ✅ Navbar now works */}
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p>We’d love to hear from you! Fill out the form below.</p>
        
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>

          <button type="submit">Send Message</button>
        </form>
      </div>
    </>
  );
}
