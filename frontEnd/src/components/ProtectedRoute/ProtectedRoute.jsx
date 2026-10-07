import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Guards routes that require a valid authenticated session.
 *
 * On page load the app first asks the backend who is logged in (the login
 * token is an httpOnly cookie the browser keeps). Until that answer arrives,
 * nothing is rendered, so a logged-in user is not sent to the login page by
 * mistake. If the user is not authenticated, they are redirected to the auth
 * page and can return to the protected page after signing in.
 */

export default function ProtectedRoute() {
  const { isAuthenticated, isCheckingSession } = useAuth();
  const location = useLocation();

  if (isCheckingSession) {
    return null;
  }

  // Redirect unauthenticated users to the login/register screen while keeping
  // the page they were trying to reach to allow a return after sign in.

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
