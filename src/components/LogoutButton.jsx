import React from 'react';
// --- FIX: Using a CDN URL to resolve the module ---
import { useAuth } from 'https://esm.sh/react-oidc-context';

function LogoutButton() {
  const auth = useAuth();

  const handleLogout = () => {
    // Add a console log to help with debugging
    console.log("Attempting to log out...");
    
    // ✅ CORRECT: This is the function for logging out.
    // It will build the .../logout URL and redirect the user.
    auth.signoutRedirect();
  };

  // Only render the button if the user is authenticated
  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    // Make sure the onClick handler calls the correct function
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;

