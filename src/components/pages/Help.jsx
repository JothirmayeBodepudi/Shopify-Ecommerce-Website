import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/Help.css";

export default function Help() {
  return (
    <>
      <Navbar />
      <div className="help-container">
        <h1>Help Center</h1>
        <p>Contact us at +91 9876543210</p>
        <p>Available: 9:30 AM – 7:30 PM</p>
        <p>Registered Office: MyShop Pvt. Ltd. 2nd Floor, MG Road, Bangalore, India</p>
        <p>CIN: U12345KA2025PLC000000</p>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <img
                src="https://via.placeholder.com/150"
                alt="How to place an order"
                className="faq-image"
              />
              <h3>How to place an order</h3>
              <p>Learn how to easily place an order on our website.</p>
            </div>
            <div className="faq-item">
              <img
                src="https://via.placeholder.com/150"
                alt="Tracking your shipment"
                className="faq-image"
              />
              <h3>Tracking your shipment</h3>
              <p>Find out how to track your shipment and get updates on its location.</p>
            </div>
            <div className="faq-item">
              <img
                src="https://via.placeholder.com/150"
                alt="Return process"
                className="faq-image"
              />
              <h3>Return process</h3>
              <p>Understand our return process and how to return an item.</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
