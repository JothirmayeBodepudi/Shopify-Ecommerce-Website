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

  // Remove item from wishlist (Handles both id and productId)
  const removeFromWishlist = (idToRemove) => {
    const updatedWishlist = wishlist.filter(
      (item) => item.id !== idToRemove && item.productId !== idToRemove
    );
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  // Add to cart
  const handleAddToCart = (product, itemId) => {
    addToCart({ ...product, id: itemId, quantity: 1 });
    removeFromWishlist(itemId);
    navigate("/cart");
  };

  // Navigate to product details
  const goToProductDetails = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <>
      <Navbar />

      <div className="wishlist-page-wrapper">
        <div className="wishlist-main-container">
          
          {/* Header */}
          <div className="wishlist-header">
            <h2 className="text-3xl font-bold text-gray-800">My Wishlist</h2>
            <span className="wishlist-count">
              {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {/* Content */}
          {wishlist.length === 0 ? (
            <div className="wishlist-empty-state">
              <div className="empty-icon">🤍</div>
              <h3>It feels a bit empty here</h3>
              <p>Explore more and shortlist some items.</p>
              <Link to="/shop" className="explore-btn">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="wishlist-professional-grid">
              {wishlist.map((product, index) => {
                // Safeguard: support both item.id and item.productId
                const itemId = product.productId || product.id;

                return (
                  <div key={itemId || index} className="wish-card">
                    {/* Image Container with floating remove button */}
                    <div className="wish-card-image-wrapper">
                      <button
                        className="wish-remove-icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents image click
                          removeFromWishlist(itemId);
                        }}
                        title="Remove from Wishlist"
                      >
                        ✕
                      </button>
                      <img
                        src={product.img || product.imageUrl || "https://via.placeholder.com/250"}
                        alt={product.name}
                        onClick={() => goToProductDetails(itemId)}
                      />
                    </div>

                    {/* Card Info */}
                    <div className="wish-card-body">
                      <h4 
                        className="wish-card-title" 
                        onClick={() => goToProductDetails(itemId)}
                      >
                        {product.name}
                      </h4>
                      <p className="wish-card-price">
                        ${Number(product.price).toFixed(2)}
                      </p>
                      
                      <button
                        className="wish-add-btn"
                        onClick={() => handleAddToCart(product, itemId)}
                      >
                        Move to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistPage;