import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from "../context/CartContext";
import { Briefcase, Building2, Mail, Phone, MapPin, ClipboardList, ShieldCheck, ArrowLeft } from "lucide-react";
import "../styles/BusinessOrders.css";

const BusinessOrderPage = () => {
  const { cart, clearCart } = useCart();

  const [formData, setFormData] = useState({
    businessName: "",
    taxId: "", // Added for professional B2B
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    orderDetails: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    setFormSubmitted(true);
  };

  return (
    <div className="b2b-page-wrapper">
      <Navbar />
      
      <div className="b2b-hero">
        <div className="container">
          <h1>Business Procurement</h1>
          <p>Bulk pricing and corporate tax invoicing for your organization.</p>
        </div>
      </div>

      <main className="b2b-main container">
        {!orderPlaced ? (
          <div className="b2b-grid">
            
            {/* LEFT: FORM SECTION */}
            <div className="b2b-form-column">
              <Link to="/cart" className="back-link">
                <ArrowLeft size={16} /> Back to Cart
              </Link>

              <form onSubmit={handleFormSubmit} className="b2b-card">
                <div className="card-header">
                  <Building2 size={22} className="text-blue-600" />
                  <h3>Company Details</h3>
                </div>
                
                <div className="form-grid">
                  <div className="input-group full-width">
                    <label>Registered Business Name</label>
                    <input type="text" name="businessName" placeholder="e.g. Acme Corp Int." value={formData.businessName} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Tax ID / VAT Number</label>
                    <input type="text" name="taxId" placeholder="Optional for invoicing" value={formData.taxId} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Contact Person</label>
                    <input type="text" name="contactPerson" placeholder="Full Name" value={formData.contactPerson} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Business Email</label>
                    <input type="email" name="email" placeholder="corp@company.com" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Contact Number</label>
                    <input type="tel" name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>

                <div className="card-header mt-8">
                  <MapPin size={22} className="text-blue-600" />
                  <h3>Registered Office Address</h3>
                </div>
                
                <div className="form-grid">
                  <div className="input-group full-width">
                    <label>Street Address</label>
                    <input type="text" name="address" placeholder="HQ Suite or Building" value={formData.address} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>State / Province</label>
                    <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>ZIP Code</label>
                    <input type="text" name="zip" placeholder="Zip" value={formData.zip} onChange={handleChange} required />
                  </div>
                </div>

                <div className="input-group mt-6">
                  <label>Special Instructions / PO Reference</label>
                  <textarea name="orderDetails" placeholder="Any specific requirements for this business order?" value={formData.orderDetails} onChange={handleChange} rows="3" />
                </div>

                {!formSubmitted && (
                  <button type="submit" className="btn-b2b-primary">
                    Confirm Details & Pay
                  </button>
                )}
              </form>
            </div>

            {/* RIGHT: SUMMARY SECTION */}
            <aside className="b2b-summary-column">
              <div className="summary-card sticky-summary">
                <div className="card-header">
                  <ClipboardList size={22} className="text-blue-600" />
                  <h3>Purchase Summary</h3>
                </div>

                <div className="summary-cart-items">
                  {cart.map((item) => (
                    <div key={item.id} className="mini-item">
                      <img src={item.img} alt={item.name} />
                      <div className="mini-info">
                        <p className="item-name">{item.name}</p>
                        <p className="item-qty">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="summary-totals">
                  <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="summary-row"><span>Corporate Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className="summary-row total"><span>Grand Total</span><span>${total.toFixed(2)}</span></div>
                </div>

                {formSubmitted && (
                  <div className="payment-gateway-box">
                    <p className="payment-hint">Please complete the B2B transaction via PayPal:</p>
                    <PayPalScriptProvider options={{ "client-id": "test", currency: "USD" }}>
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "rect", color: "blue" }}
                        createOrder={(data, actions) => actions.order.create({
                          purchase_units: [{ amount: { currency_code: "USD", value: total.toFixed(2) } }]
                        })}
                        onApprove={(data, actions) => actions.order.capture().then(() => {
                          clearCart();
                          setOrderPlaced(true);
                        })}
                      />
                    </PayPalScriptProvider>
                  </div>
                )}
                
                <div className="trust-footer">
                  <ShieldCheck size={16} /> <span>SSL Encrypted Transaction</span>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>Order Successfully Placed</h2>
            <p>Thank you for choosing us for your business needs, <strong>{formData.contactPerson}</strong>.</p>
            <div className="order-receipt-box">
              <p>Organization: <strong>{formData.businessName}</strong></p>
              <p>A tax invoice has been sent to: <strong>{formData.email}</strong></p>
            </div>
            <Link to="/home" className="btn-b2b-primary">Return to Dashboard</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BusinessOrderPage;