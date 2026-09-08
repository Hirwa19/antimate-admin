import React from "react";
import {
  LayoutDashboard,
  Cpu,
  Shield,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";

/*
|--------------------------------------------------------------------------
| ANTIMATE ADMIN — SIDEBAR
|--------------------------------------------------------------------------
*/

export default function Sidebar() {
  const { logout, admin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const {
    t,
  } = useAppSettings();

  /*
  |--------------------------------------------------------------------------
  | MENU
  |--------------------------------------------------------------------------
  */

  const menu = [
    {
      title: t("dashboard"),
      icon: <LayoutDashboard size={19} />,
      path: "/dashboard",
    },

    {
      title: t("devices"),
      icon: <Cpu size={19} />,
      path: "/devices",
    },

    {
      title: t("generateDevice"),
      icon: <Cpu size={19} />,
      path: "/generate-device",
    },

    {
      title: t("generateGateway"),
      icon: <Shield size={19} />,
      path: "/generate-gateway",
    },

    {
      title: t("workers"),
      icon: <Users size={19} />,
      path: "/workers",
    },

    {
      title: t("settings"),
      icon: <Settings size={19} />,
      path: "/settings",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | ACTIVE
  |--------------------------------------------------------------------------
  */

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
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

    /*
     * Close mobile sidebar after navigation.
     */

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

  const logoutUser = () => {
    logout();

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
    admin?.name ||
    admin?.fullName ||
    admin?.username ||
    t("admin");

  const adminRole =
    admin?.role ||
    t("administrator");

  const initial =
    adminName
      .charAt(0)
      .toUpperCase();

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="antimate-sidebar">

      {/* ============================================================
          BRAND
          ============================================================ */}

      <div className="antimate-sidebar-brand">

        <button
          type="button"
          className="antimate-brand"
          onClick={() =>
            goTo("/dashboard")
          }
        >

          <span className="antimate-brand-mark">
            A
          </span>

          <span className="antimate-brand-copy">

            <span className="antimate-brand-name">
              ANTIMATE
            </span>

            <span className="antimate-brand-subtitle">
              {t("administration")}
            </span>

          </span>

        </button>

      </div>

      {/* ============================================================
          NAVIGATION
          ============================================================ */}

      <nav className="antimate-sidebar-nav">

        <div className="antimate-nav-heading">
          {t("administration")}
        </div>

        <div className="antimate-nav-items">

          {menu.map((item) => {
            const active =
              isActive(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() =>
                  goTo(item.path)
                }
                className={
                  active
                    ? "antimate-nav-item active"
                    : "antimate-nav-item"
                }
              >

                <span className="antimate-nav-icon">
                  {item.icon}
                </span>

                <span className="antimate-nav-title">
                  {item.title}
                </span>

                {active && (
                  <ChevronRight
                    size={15}
                    className="antimate-nav-arrow"
                  />
                )}

              </button>
            );
          })}

        </div>

      </nav>

      {/* ============================================================
          ACCOUNT
          ============================================================ */}

      <div className="antimate-sidebar-footer">

        <div className="antimate-sidebar-user">

          <div className="antimate-sidebar-avatar">
            {initial}
          </div>

          <div className="antimate-sidebar-user-info">

            <span className="antimate-sidebar-user-name">
              {adminName}
            </span>

            <span className="antimate-sidebar-user-role">
              {adminRole}
            </span>

          </div>

        </div>

        <button
          type="button"
          className="antimate-logout"
          onClick={logoutUser}
        >

          <LogOut size={18} />

          <span>
            {t("logout")}
          </span>

        </button>

      </div>

      {/* ============================================================
          CSS
          ============================================================ */}

      <style>{`

        .antimate-sidebar {
          display: flex;
          flex-direction: column;

          width: 100%;
          min-height: 100%;

          background:
            var(--admin-surface);

          color:
            var(--admin-text);
        }

        /* ============================================================
           BRAND
           ============================================================ */

        .antimate-sidebar-brand {
          height:
            var(--admin-navbar-height);

          display: flex;
          align-items: center;

          padding:
            0 19px;

          border-bottom:
            1px solid var(--admin-border);
        }

        .antimate-brand {
          display: flex;
          align-items: center;

          width: 100%;

          padding: 0;

          background: transparent;

          color: inherit;

          cursor: pointer;

          text-align: left;
        }

        .antimate-brand-mark {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 34px;
          height: 34px;

          flex-shrink: 0;

          border-radius: 9px;

          background:
            var(--admin-primary);

          color:
            #020617;

          font-size: 17px;
          font-weight: 850;
        }

        .antimate-brand-copy {
          display: flex;
          flex-direction: column;

          margin-left: 10px;
        }

        .antimate-brand-name {
          font-size: 16px;
          font-weight: 800;

          letter-spacing: .03em;
        }

        .antimate-brand-subtitle {
          margin-top: 2px;

          font-size: 9px;
          font-weight: 600;

          text-transform: uppercase;

          letter-spacing: .07em;

          color:
            var(--admin-text-muted);
        }

        /* ============================================================
           NAV
           ============================================================ */

        .antimate-sidebar-nav {
          flex: 1;

          padding:
            21px 12px;
        }

        .antimate-nav-heading {
          padding:
            0 10px 9px;

          font-size: 10px;
          font-weight: 750;

          text-transform: uppercase;

          letter-spacing: .08em;

          color:
            var(--admin-text-muted);
        }

        .antimate-nav-items {
          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .antimate-nav-item {
          display: flex;
          align-items: center;

          width: 100%;
          min-height: 44px;

          padding:
            0 10px;

          border:
            1px solid transparent;

          border-radius: 8px;

          background: transparent;

          color:
            var(--admin-text-secondary);

          cursor: pointer;

          text-align: left;

          transition:
            background 150ms ease,
            border-color 150ms ease,
            color 150ms ease;
        }

        .antimate-nav-item:hover {
          background:
            rgba(148,163,184,.06);

          color:
            var(--admin-text);
        }

        .antimate-nav-item.active {
          background:
            rgba(56,189,248,.10);

          border-color:
            rgba(56,189,248,.17);

          color:
            var(--admin-primary);
        }

        .antimate-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 28px;
          height: 28px;

          flex-shrink: 0;
        }

        .antimate-nav-title {
          margin-left: 9px;

          min-width: 0;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 13px;
          font-weight: 550;
        }

        .antimate-nav-arrow {
          margin-left: auto;

          flex-shrink: 0;
        }

        /* ============================================================
           FOOTER
           ============================================================ */

        .antimate-sidebar-footer {
          padding:
            13px 12px 16px;

          border-top:
            1px solid var(--admin-border);
        }

        .antimate-sidebar-user {
          display: flex;
          align-items: center;

          padding:
            6px 8px 12px;
        }

        .antimate-sidebar-avatar {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 34px;
          height: 34px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            var(--admin-surface-3);

          border:
            1px solid var(--admin-border-strong);

          font-size: 12px;
          font-weight: 750;
        }

        .antimate-sidebar-user-info {
          display: flex;
          flex-direction: column;

          min-width: 0;

          margin-left: 9px;
        }

        .antimate-sidebar-user-name {
          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 12px;
          font-weight: 650;
        }

        .antimate-sidebar-user-role {
          margin-top: 2px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 10px;

          color:
            var(--admin-text-muted);
        }

        /* ============================================================
           LOGOUT
           ============================================================ */

        .antimate-logout {
          display: flex;
          align-items: center;

          gap: 9px;

          width: 100%;
          min-height: 40px;

          padding:
            0 10px;

          border:
            1px solid transparent;

          border-radius: 8px;

          background: transparent;

          color:
            var(--admin-text-muted);

          cursor: pointer;

          font-size: 13px;
          font-weight: 550;

          text-align: left;

          transition:
            background 150ms ease,
            color 150ms ease,
            border-color 150ms ease;
        }

        .antimate-logout:hover {
          background:
            rgba(239,68,68,.08);

          border-color:
            rgba(239,68,68,.14);

          color:
            var(--admin-danger);
        }

        /* ============================================================
           LIGHT
           ============================================================ */

        [data-theme="light"]
        .antimate-nav-item:hover {
          background:
            rgba(15,23,42,.045);
        }

        [data-theme="light"]
        .antimate-nav-item.active {
          background:
            rgba(14,165,233,.08);
        }

      `}</style>
    </div>
  );
}