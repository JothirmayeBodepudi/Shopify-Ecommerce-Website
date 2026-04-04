import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
} from "react-icons/fa";
import { Link } from "react-router-dom"; // Use Link for internal routing
import "./styles/Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-modern">
      <div className="footer-main">
        <div className="footer-grid">
          
          {/* Brand Column */}
          <div className="footer-brand-col">
            <h2 className="footer-logo">Shop<span>Ease</span></h2>
            <p className="footer-description">
              Elevating your lifestyle with premium quality products and 
              unmatched customer service since 2025.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="footer-links-col">
            <h3>Company</h3>
            <ul>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/dealer-registration">Become a Dealer</Link></li>
              <li><Link to="/business-orders">Business Orders</Link></li>
              <li><Link to="/media-queries">Media Queries</Link></li>
              <li><Link to="/investor-relations">Investor Relations</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="footer-links-col">
            <h3>Support</h3>
            <ul>
              <li><Link to="/faqs">FAQs</Link></li>
              <li><Link to="/returns-refunds">Returns & Refunds</Link></li>
              <li><Link to="/shipping-location">Shipping Policy</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-contact-col">
            <h3>Contact Us</h3>
            <div className="contact-item">
              <span className="label">Call Us:</span>
              <p>+91 98765 43210</p>
            </div>
            <div className="contact-item">
              <span className="label">Visit Us:</span>
              <p>
                MyShop Pvt. Ltd.<br />
                2nd Floor, MG Road, Bangalore, India
              </p>
            </div>
            <div className="contact-item">
              <span className="label">Hours:</span>
              <p>9:30 AM – 7:30 PM</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} ShopEase. All rights reserved.</p>
          <p className="cin-text">CIN: U12345KA2025PLC000000</p>
        </div>
      </div>
    </footer>
  );
}