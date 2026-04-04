import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Store, Package, PlusCircle, ShoppingCart, 
  LogOut, Edit3, Trash2, UploadCloud, Image as ImageIcon 
} from "lucide-react";
import "../styles/DealerDashboard.css";

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
      const res = await axios.post(`${API_BASE}/api/dealer/products`, formData);
      if (res.data.success) {
        setMessage("✅ Product published successfully!");
        e.target.reset();
        setName(""); setPrice(""); setCategory(""); setBrand(""); setDescription(""); setFile(null);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(""), 5000); // Clear message after 5s
    }
  };

  return (
    <div className="dealer-card fade-in">
      <div className="card-header-block">
        <h2>Create New Listing</h2>
        <p>Listing as: <span className="font-semibold text-blue-600">{dealerInfo?.company || dealerInfo?.name}</span></p>
      </div>

      {message && <div className={`alert-banner ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="professional-form">
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Product Name <span className="required">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Wireless Noise-Cancelling Headphones" required />
          </div>

          <div className="form-group">
            <label>Price ($) <span className="required">*</span></label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="0.00" required />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Electronics" />
          </div>

          <div className="form-group">
            <label>Brand</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g., Sony" />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Highlight the key features and specifications..." rows="4" />
          </div>

          <div className="form-group full-width">
            <label>Product Image <span className="required">*</span></label>
            <div className="file-upload-zone">
              <input type="file" id="file-upload" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required hidden />
              <label htmlFor="file-upload" className="file-upload-label">
                <UploadCloud size={32} className="upload-icon" />
                <span className="upload-text">{file ? file.name : "Click to browse or drag and drop an image"}</span>
                <span className="upload-hint">PNG, JPG up to 5MB</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions border-t mt-6 pt-6">
          <button type="submit" className="btn-primary" disabled={isUploading}>
            {isUploading ? <span className="spinner-small"></span> : <PlusCircle size={18} />}
            {isUploading ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   VIEW MY PRODUCTS
========================================================= */
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

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await axios.delete(`${API_BASE}/api/dealer/products/${productId}`);
      fetchProducts();
    } catch (err) {
      alert("❌ Delete failed");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE}/api/dealer/products/${editingProduct.productId}`, editingProduct);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert("❌ Update failed");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your inventory...</div>;

  return (
    <div className="dealer-card fade-in">
      <div className="card-header-block flex-between">
        <h2>My Inventory</h2>
        <span className="badge-count">{products.length} Products</span>
      </div>

      {products.length === 0 ? (
        <div className="empty-state-modern">
          <Package size={48} className="empty-icon" />
          <h3>Your inventory is empty</h3>
          <p>You haven't listed any products yet. Get started by adding your first product.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Info</th>
                <th>Price</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.productId}>
                  <td className="img-cell">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="product-thumbnail" /> : <ImageIcon className="placeholder-icon" />}
                  </td>
                  <td>
                    <div className="product-title">{p.name}</div>
                    <div className="product-meta">{p.category || 'Uncategorized'} • {p.brand || 'No Brand'}</div>
                  </td>
                  <td className="font-semibold text-gray-800">${Number(p.price).toFixed(2)}</td>
                  <td className="actions-cell text-right">
                    <button className="icon-btn edit" onClick={() => setEditingProduct(p)} title="Edit"><Edit3 size={16} /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(p.productId)} title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="modern-modal-overlay">
          <div className="modern-modal-content">
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button className="close-btn" onClick={() => setEditingProduct(null)}>×</button>
            </div>
            <div className="modal-body form-grid">
              <div className="form-group full-width">
                <label>Product Name</label>
                <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div className="form-group full-width">
                <label>Price ($)</label>
                <input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea rows="4" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   VIEW ORDERS
========================================================= */
function ViewMyOrders({ dealerId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
      const res = await axios.put(`${API_BASE}/api/vendor/orders/${orderId}/status`, 
        { status },
        { headers: { "X-Dealer-Id": dealerId } }
      );
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.error || "Update failed"}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

  return (
    <div className="dealer-card fade-in">
      <div className="card-header-block flex-between">
        <h2>Sales & Fulfillment</h2>
        <span className="badge-count">{orders.length} Active Orders</span>
      </div>
      
      {orders.length === 0 ? (
        <div className="empty-state-modern">
          <ShoppingCart size={48} className="empty-icon" />
          <h3>No orders yet</h3>
          <p>When customers purchase your products, they will appear here.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="modern-table align-top">
            <thead>
              <tr>
                <th>Order Details</th>
                <th>Items to Fulfill</th>
                <th>Customer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const myItems = o.items.filter(item => item.dealerId === dealerId);
                const orderDate = new Date(o.createdAt).toLocaleDateString();
                
                return (
                  <tr key={o.orderId}>
                    <td>
                      <div className="order-id-badge">#{o.orderId.substring(o.orderId.length - 6)}</div>
                      <div className="text-sm text-gray-500 mt-1">{orderDate}</div>
                    </td>
                    <td>
                      <div className="order-items-list">
                        {myItems.map((item, idx) => (
                          <div key={idx} className="order-item-pill">
                            <span className="qty">x{item.quantity}</span> {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-800">{o.shipping?.name || "Customer"}</div>
                      <div className="text-sm text-gray-500">{o.shipping?.city || ''}</div>
                    </td>
                    <td>
                      <select
                        className={`status-select-modern status-${o.status?.toLowerCase().replace(/\s+/g, '-')}`}
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
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD LAYOUT
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

  if (loading) return <div className="h-screen w-full flex items-center justify-center text-gray-600 bg-gray-50">Authenticating...</div>;

  return (
    <div className="b2b-dashboard-layout">
      {/* Sidebar */}
      <aside className="b2b-sidebar">
        <div className="sidebar-brand">
          <Store size={24} className="brand-icon" />
          <h2>Vendor Portal</h2>
        </div>
        
        <div className="sidebar-user-block">
          <div className="user-avatar">{dealerInfo?.company?.charAt(0) || dealerInfo?.name?.charAt(0) || 'V'}</div>
          <div className="user-details">
            <div className="user-company">{dealerInfo?.company || dealerInfo?.name}</div>
            <div className="user-role">Verified Vendor</div>
          </div>
        </div>

        <nav className="b2b-nav">
          <div className="nav-label">Inventory Management</div>
          <button className={`nav-btn ${activeView === "viewProducts" ? "active" : ""}`} onClick={() => setActiveView("viewProducts")}>
            <Package size={18} /> My Inventory
          </button>
          <button className={`nav-btn ${activeView === "addProduct" ? "active" : ""}`} onClick={() => setActiveView("addProduct")}>
            <PlusCircle size={18} /> New Listing
          </button>

          <div className="nav-label mt-6">Sales</div>
          <button className={`nav-btn ${activeView === "viewOrders" ? "active" : ""}`} onClick={() => setActiveView("viewOrders")}>
            <ShoppingCart size={18} /> Manage Orders
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-btn logout-btn">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="b2b-main">
        <header className="b2b-topbar">
          <h1 className="page-title">
            {activeView === "viewProducts" && "Inventory Overview"}
            {activeView === "addProduct" && "Create Product Listing"}
            {activeView === "viewOrders" && "Order Fulfillment"}
          </h1>
        </header>
        
        <div className="b2b-content-area">
          {activeView === "viewProducts" && <ViewMyProducts dealerId={dealerId} />}
          {activeView === "addProduct" && <AddProductForm dealerId={dealerId} dealerInfo={dealerInfo} />}
          {activeView === "viewOrders" && <ViewMyOrders dealerId={dealerId} />}
        </div>
      </main>
    </div>
  );
}