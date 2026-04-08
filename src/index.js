// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { CartProvider } from "./components/context/CartContext";

// const cognitoAuthConfig = {
//   authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_DoS4Lyi4Q",
//   client_id: "6gdo20o2m2nuushmcnt2h918lp",
//   redirect_uri: "http://localhost:3000/home",
//   logout_uri: "http://localhost:3000/logout-success",
//   response_type: "code",
//   scope: "email openid phone profile",

//   //automaticSilentRenew: true, // Keep this true for good UX
//  // revokeTokensOnSignout: true, // Recommended for security
// };

const isLocal = window.location.hostname === "localhost";
const APP_URL = isLocal 
  ? "http://localhost:3000" 
  : "https://main.d28osev3npc5aj.amplifyapp.com";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_DoS4Lyi4Q",
  client_id: "6gdo20o2m2nuushmcnt2h918lp",
  // This now uses the Amplify URL automatically when you are live
  redirect_uri: `${APP_URL}/home`,
  logout_uri: `${APP_URL}/logout-success`,
  response_type: "code",
  scope: "email openid phone profile",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// ✅ Single render call wrapping both providers
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
