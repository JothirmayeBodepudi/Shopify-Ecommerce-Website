import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DealerDashboard.css";
import axios from "axios";

const API_BASE = "http://localhost:5001";

/* =========================================================
   ADD PRODUCT FORM
========================================================= */
function AddProductForm({ dealerId, dealerInfo }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name || !price) {
      setMessage("⚠️ Please fill all required fields.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("dealerId", dealerId);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", category || "");
    formData.append("brand", brand || "");
    formData.append("description", description || "");
    formData.append("image", file);

    try {
      // Note: If using JWT for dealers, add headers: { Authorization: `Bearer ${token}` }
      const res = await axios.post(`${API_BASE}/api/dealer/products`, formData);
      if (res.data.success) {
        setMessage("✅ Product uploaded successfully!");
        e.target.reset();
        setName(""); setPrice(""); setCategory(""); setBrand(""); setDescription(""); setFile(null);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="form-card product-upload-container">
      <h2>Add a New Product</h2>
      <p>Listings appear as: <strong>{dealerInfo?.company || dealerInfo?.name}</strong></p>

      <form onSubmit={handleSubmit} className="product-upload-form">
        <div className="form-group full-width">
          <label>Product Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wireless Headphones" required />
        </div>

        <div className="form-group">
          <label>Price ($)</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="0.00" required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Electronics" />
        </div>

        <div className="form-group">
          <label>Brand</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Sony" />
        </div>

        <div className="form-group full-width">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers about your product..." />
        </div>

        <div className="form-group file-upload-wrapper">
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
        </div>

        <div className="submit-btn-wrapper">
          <button type="submit" className="submit-btn" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Publish Product"}
          </button>
        </div>
      </form>

      {message && <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
    </div>
  );
}

function ViewMyProducts({ dealerId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/dealer/products/${dealerId}`);
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error("Fetch products error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [dealerId]);

  /* -------- DELETE -------- */
  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_BASE}/api/dealer/products/${productId}`);
      fetchProducts();
    } catch (err) {
      alert("❌ Delete failed");
    }
  };

  /* -------- EDIT -------- */
  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE}/api/dealer/products/${editingProduct.productId}`,
        editingProduct
      );
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert("❌ Update failed");
    }
  };

  if (loading) return <p>Loading your products...</p>;

  return (
    <div className="form-card">
      <h2>My Inventory</h2>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="dealer-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId}>
                <td>
                  <img src={p.imageUrl} alt={p.name} className="table-img" />
                </td>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(p.productId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Product</h3>

            <input
              type="text"
              value={editingProduct.name}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, name: e.target.value })
              }
            />

            <input
              type="number"
              value={editingProduct.price}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, price: e.target.value })
              }
            />

            <textarea
              value={editingProduct.description}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  description: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button className="btn-save" onClick={handleUpdate}>
                Save
              </button>
              <button
                className="btn-cancel"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/* =========================================================
   VIEW ORDERS (OWNERSHIP TRACKING)
========================================================= */
function ViewMyOrders({ dealerId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetches orders where at least one item belongs to this dealerId
      const res = await axios.get(`${API_BASE}/api/vendor/orders/${dealerId}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Order fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [dealerId]);

  const updateStatus = async (orderId, status) => {
    try {
      // Sends update to the ownership-protected backend route
      const res = await axios.put(`${API_BASE}/api/vendor/orders/${orderId}/status`, 
        { status },
        { headers: { "X-Dealer-Id": dealerId } } // Passing dealerId for validation if not using JWT
      );
      if (res.data.success) {
        alert("✅ Tracking status updated.");
        fetchOrders();
      }
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.error || "Update failed"}`);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="form-card">
      <h2>Sales & Tracking</h2>
      {orders.length === 0 ? <p>No orders for your products yet.</p> : (
        <table className="dealer-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>My Items</th>
              <th>Customer</th>
              <th>Total (Order)</th>
              <th>Tracking Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              // Filter items to only show the ones belonging to THIS dealer
              const myItems = o.items.filter(item => item.dealerId === dealerId);
              
              return (
                <tr key={o.orderId}>
                  <td><small>{o.orderId}</small></td>
                  <td>
                    {myItems.map((item, idx) => (
                      <div key={idx} className="order-item-mini">
                        {item.name} (x{item.quantity})
                      </div>
                    ))}
                  </td>
                  <td>{o.shipping?.name || "Customer"}</td>
                  <td>₹{o.totalAmount}</td>
                  <td>
                    <select
                      className="status-select"
                      value={o.status}
                      onChange={(e) => updateStatus(o.orderId, e.target.value)}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */
export default function DealerDashboard() {
  const [dealerInfo, setDealerInfo] = useState(null);
  const [activeView, setActiveView] = useState("viewProducts");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dealerId = localStorage.getItem("dealerId");

  useEffect(() => {
    if (!dealerId) {
      navigate("/dealer-login");
      return;
    }

    const fetchDealerInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/dealers/${dealerId}`);
        if (res.data.success) setDealerInfo(res.data.dealer);
        else handleLogout();
      } catch (err) {
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchDealerInfo();
  }, [dealerId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("dealerId");
    navigate("/dealer-login");
  };

  if (loading) return <div className="loading-screen">Authenticating...</div>;

  return (
    <div className="dealer-dashboard-layout">
      <aside className="dealer-sidebar">
        <div className="sidebar-header">
          <h2>Dealer Panel</h2>
          <p>Welcome, <strong>{dealerInfo?.company || dealerInfo?.name}</strong></p>
        </div>
        <nav className="sidebar-nav">
          <button className={activeView === "viewProducts" ? "active" : ""} onClick={() => setActiveView("viewProducts")}>My Products</button>
          <button className={activeView === "addProduct" ? "active" : ""} onClick={() => setActiveView("addProduct")}>Add Product</button>
          <button className={activeView === "viewOrders" ? "active" : ""} onClick={() => setActiveView("viewOrders")}>Manage Orders</button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </aside>

      <main className="dealer-main-content">
        <header className="content-header">
            <h1>{activeView === "viewProducts" ? "Inventory" : activeView === "addProduct" ? "New Listing" : "Orders"}</h1>
        </header>
        {activeView === "viewProducts" && <ViewMyProducts dealerId={dealerId} />}
        {activeView === "addProduct" && <AddProductForm dealerId={dealerId} dealerInfo={dealerInfo} />}
        {activeView === "viewOrders" && <ViewMyOrders dealerId={dealerId} />}
      </main>
    </div>
  );
}
