import { useState } from "react";

import {
  Copy,
  Check,
  Cpu,
  KeyRound,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  ShieldCheck,
  QrCode,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

export default function GenerateDevice() {
  const { language } = useAppSettings();

  const [device, setDevice] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [showKey, setShowKey] = useState(false);
  const [showQrToken, setShowQrToken] = useState(false);

  const [copied, setCopied] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRw = language === "rw";

  /* ============================================================
     GENERATE DEVICE
  ============================================================ */

  const generateDevice = async () => {
    try {
      setLoading(true);

      setError("");
      setSuccess("");
      setCopied("");

      setShowKey(false);
      setShowQrToken(false);

      const res = await api.post(
        "/devices/register",
        {}
      );

      console.log(
        "REGISTER RESPONSE:",
        res.data
      );

      const generatedDevice =
        res?.data?.device;

      if (!generatedDevice) {
        throw new Error(
          isRw
            ? "Device ntiyagarutse neza muri server."
            : "Device data was not returned by the server."
        );
      }

      setDevice(generatedDevice);

      setSuccess(
        isRw
          ? "Device yakozwe neza."
          : "Device identity generated successfully."
      );

    } catch (err) {
      console.error(
        "Device generation error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          (isRw
            ? "Kurema Device byanze. Ongera ugerageze."
            : "Device generation failed. Please try again.")
      );

    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     COPY
  ============================================================ */

  const copyText = async (
    value,
    type
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(
        String(value)
      );

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 2000);

    } catch (err) {
      console.error(
        "Copy failed:",
        err
      );

      setError(
        isRw
          ? "Copy yanze kuri iyi browser."
          : "Copy failed on this browser."
      );
    }
  };

  /* ============================================================
     DOWNLOAD LABEL
  ============================================================ */

  const downloadLabel = async () => {
    if (!device?.deviceId) return;

    try {
      setPdfLoading(true);
      setError("");

      const res = await api.get(
        `/devices/label/${device.deviceId}`,
        {
          responseType: "blob",
        }
      );

      const file = new Blob(
        [res.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(file);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${device.deviceId}-label.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(
        "Device label download error:",
        err.response?.data || err.message
      );

      setError(
        isRw
          ? "PDF label ntiyabashije gukururwa."
          : "Failed to download the device PDF label."
      );

    } finally {
      setPdfLoading(false);
    }
  };

  /* ============================================================
     DEVICE KEY
  ============================================================ */

  const secretKey =
    device?.secretKey || "";

  const maskedKey =
    secretKey
      ? "••••••••••••••••••••••••••••••••"
      : "—";

  const qrToken =
    device?.qrToken || "";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="device-page">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="device-header">

        <div className="device-header-text">

          <div className="device-breadcrumb">

            <Cpu size={14} />

            <span>
              {isRw
                ? "Administration"
                : "Administration"}
            </span>

            <span>/</span>

            <span>
              {isRw
                ? "Kora Device"
                : "Generate Device"}
            </span>

          </div>

          <h1>
            {isRw
              ? "Kora Device Identity"
              : "Generate Device Identity"}
          </h1>

          <p>
            {isRw
              ? "Kora identity na credentials byize bya ANTIMATE Edge Device."
              : "Create a secure identity and credentials for an ANTIMATE Edge Device."}
          </p>

        </div>

        <button
          type="button"
          onClick={generateDevice}
          disabled={loading}
          className="device-generate-button"
        >

          <RefreshCw
            size={18}
            className={
              loading
                ? "device-spin"
                : ""
            }
          />

          <span>
            {loading
              ? isRw
                ? "Birakorwa..."
                : "Generating..."
              : isRw
                ? "Kora Device"
                : "Generate Device"}
          </span>

        </button>

      </header>

      {/* ========================================================
          ALERT
      ======================================================== */}

      {error && (
        <div className="device-alert device-alert-error">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>
      )}

      {success && (
        <div className="device-alert device-alert-success">

          <CheckCircle2 size={18} />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            ×
          </button>

        </div>
      )}

      {/* ========================================================
          GENERATED DEVICE
      ======================================================== */}

      {device && (
        <div className="device-workspace">

          {/* ====================================================
              DEVICE INFORMATION
          ==================================================== */}

          <section className="device-section">

            <div className="device-section-header">

              <div className="device-section-title">

                <div className="device-section-icon">
                  <Cpu size={19} />
                </div>

                <div>

                  <h2>
                    {isRw
                      ? "Device Information"
                      : "Device Information"}
                  </h2>

                  <p>
                    {isRw
                      ? "Identity na credentials bya Device yakozwe."
                      : "Identity and credentials generated for this device."}
                  </p>

                </div>

              </div>

              <span className="device-ready-status">
                <span />
                READY
              </span>

            </div>

            <div className="device-information-list">

              {/* ==================================================
                  DEVICE ID
              ================================================== */}

              <CredentialRow
                icon={<Cpu size={16} />}
                label="Device ID"
                description={
                  isRw
                    ? "Unique identifier ya Device."
                    : "Unique identifier for this device."
                }
                value={device.deviceId}
                type="device-id"
                copied={copied}
                onCopy={copyText}
              />

              {/* ==================================================
                  SECRET KEY
              ================================================== */}

              <div className="device-credential-row">

                <div className="device-credential-label">

                  <div className="device-credential-icon">
                    <KeyRound size={16} />
                  </div>

                  <div>

                    <span>
                      {isRw
                        ? "Default Key"
                        : "Default Key"}
                    </span>

                    <small>
                      {isRw
                        ? "Secret key ikoreshwa mu provisioning ya Device."
                        : "Secret key used during device provisioning."}
                    </small>

                  </div>

                </div>

                <div className="device-value-area">

                  <code>
                    {showKey
                      ? secretKey || "—"
                      : maskedKey}
                  </code>

                  <div className="device-value-actions">

                    <button
                      type="button"
                      onClick={() =>
                        setShowKey(
                          previous =>
                            !previous
                        )
                      }
                      title={
                        showKey
                          ? "Hide key"
                          : "Show key"
                      }
                    >
                      {showKey ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          secretKey,
                          "secret-key"
                        )
                      }
                      title="Copy"
                    >
                      {copied === "secret-key" ? (
                        <Check size={17} />
                      ) : (
                        <Copy size={17} />
                      )}
                    </button>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  QR TOKEN
              ================================================== */}

              <div className="device-credential-row">

                <div className="device-credential-label">

                  <div className="device-credential-icon">
                    <QrCode size={16} />
                  </div>

                  <div>

                    <span>
                      QR Token
                    </span>

                    <small>
                      {isRw
                        ? "Token ikoreshwa mu device provisioning."
                        : "Token used during device provisioning."}
                    </small>

                  </div>

                </div>

                <div className="device-value-area">

                  <code>
                    {showQrToken
                      ? qrToken || "—"
                      : "••••••••••••••••••"}
                  </code>

                  <div className="device-value-actions">

                    <button
                      type="button"
                      onClick={() =>
                        setShowQrToken(
                          previous =>
                            !previous
                        )
                      }
                      title={
                        showQrToken
                          ? "Hide token"
                          : "Show token"
                      }
                    >
                      {showQrToken ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          qrToken,
                          "qr-token"
                        )
                      }
                      title="Copy"
                    >
                      {copied === "qr-token" ? (
                        <Check size={17} />
                      ) : (
                        <Copy size={17} />
                      )}
                    </button>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  STATUS
              ================================================== */}

              <div className="device-information-simple">

                <div>

                  <span className="device-simple-label">
                    {isRw
                      ? "Status"
                      : "Status"}
                  </span>

                  <span className="device-status-ready">

                    <span />

                    READY

                  </span>

                </div>

              </div>

            </div>

            {/* ==================================================
                SECURITY NOTICE
            ================================================== */}

            <div className="device-security-note">

              <ShieldCheck size={19} />

              <div>

                <strong>
                  {isRw
                    ? "Bika credentials neza"
                    : "Protect these credentials"}
                </strong>

                <p>
                  {isRw
                    ? "Default Key ni secret credential. Yibike ahantu hizewe kandi ntuyisangize umuntu utabifitiye ububasha."
                    : "The Default Key is a secret credential. Store it securely and do not share it with unauthorized people."}
                </p>

              </div>

            </div>

          </section>

          {/* ====================================================
              PDF LABEL
          ==================================================== */}

          <section className="device-section">

            <div className="device-section-header">

              <div className="device-section-title">

                <div className="device-section-icon">
                  <Download size={19} />
                </div>

                <div>

                  <h2>
                    {isRw
                      ? "Device Label"
                      : "Device Label"}
                  </h2>

                  <p>
                    {isRw
                      ? "Kuramo PDF label ya Device kugirango uyishyire kuri hardware."
                      : "Download the PDF label for physical device identification."}
                  </p>

                </div>

              </div>

            </div>

            <div className="device-label-content">

              <div className="device-label-preview">

                <div className="device-label-icon">
                  <Cpu size={26} />
                </div>

                <div>

                  <strong>
                    {device.deviceId}
                  </strong>

                  <span>
                    ANTIMATE Edge Device
                  </span>

                </div>

              </div>

              <button
                type="button"
                onClick={downloadLabel}
                disabled={pdfLoading}
                className="device-download-button"
              >

                <Download
                  size={17}
                  className={
                    pdfLoading
                      ? "device-spin"
                      : ""
                  }
                />

                {pdfLoading
                  ? isRw
                    ? "Birakururwa..."
                    : "Downloading..."
                  : isRw
                    ? "Kuramo PDF Label"
                    : "Download PDF Label"}

              </button>

            </div>

          </section>

        </div>
      )}

      {/* ========================================================
          EMPTY STATE
      ======================================================== */}

      {!device && !loading && (
        <section className="device-empty-state">

          <div className="device-empty-icon">
            <Cpu size={31} />
          </div>

          <h2>
            {isRw
              ? "Nta Device irakorwa"
              : "No device generated"}
          </h2>

          <p>
            {isRw
              ? "Kanda kuri “Kora Device” kugirango ukore Device identity na credentials nshya."
              : "Click “Generate Device” to create a new device identity and credentials."}
          </p>

          <button
            type="button"
            onClick={generateDevice}
            className="device-empty-button"
          >

            <RefreshCw size={17} />

            {isRw
              ? "Kora Device"
              : "Generate Device"}

          </button>

        </section>
      )}

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <section className="device-loading-state">

          <RefreshCw
            size={28}
            className="device-spin"
          />

          <strong>
            {isRw
              ? "Turimo gukora Device..."
              : "Generating device credentials..."}
          </strong>

          <span>
            {isRw
              ? "Tegereza gato."
              : "Please wait a moment."}
          </span>

        </section>
      )}

      {/* ========================================================
          CSS
      ======================================================== */}

      <style>{`

        /* ======================================================
           PAGE
        ====================================================== */

        .device-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 4px 0 40px;
          color: var(--admin-text);
        }

        /* ======================================================
           HEADER
        ====================================================== */

        .device-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .device-header-text {
          min-width: 0;
        }

        .device-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 9px;
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .device-header h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1.2;
          font-weight: 760;
          letter-spacing: -.5px;
        }

        .device-header p {
          margin: 7px 0 0;
          color: var(--admin-text-muted);
          font-size: 14px;
          line-height: 1.55;
        }

        /* ======================================================
           BUTTONS
        ====================================================== */

        .device-generate-button {
          min-height: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          flex-shrink: 0;
          padding: 0 17px;
          border: 1px solid var(--admin-accent);
          border-radius: 9px;
          background: var(--admin-accent);
          color: #fff;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition:
            opacity .18s ease,
            transform .18s ease;
        }

        .device-generate-button:hover {
          opacity: .91;
          transform: translateY(-1px);
        }

        .device-generate-button:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .device-download-button,
        .device-empty-button {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 650;
        }

        .device-download-button {
          border: 1px solid var(--admin-accent);
          background: var(--admin-accent);
          color: white;
        }

        .device-download-button:hover {
          opacity: .9;
        }

        .device-download-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        /* ======================================================
           ALERTS
        ====================================================== */

        .device-alert {
          min-height: 46px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 0 13px;
          border-radius: 9px;
          font-size: 13px;
        }

        .device-alert span {
          flex: 1;
        }

        .device-alert button {
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 20px;
        }

        .device-alert-error {
          border: 1px solid rgba(239, 107, 107, .25);
          background: rgba(239, 107, 107, .06);
          color: #ef8585;
        }

        .device-alert-success {
          border: 1px solid rgba(69, 201, 130, .25);
          background: rgba(69, 201, 130, .06);
          color: #55ca88;
        }

        /* ======================================================
           WORKSPACE
        ====================================================== */

        .device-workspace {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .device-section {
          border: 1px solid var(--admin-border);
          border-radius: 14px;
          background: var(--admin-surface);
          overflow: hidden;
        }

        .device-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--admin-border);
        }

        .device-section-title {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .device-section-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .device-section-title h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 720;
        }

        .device-section-title p {
          margin: 4px 0 0;
          color: var(--admin-text-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        /* ======================================================
           STATUS
        ====================================================== */

        .device-ready-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 9px;
          border: 1px solid rgba(69, 201, 130, .2);
          border-radius: 7px;
          background: rgba(69, 201, 130, .06);
          color: #4bc985;
          font-size: 11px;
          font-weight: 750;
        }

        .device-ready-status > span,
        .device-status-ready > span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        /* ======================================================
           INFORMATION
        ====================================================== */

        .device-information-list {
          display: flex;
          flex-direction: column;
        }

        .device-credential-row,
        .device-information-simple {
          min-height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--admin-border);
        }

        .device-credential-label {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 200px;
        }

        .device-credential-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          color: var(--admin-text-muted);
        }

        .device-credential-label > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .device-credential-label span {
          color: var(--admin-text);
          font-size: 13px;
          font-weight: 650;
        }

        .device-credential-label small {
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .device-value-area {
          max-width: 65%;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .device-value-area code {
          display: block;
          max-width: 100%;
          overflow-wrap: anywhere;
          color: var(--admin-text);
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;
          font-size: 12px;
          line-height: 1.5;
        }

        .device-value-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .device-value-actions button {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 1px solid var(--admin-border);
          border-radius: 7px;
          background: var(--admin-surface-subtle);
          color: var(--admin-text-muted);
          cursor: pointer;
        }

        .device-value-actions button:hover {
          color: var(--admin-accent);
          border-color: var(--admin-accent);
        }

        .device-information-simple {
          min-height: 70px;
        }

        .device-information-simple > div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .device-simple-label {
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .device-status-ready {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #4bc985;
          font-size: 13px;
          font-weight: 700;
        }

        /* ======================================================
           SECURITY
        ====================================================== */

        .device-security-note {
          display: flex;
          gap: 11px;
          margin: 18px 20px 20px;
          padding: 13px;
          border: 1px solid var(--admin-border);
          border-radius: 9px;
          background: var(--admin-surface-subtle);
        }

        .device-security-note > svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: var(--admin-accent);
        }

        .device-security-note strong {
          display: block;
          margin-bottom: 4px;
          color: var(--admin-text);
          font-size: 12px;
        }

        .device-security-note p {
          margin: 0;
          color: var(--admin-text-muted);
          font-size: 11px;
          line-height: 1.6;
        }

        /* ======================================================
           LABEL
        ====================================================== */

        .device-label-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 20px;
        }

        .device-label-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .device-label-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid var(--admin-border);
          border-radius: 9px;
          color: var(--admin-accent);
          background: var(--admin-surface-subtle);
        }

        .device-label-preview > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .device-label-preview strong {
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .device-label-preview span {
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        /* ======================================================
           EMPTY
        ====================================================== */

        .device-empty-state {
          min-height: 330px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 35px 20px;
          border: 1px dashed var(--admin-border);
          border-radius: 14px;
          background: var(--admin-surface);
          text-align: center;
        }

        .device-empty-icon {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          margin-bottom: 15px;
          border-radius: 50%;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .device-empty-state h2 {
          margin: 0;
          font-size: 17px;
        }

        .device-empty-state p {
          max-width: 450px;
          margin: 7px 0 18px;
          color: var(--admin-text-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .device-empty-button {
          border: 1px solid var(--admin-accent);
          background: var(--admin-accent);
          color: white;
        }

        /* ======================================================
           LOADING
        ====================================================== */

        .device-loading-state {
          min-height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid var(--admin-border);
          border-radius: 14px;
          background: var(--admin-surface);
          color: var(--admin-accent);
        }

        .device-loading-state strong {
          color: var(--admin-text);
          font-size: 14px;
        }

        .device-loading-state span {
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        /* ======================================================
           ANIMATION
        ====================================================== */

        .device-spin {
          animation: device-spin 1s linear infinite;
        }

        @keyframes device-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ======================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 850px) {

          .device-header {
            align-items: stretch;
            flex-direction: column;
          }

          .device-generate-button {
            width: 100%;
          }

          .device-label-content {
            align-items: stretch;
            flex-direction: column;
          }

          .device-download-button {
            width: 100%;
          }

        }

        @media (max-width: 650px) {

          .device-header h1 {
            font-size: 25px;
          }

          .device-section-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .device-ready-status {
            align-self: flex-start;
          }

          .device-credential-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .device-credential-label {
            min-width: 0;
          }

          .device-value-area {
            width: 100%;
            max-width: none;
          }

          .device-value-area code {
            flex: 1;
          }

        }

        @media (max-width: 450px) {

          .device-page {
            padding-bottom: 25px;
          }

          .device-section-header {
            padding: 15px;
          }

          .device-credential-row,
          .device-information-simple {
            padding: 14px 15px;
          }

          .device-security-note {
            margin: 15px;
          }

        }

      `}</style>
    </div>
  );
}


/* ================================================================
   CREDENTIAL ROW
================================================================ */

function CredentialRow({
  icon,
  label,
  description,
  value,
  type,
  copied,
  onCopy,
}) {
  return (
    <div className="device-credential-row">

      <div className="device-credential-label">

        <div className="device-credential-icon">
          {icon}
        </div>

        <div>

          <span>
            {label}
          </span>

          <small>
            {description}
          </small>

        </div>

      </div>

      <div className="device-value-area">

        <code>
          {value || "—"}
        </code>

        <div className="device-value-actions">

          <button
            type="button"
            onClick={() =>
              onCopy(value, type)
            }
            title="Copy"
          >
            {copied === type ? (
              <Check size={17} />
            ) : (
              <Copy size={17} />
            )}
          </button>

        </div>

      </div>

    </div>
  );
}