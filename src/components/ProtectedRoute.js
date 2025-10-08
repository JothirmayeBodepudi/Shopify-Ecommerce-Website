import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    // Redirect to signin if no token
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
