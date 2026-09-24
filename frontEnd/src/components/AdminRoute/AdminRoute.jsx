// ROOMS FEATURE OWNERSHIP: E = Admin (Wonde). Whole file. Search "[Rooms X" (your letter) to find your parts.
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";


/**
 * Lets only admins see the pages inside it. Use it INSIDE ProtectedRoute.
 *
 * This only decides what the front end SHOWS. It is not the security: the
 * server checks the admin role again on every /api/admin request, so a user
 * who gets past this file still receives 403 and no data.
 */
export default function AdminRoute() {
  const { isAdmin, roleReady } = useAuth();

  // After a page refresh the role arrives a moment later. Wait for it, or a
  // real admin would be sent away.
  if (!roleReady) {
    return <LoadingSpinner label="Checking your access..." />;
  }

  if (!isAdmin) {
    return <Navigate to="/rooms" replace />;
  }

  return <Outlet />;
}
