import React, { useState } from "react";
import "../styles/CheckoutPage.css";
import Navbar from "../Navbar";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from "../context/CartContext";

const CheckoutPage = () => {
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    alert("Please complete payment to confirm your order.");
  };

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container w-full max-w-4xl animate-fadeInUp">
          <div className="checkout-card glassy">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-wide">
              Checkout
            </h2>

            {!orderPlaced ? (
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Shipping Information</h3>
                  <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="input-field" required />
                  <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="input-field" required />
                  <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} className="input-field" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="input-field" required />
                    <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="input-field" required />
                  </div>
                  <input type="text" name="zip" placeholder="ZIP Code" value={formData.zip} onChange={handleChange} className="input-field" required />
                </div>

                {/* Payment Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Payment & Summary</h3>
                  <div className="order-summary glassy mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Order Summary</h4>
                    <p className="flex justify-between text-gray-700">
                      <span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between text-gray-700">
                      <span>Tax (8%):</span> <span>${tax.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between font-bold text-gray-900 text-lg">
                      <span>Total:</span> <span>${total.toFixed(2)}</span>
                    </p>
                  </div>

                  {/* PayPal Integration */}
                  <PayPalScriptProvider
                    options={{
                      "client-id": "AW3hs3Q7NAUM6vCH9hD1kXJy-RT0rIKaLm5rs0LW81DOSlLzsrL4tioTaQV3dUxyNAZayZiAbPtGVlDf",
                      currency: "USD",
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical", color: "blue" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            description: "E-commerce Order",
                            amount: { currency_code: "USD", value: total.toFixed(2) },
                          }],
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then(async (details) => {
                          localStorage.setItem("userId", details.payer.payer_id);

                          // --- CRITICAL UPDATE: Ensure dealerId is passed for tracking ---
                          const orderPayload = {
                            userId: details.payer.payer_id,
                            paymentId: details.id,
                            items: cart.map(item => ({
                              productId: item.id || item.productId,
                              dealerId: item.dealerId || null, // Essential for Manage Orders visibility
                              name: item.name,
                              price: item.price,
                              quantity: item.quantity,
                              imageUrl: item.img || item.imageUrl
                            })),
                            totalAmount: total,
                            shipping: { ...formData },
                            createdAt: new Date().toISOString()
                          };

                          try {
                            const response = await fetch("http://localhost:5001/api/orders", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(orderPayload),
                            });
                            
                            if (response.ok) {
                              setOrderPlaced(true);
                              alert(`Order confirmed! Thank you, ${details.payer.name.given_name}`);
                            }
                          } catch (err) {
                            console.error("Order API Error:", err);
                            alert("Payment successful, but failed to save order details. Please contact support.");
                          }
                        });
                      }}
                      onError={(err) => {
                        console.error("PayPal Error:", err);
                        alert("Payment could not be processed.");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </form>
            ) : (
              <div className="text-center p-8">
                <h3 className="text-2xl font-bold text-green-600 mb-4">🎉 Order Confirmed!</h3>
                <p className="text-gray-700">Thank you, {formData.fullName}. Your order has been placed successfully!</p>
                <button onClick={() => window.location.href = "/home"} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg">Return to Home</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;