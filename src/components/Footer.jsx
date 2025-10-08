// src/components/Footer.jsx
import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
} from "react-icons/fa";
import "./styles/Footer.css"; // ✅ Correct import

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Column */}
        <div className="footer-col">
          <h2 className="footer-logo">MyShop</h2>
          <ul>
            <li><a href="/careers">Careers</a></li>
            <li> <a href="/dealer-registration">Become Dealer</a> </li>
            <li><a href="/investor-relations">Investor Relations</a></li>
            <li><a href="/business-orders">Business Orders</a></li>
            <li><a href="/media-queries">Media Queries</a></li>
            <li><a href="/media-coverage">Media Coverage</a></li>
          </ul>
          <div className="social-icons">
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedinIn /></a>
            <a href="#"><FaPinterestP /></a>
          </div>
        </div>

        {/* Middle Column 1 */}
        <div className="footer-col">
          <h3>Campaigns</h3>
          <ul>
            <li><a href="/Work-From-Home-Quiz">Work From Home Quiz</a> </li>
            <li><a href="/product-survey">Product Survey</a></li>
            
            <li><a href="/seasonal-deals">Seasonal Deals</a></li>
          </ul>
        </div>

        {/* Middle Column 2 */}
        <div className="footer-col">
          <h3>Policies</h3>
          <ul>
            <li><a href="/faqs">FAQs</a></li>
            <li><a href="/shipping-location">Shipping & Location</a></li>
            <li><a href="/returns-refunds">Returns & Refunds</a></li>
            <li><a href="/warranty">Warranty</a></li>
            <li><a href="/terms-of-service">Terms Of Service</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Right Column */}
        <div className="footer-col">
          <h3>Help</h3>
          <p>Contact us at +91 9876543210</p>
          <p>Available: 9:30 AM – 7:30 PM</p>
          <p>
            Registered Office: MyShop Pvt. Ltd. <br />
            2nd Floor, MG Road, Bangalore, India
          </p>
          <p>CIN: U12345KA2025PLC000000</p>
        </div>
      </div>
    </footer>
  );
}
