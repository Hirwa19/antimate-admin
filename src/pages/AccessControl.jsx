import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

const translations = {
  en: {
    accessControl: "Access Control",
    accessControlDesc:
      "Manage users, roles and system permissions.",

    users: "Users",
    roles: "Roles",
    permissions: "Permissions",

    search: "Search",
    searchUsers: "Search users...",
    searchRoles: "Search roles...",
    searchPermissions: "Search permissions...",

    name: "Name",
    email: "Email",
    phone: "Phone",
    role: "Role",
    accessLevel: "Access level",
    department: "Department",
    position: "Position",
    team: "Team",
    status: "Status",
    actions: "Actions",

    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    onLeave: "On leave",
    terminated: "Terminated",

    superadmin: "Superadmin",
    admin: "Admin",
    manager: "Manager",
    staff: "Staff",
    limited: "Limited",

    view: "View",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    close: "Close",

    permissionsCount: "permissions",
    permission: "Permission",
    module: "Module",
    action: "Action",
    description: "Description",

    changeAccess: "Change access level",
    changeAccessDesc:
      "Select the access level for this user.",

    saveAccess: "Save access",
    updateStatus: "Update status",

    enableUser: "Activate user",
    disableUser: "Deactivate user",

    noUsers: "No users found.",
    noRoles: "No roles found.",
    noPermissions: "No permissions found.",

    loading: "Loading...",
    failedUsers:
      "Failed to load users.",
    failedRoles:
      "Failed to load roles.",
    failedPermissions:
      "Failed to load permissions.",

    accessUpdated:
      "User access level updated successfully.",
    statusUpdated:
      "User status updated successfully.",
    roleUpdated:
      "Role permissions updated successfully.",

    selectRole: "Select role",
    selectAll: "Select all",
    clearAll: "Clear all",
    selected: "selected",

    confirmDeactivate:
      "Are you sure you want to deactivate this user?",
  },

  rw: {
    accessControl: "Igenzura ry'Uburenganzira",
    accessControlDesc:
      "Gucunga abakozi, roles n'uburenganzira bwa system.",

    users: "Abakoresha",
    roles: "Roles",
    permissions: "Uburenganzira",

    search: "Shakisha",
    searchUsers: "Shakisha umukozi...",
    searchRoles: "Shakisha role...",
    searchPermissions:
      "Shakisha uburenganzira...",

    name: "Amazina",
    email: "Email",
    phone: "Telefone",
    role: "Role",
    accessLevel: "Urwego rw'uburenganzira",
    department: "Department",
    position: "Umwanya",
    team: "Team",
    status: "Status",
    actions: "Ibikorwa",

    active: "Akora",
    inactive: "Ntakora",
    suspended: "Yahagaritswe",
    onLeave: "Ari mu kiruhuko",
    terminated: "Yirukanywe",

    superadmin: "Superadmin",
    admin: "Admin",
    manager: "Manager",
    staff: "Staff",
    limited: "Limited",

    view: "Reba",
    edit: "Hindura",
    save: "Bika",
    cancel: "Reka",
    close: "Funga",

    permissionsCount: "uburenganzira",
    permission: "Uburenganzira",
    module: "Module",
    action: "Igikorwa",
    description: "Ibisobanuro",

    changeAccess:
      "Hindura urwego rw'uburenganzira",
    changeAccessDesc:
      "Hitamo urwego rw'uburenganzira bw'uyu mukozi.",

    saveAccess: "Bika uburenganzira",
    updateStatus: "Hindura status",

    enableUser: "Shyira ku murimo",
    disableUser: "Hagarika umukozi",

    noUsers: "Nta bakozi babonetse.",
    noRoles: "Nta roles zabonetse.",
    noPermissions:
      "Nta burenganzira bwabonetse.",

    loading: "Birimo gutegurwa...",
    failedUsers:
      "Kubona abakozi byanze.",
    failedRoles:
      "Kubona roles byanze.",
    failedPermissions:
      "Kubona permissions byanze.",

    accessUpdated:
      "Urwego rw'uburenganzira rwahinduwe neza.",
    statusUpdated:
      "Status y'umukozi yahinduwe neza.",
    roleUpdated:
      "Permissions za role zahinduwe neza.",

    selectRole: "Hitamo role",
    selectAll: "Hitamo byose",
    clearAll: "Kuraho byose",
    selected: "byatoranyijwe",

    confirmDeactivate:
      "Urashaka koko guhagarika uyu mukozi?",
  },
};

