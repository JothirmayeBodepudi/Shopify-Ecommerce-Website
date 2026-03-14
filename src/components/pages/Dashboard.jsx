import React, { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Navbar from "../Navbar"; 
import Footer from "../Footer";
import "../styles/DashBoard.css";

const API_URL = "http://localhost:5001";

export default function Dashboard() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  // ✅ Fetch dynamic data from your backend
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        // We fetch products and perhaps filter them by a 'featured' tag or just take the latest 4
        const res = await axios.get(`${API_URL}/api/products`);
        if (res.data.success) {
          // Logic: Show the 4 most recent products added by the admin
          const dynamicDeals = res.data.items.slice(0, 4); 
          setFeaturedProducts(dynamicDeals);
        }
      } catch (err) {
        console.error("Failed to load seasonal deals", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Navbar />

      {/* ✅ Dynamic Hero: This could also be fetched from a 'Settings' API later */}
      <section className="hero">
        <div className="hero-content">
          <span className="season-tag">Limited Collection 2026</span>
          <h1>Experience Premium Quality</h1>
          <p>Handpicked deals curated specifically for this season.</p>
          <Link to="/shop" className="hero-btn">
            Explore Collection
          </Link>
        </div>
      </section>

      {/* ✅ Featured Products Section */}
      <section className="featured-products">
        <div className="section-header">
          <h2>Seasonal Highlights</h2>
          <Link to="/shop" className="view-all">View All Products →</Link>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Fetching latest deals...</p>
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <div key={product.id || product._id} className="product-card">
                <div className="product-img-wrapper">
                  <img src={product.imageUrl || product.img} alt={product.name} />
                  {product.price < 100 && <span className="deal-badge">Hot Deal</span>}
                </div>
                <div className="product-card-info">
                  <span className="category-label">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className="price">${Number(product.price).toFixed(2)}</p>
                  <button 
                    className="add-btn" 
                    onClick={() => addToCart({ ...product, quantity: 1 })}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}