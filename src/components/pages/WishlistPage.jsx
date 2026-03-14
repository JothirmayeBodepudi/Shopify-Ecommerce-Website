import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { useCart } from "../context/CartContext";
import "../styles/WishlistPage.css";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Load wishlist from localStorage
  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(storedWishlist);
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  // Add to cart
  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
    removeFromWishlist(product.id);
    navigate("/cart");
  };

  // Navigate to product details (IMPORTANT FIX)
  const goToProductDetails = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <>
      <Navbar />

      <div className="wishlist-wrapper">
        <div className="wishlist-container">
          <h2 className="wishlist-title">My Wishlist ❤️</h2>

          {wishlist.length === 0 ? (
            <div className="wishlist-empty glassy">
              <p>Your wishlist is empty.</p>
              <Link to="/shop" className="go-shop-btn">
                Go to Shop
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map((product) => (
                <div key={product.id} className="wishlist-card">

                  {/* PRODUCT IMAGE (CLICK WORKS ALWAYS) */}
                  <img
                    src={product.img || product.imageUrl}
                    alt={product.name}
                    className="wishlist-img clickable"
                    onClick={() => goToProductDetails(product.id)}
                  />

                  {/* PRODUCT INFO */}
                  <div className="wishlist-info">
                    <span
                      className="wishlist-name clickable"
                      onClick={() => goToProductDetails(product.id)}
                    >
                      {product.name}
                    </span>

                    <p className="wishlist-price">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="wishlist-actions">
                    <button
                      className="wishlist-add-cart"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>

                    <button
                      className="wishlist-remove"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      Remove
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistPage;
