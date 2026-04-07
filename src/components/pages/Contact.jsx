import React, { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import "../styles/Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Thanks, ${formData.name}! Your message has been received.`);
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert("Failed to save message.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <Navbar />
      
      <main className="contact-main">
        <section className="contact-hero">
          <h1>Get in Touch</h1>
          <p>Have a question or feedback? We're here to help you 24/7.</p>
        </section>

        <div className="contact-grid-container">
          {/* Left Side: Contact Info */}
          <div className="contact-info-card">
            <div className="info-item">
              <div className="icon-box"><MapPin size={24} /></div>
              <div>
                <h3>Our Office</h3>
                <p>2nd Floor, MG Road, Bangalore, India</p>
              </div>
            </div>

            <div className="info-item">
              <div className="icon-box"><Phone size={24} /></div>
              <div>
                <h3>Phone Number</h3>
                <p>+91 98765 43210</p>
              </div>
            </div>

            <div className="info-item">
              <div className="icon-box"><Mail size={24} /></div>
              <div>
                <h3>Email Address</h3>
                <p>support@shopease.com</p>
              </div>
            </div>

            <div className="info-item">
              <div className="icon-box"><MessageCircle size={24} /></div>
              <div>
                <h3>Live Chat</h3>
                <p>Available Mon-Sat (9am - 7pm)</p>
              </div>
            </div>
          </div>

          {/* Right Side: The Form */}
          <div className="contact-form-card">
            <form onSubmit={handleSubmit} className="professional-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Your Message</label>
                <textarea
                  name="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : <>Send Message <Send size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}