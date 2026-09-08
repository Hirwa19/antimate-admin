import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      console.clear();

      console.log("========== LOGIN START ==========");
      console.log("Email:", email);

      const res = await api.post("/admin-auth/login", {
        email,
        password,
      });

      console.log("========== LOGIN SUCCESS ==========");
      console.log("Status:", res.status);
      console.log("Response:", res.data);

      login(res.data.admin, res.data.token);

      console.log("Saved admin:", res.data.admin);
      console.log("Saved token:", res.data.token);

      navigate("/dashboard");
    } catch (error) {
      console.log("========== LOGIN FAILED ==========");
      console.log("Error object:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Response:", error.response.data);
      } else {
        console.log("No response from server");
      }

      setErrorMessage(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decorations */}
      <div className="background-orb orb-one"></div>
      <div className="background-orb orb-two"></div>
      <div className="background-orb orb-three"></div>

      {/* Main glass card */}
      <div className="login-card">

        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo">
            A
          </div>

          <div>
            <h1>ANTIMATE</h1>
            <span>ADMIN PORTAL</span>
          </div>
        </div>

        {/* Header */}
        <div className="login-header">
          <h2>Welcome back</h2>
          <p>
            Sign in to manage your ANTIMATE systems and services.
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="error-message">
            <span className="error-icon">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="email">
              Email address
            </label>

            <div className="input-wrapper">
              <span className="input-icon">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>

              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage("");
                }}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group password-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">
              <span className="input-icon">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage("");
                }}
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 2l20 20" />
                    <path d="M6.7 6.7C4.9 8 3.5 9.7 2.5 12c1.8 4.2 5.5 7 9.5 7 1.5 0 3-.4 4.3-1.1" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.2C10.6 5 11.3 5 12 5c4 0 7.7 2.8 9.5 7-.6 1.4-1.4 2.6-2.4 3.7" />
                  </svg>
                ) : (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className={`login-button ${
              loading ? "loading" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>

                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <div className="security-status">
            <span className="status-dot"></span>
            <span>Secure staff access</span>
          </div>

          <span className="version">
            ANTIMATE Admin
          </span>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="page-footer">
        <span>© {new Date().getFullYear()} ANTIMATE</span>
        <span className="footer-separator">•</span>
        <span>Company Management Platform</span>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 40px 20px;

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(37, 99, 235, 0.10),
              transparent 32%
            ),
            radial-gradient(
              circle at 90% 90%,
              rgba(124, 58, 237, 0.10),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #eef2ff 48%,
              #f8fafc 100%
            );

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          color: #172033;
        }

        /* =========================
           BACKGROUND ORBS
        ========================= */

        .background-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(2px);
        }

        .orb-one {
          width: 340px;
          height: 340px;
          top: -150px;
          left: -100px;

          background:
            radial-gradient(
              circle,
              rgba(59, 130, 246, 0.18),
              rgba(59, 130, 246, 0)
            );
        }

        .orb-two {
          width: 430px;
          height: 430px;
          right: -180px;
          top: 20%;

          background:
            radial-gradient(
              circle,
              rgba(139, 92, 246, 0.13),
              rgba(139, 92, 246, 0)
            );
        }

        .orb-three {
          width: 300px;
          height: 300px;
          bottom: -150px;
          left: 20%;

          background:
            radial-gradient(
              circle,
              rgba(14, 165, 233, 0.10),
              rgba(14, 165, 233, 0)
            );
        }

        /* =========================
           GLASS CARD
        ========================= */

        .login-card {
          width: 100%;
          max-width: 450px;

          position: relative;
          z-index: 2;

          padding: 38px;

          border-radius: 28px;

          background:
            rgba(255, 255, 255, 0.64);

          border:
            1px solid rgba(255, 255, 255, 0.78);

          box-shadow:
            0 30px 80px rgba(15, 23, 42, 0.10),
            0 8px 30px rgba(15, 23, 42, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);

          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        /* =========================
           BRAND
        ========================= */

        .brand-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;

          margin-bottom: 34px;
        }

        .brand-logo {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;

          color: white;

          font-size: 25px;
          font-weight: 800;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          box-shadow:
            0 10px 25px rgba(37, 99, 235, 0.25);
        }

        .brand-section h1 {
          margin: 0;

          font-size: 21px;
          line-height: 1.1;
          letter-spacing: 0.08em;
          font-weight: 800;

          color: #172033;
        }

        .brand-section span {
          display: block;

          margin-top: 4px;

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.20em;

          color: #64748b;
        }

        /* =========================
           HEADER
        ========================= */

        .login-header {
          margin-bottom: 28px;
        }

        .login-header h2 {
          margin: 0 0 8px;

          font-size: 28px;
          line-height: 1.2;

          font-weight: 750;
          letter-spacing: -0.025em;

          color: #111827;
        }

        .login-header p {
          margin: 0;

          font-size: 14px;
          line-height: 1.6;

          color: #64748b;
        }

        /* =========================
           ERROR
        ========================= */

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 20px;
          padding: 12px 14px;

          border-radius: 13px;

          background: rgba(254, 226, 226, 0.75);
          border: 1px solid rgba(248, 113, 113, 0.30);

          color: #b91c1c;

          font-size: 13px;
          line-height: 1.4;
        }

        .error-icon {
          width: 21px;
          height: 21px;

          flex: 0 0 21px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #dc2626;
          color: white;

          font-size: 12px;
          font-weight: 800;
        }

        /* =========================
           INPUTS
        ========================= */

        .input-group {
          margin-bottom: 20px;
        }

        .password-group {
          margin-bottom: 25px;
        }

        .input-group label {
          display: block;

          margin-bottom: 8px;

          font-size: 13px;
          font-weight: 650;

          color: #334155;
        }

        .input-wrapper {
          position: relative;

          display: flex;
          align-items: center;

          height: 54px;

          border-radius: 15px;

          background:
            rgba(255, 255, 255, 0.60);

          border:
            1px solid rgba(148, 163, 184, 0.32);

          box-shadow:
            inset 0 1px 2px rgba(15, 23, 42, 0.025);

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .input-wrapper:focus-within {
          background: rgba(255, 255, 255, 0.85);

          border-color: rgba(37, 99, 235, 0.55);

          box-shadow:
            0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .input-icon {
          width: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #94a3b8;

          pointer-events: none;
        }

        .input-wrapper:focus-within .input-icon {
          color: #2563eb;
        }

        .input-wrapper input {
          width: 100%;
          height: 100%;

          padding: 0 15px 0 0;

          border: none;
          outline: none;

          background: transparent;

          color: #172033;

          font-size: 14px;
          font-family: inherit;
        }

        .input-wrapper input::placeholder {
          color: #94a3b8;
        }

        .input-wrapper input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* =========================
           PASSWORD TOGGLE
        ========================= */

        .password-toggle {
          width: 45px;
          height: 100%;

          flex: 0 0 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: none;
          outline: none;

          background: transparent;

          color: #94a3b8;

          cursor: pointer;

          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: #2563eb;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* =========================
           LOGIN BUTTON
        ========================= */

        .login-button {
          width: 100%;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          border: none;
          outline: none;
          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          font-family: inherit;
          font-size: 14px;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 12px 25px rgba(37, 99, 235, 0.20);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 16px 30px rgba(37, 99, 235, 0.25);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          cursor: not-allowed;
          opacity: 0.75;
        }

        .login-button.loading {
          cursor: wait;
        }

        /* =========================
           SPINNER
        ========================= */

        .spinner {
          width: 18px;
          height: 18px;

          border-radius: 50%;

          border:
            2px solid rgba(255, 255, 255, 0.35);

          border-top-color: white;

          animation:
            spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =========================
           CARD FOOTER
        ========================= */

        .login-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 24px;
          padding-top: 20px;

          border-top:
            1px solid rgba(148, 163, 184, 0.16);

          font-size: 11px;
          color: #94a3b8;
        }

        .security-status {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 0 3px rgba(34, 197, 94, 0.10);
        }

        .version {
          font-weight: 600;
        }

        /* =========================
           PAGE FOOTER
        ========================= */

        .page-footer {
          position: absolute;

          bottom: 18px;
          left: 0;
          right: 0;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;

          z-index: 2;

          color: #94a3b8;

          font-size: 10px;
          font-weight: 500;
        }

        .footer-separator {
          opacity: 0.5;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 520px) {
          .login-page {
            padding: 25px 15px 65px;
          }

          .login-card {
            padding: 28px 22px;

            border-radius: 23px;
          }

          .brand-section {
            margin-bottom: 28px;
          }

          .login-header h2 {
            font-size: 25px;
          }

          .page-footer {
            bottom: 15px;
            padding: 0 15px;

            text-align: center;
          }
        }

        @media (max-height: 700px) {
          .login-page {
            align-items: flex-start;
            padding-top: 25px;
            padding-bottom: 60px;
            overflow-y: auto;
          }

          .login-card {
            margin: auto 0;
          }
        }
      `}</style>
    </div>
  );
}