// src/components/pages/CartPage.jsx
import React from "react";
import { useCart } from "../context/CartContext";
import "../styles/Cart.css";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  // Safe totals
  const subtotal = cart?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Total items
  const itemCount = cart?.reduce((count, item) => count + item.quantity, 0) || 0;

  return (
    <>
      <Navbar />

      <div className="cart-page">
        <h2>Your Shopping Cart ({itemCount} items)</h2>

        <div className="cart-container">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="empty-cart">🛒 Your cart is empty</p>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.img} alt={item.name} width={80} />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <p>Items: {itemCount}</p>
              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              <p>Tax (8%): ${tax.toFixed(2)}</p>
              <h4>Total: ${total.toFixed(2)}</h4>
              <button className="checkout-btn" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>
              <button className="clear-btn" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
