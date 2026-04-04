import React from "react";
import { useCart } from "../context/CartContext";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import "../styles/Cart.css";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const itemCount = cart?.reduce((count, item) => count + item.quantity, 0) || 0;

  return (
    <div className="cart-page-wrapper">
      <Navbar />

      <main className="cart-main container">
        <header className="cart-header">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted">{itemCount} items in your bag</p>
        </header>

        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <ShoppingBag size={64} className="empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* LEFT SIDE: ITEMS */}
            <div className="cart-items-section">
              {cart.map((item) => (
                <div className="cart-item-card" key={item.id}>
                  <div className="item-image">
                    <img src={item.img} alt={item.name} />
                  </div>
                  
                  <div className="item-info">
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-price-unit">${item.price.toFixed(2)}</p>
                    </div>

                    <div className="item-actions">
                      <div className="quantity-stepper">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button className="delete-icon-btn" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="item-total-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <button className="back-to-shop-link" onClick={() => navigate("/shop")}>
                <ArrowLeft size={16} /> Continue Shopping
              </button>
            </div>

            {/* RIGHT SIDE: SUMMARY */}
            <aside className="cart-summary-aside">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="text-green">Free</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button className="btn-checkout-full" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout
                </button>
                
                <button className="btn-clear-ghost" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}