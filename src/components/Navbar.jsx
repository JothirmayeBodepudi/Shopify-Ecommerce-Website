import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import { useAuth } from "react-oidc-context";
import "./styles/Navbar.css";

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const { cart } = useCart();
  const auth = useAuth();
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    setShowProfileMenu(false);
    auth.signoutRedirect();
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔍 SMART SEARCH HANDLER
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/search?q=${query}`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300); // debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <div className="logo">ShopEase</div>
        <div className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/cart">Cart ({totalItems})</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        {/* 🔍 SEARCH BOX */}
        <div className="search-box" ref={searchRef}>
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* SEARCH DROPDOWN */}
          {suggestions.length > 0 && (
            <div className="search-dropdown">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="search-item"
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    navigate(`/product/${item.id}`);
                  }}
                >
                  <img src={item.img} alt={item.name} />
                  <div>
                    <p className="name">{item.name}</p>
                    <p className="price">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROFILE */}
        {auth.isAuthenticated ? (
          <div className="dropdown" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="dropdown-btn"
            >
              {auth.user?.profile.name || "Profile"} ⌄
            </button>
            {showProfileMenu && (
              <div className="dropdown-menu">
                <Link to="/profile/view" className="menu-item">View Profile</Link>
                <Link to="/profile/orders" className="menu-item">My Orders</Link>
                <Link to="/profile/wishlist" className="menu-item">Wishlist</Link>
                <Link to="/admin/login" className="menu-item">Admin Login</Link>
                <button onClick={handleLogout} className="menu-item logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={() => auth.signinRedirect()}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
