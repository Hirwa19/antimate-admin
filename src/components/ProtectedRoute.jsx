import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  permission,
  anyPermissions = [],
  allPermissions = [],
}) {
  const location = useLocation();

  const {
    admin,
    loading,
    permissionsLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuth();

  /*
  ============================================================
  AUTH LOADING
  ============================================================
  */

  if (loading) {
    return (
      <div className="protected-route-loading">
        Loading...
      </div>
    );
  }

  /*
  ============================================================
  NOT LOGGED IN
  ============================================================
  */

  if (!admin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
  ============================================================
  PERMISSIONS LOADING
  ============================================================
  */

  if (
    permission ||
    anyPermissions.length > 0 ||
    allPermissions.length > 0
  ) {
    if (permissionsLoading) {
      return (
        <div className="protected-route-loading">
          Loading access...
        </div>
      );
    }
  }

  /*
  ============================================================
  SINGLE PERMISSION
  ============================================================
  */

  if (permission && !hasPermission(permission)) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /*
  ============================================================
  ANY PERMISSION
  ============================================================
  */

  if (
    anyPermissions.length > 0 &&
    !hasAnyPermission(...anyPermissions)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /*
  ============================================================
  ALL PERMISSIONS
  ============================================================
  */

  if (
    allPermissions.length > 0 &&
    !hasAllPermissions(...allPermissions)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /*
  ============================================================
  ACCESS GRANTED
  ============================================================
  */

  return children;
}