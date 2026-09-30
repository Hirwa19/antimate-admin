import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext();

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://brooder-backend.onrender.com/api";

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  /*
  ============================================================
  LOAD SAVED LOGIN
  ============================================================
  */

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    const savedToken = localStorage.getItem("token");
    const savedPermissions =
      localStorage.getItem("permissions");

    if (savedAdmin && savedToken) {
      try {
        const parsedAdmin = JSON.parse(savedAdmin);

        setAdmin(parsedAdmin);
        setToken(savedToken);

        if (savedPermissions) {
          try {
            setPermissions(JSON.parse(savedPermissions));
          } catch {
            setPermissions([]);
          }
        }
      } catch (error) {
        console.error("FAILED TO LOAD SAVED ADMIN:", error);

        localStorage.removeItem("admin");
        localStorage.removeItem("token");
        localStorage.removeItem("permissions");
      }
    }

    setLoading(false);
  }, []);

  /*
  ============================================================
  LOAD CURRENT ACCESS
  ============================================================
  */

  const loadPermissions = useCallback(
    async (jwtToken) => {
      if (!jwtToken) {
        setPermissions([]);
        return;
      }

      setPermissionsLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/access-control/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load access permissions"
          );
        }

        const user = data?.user;
        const access = data?.access;

        const loadedPermissions =
          Array.isArray(access?.permissions)
            ? access.permissions
            : [];

        /*
        Update admin with the latest backend data.
        */

        if (user) {
          setAdmin(user);

          localStorage.setItem(
            "admin",
            JSON.stringify(user)
          );
        }

        setPermissions(loadedPermissions);

        localStorage.setItem(
          "permissions",
          JSON.stringify(loadedPermissions)
        );
      } catch (error) {
        console.error(
          "LOAD ACCESS PERMISSIONS ERROR:",
          error
        );

        /*
        Do not immediately logout here.

        If Render/backend is temporarily waking up,
        the saved login can remain available.
        */

        setPermissions([]);
      } finally {
        setPermissionsLoading(false);
      }
    },
    []
  );

  /*
  ============================================================
  LOAD PERMISSIONS AFTER LOGIN IS RESTORED
  ============================================================
  */

  useEffect(() => {
    if (token) {
      loadPermissions(token);
    }
  }, [token, loadPermissions]);

  /*
  ============================================================
  LOGIN
  ============================================================
  */

  const login = (adminData, jwtToken) => {
    console.log(
      "AUTH LOGIN DATA:",
      adminData
    );

    localStorage.setItem(
      "admin",
      JSON.stringify(adminData)
    );

    localStorage.setItem(
      "token",
      jwtToken
    );

    localStorage.removeItem("permissions");

    setAdmin(adminData);
    setToken(jwtToken);
    setPermissions([]);

    /*
    Load permissions immediately after login.
    */

    loadPermissions(jwtToken);
  };

  /*
  ============================================================
  LOGOUT
  ============================================================
  */

  const logout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    localStorage.removeItem("permissions");

    setAdmin(null);
    setToken(null);
    setPermissions([]);
  };

  /*
  ============================================================
  HAS PERMISSION
  ============================================================
  */

  const hasPermission = useCallback(
    (permission) => {
      if (!permission) {
        return false;
      }

      /*
      Superadmin / wildcard permission.
      */

      if (permissions.includes("*")) {
        return true;
      }

      return permissions.includes(permission);
    },
    [permissions]
  );

  /*
  ============================================================
  HAS ANY PERMISSION
  ============================================================
  */

  const hasAnyPermission = useCallback(
    (...requiredPermissions) => {
      if (!requiredPermissions.length) {
        return false;
      }

      if (permissions.includes("*")) {
        return true;
      }

      return requiredPermissions.some(
        (permission) =>
          permissions.includes(permission)
      );
    },
    [permissions]
  );

  /*
  ============================================================
  HAS ALL PERMISSIONS
  ============================================================
  */

  const hasAllPermissions = useCallback(
    (...requiredPermissions) => {
      if (!requiredPermissions.length) {
        return false;
      }

      if (permissions.includes("*")) {
        return true;
      }

      return requiredPermissions.every(
        (permission) =>
          permissions.includes(permission)
      );
    },
    [permissions]
  );

  /*
  ============================================================
  ACCESS LEVEL
  ============================================================
  */

  const accessLevel =
    admin?.accessLevel || "limited";

  /*
  ============================================================
  CONTEXT
  ============================================================
  */

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,

        accessLevel,
        permissions,

        login,
        logout,

        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        loadPermissions,

        loading,
        permissionsLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}