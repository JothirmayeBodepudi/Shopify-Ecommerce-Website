import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../styles/DealerRegistration.css';

export default function DealerLoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        phone: '', // Changed from dealerId to phone
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await fetch('http://localhost:5000/dealers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // On successful login, save the dealerId and redirect
                localStorage.setItem('dealerId', data.dealerId);
                navigate('/dealer-dashboard');
            } else {
                setMessage(`❌ ${data.error || 'Login failed!'}`);
            }
        } catch (error) {
            setMessage('❌ Server error during login.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="dealer-form-container">
                <h2>Dealer Login</h2>
                <form onSubmit={handleSubmit} className="dealer-form">
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="tel" // Changed type to 'tel' for phone number
                        name="phone" // Changed name to 'phone'
                        placeholder="Your Phone Number" // Changed placeholder
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                {message && <p className="error-message">{message}</p>}
            </div>
        </>
    );
}