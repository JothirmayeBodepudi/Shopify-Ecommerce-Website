import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CheckCircle, ShieldCheck, Truck, CreditCard, ChevronLeft, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import Navbar from "../Navbar";
import "../styles/CheckoutPage.css";

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper to handle the Order Save to Backend
  const saveOrderToDB = async (details) => {
    const orderPayload = {
      userId: localStorage.getItem("userId") || details.payer.payer_id,
      paymentId: details.id,
      items: cart.map(item => ({
        productId: item.id || item.productId,
        dealerId: item.dealerId || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.img || item.imageUrl
      })),
      totalAmount: total,
      shipping: { ...formData },
      status: "Processing",
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      return response.ok;
    } catch (err) {
      console.error("Failed to save order:", err);
      return false;
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="empty-checkout text-center py-20">
        <Navbar />
        <div className="container">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button onClick={() => navigate("/shop")} className="btn-primary-lg">Return to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <Navbar />
      
      <main className="checkout-main container">
        {!orderPlaced && (
          <div className="checkout-steps">
            <div className="step active"><span>1</span> Information</div>
            <div className="step-line"></div>
            <div className="step active"><span>2</span> Payment</div>
            <div className="step-line"></div>
            <div className="step"><span>3</span> Completion</div>
          </div>
        )}

        {isProcessing && (
          <div className="processing-overlay">
            <Loader2 className="spinner-icon" size={48} />
            <p>Finalizing your order...</p>
          </div>
        )}

        {!orderPlaced ? (
          <div className="checkout-grid">
            <div className="checkout-details-column">
              <button className="back-to-cart" onClick={() => navigate("/cart")}>
                <ChevronLeft size={16} /> Back to Cart
              </button>

              <section className="checkout-card-pro">
                <div className="card-header">
                  <Truck size={20} className="text-blue-600" />
                  <h3>Shipping Information</h3>
                </div>
                <div className="pro-form-grid">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="input-group full-width">
                    <label>Street Address</label>
                    <input type="text" name="address" placeholder="123 Luxury Lane" value={formData.address} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input type="text" name="city" placeholder="Los Angeles" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>State</label>
                    <input type="text" name="state" placeholder="CA" value={formData.state} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>ZIP Code</label>
                    <input type="text" name="zip" placeholder="90210" value={formData.zip} onChange={handleChange} required />
                  </div>
                </div>
              </section>

              <div className="secure-badge">
                <ShieldCheck size={18} />
                <p>Secure SSL Encrypted Checkout</p>
              </div>
            </div>

            <aside className="checkout-summary-column">
              <div className="summary-card-pro sticky-summary">
                <div className="card-header">
                  <CreditCard size={20} className="text-blue-600" />
                  <h3>Order Summary</h3>
                </div>

                <div className="summary-items">
                  {cart.map(item => (
                    <div className="mini-item" key={item.id}>
                      <img src={item.img} alt={item.name} />
                      <div className="mini-item-info">
                        <p>{item.name}</p>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <p className="mini-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="summary-totals">
                  <div className="total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="total-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className="total-row"><span>Shipping</span><span className="free-tag">Free</span></div>
                  <div className="divider"></div>
                  <div className="total-row grand-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>

                <div className="payment-area">
                  <p className="payment-notice">Choose payment method:</p>
                  
                  {/* PAYPAL INTEGRATION UPDATED */}
                  <PayPalScriptProvider 
                    options={{ 
                      "client-id": "AW3hs3Q7NAUM6vCH9hD1kXJy-RT0rIKaLm5rs0LW81DOSlLzsrL4tioTaQV3dUxyNAZayZiAbPtGVlDf", // Replace with your ID
                      currency: "USD",
                      components: "buttons" 
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical", color: "black", shape: "rect" }}
                      createOrder={(data, actions) => {
                        // Check if form is filled before allowing payment
                        if (!formData.fullName || !formData.email || !formData.address) {
                            alert("Please fill in your shipping details first.");
                            return actions.reject();
                        }
                        return actions.order.create({
                          purchase_units: [{ 
                            amount: { 
                                currency_code: "USD", 
                                value: total.toFixed(2) 
                            } 
                          }],
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then(async (details) => {
                          setIsProcessing(true);
                          const success = await saveOrderToDB(details);
                          if (success) {
                            setOrderPlaced(true);
                            clearCart();
                          } else {
                            alert("Payment received, but we had trouble saving your order. Please contact support.");
                          }
                          setIsProcessing(false);
                        });
                      }}
                      onError={(err) => {
                        console.error("PayPal Error:", err);
                        alert("There was an issue processing the payment. Please try again.");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="success-screen animate-fadeIn">
            <CheckCircle size={80} className="text-green-500 mb-6" />
            <h2 className="text-4xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-8">A confirmation email has been sent to <strong>{formData.email}</strong>.</p>
            <div className="order-details-box">
              <p>Order ID: <strong>#SE-{Math.floor(Math.random() * 900000) + 100000}</strong></p>
              <p>Status: <strong>Processing</strong></p>
            </div>
            <button onClick={() => navigate("/home")} className="btn-primary-lg">Back to Store</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckoutPage;