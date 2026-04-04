import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import Navbar from "../Navbar";
import { useCart } from "../context/CartContext";
import "../styles/ProductDetails.css";
import Footer from "../Footer";

const API_URL = "http://localhost:5001";

const getWishlist = () => JSON.parse(localStorage.getItem("wishlist")) || [];
const isInWishlist = (productId) => getWishlist().some((item) => item.productId === productId);

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [productId, setProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        const prod = res.data.product || res.data;
        if (!prod) { setError("Product not found"); return; }
        const pid = prod.id || prod._id;
        setProduct({ ...prod, productId: pid });
        setProductId(pid);
        setWishlisted(isInWishlist(pid));
      } catch (err) {
        setError("Unable to load product details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = (item, qty) => {
    addToCart({ ...item, productId, quantity: qty });
  };

  const toggleWishlist = () => {
    const wishlist = getWishlist();
    if (wishlisted) {
      const updated = wishlist.filter((item) => item.productId !== productId);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setWishlisted(false);
    } else {
      wishlist.push({ productId, name: product.name, price: product.price, imageUrl: product.imageUrl || product.img });
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setWishlisted(true);
    }
  };

  if (isLoading) return <div className="loading-full"><div className="spinner"></div></div>;

  return (
    <div className="pd-page-wrapper">
      <Navbar />

      {/* Expanded Image Modal */}
      {isImageExpanded && (
        <div className="pd-modal" onClick={() => setIsImageExpanded(false)}>
          <img src={product.imageUrl || product.img} alt={product.name} />
        </div>
      )}

      <main className="pd-container container">
        {/* Back Navigation */}
        <button className="pd-back-link" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} /> Back to Collection
        </button>

        <div className="pd-layout">
          {/* Left: Image Gallery */}
          <div className="pd-image-section">
            <div className="pd-main-img-wrapper" onClick={() => setIsImageExpanded(true)}>
              <img src={product.imageUrl || product.img} alt={product.name} />
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="pd-info-section">
            <div className="pd-sticky-content">
              <nav className="pd-breadcrumbs">
                <span>Products</span> / <span>{product.category || "Collection"}</span>
              </nav>

              <div className="pd-header">
                <h1 className="pd-title">{product.name}</h1>
                <button 
                  className={`pd-wishlist-btn ${wishlisted ? "active" : ""}`}
                  onClick={toggleWishlist}
                >
                  <Heart fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "currentColor"} />
                </button>
              </div>

              <p className="pd-price">${Number(product.price).toFixed(2)}</p>

              <div className="pd-description">
                <h3>Description</h3>
                <p>{product.description || "Crafted with precision and designed for longevity, this item represents our commitment to quality and style."}</p>
              </div>

              {/* Selection Section */}
              <div className="pd-selection">
                <div className="pd-qty-wrapper">
                  <label>Quantity</label>
                  <div className="pd-qty-selector">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pd-actions">
                <button className="btn-pd-cart" onClick={() => handleAddToCart(product, quantity)}>
                  <ShoppingBag size={20} /> Add to Cart
                </button>
                <button className="btn-pd-buy" onClick={() => { handleAddToCart(product, quantity); navigate("/cart"); }}>
                  Buy It Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pd-trust-badges">
                <div className="badge-item">
                  <Truck size={20} /> <span>Free Shipping</span>
                </div>
                <div className="badge-item">
                  <RotateCcw size={20} /> <span>30 Day Returns</span>
                </div>
                <div className="badge-item">
                  <ShieldCheck size={20} /> <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}