import React, { useState, useMemo } from "react";
import "../styles/BusinessOrders.css";
import Navbar from "../Navbar";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from "../context/CartContext"; // Import the custom hook
import Footer from "../Footer";

const BusinessOrderPage = () => {
  const { cart, clearCart } = useCart();

  const [formData, setFormData] = useState({
    businessName: "",
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

  // Calculate subtotal from cart items
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

    const requiredFields = [
      "businessName", "contactPerson", "email", "phone", "address", "city", "state", "zip",
    ];
    const isFormValid = requiredFields.every((field) => formData[field].trim() !== "");

    if (cart.length === 0) {
      alert("Your cart is empty. Please add products to place an order.");
      return;
    }

    if (isFormValid) {
      setFormSubmitted(true);
    } else {
      alert("Please fill in all required business information.");
    }
  };

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: "Business Order",
          amount: {
            currency_code: "USD",
            value: total.toFixed(2),
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      alert(`Transaction completed by ${details.payer.name.given_name}`);
      // Clear the cart after successful payment
      clearCart();
      setOrderPlaced(true);
    });
  };

  const onError = (err) => {
    console.error("PayPal Checkout Error:", err);
    alert("Payment could not be processed.");
  };

  return (
    <>
      <Navbar />
      <div className="business-orders-container">
        {!orderPlaced ? (
          <form onSubmit={handleFormSubmit} className="business-orders-form">
            <h2>Business Order</h2>

            {/* Displaying selected products directly from the cart */}
            <div className="selected-products-cart">
              <h3>Your Order</h3>
              <div className="cart-items">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="cart-item-image"
                      />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p>
                          ${item.price.toFixed(2)} x {item.quantity} = $
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-cart-message">
                    Your cart is empty. Please add products to continue.
                  </p>
                )}
              </div>
            </div>

            {/* Business Info Section */}
            <div className="business-info-section">
              <h3>Business Information</h3>
              <input
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="contactPerson"
                placeholder="Contact Person"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Business Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Contact Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Business Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <div className="location-fields">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                value={formData.zip}
                onChange={handleChange}
                required
              />
              <textarea
                name="orderDetails"
                placeholder="Order Details / Special Instructions"
                value={formData.orderDetails}
                onChange={handleChange}
                rows="3"
              />
            </div>

            {/* Payment Section */}
            <div className="payment-section">
              <h3>Order Summary</h3>
              <div className="order-summary">
                <div className="summary-item">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {!formSubmitted && (
              <button type="submit" className="submit-button">
                Proceed to Payment
              </button>
            )}

            {formSubmitted && (
              <div className="paypal-buttons-container">
                <PayPalScriptProvider
                  options={{
                    "client-id": "test",
                    currency: "USD",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical", color: "blue" }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                  />
                </PayPalScriptProvider>
              </div>
            )}
          </form>
        ) : (
          <div className="business-orders-form form-message">
            <h3 className="success-message">✅ Business Order Confirmed!</h3>
            <p>
              Thank you, {formData.contactPerson}. Your business order has been
              placed successfully for <b>{formData.businessName}</b>!
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BusinessOrderPage;