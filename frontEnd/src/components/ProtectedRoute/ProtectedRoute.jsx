import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Guards routes that require a valid authenticated session.
 *
 * The auth state is read from the saved token the moment the app starts, so
 * there is nothing to wait for. If the user is not authenticated, they are
 * redirected to the auth page and can return to the protected page after
 * signing in.
 */

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Redirect unauthenticated users to the login/register screen while keeping
  // the page they were trying to reach to allow a return after sign in.

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
