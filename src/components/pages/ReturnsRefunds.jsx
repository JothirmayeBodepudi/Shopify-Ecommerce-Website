import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/ReturnsRefunds.css";

export default function ReturnsRefunds() {
  return (
    <>
      <Navbar />
      <div className="returns-container">
        <h1>Returns & Refunds</h1>

        <section className="returns-policy">
          <h2>Our Returns Policy</h2>
          <p>
            We want you to be completely satisfied with your purchase. If you are not satisfied for any reason, you
            may return the item(s) within 30 days of the purchase date for a full refund or exchange.
          </p>
        </section>

        <section className="eligible-items">
          <h2>Eligible Items</h2>
          <p>
            Most items are eligible for return, but certain exceptions apply:
          </p>
          <ul>
            <li>Items must be in their original condition, with all tags attached.</li>
            <li>Items must be unused and unworn.</li>
            <li>Personalized or custom-made items are not eligible for return.</li>
            <li>Items marked as "Final Sale" are not eligible for return.</li>
          </ul>
        </section>

        <section className="return-process">
          <h2>How to Return an Item</h2>
          <ol>
            <li>
              <b>Initiate a Return:</b> Contact our customer support team to initiate a return request.
            </li>
            <li>
              <b>Pack Your Item(s):</b> Securely pack the item(s) you wish to return, along with a copy of the
              original packing slip.
            </li>
            <li>
              <b>Ship Your Item(s):</b> Ship the item(s) to the address provided by our customer support team.
            </li>
          </ol>
        </section>

        <section className="refund-process">
          <h2>Refund Process</h2>
          <p>
            Once we receive your returned item(s), we will inspect them and process your refund within 5-7 business
            days. Refunds will be issued to the original form of payment.
          </p>
        </section>

        <section className="contact-information">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about our returns and refunds policy, please contact us:
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
