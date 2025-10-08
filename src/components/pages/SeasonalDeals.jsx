import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import DealCard from "../DealCard";
import AddDealForm from "../AddDealForm";
import LoginPage from "../admin/LoginPage";
import { fetchDeals } from "../../data/dealsData";
import "../styles/SeasonalDeals.css";

export default function SeasonalDeals() {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");
  // --- 1. ADD NEW STATE TO TOGGLE THE LOGIN FORM VISIBILITY ---
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    // ... data fetching logic remains the same
    const getDeals = async () => {
      try {
        const initialDeals = await fetchDeals();
        setDeals(initialDeals);
      } catch (err) {
        setError("Failed to load deals. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getDeals();
  }, []);

  const handleLogin = (credentials) => {
    if (
      credentials.email === "admin@example.com" &&
      credentials.password === "password123"
    ) {
      setIsAdmin(true);
      setLoginError("");
      // --- 2. HIDE THE FORM AFTER SUCCESSFUL LOGIN ---
      setShowLoginForm(false);
    } else {
      setLoginError("Invalid email or password. Please try again.");
    }
  };
  
  const handleLogout = () => {
    setIsAdmin(false);
    // Also hide the login form when logging out
    setShowLoginForm(false);
  };

  const addDealHandler = (newDeal) => {
    if (!isAdmin) return;
    setDeals(prevDeals => [newDeal, ...prevDeals]);
  };
  
  const handleAddToCart = (dealName) => {
    alert(`"${dealName}" has been added to your cart!`);
  };

  const renderContent = () => {
    // ... loading/error logic remains the same
    if (isLoading) return <div className="loader"></div>;
    if (error) return <p className="error-message">{error}</p>;
    return (
      <div className="deals-list">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} onAddToCart={handleAddToCart} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="deals-container">
        {/* --- 3. UPDATE THE CONDITIONAL RENDERING LOGIC --- */}
        {isAdmin ? (
          // If admin is logged in, show the admin panel
          <>
            <div className="admin-header">
              <h3>Admin Panel</h3>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
            <AddDealForm onAddDeal={addDealHandler} />
            <hr className="section-divider" />
          </>
        ) : showLoginForm ? (
          // If not logged in AND the form should be shown, show the LoginPage
          <LoginPage onLogin={handleLogin} error={loginError} />
        ) : (
          // If not logged in AND the form is hidden, show the initial login button
          <div className="admin-login-prompt">
            <button onClick={() => setShowLoginForm(true)}>
              Admin Login
            </button>
          </div>
        )}

        <h1>Seasonal Deals 🔥</h1>
        <p className="deals-description">
          Check out our amazing seasonal deals! These offers are available for a limited time only, so don't miss out!
        </p>
        {renderContent()}
      </div>
      <Footer />
    </>
  );
}