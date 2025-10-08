import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

function CallbackPage() {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // This effect runs when the auth state changes.
        if (auth.isAuthenticated) {
            // Once the user is authenticated, redirect them to their profile.
            navigate('/profile/view'); 
        } else if (auth.error) {
            // If there's an error during login, you can handle it here.
            console.error("Login Error:", auth.error);
            navigate('/'); // Or redirect to an error page
        }
    }, [auth.isAuthenticated, auth.error, navigate]);

    // Show a loading message while the library is processing the callback.
    return <div>Loading session...</div>;
}

export default CallbackPage;