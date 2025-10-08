import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/PrivacyPolicy.css";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <div className="privacy-container">
        <h1>Privacy Policy</h1>

        <section className="introduction">
          <h2>1. Introduction</h2>
          <p>
            Your privacy is important to us. This Privacy Policy explains how MyShop collects, uses, and protects
            your personal information when you use our website and services.
          </p>
        </section>

        <section className="information-we-collect">
          <h2>2. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul>
            <li>
              <b>Information You Provide Directly:</b> When you create an account, make a purchase, or contact us, we
              collect information such as your name, email address, shipping address, and payment information.
            </li>
            <li>
              <b>Automatically Collected Information:</b> We automatically collect certain information about your device
              and usage of our services, such as your IP address, browser type, operating system, and browsing
              activity.
            </li>
          </ul>
        </section>

        <section className="how-we-use-your-information">
          <h2>3. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul>
            <li>To provide and improve our services</li>
            <li>To process your orders and payments</li>
            <li>To communicate with you about your account and orders</li>
            <li>To personalize your experience</li>
            <li>To detect and prevent fraud</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="data-security">
          <h2>4. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your personal information from unauthorized access,
            use, or disclosure. However, no method of transmission over the internet or electronic storage is
            completely secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section className="data-sharing">
          <h2>5. Data Sharing</h2>
          <p>
            We may share your personal information with the following types of third parties:
          </p>
          <ul>
            <li>Service providers who assist us with payment processing, shipping, and other services</li>
            <li>Business partners who offer products or services in conjunction with us</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section className="your-rights">
          <h2>6. Your Rights</h2>
          <p>
            You have the following rights regarding your personal information:
          </p>
          <ul>
            <li>To access your personal information</li>
            <li>To correct inaccuracies in your personal information</li>
            <li>To request deletion of your personal information</li>
            <li>To object to the processing of your personal information</li>
          </ul>
        </section>

        <section className="contact-information">
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
            <br />
            Email: support@example.com
            <br />
            Phone: (555) 123-4567
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
