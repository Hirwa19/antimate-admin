import React, {
  useState,
  useEffect,
} from "react";

import {
  Menu,
  Sun,
  Moon,
  Globe2,
  ChevronDown,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  useAppSettings,
} from "../context/AppSettingsContext";

/*
|--------------------------------------------------------------------------
| ANTIMATE ADMIN — NAVBAR
|--------------------------------------------------------------------------
*/

export default function Navbar() {
  const { admin } = useAuth();
  const navigate = useNavigate();

  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    t,
  } = useAppSettings();

  const [
    languageOpen,
    setLanguageOpen,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | MOBILE SIDEBAR
  |--------------------------------------------------------------------------
  */

  const toggleSidebar = () => {
    const app =
      document.querySelector(
        ".antimate-app"
      );

    if (!app) return;

    app.classList.toggle(
      "sidebar-open"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE LANGUAGE MENU
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setLanguageOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CHANGE LANGUAGE
  |--------------------------------------------------------------------------
  */

  const changeLanguage = (next) => {
    setLanguage(next);
    setLanguageOpen(false);
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

  const adminEmail =
    admin?.email ||
    "";

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
    <div className="antimate-navbar">

      {/* ============================================================
          LEFT
          ============================================================ */}

      <div className="antimate-navbar-left">

        {/* Mobile menu */}
        <button
          type="button"
          className="antimate-mobile-menu"
          onClick={toggleSidebar}
          aria-label={t("openMenu")}
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          className="antimate-navbar-brand"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <span className="antimate-navbar-title">
            ANTIMATE ADMIN
          </span>

          <span className="antimate-navbar-subtitle">
            {t("platform")}
          </span>

        </button>

      </div>

      {/* ============================================================
          RIGHT
          ============================================================ */}

      <div className="antimate-navbar-right">

        {/* ==========================================================
            LANGUAGE
            ========================================================== */}

        <div className="antimate-language-wrapper">

          <button
            type="button"
            className="antimate-language-button"
            onClick={() =>
              setLanguageOpen(
                (value) => !value
              )
            }
            aria-expanded={
              languageOpen
            }
          >

            <Globe2 size={17} />

            <span className="antimate-language-code">
              {language === "rw"
                ? "RW"
                : "EN"}
            </span>

            <ChevronDown
              size={14}
              className={
                languageOpen
                  ? "rotate"
                  : ""
              }
            />

          </button>

          {languageOpen && (
            <>

              <button
                type="button"
                className="antimate-menu-backdrop"
                onClick={() =>
                  setLanguageOpen(
                    false
                  )
                }
                aria-label={
                  t("closeMenu")
                }
              />

              <div className="antimate-language-menu">

                <div className="antimate-menu-label">
                  {t("language")}
                </div>

                <button
                  type="button"
                  className={
                    language === "en"
                      ? "antimate-language-option active"
                      : "antimate-language-option"
                  }
                  onClick={() =>
                    changeLanguage("en")
                  }
                >

                  <span>
                    🇬🇧 {t("english")}
                  </span>

                  {language === "en" && (
                    <span>✓</span>
                  )}

                </button>

                <button
                  type="button"
                  className={
                    language === "rw"
                      ? "antimate-language-option active"
                      : "antimate-language-option"
                  }
                  onClick={() =>
                    changeLanguage("rw")
                  }
                >

                  <span>
                    🇷🇼 {t("kinyarwanda")}
                  </span>

                  {language === "rw" && (
                    <span>✓</span>
                  )}

                </button>

              </div>

            </>
          )}

        </div>

        {/* ==========================================================
            THEME
            ========================================================== */}

        <button
          type="button"
          className="antimate-theme-button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? t("light")
              : t("dark")
          }
          title={
            theme === "dark"
              ? t("light")
              : t("dark")
          }
        >

          {theme === "dark" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}

        </button>

        {/* ==========================================================
            DIVIDER
            ========================================================== */}

        <div className="antimate-navbar-divider" />

        {/* ==========================================================
            USER
            ========================================================== */}

        <button
          type="button"
          className="antimate-navbar-user"
          onClick={() =>
            navigate("/settings")
          }
        >

          <span className="antimate-navbar-avatar">
            {initial}
          </span>

          <span className="antimate-navbar-user-info">

            <span className="antimate-navbar-user-name">
              {adminName}
            </span>

            <span className="antimate-navbar-user-email">
              {adminEmail}
            </span>

          </span>

        </button>

      </div>

      {/* ============================================================
          CSS
          ============================================================ */}

      <style>{`

        .antimate-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;

          width: 100%;
          height: 100%;

          padding:
            0 26px;

          color:
            var(--admin-text);
        }

        /* ============================================================
           LEFT
           ============================================================ */

        .antimate-navbar-left {
          display: flex;
          align-items: center;

          min-width: 0;

          gap: 12px;
        }

        .antimate-navbar-brand {
          display: flex;
          flex-direction: column;

          padding: 0;

          background: transparent;

          color: inherit;

          cursor: pointer;

          text-align: left;
        }

        .antimate-navbar-title {
          font-size: 14px;
          line-height: 1.3;

          font-weight: 750;

          letter-spacing: .015em;
        }

        .antimate-navbar-subtitle {
          margin-top: 2px;

          font-size: 10px;

          color:
            var(--admin-text-muted);
        }

        /* ============================================================
           MOBILE MENU
           ============================================================ */

        .antimate-mobile-menu {
          display: none;

          align-items: center;
          justify-content: center;

          width: 36px;
          height: 36px;

          border:
            1px solid var(--admin-border-strong);

          border-radius: 8px;

          background: transparent;

          color:
            var(--admin-text-secondary);

          cursor: pointer;
        }

        .antimate-mobile-menu:hover {
          background:
            var(--admin-surface-3);

          color:
            var(--admin-text);
        }

        /* ============================================================
           RIGHT
           ============================================================ */

        .antimate-navbar-right {
          display: flex;
          align-items: center;

          gap: 8px;

          min-width: 0;
        }

        /* ============================================================
           LANGUAGE
           ============================================================ */

        .antimate-language-wrapper {
          position: relative;
        }

        .antimate-language-button {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          height: 36px;

          padding:
            0 9px;

          border:
            1px solid transparent;

          border-radius: 8px;

          background: transparent;

          color:
            var(--admin-text-secondary);

          cursor: pointer;
        }

        .antimate-language-button:hover {
          background:
            var(--admin-surface-3);

          border-color:
            var(--admin-border);

          color:
            var(--admin-text);
        }

        .antimate-language-code {
          font-size: 11px;
          font-weight: 750;
        }

        .antimate-language-button .rotate {
          transform:
            rotate(180deg);
        }

        /* ============================================================
           MENU
           ============================================================ */

        .antimate-menu-backdrop {
          position: fixed;

          inset: 0;

          z-index: 299;

          padding: 0;

          background: transparent;

          cursor: default;
        }

        .antimate-language-menu {
          position: absolute;

          top:
            calc(100% + 9px);

          right: 0;

          z-index: 300;

          width: 190px;

          padding: 7px;

          border:
            1px solid var(--admin-border-strong);

          border-radius: 10px;

          background:
            var(--admin-surface);

          box-shadow:
            var(--admin-shadow);
        }

        .antimate-menu-label {
          padding:
            8px 9px;

          font-size: 10px;
          font-weight: 750;

          text-transform: uppercase;

          letter-spacing: .07em;

          color:
            var(--admin-text-muted);
        }

        .antimate-language-option {
          display: flex;
          align-items: center;
          justify-content: space-between;

          width: 100%;
          min-height: 38px;

          padding:
            0 9px;

          border-radius: 7px;

          background: transparent;

          color:
            var(--admin-text-secondary);

          cursor: pointer;

          font-size: 12px;

          text-align: left;
        }

        .antimate-language-option:hover {
          background:
            var(--admin-surface-3);

          color:
            var(--admin-text);
        }

        .antimate-language-option.active {
          color:
            var(--admin-primary);
        }

        /* ============================================================
           THEME
           ============================================================ */

        .antimate-theme-button {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 36px;
          height: 36px;

          border:
            1px solid transparent;

          border-radius: 8px;

          background: transparent;

          color:
            var(--admin-text-secondary);

          cursor: pointer;
        }

        .antimate-theme-button:hover {
          background:
            var(--admin-surface-3);

          border-color:
            var(--admin-border);

          color:
            var(--admin-text);
        }

        /* ============================================================
           DIVIDER
           ============================================================ */

        .antimate-navbar-divider {
          width: 1px;
          height: 28px;

          margin:
            0 5px;

          background:
            var(--admin-border);
        }

        /* ============================================================
           USER
           ============================================================ */

        .antimate-navbar-user {
          display: flex;
          align-items: center;

          padding: 3px;

          border-radius: 8px;

          background: transparent;

          color: inherit;

          cursor: pointer;

          text-align: left;
        }

        .antimate-navbar-user:hover {
          background:
            var(--admin-surface-3);
        }

        .antimate-navbar-avatar {
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

        .antimate-navbar-user-info {
          display: flex;
          flex-direction: column;

          min-width: 0;

          margin-left: 8px;
        }

        .antimate-navbar-user-name {
          max-width: 160px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 12px;
          font-weight: 650;
        }

        .antimate-navbar-user-email {
          max-width: 160px;

          margin-top: 2px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 10px;

          color:
            var(--admin-text-muted);
        }

        /* ============================================================
           TABLET
           ============================================================ */

        @media (max-width: 900px) {

          .antimate-navbar {
            padding:
              0 19px;
          }

          .antimate-navbar-subtitle {
            display: none;
          }

          .antimate-navbar-user-email {
            display: none;
          }

        }

        /* ============================================================
           MOBILE
           ============================================================ */

        @media (max-width: 768px) {

          .antimate-navbar {
            padding:
              0 13px;
          }

          .antimate-mobile-menu {
            display: flex;
          }

          .antimate-navbar-title {
            font-size: 12px;
          }

          .antimate-navbar-divider {
            display: none;
          }

          .antimate-navbar-user-info {
            display: none;
          }

          .antimate-language-code {
            display: none;
          }

          .antimate-language-button {
            width: 34px;
            padding: 0;
          }

          .antimate-theme-button {
            width: 34px;
            height: 34px;
          }

          .antimate-navbar-avatar {
            width: 32px;
            height: 32px;
          }

        }

        /* ============================================================
           SMALL PHONE
           ============================================================ */

        @media (max-width: 430px) {

          .antimate-navbar {
            padding:
              0 9px;
          }

          .antimate-navbar-left {
            gap: 7px;
          }

          .antimate-navbar-title {
            font-size: 11px;
          }

        }

      `}</style>
    </div>
  );
}