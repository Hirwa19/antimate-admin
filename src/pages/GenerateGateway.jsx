import { useState } from "react";
import QRCode from "react-qr-code";

import {
  Copy,
  Check,
  QrCode,
  KeyRound,
  Router,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

export default function GenerateGateway() {
  const { language } = useAppSettings();

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [gateway, setGateway] = useState(null);

  const [copied, setCopied] = useState("");
  const [showKey, setShowKey] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRw = language === "rw";

  /* ============================================================
     GENERATE GATEWAY
  ============================================================ */

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setCopied("");
      setShowKey(false);

      const res = await api.post("/gateway/generate");

      const generatedGateway = res?.data?.data;

      if (!generatedGateway) {
        throw new Error(
          isRw
            ? "Gateway ntiyagarutse neza muri server."
            : "Gateway data was not returned by the server."
        );
      }

      setGateway(generatedGateway);

      setSuccess(
        isRw
          ? "Gateway yakozwe neza."
          : "Gateway credentials generated successfully."
      );
    } catch (err) {
      console.error(
        "Gateway generation error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          (isRw
            ? "Kurema Gateway byanze. Ongera ugerageze."
            : "Failed to generate gateway credentials. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     COPY
  ============================================================ */

  const copyText = async (value, type) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch (err) {
      console.error("Copy failed:", err);

      setError(
        isRw
          ? "Copy yanze kuri iyi browser."
          : "Copy failed on this browser."
      );
    }
  };

  /* ============================================================
     DOWNLOAD PDF
  ============================================================ */

  const downloadPDF = async () => {
    if (!gateway?._id) return;

    try {
      setPdfLoading(true);
      setError("");

      const response = await api.get(
        `/gateway/${gateway._id}/pdf`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download =
        `${gateway.gatewayId || "gateway"}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "PDF download error:",
        err.response?.data || err.message
      );

      setError(
        isRw
          ? "PDF download yanze. Ongera ugerageze."
          : "PDF download failed. Please try again."
      );
    } finally {
      setPdfLoading(false);
    }
  };

  /* ============================================================
     QR DATA
  ============================================================ */

  const qrData = gateway
    ? JSON.stringify({
        gatewayId: gateway.gatewayId,
        qrToken: gateway.qrToken,
      })
    : "";

  /* ============================================================
     MASK KEY
  ============================================================ */

  const maskedKey = gateway?.defaultKey
    ? "••••••••••••••••••••••••••••••••"
    : "—";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="gateway-page">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="gateway-header">

        <div className="gateway-header-text">

          <div className="gateway-breadcrumb">
            <Router size={14} />

            <span>
              {isRw
                ? "Administration"
                : "Administration"}
            </span>

            <span>/</span>

            <span>
              {isRw
                ? "Kora Gateway"
                : "Generate Gateway"}
            </span>
          </div>

          <h1>
            {isRw
              ? "Kora Gateway"
              : "Generate Gateway"}
          </h1>

          <p>
            {isRw
              ? "Kora identity na credentials byize bya ANTIMATE Gateway."
              : "Create a secure identity and credentials for an ANTIMATE Gateway."}
          </p>

        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="gateway-generate-button"
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? "gateway-spin"
                : ""
            }
          />

          <span>
            {loading
              ? isRw
                ? "Birakorwa..."
                : "Generating..."
              : isRw
                ? "Kora Gateway"
                : "Generate Gateway"}
          </span>
        </button>

      </header>

      {/* ========================================================
          FEEDBACK
      ======================================================== */}

      {error && (
        <div className="gateway-alert gateway-alert-error">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="gateway-alert gateway-alert-success">
          <CheckCircle2 size={18} />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================
          GENERATED GATEWAY
      ======================================================== */}

      {gateway && (
        <div className="gateway-workspace">

          {/* ====================================================
              MAIN INFORMATION
          ==================================================== */}

          <section className="gateway-section">

            <div className="gateway-section-header">

              <div className="gateway-section-title">

                <div className="gateway-section-icon">
                  <Router size={19} />
                </div>

                <div>
                  <h2>
                    {isRw
                      ? "Gateway Information"
                      : "Gateway Information"}
                  </h2>

                  <p>
                    {isRw
                      ? "Identity na credentials bya Gateway yakozwe."
                      : "Identity and credentials generated for this gateway."}
                  </p>
                </div>

              </div>

              <span className="gateway-ready-status">
                <span />
                READY
              </span>

            </div>

            <div className="gateway-information-list">

              {/* Gateway ID */}

              <CredentialRow
                label="Gateway ID"
                value={gateway.gatewayId}
                type="gateway-id"
                copied={copied}
                onCopy={copyText}
              />

              {/* Default Key */}

              <div className="gateway-credential-row">

                <div className="gateway-credential-label">

                  <div className="gateway-credential-icon">
                    <KeyRound size={16} />
                  </div>

                  <div>
                    <span>
                      {isRw
                        ? "Gateway Default Key"
                        : "Gateway Default Key"}
                    </span>

                    <small>
                      {isRw
                        ? "Secret key ikoreshwa mu gutangira Gateway."
                        : "Secret key used during gateway provisioning."}
                    </small>
                  </div>

                </div>

                <div className="gateway-value-area">

                  <code>
                    {showKey
                      ? gateway.defaultKey || "—"
                      : maskedKey}
                  </code>

                  <div className="gateway-value-actions">

                    <button
                      type="button"
                      onClick={() =>
                        setShowKey(
                          (previous) => !previous
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
                          gateway.defaultKey,
                          "gateway-key"
                        )
                      }
                      title="Copy"
                    >
                      {copied === "gateway-key" ? (
                        <Check size={17} />
                      ) : (
                        <Copy size={17} />
                      )}
                    </button>

                  </div>

                </div>

              </div>

              {/* Status */}

              <div className="gateway-information-simple">

                <div>
                  <span className="gateway-simple-label">
                    {isRw ? "Status" : "Status"}
                  </span>

                  <span className="gateway-simple-value gateway-status-ready">
                    <span />
                    READY
                  </span>
                </div>

              </div>

            </div>

            {/* Security note */}

            <div className="gateway-security-note">

              <ShieldCheck size={19} />

              <div>
                <strong>
                  {isRw
                    ? "Bika credentials neza"
                    : "Protect these credentials"}
                </strong>

                <p>
                  {isRw
                    ? "Default Key ni secret. Ntuyisangize umuntu utabifitiye ububasha kandi uyibike ahantu hizewe."
                    : "The Default Key is a secret credential. Do not share it with unauthorized people and store it securely."}
                </p>
              </div>

            </div>

          </section>

          {/* ====================================================
              QR SECTION
          ==================================================== */}

          <section className="gateway-section gateway-qr-section">

            <div className="gateway-section-header">

              <div className="gateway-section-title">

                <div className="gateway-section-icon">
                  <QrCode size={19} />
                </div>

                <div>
                  <h2>
                    {isRw
                      ? "Provisioning QR"
                      : "Provisioning QR"}
                  </h2>

                  <p>
                    {isRw
                      ? "QR code ikoreshwa mu guhuza Gateway na ANTIMATE."
                      : "Use this QR code to provision the gateway."}
                  </p>
                </div>

              </div>

            </div>

            <div className="gateway-qr-content">

              <div className="gateway-qr-box">
                <QRCode
                  value={qrData}
                  size={190}
                  bgColor="#ffffff"
                  fgColor="#111111"
                />
              </div>

              <div className="gateway-qr-description">

                <div className="gateway-qr-token-title">
                  <KeyRound size={16} />

                  <span>
                    {isRw
                      ? "QR Token"
                      : "QR Token"}
                  </span>
                </div>

                <p>
                  {isRw
                    ? "Scan iyi QR code ukoresheje uburyo bwa ANTIMATE bwo kwinjiza Gateway."
                    : "Scan this QR code using the ANTIMATE provisioning workflow to configure the gateway."}
                </p>

                <div className="gateway-qr-actions">

                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        qrData,
                        "qr-data"
                      )
                    }
                    className="gateway-secondary-button"
                  >
                    {copied === "qr-data" ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}

                    {copied === "qr-data"
                      ? isRw
                        ? "Byakopiwe"
                        : "Copied"
                      : isRw
                        ? "Kopa QR data"
                        : "Copy QR data"}
                  </button>

                  <button
                    type="button"
                    onClick={downloadPDF}
                    disabled={pdfLoading}
                    className="gateway-primary-button"
                  >
                    <Download
                      size={16}
                      className={
                        pdfLoading
                          ? "gateway-spin"
                          : ""
                      }
                    />

                    {pdfLoading
                      ? isRw
                        ? "Irakurura..."
                        : "Downloading..."
                      : isRw
                        ? "Download PDF"
                        : "Download PDF"}
                  </button>

                </div>

              </div>

            </div>

          </section>

        </div>
      )}

      {/* ========================================================
          EMPTY STATE
      ======================================================== */}

      {!gateway && !loading && (
        <section className="gateway-empty-state">

          <div className="gateway-empty-icon">
            <KeyRound size={31} />
          </div>

          <h2>
            {isRw
              ? "Nta Gateway irakorwa"
              : "No gateway generated"}
          </h2>

          <p>
            {isRw
              ? "Kanda kuri “Kora Gateway” kugirango ukore Gateway identity na credentials nshya."
              : "Click “Generate Gateway” to create a new gateway identity and credentials."}
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="gateway-empty-button"
          >
            <RefreshCw size={17} />

            {isRw
              ? "Kora Gateway"
              : "Generate Gateway"}
          </button>

        </section>
      )}

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <section className="gateway-loading-state">

          <RefreshCw
            size={28}
            className="gateway-spin"
          />

          <strong>
            {isRw
              ? "Turimo gukora Gateway..."
              : "Generating gateway credentials..."}
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

        .gateway-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 4px 0 40px;
          color: var(--admin-text);
        }

        /* ======================================================
           HEADER
        ====================================================== */

        .gateway-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .gateway-header-text {
          min-width: 0;
        }

        .gateway-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 9px;
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .gateway-header h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1.2;
          font-weight: 760;
          letter-spacing: -.5px;
        }

        .gateway-header p {
          margin: 7px 0 0;
          color: var(--admin-text-muted);
          font-size: 14px;
          line-height: 1.55;
        }

        /* ======================================================
           BUTTONS
        ====================================================== */

        .gateway-generate-button {
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

        .gateway-generate-button:hover {
          opacity: .91;
          transform: translateY(-1px);
        }

        .gateway-generate-button:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .gateway-primary-button,
        .gateway-secondary-button,
        .gateway-empty-button {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 13px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 650;
          transition: .18s ease;
        }

        .gateway-primary-button {
          border: 1px solid var(--admin-accent);
          background: var(--admin-accent);
          color: white;
        }

        .gateway-primary-button:hover {
          opacity: .9;
        }

        .gateway-primary-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .gateway-secondary-button {
          border: 1px solid var(--admin-border);
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
        }

        .gateway-secondary-button:hover {
          border-color: var(--admin-border-strong);
        }

        /* ======================================================
           ALERTS
        ====================================================== */

        .gateway-alert {
          min-height: 46px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 0 13px;
          border-radius: 9px;
          font-size: 13px;
        }

        .gateway-alert span {
          flex: 1;
        }

        .gateway-alert button {
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 20px;
        }

        .gateway-alert-error {
          border: 1px solid rgba(239, 107, 107, .25);
          background: rgba(239, 107, 107, .06);
          color: #ef8585;
        }

        .gateway-alert-success {
          border: 1px solid rgba(69, 201, 130, .25);
          background: rgba(69, 201, 130, .06);
          color: #55ca88;
        }

        /* ======================================================
           WORKSPACE
        ====================================================== */

        .gateway-workspace {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .gateway-section {
          border: 1px solid var(--admin-border);
          border-radius: 14px;
          background: var(--admin-surface);
          overflow: hidden;
        }

        .gateway-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--admin-border);
        }

        .gateway-section-title {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .gateway-section-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .gateway-section-title h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 720;
        }

        .gateway-section-title p {
          margin: 4px 0 0;
          color: var(--admin-text-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        /* ======================================================
           READY STATUS
        ====================================================== */

        .gateway-ready-status {
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

        .gateway-ready-status > span,
        .gateway-status-ready > span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        /* ======================================================
           INFORMATION
        ====================================================== */

        .gateway-information-list {
          display: flex;
          flex-direction: column;
        }

        .gateway-credential-row,
        .gateway-information-simple {
          min-height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--admin-border);
        }

        .gateway-credential-label {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 190px;
        }

        .gateway-credential-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          color: var(--admin-text-muted);
        }

        .gateway-credential-label > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .gateway-credential-label span {
          color: var(--admin-text);
          font-size: 13px;
          font-weight: 650;
        }

        .gateway-credential-label small {
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .gateway-value-area {
          max-width: 65%;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gateway-value-area code {
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

        .gateway-value-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .gateway-value-actions button {
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

        .gateway-value-actions button:hover {
          color: var(--admin-accent);
          border-color: var(--admin-accent);
        }

        .gateway-information-simple {
          min-height: 70px;
        }

        .gateway-information-simple > div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gateway-simple-label {
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .gateway-simple-value {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #4bc985;
          font-size: 13px;
          font-weight: 700;
        }

        /* ======================================================
           SECURITY NOTE
        ====================================================== */

        .gateway-security-note {
          display: flex;
          gap: 11px;
          margin: 18px 20px 20px;
          padding: 13px;
          border: 1px solid var(--admin-border);
          border-radius: 9px;
          background: var(--admin-surface-subtle);
        }

        .gateway-security-note > svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: var(--admin-accent);
        }

        .gateway-security-note strong {
          display: block;
          margin-bottom: 4px;
          color: var(--admin-text);
          font-size: 12px;
        }

        .gateway-security-note p {
          margin: 0;
          color: var(--admin-text-muted);
          font-size: 11px;
          line-height: 1.6;
        }

        /* ======================================================
           QR
        ====================================================== */

        .gateway-qr-content {
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 25px 20px;
        }

        .gateway-qr-box {
          width: 230px;
          height: 230px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          padding: 18px;
          border: 1px solid var(--admin-border);
          border-radius: 12px;
          background: white;
        }

        .gateway-qr-description {
          max-width: 560px;
        }

        .gateway-qr-token-title {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--admin-accent);
          font-size: 14px;
          font-weight: 700;
        }

        .gateway-qr-description p {
          margin: 8px 0 18px;
          color: var(--admin-text-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .gateway-qr-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        /* ======================================================
           EMPTY STATE
        ====================================================== */

        .gateway-empty-state {
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

        .gateway-empty-icon {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          margin-bottom: 15px;
          border-radius: 50%;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .gateway-empty-state h2 {
          margin: 0;
          font-size: 17px;
        }

        .gateway-empty-state p {
          max-width: 450px;
          margin: 7px 0 18px;
          color: var(--admin-text-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .gateway-empty-button {
          border: 1px solid var(--admin-accent);
          background: var(--admin-accent);
          color: white;
        }

        /* ======================================================
           LOADING
        ====================================================== */

        .gateway-loading-state {
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

        .gateway-loading-state strong {
          color: var(--admin-text);
          font-size: 14px;
        }

        .gateway-loading-state span {
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        /* ======================================================
           ANIMATION
        ====================================================== */

        .gateway-spin {
          animation: gateway-spin 1s linear infinite;
        }

        @keyframes gateway-spin {
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

          .gateway-header {
            align-items: stretch;
            flex-direction: column;
          }

          .gateway-generate-button {
            width: 100%;
          }

          .gateway-qr-content {
            align-items: center;
            flex-direction: column;
            text-align: center;
          }

          .gateway-qr-description {
            max-width: 600px;
          }

          .gateway-qr-token-title {
            justify-content: center;
          }

          .gateway-qr-actions {
            justify-content: center;
          }

        }

        @media (max-width: 650px) {

          .gateway-header h1 {
            font-size: 25px;
          }

          .gateway-section-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .gateway-ready-status {
            align-self: flex-start;
          }

          .gateway-credential-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .gateway-credential-label {
            min-width: 0;
          }

          .gateway-value-area {
            width: 100%;
            max-width: none;
          }

          .gateway-value-area code {
            flex: 1;
          }

          .gateway-information-simple {
            align-items: flex-start;
          }

          .gateway-qr-box {
            width: 210px;
            height: 210px;
          }

        }

        @media (max-width: 450px) {

          .gateway-page {
            padding-bottom: 25px;
          }

          .gateway-section-header {
            padding: 15px;
          }

          .gateway-credential-row,
          .gateway-information-simple {
            padding: 14px 15px;
          }

          .gateway-security-note {
            margin: 15px;
          }

          .gateway-qr-content {
            padding: 20px 15px;
          }

          .gateway-qr-box {
            width: 190px;
            height: 190px;
          }

          .gateway-qr-actions {
            width: 100%;
            flex-direction: column;
          }

          .gateway-primary-button,
          .gateway-secondary-button {
            width: 100%;
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
  label,
  value,
  type,
  copied,
  onCopy,
}) {
  return (
    <div className="gateway-credential-row">

      <div className="gateway-credential-label">

        <div className="gateway-credential-icon">
          <Router size={16} />
        </div>

        <div>
          <span>{label}</span>

          <small>
            Unique identifier for this gateway.
          </small>
        </div>

      </div>

      <div className="gateway-value-area">

        <code>
          {value || "—"}
        </code>

        <div className="gateway-value-actions">

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