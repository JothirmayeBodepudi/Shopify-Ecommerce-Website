import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { Mail, Phone, ArrowRight, Store } from 'lucide-react';
import '../styles/DealerRegistration.css';

export default function DealerLoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        phone: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5001/api/dealers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem('dealerId', data.dealerId);
                navigate('/dealer-dashboard');
            } else {
                setError(data.error || "Invalid login details");
            }
        } catch (err) {
            setError("Server error");
        }

        setIsLoading(false);
    };

    return (
        <>
            <Navbar />

            <div className="dealer-auth-wrapper">
                <div className="dealer-auth-card">

                    <div className="auth-header">
                        <div className="auth-icon-wrapper">
                            <Store size={28} className="auth-icon" />
                        </div>
                        <h2>Vendor Login</h2>
                        <p>Login to manage your products</p>
                    </div>

                    {error && <div className="auth-banner error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">

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

                        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                            {isLoading ? "Logging in..." : <>Login <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Not registered?</p>
                        <Link to="/dealer-registration" className="auth-link">Register</Link>
                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
}