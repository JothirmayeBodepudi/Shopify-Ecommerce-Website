import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, ShoppingCart, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useCart } from "../context/CartContext";
import "../styles/ShopPage.css";

const API_URL = process.env.REACT_APP_API_BASE || "http://localhost:5001";;

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Changed to 9 for a perfect 3x3 grid

  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/api/products`);
        if (response.data.success) {
          setProducts(response.data.items);
        } else {
          setError("Failed to fetch products.");
        }
      } catch (err) {
        setError("An error occurred while fetching products.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCheckboxChange = (value, setter, current) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
    setCurrentPage(1);
  };

  const allCategories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
      if (selectedPriceRanges.length > 0) {
        const inRange = selectedPriceRanges.some((range) => {
          if (range === "Under $50") return product.price < 50;
          if (range === "$50 - $200") return product.price >= 50 && product.price <= 200;
          if (range === "$200 - $500") return product.price > 200 && product.price <= 500;
          if (range === "$500 - Over") return product.price > 500;
          return false;
        });
        if (!inRange) return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
      return true;
    });
  }, [products, searchTerm, selectedCategories, selectedPriceRanges, selectedBrands]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  return (
    <div className="shop-page-wrapper">
      <Navbar />
      
      {/* Page Header */}
      <div className="shop-hero">
        <div className="container">
          <h1 className="hero-title">The Collection</h1>
          <p className="hero-subtitle">Curated essentials for your modern lifestyle.</p>
        </div>
      </div>

      <div className="shop-main container">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="sidebar-widget">
            <div className="search-input-group">
              <Search size={18} className="icon-search" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="sidebar-widget">
            <h4 className="widget-title"><Filter size={16} /> Categories</h4>
            <div className="checkbox-list">
              {allCategories.map((cat) => (
                <label key={cat} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCheckboxChange(cat, setSelectedCategories, selectedCategories)}
                  />
                  <span className="custom-check"></span> {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-widget">
            <h4 className="widget-title">Price Range</h4>
            <div className="checkbox-list">
              {["Under $50", "$50 - $200", "$200 - $500", "$500 - Over"].map((range) => (
                <label key={range} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes(range)}
                    onChange={() => handleCheckboxChange(range, setSelectedPriceRanges, selectedPriceRanges)}
                  />
                  <span className="custom-check"></span> {range}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Section */}
        <main className="shop-content">
          <div className="results-toolbar">
            <p className="results-count">Showing <span>{paginatedProducts.length}</span> of {filteredProducts.length} items</p>
          </div>

          <div className="product-grid-modern">
            {isLoading ? (
              [...Array(6)].map((_, i) => <div key={i} className="skeleton-card"></div>)
            ) : error ? (
              <div className="error-box">{error}</div>
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <div className="pro-card" key={product.id}>
                  <div className="pro-img-box" onClick={() => navigate(`/product/${product.id}`)}>
                    <img src={product.img || product.imageUrl} alt={product.name} />
                  </div>
                  <div className="pro-info-box">
                    <span className="pro-category">{product.category}</span>
                    <h3 className="pro-name" onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
                    <div className="pro-footer">
                      <span className="pro-price">${product.price.toFixed(2)}</span>
                      <button 
                        className="btn-add-cart" 
                        onClick={() => addToCart({ ...product, dealerId: product.dealerId || null })}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No products found matching your criteria.</div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-pro">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  className={currentPage === i + 1 ? "active" : ""} 
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}