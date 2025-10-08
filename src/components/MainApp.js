import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

function MainApp() {
  const auth = useAuth();

  useEffect(() => {
    // This effect handles the initial sign-in redirect
    // if the user is not authenticated and the auth state is stable.
    if (!auth.isLoading && !auth.isAuthenticated && !auth.error) {
      auth.signinRedirect();
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, auth]);

  useEffect(() => {
    // This effect stores tokens in localStorage after a successful login.
    // This is fine, but remember to clear them on logout.
    if (auth.isAuthenticated && auth.user) {
      const { id_token, access_token, refresh_token } = auth.user;

      if (id_token) {
        localStorage.setItem("id_token", id_token);
      }
      if (access_token) {
        localStorage.setItem("access_token", access_token);
      }
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }
    }
  }, [auth.isAuthenticated, auth.user]);

  const handleSignOut = () => {
    // CRITICAL: Clear tokens from localStorage
    // localStorage.removeItem("id_token");
    // localStorage.removeItem("access_token");
    // localStorage.removeItem("refresh_token");

    // CRITICAL: Use the built-in library method for a complete logout
    auth.signoutRedirect();
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <pre>Hello: {auth.user?.profile?.email}</pre>
        <pre>ID Token: {auth.user?.id_token}</pre>
        <pre>Access Token: {auth.user?.access_token}</pre>
        <pre>Refresh Token: {auth.user?.refresh_token}</pre>
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    );
  }

  return null;
}

export default MainApp;