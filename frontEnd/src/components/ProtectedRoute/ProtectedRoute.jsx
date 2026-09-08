import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ui from "../../styles/pageStates.module.css";

/**
 * Guards routes that require a valid authenticated session.
 *
 * While the auth state is being verified, the component shows a loading screen.
 * If the user is not authenticated, they are redirected to the auth page and
 * can return to the protected page after signing in.
 */

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show a simple loading state until the auth context finishes checking the
  // saved token and user data.

  if (loading) {
    return (
      <div className={ui.screenCenter}>
        <div className={ui.spinner} />
        <p>Checking your session...</p>
      </div>
    );
  }

  // Redirect unauthenticated users to the login/register screen while keeping
  // the page they were trying to reach to allow a return after sign in.

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
