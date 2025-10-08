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
    cardNumber: "",
    expiry: "",
    cvv: "",
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
      {/* ✅ Checkout Page Wrapper for background image */}
      <div className="checkout-page">
        <div className="checkout-container w-full max-w-4xl animate-fadeInUp">
          <div className="checkout-card glassy">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-wide">
              Checkout
            </h2>

            {!orderPlaced ? (
              <form
                onSubmit={handleFormSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Shipping Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    Shipping Information
                  </h3>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="zip"
                    placeholder="ZIP Code"
                    value={formData.zip}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                {/* Payment Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    Payment
                  </h3>



                  {/* Order Summary */}
                  <div className="order-summary glassy mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Order Summary
                    </h4>
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

                  {/* ✅ PayPal Integration */}
                  <PayPalScriptProvider
                    options={{
                      "client-id": "AW3hs3Q7NAUM6vCH9hD1kXJy-RT0rIKaLm5rs0LW81DOSlLzsrL4tioTaQV3dUxyNAZayZiAbPtGVlDf", // Replace with your real PayPal Client ID later
                      currency: "USD",
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical", color: "blue" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              description: "Order from My Store",
                              amount: {
                                currency_code: "USD",
                                value: total.toFixed(2),
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then((details) => {
                          alert(
                            `Transaction completed by ${details.payer.name.given_name}`
                          );
                          setOrderPlaced(true);
                        });
                      }}
                      onError={(err) => {
                        console.error("PayPal Checkout Error:", err);
                        alert("Payment could not be processed.");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </form>
            ) : (
              <div className="text-center p-8">
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  🎉 Order Confirmed!
                </h3>
                <p className="text-gray-700">
                  Thank you, {formData.fullName}. Your order has been placed
                  successfully!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
