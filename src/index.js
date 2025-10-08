// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { CartProvider } from "./components/context/CartContext";

const cognitoAuthConfig = {
<<<<<<< HEAD
  authority: process.env.REACT_APP_AUTHORITY,
  client_id: process.env.REACT_APP_CLIENT_ID,
  redirect_uri: process.env.REACT_APP_REDIRECT_URI,
  logout_uri: process.env.REACT_APP_LOGOUT_URI,
=======
  authority: "",
  client_id: "",
  redirect_uri: "http://localhost:3000/home",
  logout_uri: "http://localhost:3000/logout-success",
>>>>>>> 695b864f11a21854b8716e13f51eb484d76132f1
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
