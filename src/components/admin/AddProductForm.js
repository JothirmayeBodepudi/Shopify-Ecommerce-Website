import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddProductForm.css';

const API_URL = 'http://localhost:5000';

// Add onLogout to the props to handle session expiry
function AddProductForm({ token, onLogout }) {
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    brand: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!imageFile) {
      setError('Please select an image file.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('name', productData.name);
    formData.append('price', productData.price);
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    formData.append('brand', productData.brand);

    try {
      const response = await axios.post(
        `${API_URL}/admin/products`, // This URL now matches the backend
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage('Product added successfully!');
        setProductData({ name: '', price: '', description: '', category: '', brand: '' });
        setImageFile(null);
        e.target.reset();
      }
    } catch (err) {
      // (NEW) Handle session expiry
      if (err.response && err.response.status === 403) {
        alert("Your session has expired. Please log in again.");
        onLogout(); // Log the user out
      } else {
        setError(err.response?.data?.error || 'Failed to add product. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input type="text" id="name" name="name" value={productData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input type="number" id="price" name="price" value={productData.price} onChange={handleChange} required />
        </div>
         <div className="form-group">
          <label htmlFor="brand">Brand</label>
          <input type="text" id="brand" name="brand" value={productData.brand} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input type="text" id="category" name="category" value={productData.category} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={productData.description} onChange={handleChange}></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="image">Product Image</label>
          <input type="file" id="image" name="image" onChange={handleFileChange} accept="image/*" required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AddProductForm;
