import React from "react";
import {
  LayoutDashboard,
  Cpu,
  Shield,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Radio,
  Building2,
} from "lucide-react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    admin,
    logout,
    hasPermission,
  } = useAuth();

  const settings = useAppSettings();

  const {
    t,
    theme,
  } = settings;

  /*
  ============================================================
  THEME
  ============================================================
  */

  const currentTheme =
    theme || "light";

  /*
  ============================================================
  TRANSLATION HELPER
  ============================================================
  */

  const translate = (
    key,
    fallback
  ) => {
    const value = t?.(key);

    return value &&
      value !== key
      ? value
      : fallback;
  };

  /*
  ============================================================
  MENU
  ============================================================
  */

  const menuItems = [
    {
      label: translate(
        "dashboard",
        "Dashboard"
      ),
      path: "/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard.view",
    },

    {
      label: translate(
        "devices",
        "Devices"
      ),
      path: "/devices",
      icon: Cpu,
      permission: "devices.view",
    },

    {
      label: translate(
        "generateDevice",
        "Generate Device"
      ),
      path: "/generate-device",
      icon: Cpu,
      permission: "devices.create",
    },

    {
      label: translate(
        "generateGateway",
        "Generate Gateway"
      ),
      path: "/generate-gateway",
      icon: Radio,
      permission: "gateways.create",
    },

    {
      label: translate(
        "workers",
        "Workers"
      ),
      path: "/workers",
      icon: Users,
      permission: "workers.view",
    },

    {
      label: translate(
        "organization",
        "Organization"
      ),
      path: "/organization",
      icon: Building2,
      permission: "organization.view",
    },

    {
      label: translate(
        "accessControl",
        "Access Control"
      ),
      path: "/access-control",
      icon: Shield,
      permission:
        "access_control.view",
    },

    {
      label: translate(
        "settings",
        "Settings"
      ),
      path: "/settings",
      icon: Settings,
      permission:
        "settings.view",
    },
  ];

  /*
  ============================================================
  FILTER MENU BY BACKEND PERMISSIONS
  ============================================================
  */

  const visibleMenuItems =
    menuItems.filter(
      (item) => {
        if (!item.permission) {
          return true;
        }

        return hasPermission(
          item.permission
        );
      }
    );

  /*
  ============================================================
  ACTIVE PATH
  ============================================================
  */

  const isActive = (path) => {
    if (
      path === "/dashboard"
    ) {
      return (
        location.pathname ===
        "/dashboard"
      );
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const goTo = (path) => {
    navigate(path);

    document.body.classList.remove(
      "sidebar-open"
    );
  };

  /*
  ============================================================
  LOGOUT
  ============================================================
  */

  const handleLogout = () => {
    logout();

    document.body.classList.remove(
      "sidebar-open"
    );

    navigate("/login", {
      replace: true,
    });
  };

  /*
  ============================================================
  ADMIN NAME
  ============================================================
  */

  const adminName =
    admin?.fullName ||
    `${admin?.firstName || ""} ${
      admin?.secondName || ""
    }`.trim() ||
    admin?.name ||
    admin?.username ||
    translate(
      "admin",
      "Administrator"
    );

  /*
  ============================================================
  ACCESS LEVEL
  ============================================================
  */

  const accessLevel =
    admin?.accessLevel ||
    "limited";

  const accessLabels = {
    superadmin: translate(
      "superAdministrator",
      "Super Administrator"
    ),

    admin: translate(
      "administrator",
      "Administrator"
    ),

    manager: translate(
      "manager",
      "Manager"
    ),

    staff: translate(
      "staff",
      "Staff"
    ),

    limited: translate(
      "limited",
      "Limited"
    ),
  };

  const accessLabel =
    accessLabels[
      accessLevel
    ] ||
    accessLevel;

  /*
  ============================================================
  INITIAL
  ============================================================
  */

  const adminInitial =
    adminName
      .charAt(0)
      .toUpperCase();

  /*
  ============================================================
  UI
  ============================================================
  */

  return (
    <aside
      className={`antimate-sidebar antimate-sidebar-${currentTheme}`}
    >
      <div className="antimate-sidebar-inner">

        {/* ==================================================
            BRAND
        ================================================== */}

        <button
          type="button"
          className="sidebar-brand"
          onClick={() =>
            goTo("/dashboard")
          }
          aria-label="ANTIMATE Admin"
        >
          <div className="sidebar-brand-mark">
            A
          </div>

          <div className="sidebar-brand-text">
            <strong>
              ANTIMATE
            </strong>

            <span>
              ADMIN
            </span>
          </div>
        </button>

        {/* ==================================================
            USER
        ================================================== */}

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {adminInitial}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {adminName}
            </strong>

            <span>
              {accessLabel}
            </span>
          </div>
        </div>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <nav
          className="sidebar-navigation"
          aria-label={translate(
            "administration",
            "Administration"
          )}
        >
          <div className="sidebar-section-title">
            {translate(
              "administration",
              "Administration"
            )}
          </div>

          {visibleMenuItems.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.path
                );

              return (
                <button
                  key={item.path}
                  type="button"
                  className={`sidebar-nav-item ${
                    active
                      ? "sidebar-nav-item-active"
                      : ""
                  }`}
                  onClick={() =>
                    goTo(
                      item.path
                    )
                  }
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                  />

                  <span>
                    {item.label}
                  </span>

                  <ChevronRight
                    size={15}
                    className="sidebar-nav-arrow"
                    strokeWidth={2}
                  />
                </button>
              );
            }
          )}
        </nav>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout"
            onClick={
              handleLogout
            }
          >
            <LogOut
              size={18}
              strokeWidth={2}
            />

            <span>
              {translate(
                "logout",
                "Logout"
              )}
            </span>
          </button>
        </div>
      </div>

      <style>{`

        /* ====================================================
           ROOT
        ==================================================== */

        .antimate-sidebar {
          --sidebar-bg: var(--app-bg, #ffffff);
          --sidebar-surface: var(--app-surface, #ffffff);
          --sidebar-border: var(--app-border, #e5e7eb);
          --sidebar-text: var(--app-text, #171a21);
          --sidebar-muted: var(--app-muted, #6b7280);
          --sidebar-hover: var(--app-hover, #f5f6f8);
          --sidebar-active: var(--app-primary-soft, #eef0ff);
          --sidebar-primary: var(--app-primary, #5961d9);

          width: 260px;
          min-width: 260px;
          height: 100vh;

          background: var(--sidebar-bg);

          border-right: 1px solid
            var(--sidebar-border);

          position: fixed;

          left: 0;
          top: 0;
          bottom: 0;

          z-index: 1000;

          color: var(--sidebar-text);

          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.25s ease;
        }

        /* ====================================================
           INNER
        ==================================================== */

        .antimate-sidebar-inner {
          height: 100%;

          display: flex;
          flex-direction: column;

          padding: 18px 13px;

          box-sizing: border-box;
        }

        /* ====================================================
           BRAND
        ==================================================== */

        .sidebar-brand {
          width: 100%;

          display: flex;
          align-items: center;

          gap: 10px;

          padding: 5px 8px 19px;

          border: 0;
          background: transparent;

          color: inherit;

          cursor: pointer;

          font-family: inherit;

          text-align: left;
        }

        .sidebar-brand-mark {
          width: 38px;
          height: 38px;

          min-width: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: var(--sidebar-primary);

          color: #ffffff;

          font-size: 18px;
          font-weight: 800;

          line-height: 1;
        }

        .sidebar-brand-text {
          min-width: 0;

          display: flex;
          flex-direction: column;

          line-height: 1;
        }

        .sidebar-brand-text strong {
          color: var(--sidebar-text);

          font-size: 16px;
          font-weight: 800;

          letter-spacing: 0.25px;
        }

        .sidebar-brand-text span {
          margin-top: 5px;

          color: var(--sidebar-muted);

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 1.6px;
        }

        /* ====================================================
           USER
        ==================================================== */

        .sidebar-user {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 10px;

          padding: 11px 9px;

          margin-bottom: 18px;

          background: var(--sidebar-surface);

          border: 1px solid
            var(--sidebar-border);

          border-radius: 11px;

          box-sizing: border-box;
        }

        .sidebar-user-avatar {
          width: 36px;
          height: 36px;

          min-width: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: var(--sidebar-active);

          color: var(--sidebar-primary);

          font-size: 14px;
          font-weight: 800;
        }

        .sidebar-user-info {
          min-width: 0;

          display: flex;
          flex-direction: column;
        }

        .sidebar-user-info strong {
          max-width: 170px;

          overflow: hidden;

          color: var(--sidebar-text);

          font-size: 13px;
          font-weight: 700;

          line-height: 1.25;

          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .sidebar-user-info span {
          margin-top: 3px;

          color: var(--sidebar-muted);

          font-size: 10.5px;
          font-weight: 500;

          line-height: 1.2;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ====================================================
           NAVIGATION
        ==================================================== */

        .sidebar-navigation {
          flex: 1;

          min-height: 0;

          overflow-y: auto;

          scrollbar-width: thin;
        }

        .sidebar-section-title {
          padding: 0 10px 8px;

          color: var(--sidebar-muted);

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 0.9px;

          text-transform: uppercase;
        }

        .sidebar-nav-item {
          width: 100%;

          min-height: 42px;

          display: flex;
          align-items: center;

          gap: 11px;

          margin-bottom: 3px;

          padding: 10px 11px;

          border: 0;
          border-radius: 9px;

          background: transparent;

          color: var(--sidebar-muted);

          cursor: pointer;

          font-family: inherit;

          font-size: 13px;
          font-weight: 600;

          text-align: left;

          box-sizing: border-box;

          transition:
            background-color 0.16s ease,
            color 0.16s ease;
        }

        .sidebar-nav-item:hover {
          background: var(--sidebar-hover);

          color: var(--sidebar-text);
        }

        .sidebar-nav-item-active {
          background: var(--sidebar-active);

          color: var(--sidebar-primary);
        }

        .sidebar-nav-item-active:hover {
          background: var(--sidebar-active);

          color: var(--sidebar-primary);
        }

        .sidebar-nav-item span {
          min-width: 0;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;
        }

        .sidebar-nav-arrow {
          margin-left: auto;

          flex-shrink: 0;

          opacity: 0.4;

          transition:
            transform 0.16s ease,
            opacity 0.16s ease;
        }

        .sidebar-nav-item:hover
          .sidebar-nav-arrow {
          opacity: 0.7;

          transform: translateX(1px);
        }

        .sidebar-nav-item-active
          .sidebar-nav-arrow {
          opacity: 0.65;
        }

        /* ====================================================
           FOOTER
        ==================================================== */

        .sidebar-footer {
          padding-top: 12px;

          margin-top: 10px;

          border-top: 1px solid
            var(--sidebar-border);
        }

        .sidebar-logout {
          width: 100%;

          min-height: 42px;

          display: flex;
          align-items: center;

          gap: 11px;

          padding: 10px 11px;

          border: 0;
          border-radius: 9px;

          background: transparent;

          color: var(--sidebar-muted);

          cursor: pointer;

          font-family: inherit;

          font-size: 13px;
          font-weight: 600;

          text-align: left;

          transition:
            background-color 0.16s ease,
            color 0.16s ease;
        }

        .sidebar-logout:hover {
          background: var(--sidebar-hover);

          color: var(--sidebar-text);
        }

        /* ====================================================
           DARK THEME FALLBACK
        ==================================================== */

        .antimate-sidebar-dark {
          --sidebar-bg:
            var(--app-bg, #101218);

          --sidebar-surface:
            var(--app-surface, #171922);

          --sidebar-border:
            var(--app-border, #292d38);

          --sidebar-text:
            var(--app-text, #f3f4f6);

          --sidebar-muted:
            var(--app-muted, #9ca3af);

          --sidebar-hover:
            var(--app-hover, #20232d);

          --sidebar-active:
            var(--app-primary-soft, #25284a);

          --sidebar-primary:
            var(--app-primary, #777ff0);
        }

        /* ====================================================
           RESPONSIVE
        ==================================================== */

        @media (max-width: 900px) {
          .antimate-sidebar {
            transform: translateX(-100%);

            box-shadow: none;
          }

          body.sidebar-open
            .antimate-sidebar {
            transform: translateX(0);

            box-shadow:
              12px 0 35px
              rgba(0, 0, 0, 0.12);
          }
        }

        @media (max-width: 480px) {
          .antimate-sidebar {
            width: 280px;
            min-width: 280px;
          }

          .antimate-sidebar-inner {
            padding:
              16px 12px;
          }
        }

      `}</style>
    </aside>
  );
}