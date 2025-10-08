// src/components/pages/ProfilePage.js

import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useAuth } from "react-oidc-context";
import '../styles/ProfilePage.css'; // Import the CSS file

const ProfilePage = () => {
    const auth = useAuth();

    // Show a loading message while auth is being checked
    if (auth.isLoading) {
        return (
            <div className="profile-page">
                <Navbar />
                <main className="profile-content"><p>Loading profile...</p></main>
                <Footer />
            </div>
        );
    }

    // Handle the case where the user is not logged in
    if (!auth.isAuthenticated || !auth.user) {
        return (
            <div className="profile-page">
                <Navbar />
                <main className="profile-content">
                    <div className="profile-card">
                        <h2>Profile</h2>
                        <p>Please log in to view your profile.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const { profile } = auth.user;
    const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?');

    return (
        <div className="profile-page">
            <Navbar />
            <main className="profile-content">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {profile.picture ? (
                                <img src={profile?.picture} alt="Profile" />
                            ) : (
                                <span>{getInitials(profile.name)}</span>
                            )}
                        </div>
                        <div className="profile-info">
                            <h2>{profile?.name || 'User Profile'}</h2>
                            <p>{profile?.email}</p>
                        </div>
                    </div>

                    <ul className="profile-details">
                        <li>
                            <strong>Email Verified:</strong> 
                            <span>{String(profile?.email_verified)}</span>
                        </li>
                        {profile.phone_number && (
                            <li>
                                <strong>Phone Number:</strong> 
                                <span>{profile?.phone_number}</span>
                            </li>
                        )}
                        {profile.preferred_username && (
                            <li>
                                <strong>Username:</strong> 
                                <span>{profile?.preferred_username}</span>
                            </li>
                        )}
                    </ul>

                    <button className="logout-button" onClick={() => auth.signoutRedirect()}>
                        Sign Out
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProfilePage;