// src/components/auth/Callback.js
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

export default function Callback() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.error) {
      console.error("Auth error:", auth.error);
    }
  }, [auth]);

  return <p>Processing login...</p>;
}
