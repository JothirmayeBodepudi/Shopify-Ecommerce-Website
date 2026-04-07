import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddProductForm.css';

// --- 🌐 DYNAMIC API URL ---
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

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

    // Using FormData for Multi-part (Image + Text) upload
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('name', productData.name);
    formData.append('price', productData.price);
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    formData.append('brand', productData.brand);

    try {
      const response = await axios.post(
        `${API_BASE}/api/admin/products`, // Fixed to use the full AWS URL
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
        // Reset local state
        setProductData({ name: '', price: '', description: '', category: '', brand: '' });
        setImageFile(null);
        // Reset the actual HTML input file field
        e.target.reset();
      }
    } catch (err) {
      console.error("Upload Error:", err);
      
      // Handle session expiry (401 or 403)
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        alert("Your session has expired or you are unauthorized. Please log in again.");
        if (onLogout) onLogout(); 
      } else {
        setError(err.response?.data?.error || 'Failed to add product. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="form-card-modern">
        <h2 className="form-title">Inventory Management</h2>
        <p className="form-subtitle">Upload new products to the ShopEase catalog.</p>

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input type="text" id="name" name="name" value={productData.name} onChange={handleChange} placeholder="e.g. Premium Cotton Tee" required />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input type="number" id="price" name="price" value={productData.price} onChange={handleChange} placeholder="0.00" step="0.01" required />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input type="text" id="brand" name="brand" value={productData.brand} onChange={handleChange} placeholder="Brand Name" />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input type="text" id="category" name="category" value={productData.category} onChange={handleChange} placeholder="Category" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={productData.description} onChange={handleChange} placeholder="Describe the product features..."></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="image" className="file-upload-label">
              <span>Product Image</span>
              <div className="file-input-wrapper">
                <input type="file" id="image" name="image" onChange={handleFileChange} accept="image/*" required />
              </div>
            </label>
          </div>

          <button type="submit" className="btn-pd-buy" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Uploading to S3...' : 'Confirm & Add Product'}
          </button>
        </form>

        {message && <div className="pd-success-alert">{message}</div>}
        {error && <div className="pd-error-alert">{error}</div>}
      </div>
    </div>
  );
}

export default AddProductForm;