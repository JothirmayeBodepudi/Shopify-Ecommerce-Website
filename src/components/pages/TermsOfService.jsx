import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/TermsOfService.css";

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <div className="terms-container">
        <h1>Terms of Service</h1>

        <section className="introduction">
          <h2>1. Introduction</h2>
          <p>
            Welcome to MyShop! These Terms of Service ("Terms") govern your use of
            our website and services. By accessing or using our services, you agree
            to be bound by these Terms. If you do not agree with these Terms,
            please do not use our services.
          </p>
        </section>

        <section className="account-terms">
          <h2>2. Account Terms</h2>
          <p>
            You are responsible for maintaining the security of your account. You
            must not share your password with anyone. You are responsible for all
            activities that occur under your account.
          </p>
        </section>

        <section className="acceptable-use">
          <h2>3. Acceptable Use</h2>
          <p>You agree to use our services only for lawful purposes. You must not use our services to:</p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Distribute spam or malicious software</li>
            <li>Engage in any activity that disrupts or interferes with our services</li>
          </ul>
        </section>

        <section className="intellectual-property">
          <h2>4. Intellectual Property</h2>
          <p>
            All content on our website, including text, images, and logos, is our
            property and is protected by copyright laws. You may not use our
            content without our permission.
          </p>
        </section>

        <section className="disclaimer-of-warranties">
          <h2>5. Disclaimer of Warranties</h2>
          <p>
            Our services are provided "as is" without any warranties, express or
            implied. We do not warrant that our services will be uninterrupted or
            error-free.
          </p>
        </section>

        <section className="limitation-of-liability">
          <h2>6. Limitation of Liability</h2>
          <p>
            We are not liable for any damages arising from your use of our
            services. Our liability is limited to the amount you paid for our
            services.
          </p>
        </section>

        <section className="governing-law">
          <h2>7. Governing Law</h2>
          <p>
            These Terms are governed by the laws of [Your Jurisdiction]. Any
            disputes will be resolved in the courts of [Your Jurisdiction].
          </p>
        </section>

        <section className="changes-to-terms">
          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify
            you of any changes by posting the new Terms on our website. Your
            continued use of our services after the changes constitutes your
            acceptance of the new Terms.
          </p>
        </section>

        <section className="contact-information">
          <h2>9. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
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
