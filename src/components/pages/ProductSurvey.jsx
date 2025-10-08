import React, { useState } from "react";
// import Navbar from "../Navbar";  // Assuming Navbar and CSS are in parent folders
// import "../styles/ProductSurvey.css";

export default function ProductSurvey() {
  const [formData, setFormData] = useState({
    productName: "",
    rating: "",
    feedback: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // This fetch call is for demonstration.
      // Replace "http://localhost:5000/product-survey" with your actual API endpoint.
      const response = await fetch("http://localhost:5000/product-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Mocking a successful response for demonstration purposes
      if (response.ok || true) { // Using 'true' to simulate success without a backend
        setMessage("✅ Survey submitted successfully!");
        setFormData({
          productName: "",
          rating: "",
          feedback: "",
        });
      } else {
        const data = await response.json();
        setMessage("❌ Failed to submit survey: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("⚠️ An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Inline styles for a self-contained component
  const styles = `
    .product-survey-container {
      font-family: 'Inter', sans-serif;
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }
    h1 {
      text-align: center;
      color: #1a202c;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .product-survey-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .product-survey-form input,
    .product-survey-form select,
    .product-survey-form textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #cbd5e0;
      border-radius: 8px;
      font-size: 1rem;
      color: #2d3748;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .product-survey-form input:focus,
    .product-survey-form select:focus,
    .product-survey-form textarea:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
    }
    .product-survey-form textarea {
      min-height: 100px;
      resize: vertical;
    }
    .product-survey-form button {
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      background-color: #4299e1;
      color: white;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .product-survey-form button:hover {
      background-color: #3182ce;
    }
    .product-survey-form button:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }
    .survey-message {
      text-align: center;
      margin-top: 1.5rem;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 500;
      background-color: #f0fff4;
      color: #38a169;
    }
    .survey-message:before {
      content: '';
      margin-right: 0.5rem;
    }
  `;

  return (
    <>
      {/* <Navbar /> */}
      <style>{styles}</style>
      <div className="product-survey-container">
        <h1>Product Survey</h1>
        <form onSubmit={handleSubmit} className="product-survey-form">
          {/* --- CHANGE: Reverted back to a text input for the product name --- */}
          <input
            type="text"
            name="productName"
            placeholder="Product Name"
            value={formData.productName}
            onChange={handleChange}
            required
          />
          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            required
          >
            <option value="">Select Rating</option>
            <option value="1">1 - Very Poor</option>
            <option value="2">2 - Poor</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>
          <textarea
            name="feedback"
            placeholder="Additional Feedback"
            value={formData.feedback}
            onChange={handleChange}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Survey"}
          </button>
        </form>
        {message && <p className="survey-message">{message}</p>}
      </div>
    </>
  );
}
