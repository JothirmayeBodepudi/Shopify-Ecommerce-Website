import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { User, Building2, Mail, Phone, MapPin, ArrowRight, Store, Loader2 } from 'lucide-react';
import '../styles/DealerRegistration.css';

export default function DealerRegistrationPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: ''
    });

    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.company || !formData.email || !formData.phone || !formData.address) {
            setMessage({ text: "Please fill all fields", type: "error" });
            return;
        }

        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('http://localhost:5001/api/dealers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ text: "Application submitted successfully! Redirecting...", type: "success" });
                setTimeout(() => navigate('/dealer-login'), 2000);
            } else {
                setMessage({ text: data.error || "Registration failed", type: "error" });
            }
        } catch (err) {
            setMessage({ text: "Server error. Please try again.", type: "error" });
        }

        setIsLoading(false);
    };

    return (
        <div className="dealer-page-container">
            <Navbar />

            <main className="dealer-auth-wrapper">
                <div className="dealer-auth-card register-mode">

                    <header className="auth-header">
                        <div className="auth-icon-wrapper">
                            <Store size={28} className="auth-icon" />
                        </div>
                        <h2>Become a Vendor</h2>
                        <p>Partner with ShopEase to grow your business.</p>
                    </header>

                    {message.text && (
                        <div className={`auth-banner ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-grid">

                            <div className="form-group">
                                <label>Full Name</label>
                                <div className="input-with-icon">
                                    <span className="input-icon"><User size={18} /></span>
                                    <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange}/>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Company Name</label>
                                <div className="input-with-icon">
                                    <span className="input-icon"><Building2 size={18} /></span>
                                    <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleChange}/>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <div className="input-with-icon">
                                    <span className="input-icon"><Mail size={18} /></span>
                                    <input type="email" name="email" placeholder="email@company.com" value={formData.email} onChange={handleChange}/>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <div className="input-with-icon">
                                    <span className="input-icon"><Phone size={18} /></span>
                                    <input type="tel" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleChange}/>
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Address</label>
                                <div className="input-with-icon">
                                    <span className="input-icon"><MapPin size={18} /></span>
                                    <textarea name="address" placeholder="Business Address" value={formData.address} onChange={handleChange}></textarea>
                                </div>
                            </div>

                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> :
                                <>Submit Application <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <footer className="auth-footer">
                        <p>Already registered?</p>
                        <Link to="/dealer-login" className="auth-link">Login</Link>
                    </footer>

                </div>
            </main>

            <Footer />
        </div>
    );
}