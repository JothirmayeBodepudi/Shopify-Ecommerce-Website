import React, { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/ShippingLocation.css";

export default function ShippingLocation() {
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);

  // ✅ Mock ZIP database with more addresses
  const zipDatabase = {
    "10001": { city: "New York, NY", options: [{ id: 1, name: "Standard (5-7 days)", price: "$5" }, { id: 2, name: "Express (2-3 days)", price: "$12" }] },
    "30301": { city: "Atlanta, GA", options: [{ id: 3, name: "Standard (4-6 days)", price: "$6" }] },
    "60601": { city: "Chicago, IL", options: [{ id: 4, name: "Express (2-3 days)", price: "$10" }, { id: 5, name: "Overnight", price: "$20" }] },
    "73301": { city: "Austin, TX", options: [{ id: 6, name: "Standard (5-7 days)", price: "$5" }] },
    "85001": { city: "Phoenix, AZ", options: [{ id: 7, name: "Express (2-3 days)", price: "$11" }] },
    "90001": { city: "Los Angeles, CA", options: [{ id: 8, name: "Standard (3-5 days)", price: "$7" }, { id: 9, name: "Same-Day Delivery", price: "$25" }] },
    "94101": { city: "San Francisco, CA", options: [{ id: 10, name: "Express (1-2 days)", price: "$15" }] },
    "33101": { city: "Miami, FL", options: [{ id: 11, name: "Standard (5-7 days)", price: "$6" }, { id: 12, name: "Express (3-4 days)", price: "$12" }] },
    "98101": { city: "Seattle, WA", options: [{ id: 13, name: "Overnight", price: "$18" }] },
    "02101": { city: "Boston, MA", options: [{ id: 14, name: "Standard (3-6 days)", price: "$6" }] },
  };

  const handleCheck = () => {
    const entry = zipDatabase[location];
    if (entry) {
      setAvailability(true);
      setShippingOptions(entry.options);
    } else {
      setAvailability(false);
      setShippingOptions([]);
    }
  };

  return (
    <>
      <Navbar />
      <div className="shipping-container">
        <h1>Shipping & Location</h1>
        <p>We ship to various locations. Enter your ZIP code to check availability.</p>

        <input
          type="text"
          placeholder="Enter ZIP Code"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleCheck}>Check Availability</button>

        {availability !== null && (
          <div className="availability-result">
            {availability ? (
              <>
                <p>
                  ✅ Shipping is available to <b>{zipDatabase[location].city}</b> ({location}).
                </p>
                {shippingOptions.length > 0 ? (
                  <>
                    <h3>Available Shipping Options:</h3>
                    <ul>
                      {shippingOptions.map((option) => (
                        <li key={option.id}>
                          {option.name} - {option.price}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>No shipping options available for this location.</p>
                )}
              </>
            ) : (
              <p>❌ Sorry, shipping is not available to ZIP code <b>{location}</b>.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
