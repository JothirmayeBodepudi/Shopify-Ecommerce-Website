import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DealerDashboard.css"; // Make sure you have this CSS file
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// --- Form Component for Adding Products ---
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
            setMessage("⚠️ Please fill all required fields and choose an image.");
            return;
        }

        setIsUploading(true);
        setMessage("Uploading product...");

        const formData = new FormData();
        formData.append("dealerId", dealerId);
        formData.append("name", name);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("brand", brand);
        formData.append("description", description);
        formData.append("image", file);

        try {
            const response = await fetch(`${API_BASE}/dealer/products`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Upload failed");

            setMessage("✅ Product uploaded successfully!");
            // Reset form
            setName("");
            setPrice("");
            setCategory("");
            setBrand("");
            setDescription("");
            setFile(null);
            e.target.reset(); // Resets the file input
        } catch (err) {
            setMessage(`❌ Error: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="form-card">
            <h2>Add a New Product</h2>
            <p>This product will be listed under your trader name: <strong>{dealerInfo?.company || dealerInfo?.name}</strong></p>
            <form onSubmit={handleSubmit} className="product-upload-form">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" required />
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" required />
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g., Electronics)" />
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand (e.g., HP)" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product Description" />
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
                <button type="submit" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload Product'}
                </button>
            </form>
            {message && <div>{message}</div>}
        </div>
    );
}

// --- Modal Component for Editing Products ---
function EditProductModal({ product, onClose, onSave }) {
    const [formData, setFormData] = useState(product);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('Updating...');
        try {
            const response = await axios.put(`${API_BASE}/dealer/products/${product.productId}`, formData);
            if (response.data.success) {
                onSave(); // Refreshes the product list in the parent
                onClose(); // Closes the modal
            }
        } catch (err) {
            setMessage('Failed to update product.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Product</h2>
                <form onSubmit={handleUpdate} className="product-upload-form">
                    <label>Product Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required />
                    
                    <label>Price</label>
                    <input name="price" value={formData.price} onChange={handleChange} type="number" required />
                    
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} />
                    
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button type="submit" className="btn-save">Save Changes</button>
                    </div>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

// --- Component for Viewing Products ---
function ViewMyProducts({ dealerId }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/dealer/products/${dealerId}`);
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (err) {
            setError("Failed to fetch products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [dealerId]);

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            await axios.delete(`${API_BASE}/dealer/products/${productId}`);
            fetchProducts(); // Refresh the list after deleting
        } catch (err) {
            alert("Failed to delete product.");
        }
    };

    if (loading) return <p>Loading your products...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="form-card">
            <h2>My Products</h2>
            <div className="product-list-container">
                {products.length === 0 ? (
                    <p>You have not added any products yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.productId}>
                                    <td><img src={product.imageUrl} alt={product.name} width="50" /></td>
                                    <td>{product.name}</td>
                                    <td>${Number(product.price).toFixed(2)}</td>
                                    <td className="description-cell">{product.description}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => setEditingProduct(product)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(product.productId)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {editingProduct && (
                <EditProductModal 
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSave={() => {
                        setEditingProduct(null);
                        fetchProducts();
                    }}
                />
            )}
        </div>
    );
}

// --- Main Dashboard Component ---
export default function DealerDashboard() {
    const [dealerInfo, setDealerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('viewProducts');
    const navigate = useNavigate();
    const dealerId = localStorage.getItem("dealerId");

    useEffect(() => {
        if (!dealerId) {
            navigate("/dealer-login");
            return;
        }
        const fetchDealerInfo = async () => {
            try {
                const response = await fetch(`${API_BASE}/dealers/${dealerId}`);
                const data = await response.json();
                if (data.success) {
                    setDealerInfo(data.dealer);
                } else {
                    handleLogout();
                }
            } catch (error) {
                console.error("Failed to fetch dealer info", error);
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

    if (loading) {
        return <div style={{ padding: '2rem' }}>Verifying your session...</div>;
    }
    
    const renderActiveView = () => {
        switch (activeView) {
            case 'addProduct':
                return <AddProductForm dealerId={dealerId} dealerInfo={dealerInfo} />;
            case 'viewProducts':
                return <ViewMyProducts dealerId={dealerId} />;
            default:
                return <ViewMyProducts dealerId={dealerId} />;
        }
    };

    return (
        <div className="dealer-dashboard-layout">
            <aside className="dealer-sidebar">
                <div className="sidebar-header">
                    <h2>Dealer Panel</h2>
                    <p>Welcome, <strong>{dealerInfo?.company || dealerInfo?.name}</strong></p>
                </div>
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-button ${activeView === 'viewProducts' ? 'active' : ''}`}
                        onClick={() => setActiveView('viewProducts')}
                    >
                        View My Products
                    </button>
                    <button 
                        className={`nav-button ${activeView === 'addProduct' ? 'active' : ''}`}
                        onClick={() => setActiveView('addProduct')}
                    >
                        Add Product
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </aside>
            <main className="dealer-main-content">
                {renderActiveView()}
            </main>
        </div>
    );
}