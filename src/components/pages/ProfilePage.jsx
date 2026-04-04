import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useAuth } from "react-oidc-context";
import { User, Mail, Phone, ShieldCheck, Calendar, LogOut, Settings, Bell } from "lucide-react";
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    const auth = useAuth();

    if (auth.isLoading) {
        return (
            <div className="profile-loading">
                <Navbar />
                <div className="spinner-container"><div className="pro-spinner"></div></div>
                <Footer />
            </div>
        );
    }

    if (!auth.isAuthenticated || !auth.user) {
        return (
            <div className="profile-page-wrapper">
                <Navbar />
                <div className="auth-fallback">
                    <div className="fallback-card">
                        <User size={48} className="text-slate-300" />
                        <h2>Access Restricted</h2>
                        <p>Please log in to manage your account and view your personal details.</p>
                        <button className="btn-login-pro" onClick={() => auth.signinRedirect()}>Sign In Now</button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const { profile } = auth.user;
    const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

    return (
        <div className="profile-page-wrapper">
            <Navbar />
            
            <main className="profile-container container">
                {/* Header Section */}
                <header className="profile-hero">
                    <div className="hero-avatar-wrapper">
                        {profile.picture ? (
                            <img src={profile.picture} alt="Avatar" className="pro-avatar" />
                        ) : (
                            <div className="pro-avatar-initials">{initials}</div>
                        )}
                    </div>
                    <div className="hero-text">
                        <h1>{profile.name}</h1>
                        <p className="profile-tagline">Manage your account settings and preferences.</p>
                    </div>
                </header>

                <div className="profile-grid">
                    {/* Sidebar Nav */}
                    <aside className="profile-sidebar">
                        <nav className="side-nav">
                            <button className="nav-item active"><User size={18} /> Personal Info</button>
                            {/* <button className="nav-item"><ShieldCheck size={18} /> Security</button>
                            <button className="nav-item"><Bell size={18} /> Notifications</button>
                            <button className="nav-item"><Settings size={18} /> Account Settings</button> */}
                            <div className="nav-divider"></div>
                            <button className="nav-item logout" onClick={() => auth.signoutRedirect()}>
                                <LogOut size={18} /> Sign Out
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <div className="profile-main-content">
                        <section className="profile-section-card">
                            <div className="section-header">
                                <h3>Account Information</h3>
                            </div>
                            
                            <div className="details-grid">
                                <div className="detail-item">
                                    <div className="detail-icon"><Mail size={20} /></div>
                                    <div className="detail-text">
                                        <label>Email Address</label>
                                        <p>{profile.email} {profile.email_verified && <span className="verified-badge">Verified</span>}</p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon"><Calendar size={20} /></div>
                                    <div className="detail-text">
                                        <label>Account Status</label>
                                        <p>Active Member</p>
                                    </div>
                                </div>

                                {profile.phone_number && (
                                    <div className="detail-item">
                                        <div className="detail-icon"><Phone size={20} /></div>
                                        <div className="detail-text">
                                            <label>Phone Number</label>
                                            <p>{profile.phone_number}</p>
                                        </div>
                                    </div>
                                )}

                                {profile.preferred_username && (
                                    <div className="detail-item">
                                        <div className="detail-icon"><User size={20} /></div>
                                        <div className="detail-text">
                                            <label>Username</label>
                                            <p>@{profile.preferred_username}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default ProfilePage;