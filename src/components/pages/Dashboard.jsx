import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { ArrowRight, ShoppingCart, Truck, ShieldCheck, Headset } from "lucide-react";
import Navbar from "../Navbar"; 
import Footer from "../Footer";
import "../styles/DashBoard.css";

const API_URL = "http://localhost:5001";

export default function Dashboard() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Fetch dynamic data from backend
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/api/products`);
        if (res.data.success) {
          // Show the 4 most recent products
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
    <div className="storefront-wrapper">
      <Navbar />

      <main className="storefront-main">
        {/* --- HERO SECTION --- */}
        <section className="hero-modern">
          <div className="hero-content">
            <span className="hero-badge">New Arrival • 2026 Collection</span>
            <h1 className="hero-title">Elevate Your Everyday Style</h1>
            <p className="hero-subtitle">
              Discover our handpicked selection of premium quality products designed for the modern lifestyle.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn-hero-primary">
                Shop Collection <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          {/* Optional: You can add a background image in CSS, or a floating element here */}
        </section>

        {/* --- VALUE PROPOSITIONS --- */}
        <section className="value-props-section">
          <div className="value-prop">
            <div className="vp-icon"><Truck size={24} /></div>
            <div>
              <h4>Free Shipping</h4>
              <p>On orders over $100</p>
            </div>
          </div>
          <div className="vp-divider"></div>
          <div className="value-prop">
            <div className="vp-icon"><ShieldCheck size={24} /></div>
            <div>
              <h4>Secure Checkout</h4>
              <p>100% protected payments</p>
            </div>
          </div>
          <div className="vp-divider"></div>
          <div className="value-prop">
            <div className="vp-icon"><Headset size={24} /></div>
            <div>
              <h4>24/7 Support</h4>
              <p>Dedicated premium support</p>
            </div>
          </div>
        </section>

        {/* --- FEATURED PRODUCTS --- */}
        <section className="featured-section">
          <div className="section-header-modern">
            <div className="sh-text">
              <h2>Trending Now</h2>
              <p>Our most popular items this week</p>
            </div>
            <Link to="/shop" className="btn-view-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="loading-state-modern">
              <div className="spinner-large"></div>
              <p>Curating latest deals...</p>
            </div>
          ) : (
            <div className="product-grid-modern">
              {featuredProducts.map((product) => {
                const pId = product.id || product.productId || product._id;
                
                return (
                  <div key={pId} className="product-card-modern">
                    <div 
                      className="pc-image-wrapper"
                      onClick={() => navigate(`/product/${pId}`)}
                    >
                      <img src={product.imageUrl || product.img} alt={product.name} />
                      {product.price < 100 && <span className="pc-badge">Hot Deal</span>}
                    </div>
                    
                    <div className="pc-content">
                      <div className="pc-meta">
                        <span className="pc-category">{product.category || "General"}</span>
                        <span className="pc-brand">{product.brand || ""}</span>
                      </div>
                      
                      <h3 
                        className="pc-title"
                        onClick={() => navigate(`/product/${pId}`)}
                      >
                        {product.name}
                      </h3>
                      
                      <div className="pc-footer">
                        <p className="pc-price">${Number(product.price).toFixed(2)}</p>
                        <button 
                          className="pc-add-btn" 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents navigating to product page
                            addToCart({ ...product, id: pId, quantity: 1 });
                          }}
                          title="Add to Cart"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}