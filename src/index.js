// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { CartProvider } from "./components/context/CartContext";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_0WjoV9R47",
  client_id: "1a4qii0kgoqusmr1ufbku7vjtv",
  redirect_uri: "https://shopify-ecommerce-website-nu.vercel.app/home",
  logout_uri: "https://shopify-ecommerce-website-nu.vercel.app/logout-success",
  response_type: "code",
  scope: "email openid phone profile",

  //automaticSilentRenew: true, // Keep this true for good UX
 // revokeTokensOnSignout: true, // Recommended for security
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
