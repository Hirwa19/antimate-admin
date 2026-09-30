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
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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

  const { t } = useAppSettings();

  /*
  ============================================================
  MENU
  ============================================================
  */

  const menuItems = [
    {
      label: t("dashboard") || "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard.view",
    },

    {
      label: t("devices") || "Devices",
      path: "/devices",
      icon: Cpu,
      permission: "devices.view",
    },

    {
      label:
        t("generateDevice") || "Generate Device",
      path: "/generate-device",
      icon: Cpu,
      permission: "devices.create",
    },

    {
      label:
        t("generateGateway") || "Generate Gateway",
      path: "/generate-gateway",
      icon: Radio,
      permission: "gateways.create",
    },

    {
      label: t("workers") || "Workers",
      path: "/workers",
      icon: Users,
      permission: "workers.view",
    },

    {
      label:
        t("accessControl") || "Access Control",
      path: "/access-control",
      icon: Shield,
      permission: "access_control.view",
    },

    {
      label: t("settings") || "Settings",
      path: "/settings",
      icon: Settings,
      permission: "settings.view",
    },
  ];

  /*
  ============================================================
  FILTER MENU BY REAL BACKEND PERMISSIONS
  ============================================================
  */

  const visibleMenuItems = menuItems.filter(
    (item) => {
      if (!item.permission) {
        return true;
      }

      return hasPermission(item.permission);
    }
  );

  /*
  ============================================================
  ACTIVE PATH
  ============================================================
  */

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
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
    navigate("/login", { replace: true });
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
    t("admin") ||
    "Administrator";

  /*
  ============================================================
  ACCESS LEVEL
  ============================================================
  */

  const accessLevel =
    admin?.accessLevel || "limited";

  const accessLabels = {
    superadmin: "Super Administrator",
    admin: "Administrator",
    manager: "Manager",
    staff: "Staff",
    limited: "Limited",
  };

  const accessLabel =
    accessLabels[accessLevel] ||
    accessLevel;

  /*
  ============================================================
  UI
  ============================================================
  */

  return (
    <aside className="antimate-sidebar">
      <div className="antimate-sidebar-inner">

        {/* BRAND */}

        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            A
          </div>

          <div className="sidebar-brand-text">
            <strong>ANTIMATE</strong>
            <span>ADMIN</span>
          </div>
        </div>

        {/* USER */}

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {adminName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <strong>{adminName}</strong>

            <span>{accessLabel}</span>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-navigation">
          <div className="sidebar-section-title">
            {t("administration") ||
              "Administration"}
          </div>

          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

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
                  goTo(item.path)
                }
              >
                <Icon
                  size={19}
                  strokeWidth={2}
                />

                <span>{item.label}</span>

                <ChevronRight
                  size={16}
                  className="sidebar-nav-arrow"
                />
              </button>
            );
          })}
        </nav>

        {/* FOOTER */}

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut
              size={19}
              strokeWidth={2}
            />

            <span>
              {t("logout") || "Logout"}
            </span>
          </button>
        </div>
      </div>

      <style>{`
        .antimate-sidebar {
          --sidebar-bg: #ffffff;
          --sidebar-border: #e7e9f2;
          --sidebar-text: #1f2430;
          --sidebar-muted: #73798a;
          --sidebar-hover: #f4f5fb;
          --sidebar-active: #eef0ff;
          --sidebar-primary: #5961d9;

          width: 260px;
          min-width: 260px;
          height: 100vh;

          background: var(--sidebar-bg);
          border-right: 1px solid var(--sidebar-border);

          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;

          z-index: 1000;
        }

        .antimate-sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;

          padding: 20px 14px;
          box-sizing: border-box;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 11px;

          padding: 4px 8px 20px;
        }

        .sidebar-brand-mark {
          width: 38px;
          height: 38px;

          border-radius: 11px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 19px;
          font-weight: 800;

          color: #ffffff;

          background: linear-gradient(
            135deg,
            #5961d9,
            #7448d8
          );
        }

        .sidebar-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.05;
        }

        .sidebar-brand-text strong {
          font-size: 16px;
          letter-spacing: 0.3px;
          color: var(--sidebar-text);
        }

        .sidebar-brand-text span {
          margin-top: 4px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: var(--sidebar-muted);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;

          padding: 12px 9px;
          margin-bottom: 18px;

          border: 1px solid var(--sidebar-border);
          border-radius: 12px;
        }

        .sidebar-user-avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: var(--sidebar-active);
          color: var(--sidebar-primary);

          font-weight: 800;
          font-size: 14px;
        }

        .sidebar-user-info {
          min-width: 0;

          display: flex;
          flex-direction: column;
        }

        .sidebar-user-info strong {
          color: var(--sidebar-text);
          font-size: 13px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-info span {
          margin-top: 3px;

          color: var(--sidebar-muted);
          font-size: 11px;
          text-transform: capitalize;
        }

        .sidebar-navigation {
          flex: 1;
          overflow-y: auto;
        }

        .sidebar-section-title {
          padding: 0 10px 8px;

          color: var(--sidebar-muted);

          font-size: 10px;
          font-weight: 700;

          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .sidebar-nav-item {
          width: 100%;
          border: 0;
          background: transparent;

          color: var(--sidebar-muted);

          display: flex;
          align-items: center;
          gap: 11px;

          padding: 11px 12px;
          margin-bottom: 4px;

          border-radius: 10px;

          cursor: pointer;

          font-family: inherit;
          font-size: 13px;
          font-weight: 600;

          text-align: left;

          transition:
            background 0.18s ease,
            color 0.18s ease;
        }

        .sidebar-nav-item:hover {
          background: var(--sidebar-hover);
          color: var(--sidebar-text);
        }

        .sidebar-nav-item-active {
          background: var(--sidebar-active);
          color: var(--sidebar-primary);
        }

        .sidebar-nav-arrow {
          margin-left: auto;
          opacity: 0.45;
        }

        .sidebar-footer {
          padding-top: 14px;
          border-top: 1px solid var(--sidebar-border);
        }

        .sidebar-logout {
          width: 100%;

          border: 0;
          background: transparent;

          color: var(--sidebar-muted);

          display: flex;
          align-items: center;
          gap: 11px;

          padding: 11px 12px;

          border-radius: 10px;

          cursor: pointer;

          font-family: inherit;
          font-size: 13px;
          font-weight: 600;

          text-align: left;

          transition:
            background 0.18s ease,
            color 0.18s ease;
        }

        .sidebar-logout:hover {
          background: var(--sidebar-hover);
          color: var(--sidebar-text);
        }

        @media (max-width: 900px) {
          .antimate-sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }

          body.sidebar-open .antimate-sidebar {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}