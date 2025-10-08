import React, { useState, useEffect } from "react";

// A reusable component for the countdown timer
const Countdown = ({ expiryDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    // Clear the interval on component unmount
    return () => clearTimeout(timer);
  });

  const timerComponents = [];
  Object.keys(timeLeft).forEach(interval => {
    if (!timeLeft[interval] && interval !== 'seconds' && Object.keys(timerComponents).length === 0) {
      return;
    }
    timerComponents.push(
      <span key={interval}>
        {String(timeLeft[interval]).padStart(2, '0')}
        {interval.charAt(0)}{" "}
      </span>
    );
  });

  return (
    <div className="countdown">
      {timerComponents.length ? <>Ends in: {timerComponents}</> : <span>Deal Expired!</span>}
    </div>
  );
};


export default function DealCard({ deal, onAddToCart }) {
  // Calculate the percentage saved
  const calculateSavePercentage = (original, discounted) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  const savings = calculateSavePercentage(deal.originalPrice, deal.discountedPrice);

  return (
    <div className="deal-card">
      <div className="deal-image-container">
        <img src={deal.img} alt={deal.name} className="deal-image" />
        <span className="save-badge">SAVE {savings}%</span>
      </div>
      <div className="deal-details">
        <h3>{deal.name}</h3>
        <div className="price-container">
          <p className="discounted-price">${deal.discountedPrice.toFixed(2)}</p>
          <p className="original-price">${deal.originalPrice.toFixed(2)}</p>
        </div>
        <Countdown expiryDate={deal.expiryDate} />
        <button onClick={() => onAddToCart(deal.name)} className="add-to-cart-btn">
          Add to Cart
        </button>
      </div>
    </div>
  );
}