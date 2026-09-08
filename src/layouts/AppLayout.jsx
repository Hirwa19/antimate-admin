import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

/*
|--------------------------------------------------------------------------
| ANTIMATE ADMIN — APP LAYOUT
|--------------------------------------------------------------------------
| Native CSS only
|--------------------------------------------------------------------------
*/

export default function AppLayout({ children }) {
  return (
    <>
      <div className="antimate-app">

        {/* Sidebar */}
        <aside className="antimate-sidebar-shell">
          <Sidebar />
        </aside>

        {/* Mobile overlay */}
        <div
          className="antimate-sidebar-overlay"
          aria-hidden="true"
        />

        {/* Main application */}
        <div className="antimate-app-body">

          {/* Persistent Navbar */}
          <header className="antimate-navbar-shell">
            <Navbar />
          </header>

          {/* Page */}
          <main className="antimate-main">
            <div className="antimate-content">
              {children}
            </div>
          </main>

        </div>
      </div>

      <style>{`

        /* ============================================================
           RESET
           ============================================================ */

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background: var(--admin-bg);
          color: var(--admin-text);

          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button {
          border: 0;
        }

        /* ============================================================
           THEME
           ============================================================ */

        :root {
          --admin-bg: #020617;
          --admin-surface: #0f172a;
          --admin-surface-2: #111827;
          --admin-surface-3: #1e293b;

          --admin-border:
            rgba(148, 163, 184, 0.15);

          --admin-border-strong:
            rgba(148, 163, 184, 0.25);

          --admin-text: #f8fafc;
          --admin-text-secondary: #cbd5e1;
          --admin-text-muted: #94a3b8;

          --admin-primary: #38bdf8;
          --admin-primary-hover: #0ea5e9;

          --admin-success: #22c55e;
          --admin-warning: #f59e0b;
          --admin-danger: #ef4444;

          --admin-navbar-height: 68px;
          --admin-sidebar-width: 250px;

          --admin-content-max-width: 1600px;

          --admin-radius-sm: 6px;
          --admin-radius-md: 9px;
          --admin-radius-lg: 12px;

          --admin-shadow:
            0 12px 35px rgba(0, 0, 0, .22);
        }

        [data-theme="light"] {
          --admin-bg: #f8fafc;
          --admin-surface: #ffffff;
          --admin-surface-2: #f1f5f9;
          --admin-surface-3: #e2e8f0;

          --admin-border:
            rgba(15, 23, 42, 0.10);

          --admin-border-strong:
            rgba(15, 23, 42, 0.18);

          --admin-text: #0f172a;
          --admin-text-secondary: #334155;
          --admin-text-muted: #64748b;

          --admin-shadow:
            0 12px 35px rgba(15, 23, 42, .10);
        }

        /* ============================================================
           APP
           ============================================================ */

        .antimate-app {
          display: flex;

          width: 100%;
          min-height: 100vh;

          background:
            var(--admin-bg);

          color:
            var(--admin-text);
        }

        /* ============================================================
           SIDEBAR SHELL
           ============================================================ */

        .antimate-sidebar-shell {
          position: fixed;

          top: 0;
          left: 0;
          bottom: 0;

          z-index: 100;

          width:
            var(--admin-sidebar-width);

          overflow-y: auto;
          overflow-x: hidden;

          background:
            var(--admin-surface);

          border-right:
            1px solid var(--admin-border);

          scrollbar-width: thin;
        }

        /* ============================================================
           BODY
           ============================================================ */

        .antimate-app-body {
          display: flex;
          flex-direction: column;

          width: 100%;
          min-width: 0;
          min-height: 100vh;

          margin-left:
            var(--admin-sidebar-width);
        }

        /* ============================================================
           NAVBAR
           ============================================================ */

        .antimate-navbar-shell {
          position: sticky;

          top: 0;

          z-index: 90;

          height:
            var(--admin-navbar-height);

          flex-shrink: 0;

          background:
            color-mix(
              in srgb,
              var(--admin-bg) 92%,
              transparent
            );

          border-bottom:
            1px solid var(--admin-border);

          backdrop-filter:
            blur(14px);

          -webkit-backdrop-filter:
            blur(14px);
        }

        /* ============================================================
           MAIN
           ============================================================ */

        .antimate-main {
          flex: 1;

          width: 100%;
          min-width: 0;

          overflow-x: hidden;

          padding:
            28px
            32px
            48px;
        }

        .antimate-content {
          width: 100%;
          max-width:
            var(--admin-content-max-width);

          margin:
            0 auto;
        }

        /* ============================================================
           MOBILE OVERLAY
           ============================================================ */

        .antimate-sidebar-overlay {
          display: none;

          position: fixed;

          inset: 0;

          z-index: 95;

          background:
            rgba(0, 0, 0, .58);
        }

        /* ============================================================
           GENERIC PAGE FOUNDATION
           ============================================================ */

        .antimate-page {
          width: 100%;
          min-width: 0;
        }

        .antimate-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 26px;
        }

        .antimate-page-title {
          margin: 0;

          font-size: 24px;
          line-height: 1.25;

          font-weight: 700;

          letter-spacing: -.02em;

          color:
            var(--admin-text);
        }

        .antimate-page-description {
          margin: 7px 0 0;

          max-width: 720px;

          font-size: 14px;
          line-height: 1.6;

          color:
            var(--admin-text-muted);
        }

        /* ============================================================
           LIST
           ============================================================ */

        .antimate-list {
          width: 100%;

          border-top:
            1px solid var(--admin-border);
        }

        .antimate-list-row {
          display: flex;
          align-items: center;

          width: 100%;
          min-height: 62px;

          border-bottom:
            1px solid var(--admin-border);

          transition:
            background 150ms ease;
        }

        .antimate-list-row:hover {
          background:
            rgba(148, 163, 184, .035);
        }

        .antimate-list-header {
          min-height: 44px;

          font-size: 11px;
          font-weight: 700;

          text-transform: uppercase;

          letter-spacing: .05em;

          color:
            var(--admin-text-muted);
        }

        .antimate-list-cell {
          min-width: 0;

          padding:
            0 12px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        /* ============================================================
           TOOLBAR
           ============================================================ */

        .antimate-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          margin-bottom: 18px;
        }

        .antimate-toolbar-left,
        .antimate-toolbar-right {
          display: flex;
          align-items: center;

          gap: 9px;
        }

        /* ============================================================
           RESPONSIVE
           ============================================================ */

        @media (max-width: 1100px) {

          :root {
            --admin-sidebar-width: 220px;
          }

          .antimate-main {
            padding:
              24px
              24px
              40px;
          }

        }

        @media (max-width: 768px) {

          :root {
            --admin-navbar-height: 60px;
          }

          .antimate-sidebar-shell {
            width: 270px;

            transform:
              translateX(-100%);

            transition:
              transform 220ms ease;

            box-shadow:
              var(--admin-shadow);
          }

          .antimate-app.sidebar-open
          .antimate-sidebar-shell {
            transform:
              translateX(0);
          }

          .antimate-app.sidebar-open
          .antimate-sidebar-overlay {
            display: block;
          }

          .antimate-app-body {
            margin-left: 0;

            min-height: 100dvh;
          }

          .antimate-main {
            padding:
              20px
              16px
              32px;
          }

          .antimate-page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .antimate-page-title {
            font-size: 20px;
          }

          .antimate-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .antimate-toolbar-left,
          .antimate-toolbar-right {
            width: 100%;
          }

          .antimate-list {
            overflow-x: auto;

            -webkit-overflow-scrolling:
              touch;
          }

          .antimate-list-row {
            min-width: 680px;
          }

        }

        @media (max-width: 480px) {

          .antimate-main {
            padding:
              18px
              13px
              28px;
          }

          .antimate-page-title {
            font-size: 19px;
          }

        }

        /* ============================================================
           ACCESSIBILITY
           ============================================================ */

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            transition: none !important;
            animation: none !important;
          }

        }

      `}</style>
    </>
  );
}