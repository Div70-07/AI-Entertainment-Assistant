import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Usage (in router config):
 *
 *   // Auth-only, no role restriction:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   // Auth + role restriction:
 *   <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 *
 * Props:
 *   requiredRole {string|string[]} - Optional. Single role string or array of allowed roles.
 *   redirectTo   {string}          - Where to redirect if unauthenticated. Default: "/login"
 *   unauthorizedTo {string}        - Where to redirect if authenticated but wrong role. Default: "/unauthorized"
 */
function ProtectedRoute({
  requiredRole   = null,
  redirectTo     = "/login",
  unauthorizedTo = "/unauthorized",
}) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // ── Not authenticated → redirect to login, preserve intended path ──────────
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // ── Authenticated but wrong role ───────────────────────────────────────────
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(role)) {
      return <Navigate to={unauthorizedTo} replace />;
    }
  }

  // ── Authorized → render nested routes ─────────────────────────────────────
  return <Outlet />;
}

export default ProtectedRoute;
