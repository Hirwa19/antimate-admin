import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] =
    useState(false);

  /*
  ============================================================
  LOAD SAVED LOGIN
  ============================================================
  */

  useEffect(() => {
    const savedAdmin =
      localStorage.getItem("admin");

    const savedToken =
      localStorage.getItem("token");

    const savedPermissions =
      localStorage.getItem("permissions");

    if (savedAdmin && savedToken) {
      try {
        const parsedAdmin =
          JSON.parse(savedAdmin);

        setAdmin(parsedAdmin);
        setToken(savedToken);

        if (savedPermissions) {
          try {
            const parsedPermissions =
              JSON.parse(savedPermissions);

            setPermissions(
              Array.isArray(parsedPermissions)
                ? parsedPermissions
                : []
            );
          } catch {
            setPermissions([]);
          }
        }
      } catch (error) {
        console.error(
          "FAILED TO LOAD SAVED ADMIN:",
          error
        );

        localStorage.removeItem("admin");
        localStorage.removeItem("token");
        localStorage.removeItem(
          "permissions"
        );
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
        /*
        api/axios.js automatically adds:

        Authorization: Bearer <token>

        and uses:

        VITE_API_URL + /api
        */

        const response =
          await api.get(
            "/access-control/me",
            {
              headers: {
                Authorization:
                  `Bearer ${jwtToken}`,
              },
            }
          );

        const data = response.data;

        const user = data?.user;
        const access = data?.access;

        const loadedPermissions =
          Array.isArray(
            access?.permissions
          )
            ? access.permissions
            : [];

        /*
        ========================================================
        UPDATE CURRENT ADMIN
        ========================================================
        */

        if (user) {
          setAdmin(user);

          localStorage.setItem(
            "admin",
            JSON.stringify(user)
          );
        }

        /*
        ========================================================
        SAVE PERMISSIONS
        ========================================================
        */

        setPermissions(
          loadedPermissions
        );

        localStorage.setItem(
          "permissions",
          JSON.stringify(
            loadedPermissions
          )
        );
      } catch (error) {
        console.error(
          "LOAD ACCESS PERMISSIONS ERROR:",
          error
        );

        /*
        Do not immediately logout.

        If Render is waking up or temporarily
        unavailable, keep the saved login.
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
  }, [
    token,
    loadPermissions,
  ]);

  /*
  ============================================================
  LOGIN
  ============================================================
  */

  const login = (
    adminData,
    jwtToken
  ) => {
    localStorage.setItem(
      "admin",
      JSON.stringify(adminData)
    );

    localStorage.setItem(
      "token",
      jwtToken
    );

    localStorage.removeItem(
      "permissions"
    );

    setAdmin(adminData);
    setToken(jwtToken);
    setPermissions([]);

    /*
    Load permissions immediately.
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
    localStorage.removeItem(
      "permissions"
    );

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
      Wildcard gives full access.
      */

      if (
        permissions.includes("*")
      ) {
        return true;
      }

      return permissions.includes(
        permission
      );
    },
    [permissions]
  );

  /*
  ============================================================
  HAS ANY PERMISSION
  ============================================================
  */

  const hasAnyPermission =
    useCallback(
      (...requiredPermissions) => {
        if (
          !requiredPermissions.length
        ) {
          return false;
        }

        if (
          permissions.includes("*")
        ) {
          return true;
        }

        return requiredPermissions.some(
          (permission) =>
            permissions.includes(
              permission
            )
        );
      },
      [permissions]
    );

  /*
  ============================================================
  HAS ALL PERMISSIONS
  ============================================================
  */

  const hasAllPermissions =
    useCallback(
      (...requiredPermissions) => {
        if (
          !requiredPermissions.length
        ) {
          return false;
        }

        if (
          permissions.includes("*")
        ) {
          return true;
        }

        return requiredPermissions.every(
          (permission) =>
            permissions.includes(
              permission
            )
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
    admin?.accessLevel ||
    "limited";

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
  return useContext(
    AuthContext
  );
}