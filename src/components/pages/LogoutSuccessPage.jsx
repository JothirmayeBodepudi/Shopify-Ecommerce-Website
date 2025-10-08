import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LogoutSucessPage.css'; // Create this CSS file for styling

const LogoutSuccessPage = () => {
    return (
        <div className="logout-success-container">
            <div className="logout-success-card">
                <h2>Logout Successful</h2>
                <p>You have been securely logged out of your account.</p>
                <Link to="/home" className="home-button">
                    Go to Homepage
                </Link>
            </div>
        </div>
    );
};

export default LogoutSuccessPage;