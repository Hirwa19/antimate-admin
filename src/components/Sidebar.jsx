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
  FileText,
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

  const {
    t,
  } = useAppSettings();

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
  |--------------------------------------------------------------------------
  | MENU
  |--------------------------------------------------------------------------
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
        "reports",
        "Reports"
      ),
      path: "/reports",
      icon: FileText,
      permission: "reports.view",
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
  |--------------------------------------------------------------------------
  | PERMISSION FILTER
  |--------------------------------------------------------------------------
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
  |--------------------------------------------------------------------------
  | ACTIVE PAGE
  |--------------------------------------------------------------------------
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
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  const goTo = (path) => {
    navigate(path);

    const app =
      document.querySelector(
        ".antimate-app"
      );

    app?.classList.remove(
      "sidebar-open"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    logout();

    const app =
      document.querySelector(
        ".antimate-app"
      );

    app?.classList.remove(
      "sidebar-open"
    );

    navigate("/login", {
      replace: true,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
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

  const adminInitial =
    adminName
      .charAt(0)
      .toUpperCase();

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div
      id="antimate-sidebar"
      className="antimate-sidebar"
    >

      <div className="antimate-sidebar-inner">

        {/* ==========================================================
            BRAND
            ========================================================== */}

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

        {/* ==========================================================
            USER
            ========================================================== */}

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

        {/* ==========================================================
            NAVIGATION
            ========================================================== */}

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

        {/* ==========================================================
            FOOTER
            ========================================================== */}

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

        /*
        |--------------------------------------------------------------------------
        | SIDEBAR
        |--------------------------------------------------------------------------
        */

        .antimate-sidebar {
          --sidebar-bg:
            var(--admin-surface, #ffffff);

          --sidebar-surface:
            var(--admin-surface, #ffffff);

          --sidebar-border:
            var(--admin-border, #e5e7eb);

          --sidebar-text:
            var(--admin-text, #171a21);

          --sidebar-muted:
            var(--admin-text-muted, #64748b);

          --sidebar-hover:
            var(--admin-surface-2, #f1f5f9);

          --sidebar-active:
            rgba(89, 97, 217, 0.10);

          --sidebar-primary:
            var(--admin-primary, #5961d9);

          width: 100%;
          height: 100%;

          background:
            var(--sidebar-bg);

          color:
            var(--sidebar-text);
        }

        /*
        |--------------------------------------------------------------------------
        | INNER
        |--------------------------------------------------------------------------
        */

        .antimate-sidebar-inner {
          display: flex;
          flex-direction: column;

          width: 100%;
          height: 100%;

          padding: 18px 13px;

          overflow: hidden;
        }

        /*
        |--------------------------------------------------------------------------
        | BRAND
        |--------------------------------------------------------------------------
        */

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

          background:
            var(--sidebar-primary);

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
          color:
            var(--sidebar-text);

          font-size: 16px;
          font-weight: 800;

          letter-spacing: .25px;
        }

        .sidebar-brand-text span {
          margin-top: 5px;

          color:
            var(--sidebar-muted);

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 1.6px;
        }

        /*
        |--------------------------------------------------------------------------
        | USER
        |--------------------------------------------------------------------------
        */

        .sidebar-user {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 10px;

          padding: 11px 9px;

          margin-bottom: 18px;

          background:
            var(--sidebar-surface);

          border:
            1px solid var(--sidebar-border);

          border-radius: 11px;
        }

        .sidebar-user-avatar {
          width: 36px;
          height: 36px;

          min-width: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            var(--sidebar-active);

          color:
            var(--sidebar-primary);

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

          color:
            var(--sidebar-text);

          font-size: 13px;
          font-weight: 700;

          line-height: 1.25;

          white-space: nowrap;

          text-overflow: ellipsis;
        }

        .sidebar-user-info span {
          margin-top: 3px;

          color:
            var(--sidebar-muted);

          font-size: 10.5px;
          font-weight: 500;

          line-height: 1.2;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        /*
        |--------------------------------------------------------------------------
        | NAVIGATION
        |--------------------------------------------------------------------------
        */

        .sidebar-navigation {
          flex: 1;

          min-height: 0;

          overflow-y: auto;

          overflow-x: hidden;

          scrollbar-width: thin;
        }

        .sidebar-section-title {
          padding:
            0 10px 8px;

          color:
            var(--sidebar-muted);

          font-size: 10px;
          font-weight: 700;

          letter-spacing: .9px;

          text-transform: uppercase;
        }

        .sidebar-nav-item {
          width: 100%;

          min-height: 42px;

          display: flex;
          align-items: center;

          gap: 11px;

          margin-bottom: 3px;

          padding:
            10px 11px;

          border: 0;

          border-radius: 9px;

          background: transparent;

          color:
            var(--sidebar-muted);

          cursor: pointer;

          font-family: inherit;

          font-size: 13px;
          font-weight: 600;

          text-align: left;

          box-sizing: border-box;

          transition:
            background-color .16s ease,
            color .16s ease;
        }

        .sidebar-nav-item:hover {
          background:
            var(--sidebar-hover);

          color:
            var(--sidebar-text);
        }

        .sidebar-nav-item-active {
          background:
            var(--sidebar-active);

          color:
            var(--sidebar-primary);
        }

        .sidebar-nav-item-active:hover {
          background:
            var(--sidebar-active);

          color:
            var(--sidebar-primary);
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

          opacity: .4;

          transition:
            transform .16s ease,
            opacity .16s ease;
        }

        .sidebar-nav-item:hover
          .sidebar-nav-arrow {
          opacity: .7;

          transform:
            translateX(1px);
        }

        .sidebar-nav-item-active
          .sidebar-nav-arrow {
          opacity: .65;
        }

        /*
        |--------------------------------------------------------------------------
        | FOOTER
        |--------------------------------------------------------------------------
        */

        .sidebar-footer {
          padding-top: 12px;

          margin-top: 10px;

          border-top:
            1px solid var(--sidebar-border);
        }

        .sidebar-logout {
          width: 100%;

          min-height: 42px;

          display: flex;
          align-items: center;

          gap: 11px;

          padding:
            10px 11px;

          border: 0;

          border-radius: 9px;

          background: transparent;

          color:
            var(--sidebar-muted);

          cursor: pointer;

          font-family: inherit;

          font-size: 13px;
          font-weight: 600;

          text-align: left;

          transition:
            background-color .16s ease,
            color .16s ease;
        }

        .sidebar-logout:hover {
          background:
            var(--sidebar-hover);

          color:
            var(--sidebar-text);
        }

        /*
        |--------------------------------------------------------------------------
        | DARK THEME
        |--------------------------------------------------------------------------
        */

        [data-theme="dark"]
        .antimate-sidebar {
          --sidebar-bg:
            var(--admin-surface, #0f172a);

          --sidebar-surface:
            var(--admin-surface-2, #111827);

          --sidebar-border:
            var(--admin-border, rgba(148,163,184,.15));

          --sidebar-text:
            var(--admin-text, #f8fafc);

          --sidebar-muted:
            var(--admin-text-muted, #94a3b8);

          --sidebar-hover:
            var(--admin-surface-3, #1e293b);

          --sidebar-active:
            rgba(99, 102, 241, .16);

          --sidebar-primary:
            var(--admin-primary, #38bdf8);
        }

        /*
        |--------------------------------------------------------------------------
        | MOBILE
        |--------------------------------------------------------------------------
        */

        @media (max-width: 768px) {

          .antimate-sidebar-inner {
            padding:
              16px 13px;
          }

        }

        /*
        |--------------------------------------------------------------------------
        | SMALL PHONE
        |--------------------------------------------------------------------------
        */

        @media (max-width: 430px) {

          .antimate-sidebar-inner {
            padding:
              15px 12px;
          }

          .sidebar-brand {
            padding-bottom: 16px;
          }

        }

        /*
        |--------------------------------------------------------------------------
        | REDUCED MOTION
        |--------------------------------------------------------------------------
        */

        @media (prefers-reduced-motion: reduce) {

          .sidebar-nav-item,
          .sidebar-nav-arrow,
          .sidebar-logout {
            transition: none;
          }

        }

      `}</style>
    </div>
  );
}