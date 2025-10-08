import React, { useState } from "react";
import "../components/styles/SeasonalDeals.css"; // Correct spelling 
export default function AddDealForm({ onAddDeal }) {
  // State to hold the values from the form inputs
  const [formData, setFormData] = useState({
    name: "",
    originalPrice: "",
    discountedPrice: "",
    img: "",
  });

  // A single handler to update state for any form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the browser from reloading the page

    // Basic validation
    if (!formData.name || !formData.originalPrice || !formData.discountedPrice || !formData.img) {
      alert("Please fill out all fields.");
      return;
    }
    
    // Create a new deal object from the form data
    const newDeal = {
      id: Date.now(), // Use a timestamp for a unique ID
      name: formData.name,
      originalPrice: parseFloat(formData.originalPrice),
      discountedPrice: parseFloat(formData.discountedPrice),
      img: formData.img,
      // Set a default expiry date, e.g., 3 days from now
      expiryDate: new Date().getTime() + 3 * 24 * 60 * 60 * 1000,
    };

    // Call the function passed down from the parent to add the deal
    onAddDeal(newDeal);

    // Clear the form fields after submission
    setFormData({ name: "", originalPrice: "", discountedPrice: "", img: "" });
  };

  return (
    <div className="admin-panel">
      <h2>Add a New Deal</h2>
      <form onSubmit={handleSubmit} className="add-deal-form">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="originalPrice"
          placeholder="Original Price ($)"
          value={formData.originalPrice}
          onChange={handleChange}
          step="0.01"
          required
        />
        <input
          type="number"
          name="discountedPrice"
          placeholder="Discounted Price ($)"
          value={formData.discountedPrice}
          onChange={handleChange}
          step="0.01"
          required
        />
        <input
          type="text"
          name="img"
          placeholder="Image URL"
          value={formData.img}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Deal</button>
      </form>
    </div>
  );
}