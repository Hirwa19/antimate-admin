import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Bell,
  Palette,
  Globe2,
  Server,
  Lock,
  LogOut,
  ChevronRight,
  Check,
  Moon,
  Sun,
  KeyRound,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";

export default function Settings() {
  const { admin, logout } = useAuth();
  const {
    language,
    theme,
    setLanguage,
    setTheme,
    t,
  } = useAppSettings();

  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("account");

  const [notifications, setNotifications] = useState({
    system: true,
    security: true,
    workers: true,
    devices: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");

  const [apiStatus, setApiStatus] = useState("unknown");
  const [checkingApi, setCheckingApi] = useState(false);

  const appVersion = "1.0.0";

  const adminName =
    admin?.name ||
    admin?.fullName ||
    admin?.username ||
    t("admin");

  const adminEmail = admin?.email || "—";
  const adminRole = admin?.role || t("administrator");

  const initials = useMemo(() => {
    return adminName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [adminName]);

  const sections = [
    {
      id: "account",
      label: language === "rw" ? "Konti" : "Account",
      icon: <User size={18} />,
    },
    {
      id: "appearance",
      label: language === "rw" ? "Imigaragarire" : "Appearance",
      icon: <Palette size={18} />,
    },
    {
      id: "notifications",
      label: language === "rw" ? "Notifications" : "Notifications",
      icon: <Bell size={18} />,
    },
    {
      id: "security",
      label: language === "rw" ? "Umutekano" : "Security",
      icon: <Shield size={18} />,
    },
    {
      id: "system",
      label: language === "rw" ? "System" : "System",
      icon: <Server size={18} />,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();

    setPasswordMessage("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordMessage(
        language === "rw"
          ? "Uzuza imyanya yose."
          : "Please fill in all fields."
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage(
        language === "rw"
          ? "Password nshya igomba kuba nibura characters 8."
          : "New password must be at least 8 characters."
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage(
        language === "rw"
          ? "Password nshya ntizihuye."
          : "New passwords do not match."
      );
      return;
    }

    /*
      IMPORTANT:
      This is currently UI validation only.

      When your backend has a change-password endpoint,
      call it here using axios/fetch.
    */

    setPasswordMessage(
      language === "rw"
        ? "Password yemejwe neza. Huza na API ya backend kugirango ihindurwe."
        : "Password validated. Connect this action to your backend API to complete the change."
    );

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const checkApiStatus = async () => {
    setCheckingApi(true);
    setApiStatus("checking");

    try {
      /*
        Replace this with your real backend health endpoint.

        Example:
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/health`
        );

        if (!response.ok) throw new Error("API unavailable");
      */

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        setApiStatus("unknown");
        return;
      }

      const response = await fetch(`${apiUrl}/health`);

      if (!response.ok) {
        throw new Error("API unavailable");
      }

      setApiStatus("online");
    } catch (error) {
      console.error("API health check failed:", error);
      setApiStatus("offline");
    } finally {
      setCheckingApi(false);
    }
  };

  const renderApiStatus = () => {
    if (apiStatus === "online") {
      return (
        <span className="settings-status settings-status-online">
          <span className="settings-status-dot" />
          {language === "rw" ? "Ikora" : "Online"}
        </span>
      );
    }

    if (apiStatus === "offline") {
      return (
        <span className="settings-status settings-status-offline">
          <span className="settings-status-dot" />
          {language === "rw" ? "Ntiboneka" : "Offline"}
        </span>
      );
    }

    if (apiStatus === "checking") {
      return (
        <span className="settings-status settings-status-checking">
          <RefreshCw size={14} className="settings-spin" />
          {language === "rw" ? "Iragenzura..." : "Checking..."}
        </span>
      );
    }

    return (
      <span className="settings-status settings-status-neutral">
        {language === "rw" ? "Ntaragenzurwa" : "Not checked"}
      </span>
    );
  };

  return (
    <div className="settings-page">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="settings-header">
        <div>
          <div className="settings-breadcrumb">
            {language === "rw" ? "Admin" : "Admin"}
            <ChevronRight size={14} />
            {language === "rw" ? "Igenamiterere" : "Settings"}
          </div>

          <h1>
            {language === "rw" ? "Igenamiterere" : "Settings"}
          </h1>

          <p>
            {language === "rw"
              ? "Genzura konti ya admin, umutekano, imigaragarire na system."
              : "Manage your admin account, security, appearance and system preferences."}
          </p>
        </div>
      </div>

      {/* =========================================================
          SETTINGS LAYOUT
      ========================================================= */}

      <div className="settings-layout">

        {/* =======================================================
            LEFT NAVIGATION
        ======================================================= */}

        <aside className="settings-navigation">

          <div className="settings-navigation-title">
            {language === "rw" ? "Settings" : "Settings"}
          </div>

          <nav>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={
                  activeSection === section.id
                    ? "settings-nav-item settings-nav-item-active"
                    : "settings-nav-item"
                }
              >
                <span className="settings-nav-icon">
                  {section.icon}
                </span>

                <span>{section.label}</span>

                {activeSection === section.id && (
                  <ChevronRight
                    size={16}
                    className="settings-nav-arrow"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="settings-navigation-bottom">
            <button
              type="button"
              className="settings-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>{t("logout")}</span>
            </button>
          </div>

        </aside>

        {/* =======================================================
            CONTENT
        ======================================================= */}

        <section className="settings-content">

          {/* =====================================================
              ACCOUNT
          ===================================================== */}

          {activeSection === "account" && (
            <div className="settings-section">

              <div className="settings-section-heading">
                <div>
                  <h2>
                    {language === "rw"
                      ? "Konti ya Admin"
                      : "Admin Account"}
                  </h2>

                  <p>
                    {language === "rw"
                      ? "Amakuru ya konti ikoreshwa muri ANTIMATE Admin."
                      : "Information about the account used to access ANTIMATE Admin."}
                  </p>
                </div>
              </div>

              <div className="settings-profile">

                <div className="settings-avatar">
                  {initials || "A"}
                </div>

                <div className="settings-profile-main">
                  <strong>{adminName}</strong>

                  <span>{adminEmail}</span>

                  <div className="settings-role">
                    {adminRole}
                  </div>
                </div>

              </div>

              <div className="settings-info-list">

                <div className="settings-info-row">
                  <div>
                    <span className="settings-info-label">
                      {language === "rw" ? "Amazina" : "Name"}
                    </span>

                    <span className="settings-info-value">
                      {adminName}
                    </span>
                  </div>
                </div>

                <div className="settings-info-row">
                  <div>
                    <span className="settings-info-label">
                      Email
                    </span>

                    <span className="settings-info-value">
                      {adminEmail}
                    </span>
                  </div>
                </div>

                <div className="settings-info-row">
                  <div>
                    <span className="settings-info-label">
                      {language === "rw" ? "Uruhare" : "Role"}
                    </span>

                    <span className="settings-info-value">
                      {adminRole}
                    </span>
                  </div>
                </div>

              </div>

              <div className="settings-note">
                <Shield size={18} />

                <p>
                  {language === "rw"
                    ? "Aya makuru asomwa muri konti yawe. Guhindura amazina cyangwa email bishobora gushyirwa kuri backend nyuma."
                    : "These details are read from your authenticated admin account. Profile editing can be connected to the backend later."}
                </p>
              </div>

            </div>
          )}

          {/* =====================================================
              APPEARANCE
          ===================================================== */}

          {activeSection === "appearance" && (
            <div className="settings-section">

              <div className="settings-section-heading">
                <div>
                  <h2>
                    {language === "rw"
                      ? "Imigaragarire"
                      : "Appearance"}
                  </h2>

                  <p>
                    {language === "rw"
                      ? "Hitamo uko ANTIMATE Admin igaragara."
                      : "Choose how ANTIMATE Admin looks on your device."}
                  </p>
                </div>
              </div>

              <div className="settings-option-list">

                <button
                  type="button"
                  className={
                    theme === "dark"
                      ? "settings-option settings-option-active"
                      : "settings-option"
                  }
                  onClick={() => setTheme("dark")}
                >
                  <div className="settings-option-icon">
                    <Moon size={19} />
                  </div>

                  <div className="settings-option-content">
                    <strong>
                      {language === "rw" ? "Dark" : "Dark mode"}
                    </strong>

                    <span>
                      {language === "rw"
                        ? "Imigaragarire yijimye kandi yoroshye ku maso."
                        : "A dark interface designed for comfortable admin work."}
                    </span>
                  </div>

                  {theme === "dark" && (
                    <Check size={19} className="settings-check" />
                  )}
                </button>

                <button
                  type="button"
                  className={
                    theme === "light"
                      ? "settings-option settings-option-active"
                      : "settings-option"
                  }
                  onClick={() => setTheme("light")}
                >
                  <div className="settings-option-icon">
                    <Sun size={19} />
                  </div>

                  <div className="settings-option-content">
                    <strong>
                      {language === "rw" ? "Light" : "Light mode"}
                    </strong>

                    <span>
                      {language === "rw"
                        ? "Imigaragarire yera kandi isukuye."
                        : "A bright and clean interface."}
                    </span>
                  </div>

                  {theme === "light" && (
                    <Check size={19} className="settings-check" />
                  )}
                </button>

              </div>

              <div className="settings-subsection">

                <div className="settings-subsection-heading">
                  <Globe2 size={18} />

                  <div>
                    <h3>
                      {language === "rw"
                        ? "Ururimi"
                        : "Language"}
                    </h3>

                    <p>
                      {language === "rw"
                        ? "Hitamo ururimi ukoresha muri Admin."
                        : "Choose the language used throughout the admin panel."}
                    </p>
                  </div>
                </div>

                <div className="settings-language-buttons">

                  <button
                    type="button"
                    className={
                      language === "en"
                        ? "settings-language-button settings-language-active"
                        : "settings-language-button"
                    }
                    onClick={() => setLanguage("en")}
                  >
                    <span>🇬🇧</span>
                    English

                    {language === "en" && (
                      <Check size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    className={
                      language === "rw"
                        ? "settings-language-button settings-language-active"
                        : "settings-language-button"
                    }
                    onClick={() => setLanguage("rw")}
                  >
                    <span>🇷🇼</span>
                    Kinyarwanda

                    {language === "rw" && (
                      <Check size={16} />
                    )}
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* =====================================================
              NOTIFICATIONS
          ===================================================== */}

          {activeSection === "notifications" && (
            <div className="settings-section">

              <div className="settings-section-heading">
                <div>
                  <h2>
                    {language === "rw"
                      ? "Notifications"
                      : "Notifications"}
                  </h2>

                  <p>
                    {language === "rw"
                      ? "Genzura notifications ushaka kwakira nk'umukozi wa ANTIMATE."
                      : "Control which notifications you receive as an ANTIMATE administrator."}
                  </p>
                </div>
              </div>

              <div className="settings-toggle-list">

                {[
                  {
                    key: "system",
                    title:
                      language === "rw"
                        ? "System alerts"
                        : "System alerts",
                    description:
                      language === "rw"
                        ? "Amakuru akomeye ajyanye na system."
                        : "Important system health and service alerts.",
                  },
                  {
                    key: "security",
                    title:
                      language === "rw"
                        ? "Security alerts"
                        : "Security alerts",
                    description:
                      language === "rw"
                        ? "Login n'ibikorwa bishobora kugira ingaruka ku mutekano."
                        : "Login activity and security-related events.",
                  },
                  {
                    key: "workers",
                    title:
                      language === "rw"
                        ? "Worker activity"
                        : "Worker activity",
                    description:
                      language === "rw"
                        ? "Amakuru ajyanye n'abakozi ba ANTIMATE."
                        : "Updates about worker accounts and activity.",
                  },
                  {
                    key: "devices",
                    title:
                      language === "rw"
                        ? "Device alerts"
                        : "Device alerts",
                    description:
                      language === "rw"
                        ? "Alerts zijyanye na devices na gateways."
                        : "Alerts related to devices and gateways.",
                  },
                ].map((item) => (
                  <div
                    className="settings-toggle-row"
                    key={item.key}
                  >
                    <div>
                      <strong>{item.title}</strong>

                      <span>{item.description}</span>
                    </div>

                    <button
                      type="button"
                      className={
                        notifications[item.key]
                          ? "settings-switch settings-switch-on"
                          : "settings-switch"
                      }
                      onClick={() =>
                        setNotifications((previous) => ({
                          ...previous,
                          [item.key]: !previous[item.key],
                        }))
                      }
                      aria-label={item.title}
                    >
                      <span />
                    </button>
                  </div>
                ))}

              </div>

              <div className="settings-note">
                <Bell size={18} />

                <p>
                  {language === "rw"
                    ? "Izi preferences zibikwa muri browser kuri ubu. Nyuma tuzazihuza na backend kugirango zikore kuri konti ya admin."
                    : "These preferences are currently stored locally. They can later be synchronized with the admin account on the backend."}
                </p>
              </div>

            </div>
          )}

          {/* =====================================================
              SECURITY
          ===================================================== */}

          {activeSection === "security" && (
            <div className="settings-section">

              <div className="settings-section-heading">
                <div>
                  <h2>
                    {language === "rw"
                      ? "Umutekano"
                      : "Security"}
                  </h2>

                  <p>
                    {language === "rw"
                      ? "Genzura umutekano wa konti ya admin."
                      : "Manage the security of your administrator account."}
                  </p>
                </div>
              </div>

              <div className="settings-security-header">
                <div className="settings-security-icon">
                  <Lock size={22} />
                </div>

                <div>
                  <strong>
                    {language === "rw"
                      ? "Hindura password"
                      : "Change password"}
                  </strong>

                  <span>
                    {language === "rw"
                      ? "Koresha password ikomeye kandi itandukanye."
                      : "Use a strong password that is unique to your admin account."}
                  </span>
                </div>
              </div>

              <form
                className="settings-password-form"
                onSubmit={handlePasswordChange}
              >

                <label>
                  <span>
                    {language === "rw"
                      ? "Password isanzwe"
                      : "Current password"}
                  </span>

                  <div className="settings-input-wrapper">
                    <KeyRound size={17} />

                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({
                          ...previous,
                          currentPassword: event.target.value,
                        }))
                      }
                      autoComplete="current-password"
                    />
                  </div>
                </label>

                <label>
                  <span>
                    {language === "rw"
                      ? "Password nshya"
                      : "New password"}
                  </span>

                  <div className="settings-input-wrapper">
                    <KeyRound size={17} />

                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({
                          ...previous,
                          newPassword: event.target.value,
                        }))
                      }
                      autoComplete="new-password"
                    />
                  </div>
                </label>

                <label>
                  <span>
                    {language === "rw"
                      ? "Emeza password nshya"
                      : "Confirm new password"}
                  </span>

                  <div className="settings-input-wrapper">
                    <KeyRound size={17} />

                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({
                          ...previous,
                          confirmPassword: event.target.value,
                        }))
                      }
                      autoComplete="new-password"
                    />
                  </div>
                </label>

                {passwordMessage && (
                  <div className="settings-form-message">
                    {passwordMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="settings-primary-button"
                >
                  <Lock size={17} />

                  {language === "rw"
                    ? "Hindura password"
                    : "Change password"}
                </button>

              </form>

            </div>
          )}

          {/* =====================================================
              SYSTEM
          ===================================================== */}

          {activeSection === "system" && (
            <div className="settings-section">

              <div className="settings-section-heading">
                <div>
                  <h2>
                    {language === "rw"
                      ? "System Information"
                      : "System Information"}
                  </h2>

                  <p>
                    {language === "rw"
                      ? "Amakuru ajyanye na ANTIMATE Admin na backend."
                      : "Information about ANTIMATE Admin and its backend connection."}
                  </p>
                </div>
              </div>

              <div className="settings-system-list">

                <div className="settings-system-row">
                  <div>
                    <span>
                      {language === "rw"
                        ? "Application"
                        : "Application"}
                    </span>

                    <strong>
                      ANTIMATE Admin
                    </strong>
                  </div>
                </div>

                <div className="settings-system-row">
                  <div>
                    <span>
                      {language === "rw"
                        ? "Version"
                        : "Version"}
                    </span>

                    <strong>
                      v{appVersion}
                    </strong>
                  </div>
                </div>

                <div className="settings-system-row">
                  <div>
                    <span>
                      Backend API
                    </span>

                    <strong>
                      {import.meta.env.VITE_API_URL || "Not configured"}
                    </strong>
                  </div>
                </div>

                <div className="settings-system-row">
                  <div>
                    <span>
                      {language === "rw"
                        ? "API Status"
                        : "API Status"}
                    </span>

                    {renderApiStatus()}
                  </div>

                  <button
                    type="button"
                    className="settings-secondary-button"
                    onClick={checkApiStatus}
                    disabled={checkingApi}
                  >
                    <RefreshCw
                      size={16}
                      className={
                        checkingApi
                          ? "settings-spin"
                          : ""
                      }
                    />

                    {language === "rw"
                      ? "Suzuma"
                      : "Check"}
                  </button>
                </div>

              </div>

              <div className="settings-danger-zone">

                <div className="settings-danger-icon">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3>
                    {language === "rw"
                      ? "Danger Zone"
                      : "Danger Zone"}
                  </h3>

                  <p>
                    {language === "rw"
                      ? "Gusohoka muri konti ya admin kuri iyi device."
                      : "Sign out of the administrator account on this device."}
                  </p>

                  <button
                    type="button"
                    className="settings-danger-button"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />

                    {language === "rw"
                      ? "Sohoka"
                      : "Logout"}
                  </button>
                </div>

              </div>

            </div>
          )}

        </section>
      </div>

      {/* =========================================================
          CSS
      ========================================================= */}

      <style>{`

        .settings-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 4px 0 40px;
          color: var(--admin-text);
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .settings-header {
          margin-bottom: 24px;
        }

        .settings-breadcrumb {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--admin-text-muted);
          font-size: 13px;
          margin-bottom: 8px;
        }

        .settings-header h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.5px;
        }

        .settings-header p {
          margin: 8px 0 0;
          color: var(--admin-text-muted);
          font-size: 14px;
          line-height: 1.6;
        }

        /* =====================================================
           MAIN LAYOUT
        ===================================================== */

        .settings-layout {
          display: grid;
          grid-template-columns: 230px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        /* =====================================================
           NAVIGATION
        ===================================================== */

        .settings-navigation {
          border: 1px solid var(--admin-border);
          background: var(--admin-surface);
          border-radius: 14px;
          overflow: hidden;
        }

        .settings-navigation-title {
          padding: 17px 18px;
          border-bottom: 1px solid var(--admin-border);
          color: var(--admin-text);
          font-size: 12px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .settings-navigation nav {
          padding: 8px;
        }

        .settings-nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 44px;
          padding: 0 11px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--admin-text-muted);
          cursor: pointer;
          text-align: left;
          font-size: 14px;
          transition:
            background .18s ease,
            color .18s ease;
        }

        .settings-nav-item:hover {
          background: var(--admin-surface-hover);
          color: var(--admin-text);
        }

        .settings-nav-item-active {
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .settings-nav-icon {
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .settings-nav-arrow {
          margin-left: auto;
        }

        .settings-navigation-bottom {
          padding: 10px 8px;
          border-top: 1px solid var(--admin-border);
        }

        .settings-logout-button {
          width: 100%;
          min-height: 42px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 11px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #ef6b6b;
          cursor: pointer;
          font-size: 14px;
        }

        .settings-logout-button:hover {
          background: rgba(239, 107, 107, .09);
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .settings-content {
          min-width: 0;
          border: 1px solid var(--admin-border);
          background: var(--admin-surface);
          border-radius: 14px;
          overflow: hidden;
        }

        .settings-section {
          padding: 26px;
        }

        .settings-section-heading {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 22px;
          border-bottom: 1px solid var(--admin-border);
        }

        .settings-section-heading h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 750;
        }

        .settings-section-heading p {
          margin: 6px 0 0;
          color: var(--admin-text-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        /* =====================================================
           PROFILE
        ===================================================== */

        .settings-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px 0;
          border-bottom: 1px solid var(--admin-border);
        }

        .settings-avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
          font-weight: 800;
          font-size: 19px;
        }

        .settings-profile-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .settings-profile-main strong {
          color: var(--admin-text);
          font-size: 16px;
        }

        .settings-profile-main span {
          color: var(--admin-text-muted);
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .settings-role {
          width: fit-content;
          margin-top: 6px;
          padding: 4px 8px;
          border: 1px solid var(--admin-border);
          border-radius: 6px;
          color: var(--admin-text-muted);
          font-size: 11px;
          font-weight: 650;
        }

        .settings-info-list {
          display: flex;
          flex-direction: column;
        }

        .settings-info-row {
          min-height: 70px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--admin-border);
        }

        .settings-info-row > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .settings-info-label {
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .settings-info-value {
          color: var(--admin-text);
          font-size: 14px;
          font-weight: 600;
        }

        .settings-note {
          display: flex;
          gap: 11px;
          margin-top: 20px;
          padding: 13px 14px;
          border: 1px solid var(--admin-border);
          border-radius: 9px;
          background: var(--admin-surface-subtle);
          color: var(--admin-text-muted);
        }

        .settings-note svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: var(--admin-accent);
        }

        .settings-note p {
          margin: 0;
          font-size: 12px;
          line-height: 1.6;
        }

        /* =====================================================
           APPEARANCE
        ===================================================== */

        .settings-option-list {
          display: flex;
          flex-direction: column;
          margin-top: 20px;
        }

        .settings-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 0;
          border: 0;
          border-bottom: 1px solid var(--admin-border);
          background: transparent;
          color: var(--admin-text);
          text-align: left;
          cursor: pointer;
        }

        .settings-option-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid var(--admin-border);
          border-radius: 9px;
          color: var(--admin-text-muted);
        }

        .settings-option-active .settings-option-icon {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
          background: var(--admin-accent-soft);
        }

        .settings-option-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-option-content strong {
          font-size: 14px;
        }

        .settings-option-content span {
          color: var(--admin-text-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .settings-check {
          color: var(--admin-accent);
          flex-shrink: 0;
        }

        .settings-subsection {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--admin-border);
        }

        .settings-subsection-heading {
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }

        .settings-subsection-heading > svg {
          margin-top: 2px;
          color: var(--admin-accent);
        }

        .settings-subsection-heading h3 {
          margin: 0;
          font-size: 15px;
        }

        .settings-subsection-heading p {
          margin: 4px 0 0;
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .settings-language-buttons {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .settings-language-button {
          min-height: 42px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 13px;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: var(--admin-surface-subtle);
          color: var(--admin-text-muted);
          cursor: pointer;
          font-size: 13px;
        }

        .settings-language-button:hover {
          color: var(--admin-text);
          border-color: var(--admin-border-strong);
        }

        .settings-language-active {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
          background: var(--admin-accent-soft);
        }

        /* =====================================================
           NOTIFICATIONS
        ===================================================== */

        .settings-toggle-list {
          margin-top: 6px;
        }

        .settings-toggle-row {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid var(--admin-border);
        }

        .settings-toggle-row > div:first-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-toggle-row strong {
          font-size: 14px;
        }

        .settings-toggle-row span {
          color: var(--admin-text-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .settings-switch {
          width: 42px;
          height: 24px;
          padding: 3px;
          flex-shrink: 0;
          border: 1px solid var(--admin-border);
          border-radius: 20px;
          background: var(--admin-surface-subtle);
          cursor: pointer;
          transition: .2s ease;
        }

        .settings-switch span {
          display: block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--admin-text-muted);
          transition: transform .2s ease;
        }

        .settings-switch-on {
          background: var(--admin-accent);
          border-color: var(--admin-accent);
        }

        .settings-switch-on span {
          background: white;
          transform: translateX(18px);
        }

        /* =====================================================
           SECURITY
        ===================================================== */

        .settings-security-header {
          display: flex;
          gap: 13px;
          margin-top: 22px;
          padding: 15px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          background: var(--admin-surface-subtle);
        }

        .settings-security-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .settings-security-header > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-security-header strong {
          font-size: 14px;
        }

        .settings-security-header span {
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .settings-password-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 22px;
          max-width: 520px;
        }

        .settings-password-form label {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .settings-password-form label > span {
          color: var(--admin-text-muted);
          font-size: 12px;
          font-weight: 600;
        }

        .settings-input-wrapper {
          height: 44px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: var(--admin-surface-subtle);
          color: var(--admin-text-muted);
        }

        .settings-input-wrapper:focus-within {
          border-color: var(--admin-accent);
        }

        .settings-input-wrapper input {
          width: 100%;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--admin-text);
          font-size: 13px;
        }

        .settings-form-message {
          padding: 11px 12px;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          color: var(--admin-text-muted);
          background: var(--admin-surface-subtle);
          font-size: 12px;
          line-height: 1.5;
        }

        .settings-primary-button,
        .settings-secondary-button,
        .settings-danger-button {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 650;
        }

        .settings-primary-button {
          border: 1px solid var(--admin-accent);
          background: var(--admin-accent);
          color: white;
        }

        .settings-primary-button:hover {
          opacity: .9;
        }

        /* =====================================================
           SYSTEM
        ===================================================== */

        .settings-system-list {
          margin-top: 10px;
        }

        .settings-system-row {
          min-height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 1px solid var(--admin-border);
        }

        .settings-system-row > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .settings-system-row span {
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .settings-system-row strong {
          max-width: 100%;
          overflow-wrap: anywhere;
          color: var(--admin-text);
          font-size: 13px;
        }

        .settings-secondary-button {
          border: 1px solid var(--admin-border);
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
        }

        .settings-secondary-button:hover {
          border-color: var(--admin-border-strong);
        }

        .settings-secondary-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .settings-status {
          width: fit-content;
          display: inline-flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 6px;
          font-size: 12px !important;
        }

        .settings-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .settings-status-online {
          color: #45c982 !important;
        }

        .settings-status-offline {
          color: #ef6b6b !important;
        }

        .settings-status-checking {
          color: var(--admin-accent) !important;
        }

        .settings-status-neutral {
          color: var(--admin-text-muted) !important;
        }

        .settings-spin {
          animation: settings-spin 1s linear infinite;
        }

        @keyframes settings-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           DANGER ZONE
        ===================================================== */

        .settings-danger-zone {
          display: flex;
          gap: 13px;
          margin-top: 28px;
          padding: 17px;
          border: 1px solid rgba(239, 107, 107, .25);
          border-radius: 10px;
          background: rgba(239, 107, 107, .035);
        }

        .settings-danger-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 8px;
          color: #ef6b6b;
          background: rgba(239, 107, 107, .09);
        }

        .settings-danger-zone h3 {
          margin: 0;
          color: #ef6b6b;
          font-size: 14px;
        }

        .settings-danger-zone p {
          margin: 5px 0 12px;
          color: var(--admin-text-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .settings-danger-button {
          border: 1px solid rgba(239, 107, 107, .3);
          background: transparent;
          color: #ef6b6b;
        }

        .settings-danger-button:hover {
          background: rgba(239, 107, 107, .08);
        }

        /* =====================================================
           LIGHT THEME
        ===================================================== */

        [data-theme="light"] .settings-danger-zone {
          background: rgba(220, 38, 38, .025);
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 900px) {

          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-navigation {
            display: flex;
            align-items: stretch;
          }

          .settings-navigation-title {
            display: none;
          }

          .settings-navigation nav {
            width: 100%;
            display: flex;
            overflow-x: auto;
            padding: 7px;
            gap: 4px;
          }

          .settings-nav-item {
            width: auto;
            min-width: max-content;
            padding: 0 13px;
          }

          .settings-nav-arrow {
            display: none;
          }

          .settings-navigation-bottom {
            display: none;
          }

        }

        @media (max-width: 600px) {

          .settings-page {
            padding-bottom: 25px;
          }

          .settings-header h1 {
            font-size: 25px;
          }

          .settings-section {
            padding: 19px;
          }

          .settings-section-heading {
            padding-bottom: 18px;
          }

          .settings-language-buttons {
            flex-direction: column;
          }

          .settings-language-button {
            width: 100%;
            justify-content: flex-start;
          }

          .settings-toggle-row {
            min-height: 86px;
          }

          .settings-system-row {
            align-items: flex-start;
            flex-direction: column;
            justify-content: center;
            padding: 13px 0;
          }

          .settings-secondary-button {
            width: 100%;
          }

          .settings-danger-zone {
            align-items: flex-start;
          }

        }

        @media (max-width: 420px) {

          .settings-profile {
            align-items: flex-start;
          }

          .settings-avatar {
            width: 48px;
            height: 48px;
            font-size: 16px;
          }

          .settings-header p {
            font-size: 13px;
          }

          .settings-section-heading h2 {
            font-size: 18px;
          }

        }

      `}</style>
    </div>
  );
}