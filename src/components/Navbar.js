// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./context/CartContext";
import { useAuth } from "react-oidc-context"; // ✅ 1. Import useAuth
import "./styles/Navbar.css";

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const { cart } = useCart();
  const auth = useAuth(); // ✅ 2. Get the authentication state

  // ✅ 3. Use the correct logout function from the auth context
  const handleLogout = () => {
    setShowProfileMenu(false);
    auth.signoutRedirect();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      {/* Left side */}
      <div className="nav-left">
        <div className="logo">ShopEase</div>
        <div className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/cart">Cart ({totalItems})</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      {/* Right side */}
      <div className="nav-right">
        <div className="search-box">
          <input type="text" placeholder="Search products..." />
          <button className="search-btn">🔍</button>
        </div>

        {/* ✅ 4. Conditionally render profile/login buttons based on auth state */}
        {auth.isAuthenticated ? (
          // Show Profile dropdown if user is logged in
          <div className="dropdown" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="dropdown-btn"
            >
              {auth.user?.profile.name || 'Profile'} ⌄
            </button>
            {showProfileMenu && (
              <div className="dropdown-menu">
                <Link to="/profile/view" className="menu-item">View Profile</Link>
                <Link to="/profile/orders" className="menu-item">My Orders</Link>
                <Link to="/profile/wishlist" className="menu-item">Wishlist</Link>
                <Link to="/admin/login" className="menu-item">Admin Login</Link>
                <button onClick={handleLogout}  className="menu-item logout-btn">Logout</button>
              </div>
            )}
          </div>
        ) : (
          // Show Login button if user is not logged in
          <button className="login-btn" onClick={() => auth.signinRedirect()}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}