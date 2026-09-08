import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Smartphone,
  X,
  XCircle,
} from "lucide-react";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

export default function Devices() {
  const { language } = useAppSettings();
  const rw = language === "rw";

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [copied, setCopied] = useState("");

  const text = {
    title: rw ? "BR Systems / Devices" : "BR Systems / Devices",
    subtitle: rw
      ? "Genzura kandi ucunge devices za ANTIMATE."
      : "Manage and monitor ANTIMATE devices.",

    generate: rw ? "Generate Device Nshya" : "Generate New Device",
    generating: rw ? "Birimo gukorwa..." : "Generating...",

    refresh: rw ? "Refresh" : "Refresh",
    search: rw ? "Shakisha device..." : "Search devices...",

    all: rw ? "Zose" : "All",
    active: rw ? "Activated" : "Activated",
    inactive: rw ? "Inactive" : "Inactive",
    pending: rw ? "Pending" : "Pending",

    deviceId: "Device ID",
    status: rw ? "Status" : "Status",
    owner: rw ? "Nyirayo" : "Owner",
    created: rw ? "Yakozwe" : "Created",
    lastSeen: rw ? "Last seen" : "Last seen",
    label: rw ? "Label" : "Label",
    action: rw ? "Action" : "Action",

    noDevices: rw ? "Nta devices zabonetse." : "No devices found.",
    loading: rw ? "Birimo gufunguka..." : "Loading devices...",

    details: rw ? "Device Details" : "Device Details",
    close: rw ? "Funga" : "Close",
    copy: rw ? "Copy" : "Copy",
    copied: rw ? "Byakoporowe" : "Copied",

    download: rw ? "Download PDF" : "Download PDF",

    notAssigned: rw ? "Ntabwo yashyizwe kuri user" : "Not assigned",

    generated: rw
      ? "Device yakozwe neza."
      : "Device generated successfully.",

    generationFailed: rw
      ? "Device ntiyashoboye gukorwa."
      : "Device generation failed.",

    loadFailed: rw
      ? "Devices ntizashoboye gufunguka."
      : "Failed to load devices.",

    sort: rw ? "Sort" : "Sort",
    newest: rw ? "Nshya mbere" : "Newest first",
    oldest: rw ? "Zishaje mbere" : "Oldest first",
    idAsc: rw ? "Device ID A-Z" : "Device ID A-Z",
    idDesc: rw ? "Device ID Z-A" : "Device ID Z-A",

    deviceCount: rw ? "devices" : "devices",
    activeDevices: rw ? "activated" : "activated",
  };

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/devices/my-devices");

      console.log("DEVICES:", res.data);

      const data =
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.devices)
          ? res.data.devices
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setDevices(data);
    } catch (err) {
      console.error("LOAD DEVICES ERROR:", err);

      setError(
        err.response?.data?.message ||
          text.loadFailed
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateDevice() {
    try {
      setGenerating(true);
      setError("");
      setSuccess("");

      const res = await api.post("/devices/register", {});

      console.log("NEW DEVICE:", res.data);

      setSuccess(text.generated);

      await loadDevices();
    } catch (err) {
      console.error(
        "GENERATE DEVICE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          text.generationFailed
      );
    } finally {
      setGenerating(false);
    }
  }

  async function downloadLabel(device) {
    if (!device?.deviceId) return;

    try {
      setPdfLoading(device.deviceId);
      setError("");

      const res = await api.get(
        `/devices/label/${device.deviceId}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `${device.deviceId}-label.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF DOWNLOAD ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to download PDF."
      );
    } finally {
      setPdfLoading(null);
    }
  }

  async function copyValue(value, type) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (err) {
      console.error("COPY ERROR:", err);
    }
  }

  function normalizeStatus(device) {
    const raw =
      device?.activationStatus ||
      device?.status ||
      device?.state ||
      "";

    return String(raw).toLowerCase();
  }

  function getStatusLabel(device) {
    const status = normalizeStatus(device);

    if (
      status.includes("active") ||
      status.includes("activated") ||
      status.includes("online")
    ) {
      return "ACTIVE";
    }

    if (
      status.includes("pending") ||
      status.includes("waiting")
    ) {
      return "PENDING";
    }

    return "INACTIVE";
  }

  function getStatusClass(device) {
    const status = getStatusLabel(device);

    if (status === "ACTIVE") return "device-status active";
    if (status === "PENDING") return "device-status pending";

    return "device-status inactive";
  }

  function getOwner(device) {
    if (!device) return text.notAssigned;

    if (typeof device.owner === "string") {
      return device.owner || text.notAssigned;
    }

    if (device.owner?.name) {
      return device.owner.name;
    }

    if (device.owner?.fullName) {
      return device.owner.fullName;
    }

    if (device.owner?.email) {
      return device.owner.email;
    }

    if (device.user?.name) {
      return device.user.name;
    }

    if (device.user?.email) {
      return device.user.email;
    }

    return text.notAssigned;
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(
      rw ? "rw-RW" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  const filteredDevices = useMemo(() => {
    let result = [...devices];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((device) => {
        const deviceId =
          String(device?.deviceId || "").toLowerCase();

        const owner =
          String(getOwner(device) || "").toLowerCase();

        const status =
          String(
            device?.activationStatus ||
              device?.status ||
              ""
          ).toLowerCase();

        return (
          deviceId.includes(query) ||
          owner.includes(query) ||
          status.includes(query)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((device) => {
        return (
          getStatusLabel(device).toLowerCase() ===
          statusFilter
        );
      });
    }

    result.sort((a, b) => {
      if (sortBy === "idAsc") {
        return String(a.deviceId || "").localeCompare(
          String(b.deviceId || "")
        );
      }

      if (sortBy === "idDesc") {
        return String(b.deviceId || "").localeCompare(
          String(a.deviceId || "")
        );
      }

      const dateA = new Date(
        a.createdAt || a.created || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || b.created || 0
      ).getTime();

      if (sortBy === "oldest") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });

    return result;
  }, [devices, search, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const active = devices.filter(
      (device) => getStatusLabel(device) === "ACTIVE"
    ).length;

    const pending = devices.filter(
      (device) => getStatusLabel(device) === "PENDING"
    ).length;

    const inactive = devices.length - active - pending;

    return {
      total: devices.length,
      active,
      pending,
      inactive,
    };
  }, [devices]);

  return (
    <>
      <div className="devices-page">
        <div className="devices-header">
          <div>
            <div className="page-kicker">
              <Smartphone size={15} />
              ANTIMATE EDGE
            </div>

            <h1>{text.title}</h1>

            <p>{text.subtitle}</p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={loadDevices}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "spin" : ""}
              />
              {text.refresh}
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={generateDevice}
              disabled={generating}
            >
              <Plus size={18} />

              {generating
                ? text.generating
                : text.generate}
            </button>
          </div>
        </div>

        <div className="device-summary">
          <SummaryItem
            label={rw ? "Total" : "Total"}
            value={stats.total}
          />

          <SummaryItem
            label={text.active}
            value={stats.active}
            status="active"
          />

          <SummaryItem
            label={text.pending}
            value={stats.pending}
            status="pending"
          />

          <SummaryItem
            label={text.inactive}
            value={stats.inactive}
            status="inactive"
          />
        </div>

        {success && (
          <div className="message success-message">
            <Check size={18} />
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="message error-message">
            <XCircle size={18} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="devices-toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder={text.search}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="clear-search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="toolbar-right">
            <div className="filter-group">
              {[
                ["all", text.all],
                ["active", text.active],
                ["pending", text.pending],
                ["inactive", text.inactive],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={
                    statusFilter === value
                      ? "filter-button selected"
                      : "filter-button"
                  }
                  onClick={() =>
                    setStatusFilter(value)
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="sort-select">
              <span>{text.sort}</span>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="newest">
                  {text.newest}
                </option>

                <option value="oldest">
                  {text.oldest}
                </option>

                <option value="idAsc">
                  {text.idAsc}
                </option>

                <option value="idDesc">
                  {text.idDesc}
                </option>
              </select>

              <ChevronDown size={15} />
            </label>
          </div>
        </div>

        <div className="devices-list">
          <div className="devices-list-header">
            <span>{text.deviceId}</span>
            <span>{text.status}</span>
            <span>{text.owner}</span>
            <span>{text.created}</span>
            <span>{text.lastSeen}</span>
            <span>{text.action}</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw
                size={24}
                className="spin"
              />

              <p>{text.loading}</p>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="empty-state">
              <Smartphone size={30} />

              <h3>{text.noDevices}</h3>

              <p>
                {search || statusFilter !== "all"
                  ? rw
                    ? "Gerageza guhindura search cyangwa filter."
                    : "Try changing your search or filter."
                  : rw
                  ? "Nta device iraboneka kuri ubu."
                  : "There are no devices available yet."}
              </p>
            </div>
          ) : (
            filteredDevices.map((device) => (
              <div
                className="device-row"
                key={
                  device._id ||
                  device.deviceId
                }
              >
                <button
                  type="button"
                  className="device-id-button"
                  onClick={() =>
                    setSelectedDevice(device)
                  }
                >
                  <span className="device-icon">
                    <Smartphone size={17} />
                  </span>

                  <span>
                    {device.deviceId || "—"}
                  </span>
                </button>

                <div>
                  <span className={getStatusClass(device)}>
                    <span className="status-dot" />
                    {getStatusLabel(device)}
                  </span>
                </div>

                <div className="owner-cell">
                  {getOwner(device)}
                </div>

                <div className="date-cell">
                  {formatDate(
                    device.createdAt ||
                      device.created
                  )}
                </div>

                <div className="date-cell">
                  {formatDate(
                    device.lastSeen ||
                      device.lastSeenAt ||
                      device.updatedAt
                  )}
                </div>

                <div className="row-actions">
                  <button
                    type="button"
                    title={text.details}
                    onClick={() =>
                      setSelectedDevice(device)
                    }
                  >
                    <FileText size={17} />
                  </button>

                  <button
                    type="button"
                    title={text.download}
                    onClick={() =>
                      downloadLabel(device)
                    }
                    disabled={
                      pdfLoading === device.deviceId
                    }
                  >
                    {pdfLoading ===
                    device.deviceId ? (
                      <RefreshCw
                        size={17}
                        className="spin"
                      />
                    ) : (
                      <Download size={17} />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading &&
          filteredDevices.length > 0 && (
            <div className="devices-footer">
              <span>
                {filteredDevices.length}{" "}
                {text.deviceCount}
              </span>

              {filteredDevices.length !==
                devices.length && (
                <span>
                  {rw
                    ? `muri ${devices.length} zose`
                    : `of ${devices.length} total`}
                </span>
              )}
            </div>
          )}
      </div>

      {selectedDevice && (
        <DeviceDetails
          device={selectedDevice}
          rw={rw}
          text={text}
          copied={copied}
          onCopy={copyValue}
          onDownload={downloadLabel}
          onClose={() =>
            setSelectedDevice(null)
          }
          pdfLoading={pdfLoading}
          getOwner={getOwner}
          getStatusClass={getStatusClass}
          getStatusLabel={getStatusLabel}
          formatDate={formatDate}
        />
      )}

      <style>{`
        .devices-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          color: var(--admin-text);
        }

        .devices-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .page-kicker {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--admin-accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .12em;
          margin-bottom: 8px;
        }

        .devices-header h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.15;
          letter-spacing: -.03em;
        }

        .devices-header p {
          margin: 8px 0 0;
          color: var(--admin-text-muted);
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .primary-button,
        .secondary-button {
          height: 42px;
          border-radius: 10px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: .18s ease;
        }

        .primary-button {
          border: 1px solid var(--admin-accent);
          background: var(--admin-accent);
          color: #fff;
        }

        .primary-button:hover {
          filter: brightness(1.08);
        }

        .secondary-button {
          border: 1px solid var(--admin-border);
          background: var(--admin-surface);
          color: var(--admin-text);
        }

        .secondary-button:hover {
          background: var(--admin-surface-subtle);
        }

        .primary-button:disabled,
        .secondary-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .device-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border: 1px solid var(--admin-border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--admin-surface);
          margin-bottom: 20px;
        }

        .summary-item {
          min-height: 86px;
          padding: 18px 20px;
          border-right: 1px solid var(--admin-border);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .summary-item:last-child {
          border-right: 0;
        }

        .summary-label {
          color: var(--admin-text-muted);
          font-size: 12px;
          margin-bottom: 5px;
        }

        .summary-value {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -.03em;
        }

        .summary-item.active .summary-value {
          color: #22c55e;
        }

        .summary-item.pending .summary-value {
          color: #f59e0b;
        }

        .summary-item.inactive .summary-value {
          color: #ef4444;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 46px;
          border-radius: 10px;
          padding: 10px 13px;
          margin-bottom: 15px;
          font-size: 13px;
        }

        .message span {
          flex: 1;
        }

        .message button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .success-message {
          background: rgba(34,197,94,.10);
          border: 1px solid rgba(34,197,94,.25);
          color: #4ade80;
        }

        .error-message {
          background: rgba(239,68,68,.10);
          border: 1px solid rgba(239,68,68,.25);
          color: #f87171;
        }

        .devices-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .search-box {
          width: min(390px, 100%);
          height: 42px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          background: var(--admin-surface);
          color: var(--admin-text-muted);
        }

        .search-box input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--admin-text);
          font-size: 13px;
        }

        .search-box input::placeholder {
          color: var(--admin-text-muted);
        }

        .clear-search {
          border: 0;
          background: transparent;
          color: var(--admin-text-muted);
          cursor: pointer;
          display: flex;
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          overflow: hidden;
          background: var(--admin-surface);
        }

        .filter-button {
          border: 0;
          border-right: 1px solid var(--admin-border);
          background: transparent;
          color: var(--admin-text-muted);
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .filter-button:last-child {
          border-right: 0;
        }

        .filter-button:hover,
        .filter-button.selected {
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
        }

        .filter-button.selected {
          color: var(--admin-accent);
        }

        .sort-select {
          position: relative;
          height: 42px;
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          padding: 0 10px;
          background: var(--admin-surface);
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .sort-select select {
          appearance: none;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--admin-text);
          font-size: 12px;
          font-weight: 700;
          padding-right: 16px;
          cursor: pointer;
        }

        .sort-select option {
          background: var(--admin-surface);
          color: var(--admin-text);
        }

        .sort-select svg {
          pointer-events: none;
          position: absolute;
          right: 8px;
        }

        .devices-list {
          width: 100%;
          border: 1px solid var(--admin-border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--admin-surface);
        }

        .devices-list-header,
        .device-row {
          display: grid;
          grid-template-columns:
            minmax(190px, 1.35fr)
            minmax(110px, .7fr)
            minmax(170px, 1fr)
            minmax(120px, .75fr)
            minmax(120px, .75fr)
            90px;
          gap: 14px;
          align-items: center;
          padding: 0 18px;
        }

        .devices-list-header {
          min-height: 44px;
          background: var(--admin-surface-subtle);
          border-bottom: 1px solid var(--admin-border);
          color: var(--admin-text-muted);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .07em;
        }

        .device-row {
          min-height: 68px;
          border-bottom: 1px solid var(--admin-border);
          transition: background .15s ease;
        }

        .device-row:last-child {
          border-bottom: 0;
        }

        .device-row:hover {
          background: var(--admin-surface-subtle);
        }

        .device-id-button {
          border: 0;
          background: transparent;
          padding: 0;
          color: var(--admin-text);
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-align: left;
          font-weight: 750;
          min-width: 0;
        }

        .device-id-button:hover {
          color: var(--admin-accent);
        }

        .device-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
          flex-shrink: 0;
        }

        .device-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .04em;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
        }

        .device-status.active {
          color: #22c55e;
        }

        .device-status.active .status-dot {
          background: #22c55e;
        }

        .device-status.pending {
          color: #f59e0b;
        }

        .device-status.pending .status-dot {
          background: #f59e0b;
        }

        .device-status.inactive {
          color: #ef4444;
        }

        .device-status.inactive .status-dot {
          background: #ef4444;
        }

        .owner-cell,
        .date-cell {
          color: var(--admin-text-muted);
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .row-actions {
          display: flex;
          justify-content: flex-end;
          gap: 5px;
        }

        .row-actions button {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: transparent;
          color: var(--admin-text-muted);
          cursor: pointer;
        }

        .row-actions button:hover {
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
        }

        .row-actions button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .empty-state {
          min-height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
          color: var(--admin-text-muted);
          text-align: center;
        }

        .empty-state h3 {
          margin: 2px 0 0;
          color: var(--admin-text);
          font-size: 15px;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        .devices-footer {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 11px 3px 0;
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .spin {
          animation: device-spin .9s linear infinite;
        }

        @keyframes device-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1100px) {
          .devices-list-header {
            display: none;
          }

          .device-row {
            grid-template-columns:
              minmax(190px, 1.4fr)
              minmax(110px, .7fr)
              minmax(150px, 1fr)
              90px;
            padding: 15px;
          }

          .device-row > div:nth-child(4),
          .device-row > div:nth-child(5) {
            display: none;
          }
        }

        @media (max-width: 800px) {
          .devices-header {
            align-items: stretch;
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }

          .device-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .summary-item:nth-child(2) {
            border-right: 0;
          }

          .summary-item:nth-child(-n+2) {
            border-bottom: 1px solid var(--admin-border);
          }

          .devices-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            width: 100%;
          }

          .toolbar-right {
            justify-content: space-between;
            flex-wrap: wrap;
          }

          .filter-group {
            max-width: 100%;
            overflow-x: auto;
          }
        }

        @media (max-width: 580px) {
          .devices-header h1 {
            font-size: 25px;
          }

          .header-actions {
            flex-direction: column;
          }

          .toolbar-right {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            width: 100%;
          }

          .filter-button {
            flex: 1;
            padding: 10px 7px;
          }

          .sort-select {
            width: 100%;
            justify-content: space-between;
          }

          .device-row {
            grid-template-columns: 1fr auto;
            gap: 10px;
          }

          .device-row > div:nth-child(2) {
            justify-self: end;
          }

          .owner-cell,
          .date-cell {
            display: none;
          }

          .row-actions {
            justify-content: flex-start;
          }

          .device-row .row-actions {
            grid-column: 1 / -1;
            border-top: 1px solid var(--admin-border);
            padding-top: 9px;
          }
        }
      `}</style>
    </>
  );
}

function SummaryItem({ label, value, status }) {
  return (
    <div
      className={`summary-item ${
        status || ""
      }`}
    >
      <span className="summary-label">
        {label}
      </span>

      <span className="summary-value">
        {value}
      </span>
    </div>
  );
}

function DeviceDetails({
  device,
  rw,
  text,
  copied,
  onCopy,
  onDownload,
  onClose,
  pdfLoading,
  getOwner,
  getStatusClass,
  getStatusLabel,
  formatDate,
}) {
  const deviceId = device?.deviceId || "—";

  const secretKey =
    device?.secretKey ||
    device?.defaultKey ||
    device?.key ||
    null;

  const qrToken =
    device?.qrToken ||
    device?.token ||
    null;

  return (
    <>
      <div
        className="device-modal-overlay"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }}
      >
        <div className="device-modal">
          <div className="device-modal-header">
            <div>
              <div className="device-modal-kicker">
                {rw
                  ? "DEVICE INFORMATION"
                  : "DEVICE INFORMATION"}
              </div>

              <h2>{deviceId}</h2>
            </div>

            <button
              type="button"
              className="modal-close"
              onClick={onClose}
            >
              <X size={19} />
            </button>
          </div>

          <div className="device-modal-body">
            <div className="detail-line">
              <span>
                {text.status}
              </span>

              <span
                className={getStatusClass(
                  device
                )}
              >
                <span className="status-dot" />
                {getStatusLabel(device)}
              </span>
            </div>

            <div className="detail-line">
              <span>
                {text.owner}
              </span>

              <strong>
                {getOwner(device)}
              </strong>
            </div>

            <div className="detail-line">
              <span>
                {text.created}
              </span>

              <strong>
                {formatDate(
                  device.createdAt ||
                    device.created
                )}
              </strong>
            </div>

            <div className="detail-line">
              <span>
                {text.lastSeen}
              </span>

              <strong>
                {formatDate(
                  device.lastSeen ||
                    device.lastSeenAt ||
                    device.updatedAt
                )}
              </strong>
            </div>

            {secretKey && (
              <CredentialRow
                label={
                  rw
                    ? "Secret Key"
                    : "Secret Key"
                }
                value={secretKey}
                copyKey="secretKey"
                copied={copied}
                onCopy={onCopy}
              />
            )}

            {qrToken && (
              <CredentialRow
                label="QR Token"
                value={qrToken}
                copyKey="qrToken"
                copied={copied}
                onCopy={onCopy}
              />
            )}
          </div>

          <div className="device-modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              {text.close}
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                onDownload(device)
              }
              disabled={
                pdfLoading === device.deviceId
              }
            >
              {pdfLoading ===
              device.deviceId ? (
                <RefreshCw
                  size={17}
                  className="spin"
                />
              ) : (
                <Download size={17} />
              )}

              {text.download}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .device-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,.68);
          backdrop-filter: blur(5px);
        }

        .device-modal {
          width: min(620px, 100%);
          max-height: min(760px, 90vh);
          overflow: auto;
          border: 1px solid var(--admin-border);
          border-radius: 14px;
          background: var(--admin-surface);
          color: var(--admin-text);
          box-shadow: 0 25px 80px rgba(0,0,0,.35);
        }

        .device-modal-header {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 22px;
          border-bottom: 1px solid var(--admin-border);
        }

        .device-modal-kicker {
          color: var(--admin-accent);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
          margin-bottom: 6px;
        }

        .device-modal-header h2 {
          margin: 0;
          font-size: 21px;
          word-break: break-word;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          border: 1px solid var(--admin-border);
          background: transparent;
          color: var(--admin-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .modal-close:hover {
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
        }

        .device-modal-body {
          padding: 7px 22px;
        }

        .detail-line {
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid var(--admin-border);
          font-size: 13px;
        }

        .detail-line > span:first-child {
          color: var(--admin-text-muted);
        }

        .detail-line strong {
          text-align: right;
          max-width: 65%;
          word-break: break-word;
        }

        .credential-row {
          padding: 15px 0;
          border-bottom: 1px solid var(--admin-border);
        }

        .credential-label {
          display: block;
          color: var(--admin-text-muted);
          font-size: 12px;
          margin-bottom: 7px;
        }

        .credential-value {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .credential-value code {
          flex: 1;
          min-width: 0;
          padding: 10px;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .copy-button {
          height: 36px;
          padding: 0 10px;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: transparent;
          color: var(--admin-text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .copy-button:hover {
          color: var(--admin-text);
          background: var(--admin-surface-subtle);
        }

        .device-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 17px 22px;
          border-top: 1px solid var(--admin-border);
        }

        @media (max-width: 520px) {
          .device-modal-overlay {
            padding: 10px;
          }

          .device-modal-header,
          .device-modal-body,
          .device-modal-footer {
            padding-left: 15px;
            padding-right: 15px;
          }

          .device-modal-footer {
            flex-direction: column-reverse;
          }

          .device-modal-footer button {
            width: 100%;
          }

          .credential-value {
            align-items: stretch;
            flex-direction: column;
          }

          .copy-button {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}

function CredentialRow({
  label,
  value,
  copyKey,
  copied,
  onCopy,
}) {
  return (
    <div className="credential-row">
      <span className="credential-label">
        {label}
      </span>

      <div className="credential-value">
        <code>{value}</code>

        <button
          type="button"
          className="copy-button"
          onClick={() =>
            onCopy(value, copyKey)
          }
        >
          {copied === copyKey ? (
            <Check size={14} />
          ) : (
            <Copy size={14} />
          )}

          {copied === copyKey
            ? "Copied"
            : "Copy"}
        </button>
      </div>
    </div>
  );
}