const ACCESS_LEVELS = [
  "superadmin",
  "admin",
  "manager",
  "staff",
  "limited",
];

function AccessControl() {
  const {
    language,
    theme,
  } = useAppSettings();

  const t = (key) =>
    translations[language]?.[key] ||
    translations.en[key] ||
    key;

  const isDark = theme === "dark";

  const [activeTab, setActiveTab] =
    useState("users");

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] =
    useState([]);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [loadingRoles, setLoadingRoles] =
    useState(false);

  const [
    loadingPermissions,
    setLoadingPermissions,
  ] = useState(false);

  const [usersError, setUsersError] =
    useState("");

  const [rolesError, setRolesError] =
    useState("");

  const [
    permissionsError,
    setPermissionsError,
  ] = useState("");

  const [userSearch, setUserSearch] =
    useState("");

  const [roleSearch, setRoleSearch] =
    useState("");

  const [
    permissionSearch,
    setPermissionSearch,
  ] = useState("");

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

  const [
    selectedAccessLevel,
    setSelectedAccessLevel,
  ] = useState("");

  const [
    selectedRole,
    setSelectedRole,
  ] = useState(null);

  const [
    selectedRolePermissions,
    setSelectedRolePermissions,
  ] = useState([]);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ===================================================
  // LOAD USERS
  // ===================================================

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError("");

      const response =
        await api.get(
          "/access-control/users"
        );

      setUsers(
        response.data?.users || []
      );
    } catch (error) {
      console.error(
        "LOAD ACCESS USERS ERROR:",
        error
      );

      setUsersError(
        error.response?.data?.message ||
          t("failedUsers")
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // ===================================================
  // LOAD ROLES
  // ===================================================

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      setRolesError("");

      const response =
        await api.get(
          "/access-control/roles"
        );

      setRoles(
        response.data?.roles || []
      );
    } catch (error) {
      console.error(
        "LOAD ACCESS ROLES ERROR:",
        error
      );

      setRolesError(
        error.response?.data?.message ||
          t("failedRoles")
      );
    } finally {
      setLoadingRoles(false);
    }
  };

  // ===================================================
  // LOAD PERMISSIONS
  // ===================================================

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      setPermissionsError("");

      const response =
        await api.get(
          "/access-control/permissions"
        );

      setPermissions(
        response.data?.permissions || []
      );
    } catch (error) {
      console.error(
        "LOAD PERMISSIONS ERROR:",
        error
      );

      setPermissionsError(
        error.response?.data?.message ||
          t("failedPermissions")
      );
    } finally {
      setLoadingPermissions(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadPermissions();
  }, []);

  // ===================================================
  // FILTER USERS
  // ===================================================

  const filteredUsers = useMemo(() => {
    const query =
      userSearch.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const values = [
        user.fullName,
        user.firstName,
        user.secondName,
        user.email,
        user.phone,
        user.accessLevel,
        user.department?.name,
        user.position?.name,
        user.team?.name,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [users, userSearch]);

  // ===================================================
  // FILTER ROLES
  // ===================================================

  const filteredRoles = useMemo(() => {
    const query =
      roleSearch.trim().toLowerCase();

    if (!query) {
      return roles;
    }

    return roles.filter((role) => {
      return [
        role.name,
        role.code,
        role.level,
        role.description,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [roles, roleSearch]);

  // ===================================================
  // FILTER PERMISSIONS
  // ===================================================

  const filteredPermissions =
    useMemo(() => {
      const query =
        permissionSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return permissions;
      }

      return permissions.filter(
        (permission) => {
          return [
            permission.name,
            permission.module,
            permission.action,
            permission.description,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      permissions,
      permissionSearch,
    ]);

  // ===================================================
  // OPEN USER ACCESS
  // ===================================================

  const openUserAccess = (user) => {
    setSelectedUser(user);
    setSelectedAccessLevel(
      user.accessLevel || "limited"
    );
    setMessage("");
  };

  // ===================================================
  // SAVE USER ACCESS
  // ===================================================

  const saveUserAccess = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response =
        await api.put(
          `/access-control/users/${selectedUser._id || selectedUser.id}/access`,
          {
            accessLevel:
              selectedAccessLevel,
          }
        );

      setMessage(
        response.data?.message ||
          t("accessUpdated")
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          String(user._id || user.id) ===
          String(
            selectedUser._id ||
              selectedUser.id
          )
            ? {
                ...user,
                accessLevel:
                  selectedAccessLevel,
              }
            : user
        )
      );

      setSelectedUser(null);
    } catch (error) {
      console.error(
        "SAVE USER ACCESS ERROR:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to update access."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // TOGGLE USER STATUS
  // ===================================================

  const toggleUserStatus = async (
    user
  ) => {
    const userId =
      user._id || user.id;

    const nextActive =
      user.active !== true;

    if (
      user.active === true &&
      !window.confirm(
        t("confirmDeactivate")
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response =
        await api.put(
          `/access-control/users/${userId}/status`,
          {
            active: nextActive,
            status: nextActive
              ? "active"
              : "inactive",
          }
        );

      setUsers((currentUsers) =>
        currentUsers.map(
          (currentUser) =>
            String(
              currentUser._id ||
                currentUser.id
            ) === String(userId)
              ? {
                  ...currentUser,
                  active: nextActive,
                  status:
                    nextActive
                      ? "active"
                      : "inactive",
                }
              : currentUser
        )
      );

      setMessage(
        response.data?.message ||
          t("statusUpdated")
      );
    } catch (error) {
      console.error(
        "TOGGLE USER STATUS ERROR:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to update status."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // OPEN ROLE
  // ===================================================

  const openRole = (role) => {
    setSelectedRole(role);

    setSelectedRolePermissions(
      (role.permissions || []).map(
        (permission) =>
          String(
            permission._id ||
              permission.id
          )
      )
    );

    setMessage("");
  };

  // ===================================================
  // TOGGLE ROLE PERMISSION
  // ===================================================

  const toggleRolePermission = (
    permissionId
  ) => {
    setSelectedRolePermissions(
      (current) => {
        if (
          current.includes(
            permissionId
          )
        ) {
          return current.filter(
            (id) =>
              id !== permissionId
          );
        }

        return [
          ...current,
          permissionId,
        ];
      }
    );
  };

  // ===================================================
  // SAVE ROLE PERMISSIONS
  // ===================================================

  const saveRolePermissions =
    async () => {
      if (!selectedRole) {
        return;
      }

      if (
        selectedRole.level ===
        "superadmin"
      ) {
        return;
      }

      try {
        setSaving(true);
        setMessage("");

        const response =
          await api.put(
            `/access-control/roles/${selectedRole._id}/permissions`,
            {
              permissions:
                selectedRolePermissions,
            }
          );

        const updatedRole =
          response.data?.role;

        if (updatedRole) {
          setRoles((currentRoles) =>
            currentRoles.map(
              (role) =>
                String(role._id) ===
                String(
                  selectedRole._id
                )
                  ? updatedRole
                  : role
            )
          );
        }

        setMessage(
          response.data?.message ||
            t("roleUpdated")
        );

        setSelectedRole(null);
      } catch (error) {
        console.error(
          "SAVE ROLE PERMISSIONS ERROR:",
          error
        );

        setMessage(
          error.response?.data
            ?.message ||
            "Failed to update role."
        );
      } finally {
        setSaving(false);
      }
    };

  // ===================================================
  // SELECT ALL PERMISSIONS
  // ===================================================

  const selectAllPermissions = () => {
    if (
      selectedRole?.level ===
      "superadmin"
    ) {
      return;
    }

    setSelectedRolePermissions(
      permissions.map(
        (permission) =>
          String(permission._id)
      )
    );
  };

  // ===================================================
  // CLEAR ALL PERMISSIONS
  // ===================================================

  const clearAllPermissions = () => {
    if (
      selectedRole?.level ===
      "superadmin"
    ) {
      return;
    }

    setSelectedRolePermissions([]);
  };

  // ===================================================
  // ROLE PERMISSION CHECK
  // ===================================================

  const roleHasPermission = (
    role,
    permissionId
  ) => {
    return (role.permissions || [])
      .some(
        (permission) =>
          String(
            permission._id ||
              permission.id
          ) === String(permissionId)
      );
  };

  // ===================================================
  // STATUS LABEL
  // ===================================================

  const getStatusLabel = (
    status
  ) => {
    const map = {
      active: t("active"),
      inactive: t("inactive"),
      suspended: t("suspended"),
      on_leave: t("onLeave"),
      terminated: t("terminated"),
    };

    return (
      map[status] ||
      status ||
      t("inactive")
    );
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      className={`access-control-page ${
        isDark ? "dark" : "light"
      }`}
    >
      <style>{`
        .access-control-page {
          --ac-bg: #f5f7fb;
          --ac-surface: #ffffff;
          --ac-surface-2: #f8fafc;
          --ac-border: #e5e7eb;
          --ac-text: #111827;
          --ac-muted: #6b7280;
          --ac-primary: #2563eb;
          --ac-primary-soft: #eff6ff;
          --ac-danger: #dc2626;
          --ac-success: #16a34a;
          --ac-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);

          min-height: 100%;
          background: var(--ac-bg);
          color: var(--ac-text);
          padding: 24px;
        }

        .access-control-page.dark {
          --ac-bg: #0b1120;
          --ac-surface: #111827;
          --ac-surface-2: #172033;
          --ac-border: #263247;
          --ac-text: #f3f4f6;
          --ac-muted: #9ca3af;
          --ac-primary: #60a5fa;
          --ac-primary-soft: #172554;
          --ac-danger: #f87171;
          --ac-success: #4ade80;
          --ac-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
        }

        .ac-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .ac-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .ac-title {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .ac-description {
          margin: 7px 0 0;
          color: var(--ac-muted);
          font-size: 14px;
        }

        .ac-message {
          margin-bottom: 18px;
          padding: 11px 14px;
          border: 1px solid var(--ac-border);
          border-radius: 10px;
          background: var(--ac-surface);
          color: var(--ac-text);
          font-size: 13px;
        }

        .ac-tabs {
          display: flex;
          gap: 5px;
          padding: 5px;
          margin-bottom: 18px;
          border: 1px solid var(--ac-border);
          border-radius: 12px;
          background: var(--ac-surface);
          width: fit-content;
        }

        .ac-tab {
          border: 0;
          background: transparent;
          color: var(--ac-muted);
          padding: 9px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .ac-tab:hover {
          color: var(--ac-text);
        }

        .ac-tab.active {
          background: var(--ac-primary-soft);
          color: var(--ac-primary);
        }

        .ac-panel {
          background: var(--ac-surface);
          border: 1px solid var(--ac-border);
          border-radius: 14px;
          box-shadow: var(--ac-shadow);
          overflow: hidden;
        }

        .ac-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 16px 18px;
          border-bottom: 1px solid var(--ac-border);
        }

        .ac-panel-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .ac-search {
          width: 280px;
          max-width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--ac-border);
          border-radius: 9px;
          outline: none;
          background: var(--ac-surface-2);
          color: var(--ac-text);
          font-size: 13px;
        }

        .ac-search:focus {
          border-color: var(--ac-primary);
        }

        .ac-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .ac-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .ac-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ac-muted);
          background: var(--ac-surface-2);
          border-bottom: 1px solid var(--ac-border);
          white-space: nowrap;
        }

        .ac-table td {
          padding: 13px 16px;
          border-bottom: 1px solid var(--ac-border);
          font-size: 13px;
          vertical-align: middle;
        }

        .ac-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .ac-user-name {
          font-weight: 600;
        }

        .ac-user-sub {
          margin-top: 3px;
          color: var(--ac-muted);
          font-size: 12px;
        }

        .ac-badge {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 4px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          background: var(--ac-surface-2);
          border: 1px solid var(--ac-border);
        }

        .ac-badge.active {
          color: var(--ac-success);
        }

        .ac-badge.inactive {
          color: var(--ac-danger);
        }

        .ac-actions {
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }

        .ac-button {
          border: 1px solid var(--ac-border);
          background: var(--ac-surface);
          color: var(--ac-text);
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .ac-button:hover {
          border-color: var(--ac-primary);
          color: var(--ac-primary);
        }

        .ac-button.primary {
          border-color: var(--ac-primary);
          background: var(--ac-primary);
          color: white;
        }

        .ac-button.primary:hover {
          opacity: 0.9;
          color: white;
        }

        .ac-button.danger {
          color: var(--ac-danger);
        }

        .ac-button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .ac-empty {
          padding: 42px 20px;
          text-align: center;
          color: var(--ac-muted);
          font-size: 13px;
        }

        .ac-loading {
          padding: 42px 20px;
          text-align: center;
          color: var(--ac-muted);
          font-size: 13px;
        }

        .ac-error {
          padding: 18px;
          color: var(--ac-danger);
          font-size: 13px;
        }

        .ac-role-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(250px, 1fr)
          );
          gap: 14px;
          padding: 18px;
        }

        .ac-role-card {
          border: 1px solid var(--ac-border);
          border-radius: 12px;
          padding: 16px;
          background: var(--ac-surface-2);
        }

        .ac-role-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .ac-role-name {
          font-size: 15px;
          font-weight: 700;
        }

        .ac-role-code {
          margin-top: 3px;
          color: var(--ac-muted);
          font-size: 11px;
        }

        .ac-role-description {
          margin: 12px 0;
          min-height: 38px;
          color: var(--ac-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .ac-role-count {
          color: var(--ac-text);
          font-size: 12px;
          font-weight: 600;
        }

        .ac-permission-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(260px, 1fr)
          );
          gap: 10px;
          padding: 18px;
        }

        .ac-permission-card {
          border: 1px solid var(--ac-border);
          border-radius: 10px;
          padding: 13px;
          background: var(--ac-surface-2);
        }

        .ac-permission-name {
          font-size: 13px;
          font-weight: 700;
        }

        .ac-permission-meta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 7px;
        }

        .ac-small-badge {
          padding: 3px 7px;
          border: 1px solid var(--ac-border);
          border-radius: 6px;
          color: var(--ac-muted);
          font-size: 10px;
        }

        .ac-permission-description {
          margin-top: 8px;
          color: var(--ac-muted);
          font-size: 11px;
          line-height: 1.45;
        }

        .ac-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.55);
        }

        .ac-modal {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--ac-border);
          border-radius: 14px;
          background: var(--ac-surface);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        .ac-modal.large {
          max-width: 900px;
        }

        .ac-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 18px;
          border-bottom: 1px solid var(--ac-border);
        }

        .ac-modal-title {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
        }

        .ac-modal-subtitle {
          margin: 5px 0 0;
          color: var(--ac-muted);
          font-size: 12px;
        }

        .ac-close {
          width: 32px;
          height: 32px;
          border: 1px solid var(--ac-border);
          border-radius: 8px;
          background: transparent;
          color: var(--ac-text);
          cursor: pointer;
          font-size: 16px;
        }

        .ac-modal-body {
          padding: 18px;
        }

        .ac-user-summary {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 12px;
          margin-bottom: 18px;
        }

        .ac-summary-item {
          padding: 11px;
          border: 1px solid var(--ac-border);
          border-radius: 9px;
          background: var(--ac-surface-2);
        }

        .ac-summary-label {
          color: var(--ac-muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ac-summary-value {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 600;
        }

        .ac-field {
          margin-bottom: 18px;
        }

        .ac-label {
          display: block;
          margin-bottom: 7px;
          font-size: 12px;
          font-weight: 700;
        }

        .ac-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--ac-border);
          border-radius: 9px;
          outline: none;
          background: var(--ac-surface-2);
          color: var(--ac-text);
          font-size: 13px;
        }

        .ac-select:focus {
          border-color: var(--ac-primary);
        }

        .ac-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 15px 18px;
          border-top: 1px solid var(--ac-border);
        }

        .ac-permission-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .ac-permission-selection {
          color: var(--ac-muted);
          font-size: 12px;
        }

        .ac-permission-list {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(250px, 1fr)
          );
          gap: 9px;
        }

        .ac-permission-option {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 11px;
          border: 1px solid var(--ac-border);
          border-radius: 9px;
          background: var(--ac-surface-2);
          cursor: pointer;
        }

        .ac-permission-option:hover {
          border-color: var(--ac-primary);
        }

        .ac-permission-option input {
          margin-top: 2px;
          accent-color: var(--ac-primary);
        }

        .ac-option-content {
          min-width: 0;
        }

        .ac-option-name {
          font-size: 12px;
          font-weight: 700;
          word-break: break-word;
        }

        .ac-option-meta {
          margin-top: 3px;
          color: var(--ac-muted);
          font-size: 10px;
        }

        .ac-option-description {
          margin-top: 4px;
          color: var(--ac-muted);
          font-size: 10px;
          line-height: 1.4;
        }

        @media (max-width: 800px) {
          .access-control-page {
            padding: 15px;
          }

          .ac-header {
            flex-direction: column;
          }

          .ac-tabs {
            width: 100%;
            overflow-x: auto;
          }

          .ac-tab {
            flex: 1;
            white-space: nowrap;
          }

          .ac-panel-header {
            align-items: stretch;
            flex-direction: column;
          }

          .ac-search {
            width: 100%;
          }

          .ac-user-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ac-container">
        {/* HEADER */}

        <div className="ac-header">
          <div>
            <h1 className="ac-title">
              {t("accessControl")}
            </h1>

            <p className="ac-description">
              {t("accessControlDesc")}
            </p>
          </div>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="ac-message">
            {message}
          </div>
        )}

        {/* TABS */}

        <div className="ac-tabs">
          <button
            type="button"
            className={`ac-tab ${
              activeTab === "users"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("users")
            }
          >
            {t("users")}
          </button>

          <button
            type="button"
            className={`ac-tab ${
              activeTab === "roles"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("roles")
            }
          >
            {t("roles")}
          </button>

          <button
            type="button"
            className={`ac-tab ${
              activeTab === "permissions"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "permissions"
              )
            }
          >
            {t("permissions")}
          </button>
        </div>

        {/* ========================================= */}
        {/* USERS */}
        {/* ========================================= */}

        {activeTab === "users" && (
          <div className="ac-panel">
            <div className="ac-panel-header">
              <h2 className="ac-panel-title">
                {t("users")}
              </h2>

              <input
                className="ac-search"
                type="search"
                value={userSearch}
                onChange={(event) =>
                  setUserSearch(
                    event.target.value
                  )
                }
                placeholder={t(
                  "searchUsers"
                )}
              />
            </div>

            {loadingUsers ? (
              <div className="ac-loading">
                {t("loading")}
              </div>
            ) : usersError ? (
              <div className="ac-error">
                {usersError}
              </div>
            ) : filteredUsers.length ===
              0 ? (
              <div className="ac-empty">
                {t("noUsers")}
              </div>
            ) : (
              <div className="ac-table-wrap">
                <table className="ac-table">
                  <thead>
                    <tr>
                      <th>
                        {t("name")}
                      </th>
                      <th>
                        {t("email")}
                      </th>
                      <th>
                        {t("department")}
                      </th>
                      <th>
                        {t("position")}
                      </th>
                      <th>
                        {t("accessLevel")}
                      </th>
                      <th>
                        {t("status")}
                      </th>
                      <th>
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map(
                      (user) => {
                        const userId =
                          user._id ||
                          user.id;

                        return (
                          <tr
                            key={userId}
                          >
                            <td>
                              <div className="ac-user-name">
                                {user.fullName ||
                                  `${user.firstName || ""} ${user.secondName || ""}`}
                              </div>

                              {user.phone && (
                                <div className="ac-user-sub">
                                  {
                                    user.phone
                                  }
                                </div>
                              )}
                            </td>

                            <td>
                              {user.email ||
                                "—"}
                            </td>

                            <td>
                              {user
                                .department
                                ?.name ||
                                "—"}
                            </td>

                            <td>
                              {user
                                .position
                                ?.name ||
                                "—"}
                            </td>

                            <td>
                              <span className="ac-badge">
                                {t(
                                  user.accessLevel ||
                                    "limited"
                                )}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`ac-badge ${
                                  user.active
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {getStatusLabel(
                                  user.status
                                )}
                              </span>
                            </td>

                            <td>
                              <div className="ac-actions">
                                <button
                                  type="button"
                                  className="ac-button"
                                  onClick={() =>
                                    openUserAccess(
                                      user
                                    )
                                  }
                                >
                                  {t(
                                    "edit"
                                  )}
                                </button>

                                <button
                                  type="button"
                                  className={`ac-button ${
                                    user.active
                                      ? "danger"
                                      : ""
                                  }`}
                                  disabled={
                                    saving ||
                                    user.accessLevel ===
                                      "superadmin"
                                  }
                                  onClick={() =>
                                    toggleUserStatus(
                                      user
                                    )
                                  }
                                >
                                  {user.active
                                    ? t(
                                        "disableUser"
                                      )
                                    : t(
                                        "enableUser"
                                      )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* ROLES */}
        {/* ========================================= */}

        {activeTab === "roles" && (
          <div className="ac-panel">
            <div className="ac-panel-header">
              <h2 className="ac-panel-title">
                {t("roles")}
              </h2>

              <input
                className="ac-search"
                type="search"
                value={roleSearch}
                onChange={(event) =>
                  setRoleSearch(
                    event.target.value
                  )
                }
                placeholder={t(
                  "searchRoles"
                )}
              />
            </div>

            {loadingRoles ? (
              <div className="ac-loading">
                {t("loading")}
              </div>
            ) : rolesError ? (
              <div className="ac-error">
                {rolesError}
              </div>
            ) : filteredRoles.length ===
              0 ? (
              <div className="ac-empty">
                {t("noRoles")}
              </div>
            ) : (
              <div className="ac-role-grid">
                {filteredRoles.map(
                  (role) => (
                    <div
                      className="ac-role-card"
                      key={role._id}
                    >
                      <div className="ac-role-top">
                        <div>
                          <div className="ac-role-name">
                            {t(
                              role.level
                            )}
                          </div>

                          <div className="ac-role-code">
                            {role.code}
                          </div>
                        </div>

                        <span className="ac-badge">
                          {role
                            .permissions
                            ?.length ||
                            0}{" "}
                          {t(
                            "permissionsCount"
                          )}
                        </span>
                      </div>

                      <div className="ac-role-description">
                        {role.description ||
                          "—"}
                      </div>

                      <button
                        type="button"
                        className="ac-button primary"
                        disabled={
                          role.level ===
                            "superadmin" ||
                          saving
                        }
                        onClick={() =>
                          openRole(
                            role
                          )
                        }
                      >
                        {role.level ===
                        "superadmin"
                          ? t(
                              "view"
                            )
                          : t(
                              "edit"
                            )}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* PERMISSIONS */}
        {/* ========================================= */}

        {activeTab ===
          "permissions" && (
          <div className="ac-panel">
            <div className="ac-panel-header">
              <h2 className="ac-panel-title">
                {t("permissions")}
              </h2>

              <input
                className="ac-search"
                type="search"
                value={
                  permissionSearch
                }
                onChange={(event) =>
                  setPermissionSearch(
                    event.target.value
                  )
                }
                placeholder={t(
                  "searchPermissions"
                )}
              />
            </div>

            {loadingPermissions ? (
              <div className="ac-loading">
                {t("loading")}
              </div>
            ) : permissionsError ? (
              <div className="ac-error">
                {permissionsError}
              </div>
            ) : filteredPermissions.length ===
              0 ? (
              <div className="ac-empty">
                {t("noPermissions")}
              </div>
            ) : (
              <div className="ac-permission-grid">
                {filteredPermissions.map(
                  (permission) => (
                    <div
                      className="ac-permission-card"
                      key={
                        permission._id
                      }
                    >
                      <div className="ac-permission-name">
                        {
                          permission.name
                        }
                      </div>

                      <div className="ac-permission-meta">
                        <span className="ac-small-badge">
                          {
                            permission.module
                          }
                        </span>

                        <span className="ac-small-badge">
                          {
                            permission.action
                          }
                        </span>
                      </div>

                      {permission.description && (
                        <div className="ac-permission-description">
                          {
                            permission.description
                          }
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================== */}
      {/* USER ACCESS MODAL */}
      {/* =========================================== */}

      {selectedUser && (
        <div className="ac-overlay">
          <div className="ac-modal">
            <div className="ac-modal-header">
              <div>
                <h2 className="ac-modal-title">
                  {t(
                    "changeAccess"
                  )}
                </h2>

                <p className="ac-modal-subtitle">
                  {t(
                    "changeAccessDesc"
                  )}
                </p>
              </div>

              <button
                type="button"
                className="ac-close"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="ac-modal-body">
              <div className="ac-user-summary">
                <div className="ac-summary-item">
                  <div className="ac-summary-label">
                    {t("name")}
                  </div>

                  <div className="ac-summary-value">
                    {
                      selectedUser.fullName
                    }
                  </div>
                </div>

                <div className="ac-summary-item">
                  <div className="ac-summary-label">
                    {t("email")}
                  </div>

                  <div className="ac-summary-value">
                    {
                      selectedUser.email
                    }
                  </div>
                </div>

                <div className="ac-summary-item">
                  <div className="ac-summary-label">
                    {t(
                      "department"
                    )}
                  </div>

                  <div className="ac-summary-value">
                    {selectedUser
                      .department
                      ?.name ||
                      "—"}
                  </div>
                </div>

                <div className="ac-summary-item">
                  <div className="ac-summary-label">
                    {t("position")}
                  </div>

                  <div className="ac-summary-value">
                    {selectedUser
                      .position
                      ?.name ||
                      "—"}
                  </div>
                </div>
              </div>

              <div className="ac-field">
                <label className="ac-label">
                  {t(
                    "accessLevel"
                  )}
                </label>

                <select
                  className="ac-select"
                  value={
                    selectedAccessLevel
                  }
                  disabled={
                    selectedUser.accessLevel ===
                    "superadmin"
                  }
                  onChange={(event) =>
                    setSelectedAccessLevel(
                      event.target
                        .value
                    )
                  }
                >
                  {ACCESS_LEVELS.map(
                    (level) => (
                      <option
                        key={level}
                        value={level}
                      >
                        {t(level)}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="ac-modal-footer">
              <button
                type="button"
                className="ac-button"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
              >
                {t("cancel")}
              </button>

              <button
                type="button"
                className="ac-button primary"
                disabled={
                  saving ||
                  selectedUser.accessLevel ===
                    "superadmin"
                }
                onClick={
                  saveUserAccess
                }
              >
                {saving
                  ? t("loading")
                  : t(
                      "saveAccess"
                    )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================== */}
      {/* ROLE PERMISSIONS MODAL */}
      {/* =========================================== */}

      {selectedRole && (
        <div className="ac-overlay">
          <div className="ac-modal large">
            <div className="ac-modal-header">
              <div>
                <h2 className="ac-modal-title">
                  {t(
                    selectedRole.level
                  )}{" "}
                  —{" "}
                  {t(
                    "permissions"
                  )}
                </h2>

                <p className="ac-modal-subtitle">
                  {
                    selectedRole.description
                  }
                </p>
              </div>

              <button
                type="button"
                className="ac-close"
                onClick={() =>
                  setSelectedRole(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="ac-modal-body">
              {selectedRole.level ===
              "superadmin" ? (
                <div className="ac-message">
                  Superadmin has full system
                  access. Its permissions
                  cannot be modified here.
                </div>
              ) : (
                <>
                  <div className="ac-permission-toolbar">
                    <div className="ac-permission-selection">
                      {
                        selectedRolePermissions.length
                      }{" "}
                      {t("selected")}
                    </div>

                    <div className="ac-actions">
                      <button
                        type="button"
                        className="ac-button"
                        onClick={
                          selectAllPermissions
                        }
                      >
                        {t(
                          "selectAll"
                        )}
                      </button>

                      <button
                        type="button"
                        className="ac-button"
                        onClick={
                          clearAllPermissions
                        }
                      >
                        {t(
                          "clearAll"
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="ac-permission-list">
                    {permissions.map(
                      (
                        permission
                      ) => {
                        const permissionId =
                          String(
                            permission._id
                          );

                        const checked =
                          selectedRolePermissions.includes(
                            permissionId
                          );

                        return (
                          <label
                            className="ac-permission-option"
                            key={
                              permission._id
                            }
                          >
                            <input
                              type="checkbox"
                              checked={
                                checked
                              }
                              onChange={() =>
                                toggleRolePermission(
                                  permissionId
                                )
                              }
                            />

                            <div className="ac-option-content">
                              <div className="ac-option-name">
                                {
                                  permission.name
                                }
                              </div>

                              <div className="ac-option-meta">
                                {
                                  permission.module
                                }{" "}
                                ·{" "}
                                {
                                  permission.action
                                }
                              </div>

                              {permission.description && (
                                <div className="ac-option-description">
                                  {
                                    permission.description
                                  }
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      }
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="ac-modal-footer">
              <button
                type="button"
                className="ac-button"
                onClick={() =>
                  setSelectedRole(
                    null
                  )
                }
              >
                {t("close")}
              </button>

              {selectedRole.level !==
                "superadmin" && (
                <button
                  type="button"
                  className="ac-button primary"
                  disabled={saving}
                  onClick={
                    saveRolePermissions
                  }
                >
                  {saving
                    ? t("loading")
                    : t("save")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccessControl;