// src/components/utils/auth.js
import { jwtDecode } from "jwt-decode";

// Extract and store tokens from Cognito redirect
export function handleCognitoRedirect() {
  const hash = window.location.hash.substring(1); // remove #
  if (!hash) return null;

  const params = new URLSearchParams(hash);

  const idToken = params.get("id_token");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (idToken) localStorage.setItem("id_token", idToken);
  if (accessToken) localStorage.setItem("access_token", accessToken);
  if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

  // Clear hash from URL for cleanliness
  window.history.replaceState(null, "", window.location.pathname);

  if (idToken) {
    try {
      return jwtDecode(idToken);
    } catch (error) {
      console.error("Invalid ID token:", error);
      return null;
    }
  }
  return null;
}

// Logout helper
export function logout() {
  localStorage.removeItem("id_token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  window.location.href =
    
"https://eu-north-10wjov9r47.auth.eu-north-1.amazoncognito.com/login?client_id=1a4qii0kgoqusmr1ufbku7vjtv&code_challenge=XdxF4tVA9rXwo14QJOqFowYyUpzuwC9zdclaWvpZF7c&code_challenge_method=S256&redirect_uri=http://localhost:3000/home&response_type=code&scope=email+openid+phone&state=2779b35e546e4456a4ed35033ae22371";
}
