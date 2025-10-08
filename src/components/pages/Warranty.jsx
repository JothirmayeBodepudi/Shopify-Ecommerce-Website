import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/Warranty.css";

export default function Warranty() {
  return (
    <>
      <Navbar />
      <div className="warranty-container">
        <h1>Warranty Information</h1>

        <section className="warranty-overview">
          <h2>Overview</h2>
          <p>
            We stand behind the quality of our products. This warranty outlines the coverage, duration, and
            procedures for warranty claims.
          </p>
        </section>

        <section className="warranty-duration">
          <h2>Warranty Duration</h2>
          <p>
            All products purchased from our store are covered by a 1-year limited warranty from the date of
            purchase. Certain products may have extended warranty periods, as specified in the product
            description.
          </p>
        </section>

        <section className="what-is-covered">
          <h2>What is Covered</h2>
          <p>This warranty covers defects in materials and workmanship under normal use during the warranty period.</p>
          <ul>
            <li>Manufacturing defects</li>
            <li>Component failure</li>
            <li>Malfunction under normal use</li>
          </ul>
        </section>

        <section className="what-is-not-covered">
          <h2>What is Not Covered</h2>
          <p>This warranty does not cover the following:</p>
          <ul>
            <li>Damage caused by misuse, abuse, or neglect</li>
            <li>Normal wear and tear</li>
            <li>Accidental damage</li>
            <li>Unauthorized modifications or repairs</li>
            <li>Damage caused by natural disasters</li>
          </ul>
        </section>

        <section className="warranty-claim-process">
          <h2>Warranty Claim Process</h2>
          <ol>
            <li>
              <b>Contact Support:</b> Initiate a warranty claim by contacting our customer support team via email or
              phone.
            </li>
            <li>
              <b>Provide Information:</b> Provide your order number, product name, and a detailed description of the
              issue.
            </li>
            <li>
              <b>Assessment:</b> Our support team will assess the issue and may request additional information or
              photos.
            </li>
            <li>
              <b>Resolution:</b> If the claim is approved, we will either repair or replace the defective item, or
              issue a refund.
            </li>
          </ol>
        </section>

        <section className="disclaimer">
          <h2>Disclaimer</h2>
          <p>
            This warranty is the sole and exclusive warranty provided by us. We disclaim all other warranties, express
            or implied, including but not limited to warranties of merchantability and fitness for a particular
            purpose.
          </p>
        </section>

        <section className="contact-information">
          <h2>Contact Information</h2>
          <p>
            For warranty claims and support, please contact us at:
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
