import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Cpu,
  Download,
  Eye,
  Filter,
  KeyRound,
  Link2,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

// =====================================================
// HELPERS
// =====================================================

function getStatus(device) {
  if (!device) return "INACTIVE";

  if (device.adminStatus) {
    return String(device.adminStatus).toUpperCase();
  }

  if (
    String(device.activationStatus).toUpperCase() ===
    "BLOCKED"
  ) {
    return "BLOCKED";
  }

  if (
    String(device.activationStatus).toUpperCase() ===
    "PENDING_OTP"
  ) {
    return "PENDING";
  }

  if (
    String(device.activationStatus).toUpperCase() ===
      "ACTIVE" &&
    device.online === true
  ) {
    return "ACTIVE";
  }

  if (
    String(device.activationStatus).toUpperCase() ===
      "ACTIVE" &&
    device.online === false
  ) {
    return "OFFLINE";
  }

  if (
    String(device.activationStatus).toUpperCase() ===
    "READY"
  ) {
    return "READY";
  }

  return "INACTIVE";
}

function getOwnerName(device) {
  if (!device?.owner) {
    return null;
  }

  if (typeof device.owner === "string") {
    return device.owner;
  }

  return (
    device.owner.fullName ||
    device.owner.name ||
    device.owner.email ||
    device.owner.phone ||
    null
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

function formatRelativeDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diff =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    diff / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 30) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

function getStatusClass(status) {
  switch (status) {
    case "ACTIVE":
      return "status-active";

    case "OFFLINE":
      return "status-offline";

    case "READY":
      return "status-ready";

    case "PENDING":
      return "status-pending";

    case "BLOCKED":
      return "status-blocked";

    default:
      return "status-inactive";
  }
}

function getStatusText(status, language) {
  const rw = language === "rw";

  const map = {
    ACTIVE: rw ? "Iri gukora" : "Active",
    OFFLINE: rw ? "Ntiri online" : "Offline",
    READY: rw ? "Yiteguye" : "Ready",
    PENDING: rw ? "Irategereje" : "Pending",
    BLOCKED: rw ? "Yahagaritswe" : "Blocked",
    INACTIVE: rw ? "Ntidakora" : "Inactive",
  };

  return (
    map[status] ||
    status
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatItem({
  icon: Icon,
  label,
  value,
  description,
  type,
}) {
  return (
    <div className="device-stat-item">
      <div className={`device-stat-icon ${type || ""}`}>
        <Icon size={19} />
      </div>

      <div className="device-stat-content">
        <div className="device-stat-label">
          {label}
        </div>

        <div className="device-stat-value">
          {value}
        </div>

        {description && (
          <div className="device-stat-description">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
  language,
}) {
  return (
    <span
      className={`device-status ${getStatusClass(
        status
      )}`}
    >
      <span className="device-status-dot" />

      {getStatusText(
        status,
        language
      )}
    </span>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({
  hasFilters,
  language,
}) {
  const rw = language === "rw";

  return (
    <div className="device-empty">
      <div className="device-empty-icon">
        <Package size={28} />
      </div>

      <h3>
        {hasFilters
          ? rw
            ? "Nta device yabonetse"
            : "No devices found"
          : rw
          ? "Nta devices zirahari"
          : "No devices yet"}
      </h3>

      <p>
        {hasFilters
          ? rw
            ? "Gerageza guhindura search cyangwa filter."
            : "Try changing your search or filter."
          : rw
          ? "Devices zakozwe zizagaragara hano."
          : "Generated devices will appear here."}
      </p>
    </div>
  );
}

// =====================================================
// MAIN
// =====================================================

export default function Devices() {
  const { language } =
    useAppSettings();

  const rw = language === "rw";

  // ===================================================
  // DATA
  // ===================================================

  const [devices, setDevices] =
    useState([]);

  const [stats, setStats] =
    useState({
      total: 0,
      active: 0,
      online: 0,
      offline: 0,
      ready: 0,
      pending: 0,
      blocked: 0,
      claimed: 0,
      unclaimed: 0,
      enabled: 0,
      disabled: 0,
    });

  // ===================================================
  // UI STATE
  // ===================================================

  const [loading, setLoading] =
    useState(true);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("ALL");

  const [sort, setSort] =
    useState("newest");

  const [page, setPage] =
    useState(1);

  const [limit] =
    useState(25);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 25,
      total: 0,
      pages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  // ===================================================
  // DETAIL
  // ===================================================

  const [selectedDevice, setSelectedDevice] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [detailError, setDetailError] =
    useState("");

  // ===================================================
  // COPY
  // ===================================================

  const [copied, setCopied] =
    useState("");

  // ===================================================
  // PDF
  // ===================================================

  const [pdfLoading, setPdfLoading] =
    useState("");

  // ===================================================
  // LOAD DEVICES
  // ===================================================

  const loadDevices = useCallback(
    async ({
      showRefresh = false,
    } = {}) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {
          page,
          limit,
          sort,
        };

        if (search.trim()) {
          params.search =
            search.trim();
        }

        if (status !== "ALL") {
          params.status =
            status;
        }

        const response =
          await api.get(
            "/devices",
            {
              params,
            }
          );

        const data =
          response?.data || {};

        const list = Array.isArray(
          data.devices
        )
          ? data.devices
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        setDevices(list);

        if (data.pagination) {
          setPagination(
            data.pagination
          );
        } else {
          setPagination({
            page,
            limit,
            total: list.length,
            pages: 1,
            hasNextPage: false,
            hasPreviousPage:
              page > 1,
          });
        }
      } catch (err) {
        console.error(
          "LOAD DEVICES ERROR:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          (rw
            ? "Devices ntizashoboye kuboneka."
            : "Failed to load devices.");

        setError(message);

        setDevices([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      limit,
      sort,
      search,
      status,
      rw,
    ]
  );

  // ===================================================
  // LOAD STATS
  // ===================================================

  const loadStats =
    useCallback(async () => {
      try {
        setStatsLoading(true);

        const response =
          await api.get(
            "/devices/stats"
          );

        const data =
          response?.data || {};

        const serverStats =
          data.stats ||
          data.data ||
          {};

        setStats({
          total:
            Number(
              serverStats.total || 0
            ),

          active:
            Number(
              serverStats.active || 0
            ),

          online:
            Number(
              serverStats.online ??
                serverStats.active ??
                0
            ),

          offline:
            Number(
              serverStats.offline || 0
            ),

          ready:
            Number(
              serverStats.ready || 0
            ),

          pending:
            Number(
              serverStats.pending || 0
            ),

          blocked:
            Number(
              serverStats.blocked || 0
            ),

          claimed:
            Number(
              serverStats.claimed || 0
            ),

          unclaimed:
            Number(
              serverStats.unclaimed || 0
            ),

          enabled:
            Number(
              serverStats.enabled || 0
            ),

          disabled:
            Number(
              serverStats.disabled || 0
            ),
        });
      } catch (err) {
        console.error(
          "LOAD DEVICE STATS ERROR:",
          err
        );
      } finally {
        setStatsLoading(false);
      }
    }, []);

  // ===================================================
  // INITIAL LOAD / FILTER CHANGE
  // ===================================================

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ===================================================
  // SEARCH DEBOUNCE
  // ===================================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setPage(1);
        setSearch(
          searchInput.trim()
        );
      }, 450);

    return () =>
      clearTimeout(timer);
  }, [searchInput]);

  // ===================================================
  // STATUS CHANGE
  // ===================================================

  const handleStatusChange =
    (value) => {
      setStatus(value);
      setPage(1);
    };

  // ===================================================
  // SORT CHANGE
  // ===================================================

  const handleSortChange =
    (value) => {
      setSort(value);
      setPage(1);
    };

  // ===================================================
  // REFRESH
  // ===================================================

  const refreshAll = async () => {
    await Promise.all([
      loadDevices({
        showRefresh: true,
      }),
      loadStats(),
    ]);
  };

  // ===================================================
  // OPEN DETAIL
  // ===================================================

  const openDevice =
    async (device) => {
      if (!device?.deviceId) {
        return;
      }

      setSelectedDevice(
        device
      );

      setDetailError("");

      try {
        setDetailLoading(true);

        const response =
          await api.get(
            `/devices/${encodeURIComponent(
              device.deviceId
            )}`
          );

        const data =
          response?.data || {};

        if (data.device) {
          setSelectedDevice(
            data.device
          );
        }
      } catch (err) {
        console.error(
          "DEVICE DETAIL ERROR:",
          err
        );

        setDetailError(
          err?.response?.data
            ?.message ||
            (rw
              ? "Amakuru ya device ntiyabonetse."
              : "Failed to load device details.")
        );
      } finally {
        setDetailLoading(false);
      }
    };

  // ===================================================
  // CLOSE DETAIL
  // ===================================================

  const closeDevice = () => {
    setSelectedDevice(null);
    setDetailError("");
    setCopied("");
  };

  // ===================================================
  // COPY
  // ===================================================

  const copyValue = async (
    value,
    key
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(
        String(value)
      );

      setCopied(key);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (err) {
      console.error(
        "COPY ERROR:",
        err
      );
    }
  };

  // ===================================================
  // DOWNLOAD PDF
  // ===================================================

  const downloadLabel =
    async (deviceId) => {
      if (!deviceId) return;

      try {
        setPdfLoading(
          deviceId
        );

        const response =
          await api.get(
            `/devices/label/${encodeURIComponent(
              deviceId
            )}`,
            {
              responseType:
                "blob",
            }
          );

        const blob =
          new Blob(
            [response.data],
            {
              type:
                "application/pdf",
            }
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `${deviceId}-label.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );
      } catch (err) {
        console.error(
          "DOWNLOAD LABEL ERROR:",
          err
        );

        alert(
          err?.response?.data
            ?.message ||
            (rw
              ? "PDF ntiyashoboye gukururwa."
              : "Failed to download PDF.")
        );
      } finally {
        setPdfLoading("");
      }
    };

  // ===================================================
  // PAGE CONTROLS
  // ===================================================

  const canPrevious =
    pagination.hasPreviousPage ||
    page > 1;

  const canNext =
    pagination.hasNextPage ||
    page <
      (pagination.pages || 1);

  const startItem =
    pagination.total === 0
      ? 0
      : (page - 1) *
          limit +
        1;

  const endItem =
    Math.min(
      page * limit,
      pagination.total
    );

  // ===================================================
  // FILTER STATUS COUNTS
  // ===================================================

  const visibleStatusCount =
    useMemo(() => {
      return {
        ALL: stats.total,
        ACTIVE: stats.active,
        OFFLINE: stats.offline,
        READY: stats.ready,
        PENDING: stats.pending,
        BLOCKED: stats.blocked,
      };
    }, [stats]);

  // ===================================================
  // FILTER ACTIVE
  // ===================================================

  const hasFilters =
    Boolean(search.trim()) ||
    status !== "ALL";

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="admin-page devices-page">
      <style>{`
        .devices-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .devices-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .devices-header-copy {
          min-width: 0;
        }

        .devices-title {
          margin: 0;
          color: var(--admin-text);
          font-size: clamp(24px, 3vw, 32px);
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .devices-subtitle {
          margin: 8px 0 0;
          color: var(--admin-text-muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .devices-refresh-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 15px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          background: var(--admin-surface);
          color: var(--admin-text);
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition: 0.2s ease;
          white-space: nowrap;
        }

        .devices-refresh-button:hover {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
        }

        .devices-refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .devices-refresh-spin {
          animation: devices-spin 0.9s linear infinite;
        }

        @keyframes devices-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .device-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border: 1px solid var(--admin-border);
          border-radius: 14px;
          overflow: hidden;
          background: var(--admin-surface);
          margin-bottom: 20px;
        }

        .device-stat-item {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 18px;
          border-right: 1px solid var(--admin-border);
        }

        .device-stat-item:nth-child(4n) {
          border-right: 0;
        }

        .device-stat-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .device-stat-icon.online {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.12);
        }

        .device-stat-icon.offline {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
        }

        .device-stat-icon.ready {
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.12);
        }

        .device-stat-content {
          min-width: 0;
        }

        .device-stat-label {
          color: var(--admin-text-muted);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .device-stat-value {
          margin-top: 3px;
          color: var(--admin-text);
          font-size: 23px;
          font-weight: 800;
          line-height: 1.1;
        }

        .device-stat-description {
          margin-top: 4px;
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .devices-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .devices-search {
          flex: 1 1 320px;
          position: relative;
          min-width: 220px;
        }

        .devices-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--admin-text-muted);
          pointer-events: none;
        }

        .devices-search input {
          width: 100%;
          height: 43px;
          box-sizing: border-box;
          padding: 0 42px 0 40px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          outline: none;
          background: var(--admin-surface);
          color: var(--admin-text);
          font-size: 13px;
        }

        .devices-search input::placeholder {
          color: var(--admin-text-muted);
        }

        .devices-search input:focus {
          border-color: var(--admin-accent);
          box-shadow: 0 0 0 3px var(--admin-accent-soft);
        }

        .devices-search-clear {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          width: 27px;
          height: 27px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: var(--admin-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .devices-search-clear:hover {
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
        }

        .device-select {
          height: 43px;
          min-width: 155px;
          padding: 0 12px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          outline: none;
          background: var(--admin-surface);
          color: var(--admin-text);
          font-size: 13px;
          cursor: pointer;
        }

        .device-select:focus {
          border-color: var(--admin-accent);
        }

        .device-filter-label {
          height: 43px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 12px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          background: var(--admin-surface);
          color: var(--admin-text-muted);
          font-size: 12px;
          font-weight: 700;
        }

        .device-list-container {
          border: 1px solid var(--admin-border);
          border-radius: 14px;
          background: var(--admin-surface);
          overflow: hidden;
        }

        .device-list-header {
          display: grid;
          grid-template-columns:
            minmax(150px, 1.2fr)
            minmax(115px, 0.8fr)
            minmax(150px, 1.1fr)
            minmax(125px, 0.9fr)
            minmax(130px, 0.9fr)
            92px;
          gap: 14px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--admin-border);
          background: var(--admin-surface-subtle);
        }

        .device-list-heading {
          color: var(--admin-text-muted);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .device-row {
          display: grid;
          grid-template-columns:
            minmax(150px, 1.2fr)
            minmax(115px, 0.8fr)
            minmax(150px, 1.1fr)
            minmax(125px, 0.9fr)
            minmax(130px, 0.9fr)
            92px;
          gap: 14px;
          align-items: center;
          padding: 15px 16px;
          border-bottom: 1px solid var(--admin-border);
          transition: background 0.18s ease;
        }

        .device-row:last-child {
          border-bottom: 0;
        }

        .device-row:hover {
          background: var(--admin-surface-subtle);
        }

        .device-main {
          min-width: 0;
        }

        .device-id {
          color: var(--admin-text);
          font-size: 13px;
          font-weight: 800;
          word-break: break-word;
        }

        .device-name {
          margin-top: 4px;
          color: var(--admin-text-muted);
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .device-mono {
          color: var(--admin-text);
          font-size: 12px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          word-break: break-word;
        }

        .device-muted {
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .device-owner {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .device-owner-icon {
          width: 29px;
          height: 29px;
          flex: 0 0 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .device-owner-text {
          min-width: 0;
        }

        .device-owner-name {
          color: var(--admin-text);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .device-owner-email {
          margin-top: 2px;
          color: var(--admin-text-muted);
          font-size: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .device-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          width: fit-content;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .device-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-active {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.12);
        }

        .status-offline {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
        }

        .status-ready {
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.12);
        }

        .status-pending {
          color: #a855f7;
          background: rgba(168, 85, 247, 0.12);
        }

        .status-blocked {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
        }

        .status-inactive {
          color: var(--admin-text-muted);
          background: var(--admin-surface-subtle);
        }

        .device-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        .device-action {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: transparent;
          color: var(--admin-text-muted);
          cursor: pointer;
          transition: 0.18s ease;
        }

        .device-action:hover {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
          background: var(--admin-accent-soft);
        }

        .device-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .device-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 13px 16px;
          border-top: 1px solid var(--admin-border);
          background: var(--admin-surface);
        }

        .device-pagination-info {
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .device-pagination-buttons {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .device-page-button {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: transparent;
          color: var(--admin-text);
          cursor: pointer;
        }

        .device-page-button:hover:not(:disabled) {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
        }

        .device-page-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .device-page-number {
          min-width: 70px;
          text-align: center;
          color: var(--admin-text-muted);
          font-size: 12px;
          font-weight: 700;
        }

        .device-empty {
          padding: 65px 20px;
          text-align: center;
        }

        .device-empty-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .device-empty h3 {
          margin: 0;
          color: var(--admin-text);
          font-size: 16px;
        }

        .device-empty p {
          margin: 7px auto 0;
          max-width: 430px;
          color: var(--admin-text-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .device-loading {
          padding: 55px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--admin-text-muted);
          font-size: 13px;
        }

        .device-loading-icon {
          color: var(--admin-accent);
          animation: devices-spin 0.9s linear infinite;
        }

        .device-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 14px;
          padding: 12px 14px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          font-size: 12px;
          line-height: 1.5;
        }

        .device-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(5px);
        }

        .device-modal {
          width: min(720px, 100%);
          max-height: min(850px, calc(100vh - 40px));
          overflow-y: auto;
          border: 1px solid var(--admin-border);
          border-radius: 16px;
          background: var(--admin-surface);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
        }

        .device-modal-header {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--admin-border);
          background: var(--admin-surface);
        }

        .device-modal-title {
          margin: 0;
          color: var(--admin-text);
          font-size: 18px;
          font-weight: 800;
        }

        .device-modal-subtitle {
          margin-top: 5px;
          color: var(--admin-text-muted);
          font-size: 11px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .device-modal-close {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: transparent;
          color: var(--admin-text-muted);
          cursor: pointer;
        }

        .device-modal-close:hover {
          color: var(--admin-text);
          border-color: var(--admin-text-muted);
        }

        .device-modal-body {
          padding: 20px;
        }

        .device-detail-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--admin-border);
        }

        .device-detail-section {
          margin-top: 22px;
        }

        .device-detail-section:first-child {
          margin-top: 0;
        }

        .device-detail-section-title {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 0 0 11px;
          color: var(--admin-text);
          font-size: 13px;
          font-weight: 800;
        }

        .device-detail-list {
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          overflow: hidden;
        }

        .device-detail-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 11px 13px;
          border-bottom: 1px solid var(--admin-border);
        }

        .device-detail-row:last-child {
          border-bottom: 0;
        }

        .device-detail-label {
          flex: 0 0 40%;
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .device-detail-value {
          min-width: 0;
          text-align: right;
          color: var(--admin-text);
          font-size: 12px;
          font-weight: 600;
          word-break: break-word;
        }

        .device-detail-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--admin-border);
        }

        .device-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid var(--admin-accent);
          border-radius: 9px;
          background: var(--admin-accent);
          color: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
        }

        .device-primary-button:hover {
          opacity: 0.9;
        }

        .device-secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid var(--admin-border);
          border-radius: 9px;
          background: transparent;
          color: var(--admin-text);
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .device-secondary-button:hover {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
        }

        .device-detail-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 150px;
          color: var(--admin-text-muted);
          font-size: 13px;
        }

        .device-detail-error {
          margin-bottom: 14px;
          padding: 11px 13px;
          border-radius: 9px;
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          font-size: 12px;
        }

        @media (max-width: 1200px) {
          .device-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .device-stat-item:nth-child(2n) {
            border-right: 0;
          }

          .device-stat-item:nth-child(-n + 2) {
            border-bottom: 1px solid var(--admin-border);
          }

          .device-list-header,
          .device-row {
            grid-template-columns:
              minmax(145px, 1.2fr)
              minmax(105px, 0.8fr)
              minmax(135px, 1fr)
              minmax(120px, 0.9fr)
              85px;
          }

          .device-list-heading:nth-child(5),
          .device-row > :nth-child(5) {
            display: none;
          }
        }

        @media (max-width: 900px) {
          .device-list-header {
            display: none;
          }

          .device-row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px 15px;
            padding: 16px;
          }

          .device-row > :nth-child(2),
          .device-row > :nth-child(3),
          .device-row > :nth-child(4),
          .device-row > :nth-child(5) {
            grid-column: 1 / -1;
          }

          .device-row > :nth-child(6) {
            grid-column: 2;
            grid-row: 1;
          }

          .device-actions {
            justify-content: flex-end;
          }

          .device-main {
            grid-column: 1;
            grid-row: 1;
          }

          .device-owner {
            padding-top: 3px;
          }

          .device-row::before {
            content: "";
            display: block;
          }
        }

        @media (max-width: 680px) {
          .devices-header {
            align-items: stretch;
            flex-direction: column;
          }

          .devices-refresh-button {
            width: 100%;
          }

          .device-stats {
            grid-template-columns: 1fr 1fr;
          }

          .device-stat-item {
            padding: 14px;
          }

          .device-stat-icon {
            width: 34px;
            height: 34px;
            flex-basis: 34px;
          }

          .device-stat-value {
            font-size: 20px;
          }

          .devices-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .devices-search {
            flex-basis: auto;
            width: 100%;
          }

          .device-select,
          .device-filter-label {
            width: 100%;
          }

          .device-pagination {
            align-items: stretch;
            flex-direction: column;
          }

          .device-pagination-info {
            text-align: center;
          }

          .device-pagination-buttons {
            justify-content: center;
          }

          .device-modal-backdrop {
            padding: 10px;
          }

          .device-modal {
            max-height: calc(100vh - 20px);
            border-radius: 13px;
          }

          .device-modal-body {
            padding: 15px;
          }

          .device-detail-row {
            flex-direction: column;
            gap: 5px;
          }

          .device-detail-label {
            flex-basis: auto;
          }

          .device-detail-value {
            text-align: left;
          }
        }

        @media (max-width: 440px) {
          .device-stats {
            grid-template-columns: 1fr;
          }

          .device-stat-item {
            border-right: 0 !important;
            border-bottom: 1px solid var(--admin-border);
          }

          .device-stat-item:last-child {
            border-bottom: 0;
          }

          .device-row {
            grid-template-columns: 1fr;
          }

          .device-row > :nth-child(6) {
            grid-column: 1;
            grid-row: auto;
          }

          .device-actions {
            justify-content: flex-start;
          }

          .device-primary-button,
          .device-secondary-button {
            width: 100%;
          }
        }
      `}</style>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="devices-header">
        <div className="devices-header-copy">
          <h1 className="devices-title">
            {rw
              ? "ANTIMATE Devices"
              : "ANTIMATE Devices"}
          </h1>

          <p className="devices-subtitle">
            {rw
              ? "Genzura BR System devices zose, uko zihagaze, owners, gateways n'ibikorwa byazo."
              : "Manage all BR System devices, their status, ownership, gateways and activity."}
          </p>
        </div>

        <button
          className="devices-refresh-button"
          onClick={refreshAll}
          disabled={
            refreshing ||
            loading
          }
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "devices-refresh-spin"
                : ""
            }
          />

          {refreshing
            ? rw
              ? "Birimo kuvugururwa..."
              : "Refreshing..."
            : rw
            ? "Vugurura"
            : "Refresh"}
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="device-error">
          <AlertCircle
            size={17}
            style={{
              flex: "0 0 auto",
              marginTop: 1,
            }}
          />

          <span>{error}</span>
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="device-stats">
        <StatItem
          icon={Cpu}
          label={
            rw
              ? "Devices zose"
              : "Total devices"
          }
          value={
            statsLoading
              ? "—"
              : stats.total
          }
          description={
            rw
              ? "Zose ziri muri platform"
              : "All registered devices"
          }
        />

        <StatItem
          icon={Wifi}
          label={
            rw
              ? "Online"
              : "Online"
          }
          value={
            statsLoading
              ? "—"
              : stats.online
          }
          description={
            rw
              ? "Ziri gukora ubu"
              : "Currently connected"
          }
          type="online"
        />

        <StatItem
          icon={WifiOff}
          label={
            rw
              ? "Offline"
              : "Offline"
          }
          value={
            statsLoading
              ? "—"
              : stats.offline
          }
          description={
            rw
              ? "Active ariko zitari online"
              : "Active but disconnected"
          }
          type="offline"
        />

        <StatItem
          icon={Package}
          label={
            rw
              ? "Ziteguye"
              : "Ready"
          }
          value={
            statsLoading
              ? "—"
              : stats.ready
          }
          description={
            rw
              ? "Zitarahuzwa na user"
              : "Not yet claimed"
          }
          type="ready"
        />
      </div>

      {/* =================================================
          SECONDARY STATUS SUMMARY
      ================================================= */}

      <div
        className="devices-toolbar"
        style={{
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            flexWrap: "wrap",
            color:
              "var(--admin-text-muted)",
            fontSize: 11,
          }}
        >
          <Activity size={14} />

          <span>
            {rw
              ? `Claimed: ${stats.claimed}`
              : `Claimed: ${stats.claimed}`}
          </span>

          <span>•</span>

          <span>
            {rw
              ? `Unclaimed: ${stats.unclaimed}`
              : `Unclaimed: ${stats.unclaimed}`}
          </span>

          <span>•</span>

          <span>
            {rw
              ? `Pending: ${stats.pending}`
              : `Pending: ${stats.pending}`}
          </span>

          <span>•</span>

          <span>
            {rw
              ? `Blocked: ${stats.blocked}`
              : `Blocked: ${stats.blocked}`}
          </span>
        </div>
      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="devices-toolbar">
        <div className="devices-search">
          <Search
            size={16}
            className="devices-search-icon"
          />

          <input
            type="text"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value
              )
            }
            placeholder={
              rw
                ? "Shakisha Device ID, name cyangwa Gateway ID..."
                : "Search Device ID, name or Gateway ID..."
            }
          />

          {searchInput && (
            <button
              className="devices-search-clear"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              title={
                rw
                  ? "Siba search"
                  : "Clear search"
              }
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="device-filter-label">
          <Filter size={14} />

          {rw
            ? "Filter"
            : "Filter"}
        </div>

        <select
          className="device-select"
          value={status}
          onChange={(event) =>
            handleStatusChange(
              event.target.value
            )
          }
          aria-label="Device status filter"
        >
          <option value="ALL">
            {rw
              ? `Zose (${visibleStatusCount.ALL})`
              : `All (${visibleStatusCount.ALL})`}
          </option>

          <option value="ACTIVE">
            {rw
              ? `Active (${visibleStatusCount.ACTIVE})`
              : `Active (${visibleStatusCount.ACTIVE})`}
          </option>

          <option value="OFFLINE">
            {rw
              ? `Offline (${visibleStatusCount.OFFLINE})`
              : `Offline (${visibleStatusCount.OFFLINE})`}
          </option>

          <option value="READY">
            {rw
              ? `Ready (${visibleStatusCount.READY})`
              : `Ready (${visibleStatusCount.READY})`}
          </option>

          <option value="PENDING">
            {rw
              ? `Pending (${visibleStatusCount.PENDING})`
              : `Pending (${visibleStatusCount.PENDING})`}
          </option>

          <option value="BLOCKED">
            {rw
              ? `Blocked (${visibleStatusCount.BLOCKED})`
              : `Blocked (${visibleStatusCount.BLOCKED})`}
          </option>
        </select>

        <select
          className="device-select"
          value={sort}
          onChange={(event) =>
            handleSortChange(
              event.target.value
            )
          }
          aria-label="Device sort"
        >
          <option value="newest">
            {rw
              ? "Bishya mbere"
              : "Newest first"}
          </option>

          <option value="oldest">
            {rw
              ? "Ibya kera mbere"
              : "Oldest first"}
          </option>

          <option value="device_asc">
            {rw
              ? "Device ID A-Z"
              : "Device ID A-Z"}
          </option>

          <option value="device_desc">
            {rw
              ? "Device ID Z-A"
              : "Device ID Z-A"}
          </option>

          <option value="updated">
            {rw
              ? "Byavuguruwe vuba"
              : "Recently updated"}
          </option>
        </select>
      </div>

      {/* =================================================
          DEVICE LIST
      ================================================= */}

      <div className="device-list-container">
        <div className="device-list-header">
          <div className="device-list-heading">
            Device
          </div>

          <div className="device-list-heading">
            Status
          </div>

          <div className="device-list-heading">
            Owner
          </div>

          <div className="device-list-heading">
            Gateway
          </div>

          <div className="device-list-heading">
            Last seen
          </div>

          <div className="device-list-heading">
            {rw
              ? "Ibikorwa"
              : "Actions"}
          </div>
        </div>

        {loading ? (
          <div className="device-loading">
            <Loader2
              size={25}
              className="device-loading-icon"
            />

            <span>
              {rw
                ? "Birimo kuboneka..."
                : "Loading devices..."}
            </span>
          </div>
        ) : devices.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            language={language}
          />
        ) : (
          devices.map(
            (device) => {
              const deviceStatus =
                getStatus(device);

              const ownerName =
                getOwnerName(
                  device
                );

              return (
                <div
                  className="device-row"
                  key={
                    device._id ||
                    device.deviceId
                  }
                >
                  {/* DEVICE */}

                  <div className="device-main">
                    <div className="device-id">
                      {device.deviceId}
                    </div>

                    {device.deviceName && (
                      <div className="device-name">
                        {
                          device.deviceName
                        }
                      </div>
                    )}
                  </div>

                  {/* STATUS */}

                  <div>
                    <StatusBadge
                      status={
                        deviceStatus
                      }
                      language={
                        language
                      }
                    />
                  </div>

                  {/* OWNER */}

                  <div className="device-owner">
                    <div className="device-owner-icon">
                      <Link2
                        size={14}
                      />
                    </div>

                    <div className="device-owner-text">
                      <div className="device-owner-name">
                        {ownerName ||
                          (rw
                            ? "Nta owner"
                            : "Not assigned")}
                      </div>

                      {device.owner
                        ?.email && (
                        <div className="device-owner-email">
                          {
                            device
                              .owner
                              .email
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GATEWAY */}

                  <div>
                    {device.gatewayId ? (
                      <span className="device-mono">
                        {
                          device.gatewayId
                        }
                      </span>
                    ) : (
                      <span className="device-muted">
                        {rw
                          ? "Nta gateway"
                          : "No gateway"}
                      </span>
                    )}
                  </div>

                  {/* LAST SEEN */}

                  <div>
                    <div className="device-muted">
                      {formatRelativeDate(
                        device.lastSeen
                      )}
                    </div>

                    {device.lastSeen && (
                      <div
                        style={{
                          marginTop: 3,
                          color:
                            "var(--admin-text-muted)",
                          fontSize: 9,
                        }}
                      >
                        {formatDate(
                          device.lastSeen
                        )}
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div className="device-actions">
                    <button
                      className="device-action"
                      onClick={() =>
                        openDevice(
                          device
                        )
                      }
                      title={
                        rw
                          ? "Reba details"
                          : "View details"
                      }
                    >
                      <Eye
                        size={15}
                      />
                    </button>

                    <button
                      className="device-action"
                      onClick={() =>
                        downloadLabel(
                          device.deviceId
                        )
                      }
                      disabled={
                        pdfLoading ===
                        device.deviceId
                      }
                      title={
                        rw
                          ? "Kuramo PDF"
                          : "Download PDF"
                      }
                    >
                      {pdfLoading ===
                      device.deviceId ? (
                        <Loader2
                          size={14}
                          className="devices-refresh-spin"
                        />
                      ) : (
                        <Download
                          size={15}
                        />
                      )}
                    </button>
                  </div>
                </div>
              );
            }
          )
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          devices.length > 0 && (
            <div className="device-pagination">
              <div className="device-pagination-info">
                {pagination.total > 0
                  ? rw
                    ? `Byerekana ${startItem}-${endItem} muri ${pagination.total}`
                    : `Showing ${startItem}-${endItem} of ${pagination.total}`
                  : rw
                  ? "Nta device"
                  : "No devices"}
              </div>

              <div className="device-pagination-buttons">
                <button
                  className="device-page-button"
                  disabled={
                    !canPrevious
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current -
                            1
                        )
                    )
                  }
                  title={
                    rw
                      ? "Page ibanza"
                      : "Previous page"
                  }
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                <div className="device-page-number">
                  {pagination.pages
                    ? `${page} / ${pagination.pages}`
                    : page}
                </div>

                <button
                  className="device-page-button"
                  disabled={
                    !canNext
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current +
                        1
                    )
                  }
                  title={
                    rw
                      ? "Page ikurikira"
                      : "Next page"
                  }
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      {selectedDevice && (
        <div
          className="device-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDevice();
            }
          }}
        >
          <div className="device-modal">
            {/* MODAL HEADER */}

            <div className="device-modal-header">
              <div>
                <h2 className="device-modal-title">
                  {rw
                    ? "Device details"
                    : "Device details"}
                </h2>

                <div className="device-modal-subtitle">
                  {
                    selectedDevice.deviceId
                  }
                </div>
              </div>

              <button
                className="device-modal-close"
                onClick={
                  closeDevice
                }
                title={
                  rw
                    ? "Funga"
                    : "Close"
                }
              >
                <X size={16} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="device-modal-body">
              {detailLoading && (
                <div
                  className="device-detail-loading"
                  style={{
                    marginBottom: 15,
                  }}
                >
                  <Loader2
                    size={18}
                    className="devices-refresh-spin"
                  />

                  {rw
                    ? "Birimo kuboneka..."
                    : "Loading latest details..."}
                </div>
              )}

              {detailError && (
                <div className="device-detail-error">
                  {detailError}
                </div>
              )}

              {/* STATUS */}

              <div className="device-detail-status">
                <div>
                  <div
                    style={{
                      color:
                        "var(--admin-text-muted)",
                      fontSize: 10,
                      marginBottom: 6,
                    }}
                  >
                    {rw
                      ? "STATUS"
                      : "STATUS"}
                  </div>

                  <StatusBadge
                    status={getStatus(
                      selectedDevice
                    )}
                    language={
                      language
                    }
                  />
                </div>

                <div
                  style={{
                    textAlign:
                      "right",
                  }}
                >
                  <div
                    style={{
                      color:
                        "var(--admin-text-muted)",
                      fontSize: 10,
                      marginBottom: 5,
                    }}
                  >
                    {rw
                      ? "Online"
                      : "Online"}
                  </div>

                  <strong
                    style={{
                      color:
                        selectedDevice.online
                          ? "#22c55e"
                          : "var(--admin-text-muted)",
                      fontSize: 12,
                    }}
                  >
                    {selectedDevice.online
                      ? rw
                        ? "Yego"
                        : "Yes"
                      : rw
                      ? "Oya"
                      : "No"}
                  </strong>
                </div>
              </div>

              {/* IDENTITY */}

              <div className="device-detail-section">
                <h3 className="device-detail-section-title">
                  <ShieldCheck
                    size={15}
                  />

                  {rw
                    ? "Identity"
                    : "Identity"}
                </h3>

                <div className="device-detail-list">
                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Device ID
                    </span>

                    <strong className="device-detail-value">
                      {
                        selectedDevice.deviceId
                      }
                    </strong>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Device name
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice.deviceName ||
                        "—"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Activation
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice.activationStatus ||
                        "—"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Claimed
                    </span>

                    <span className="device-detail-value">
                      {selectedDevice.claimed
                        ? rw
                          ? "Yego"
                          : "Yes"
                        : rw
                        ? "Oya"
                        : "No"}
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Enabled
                    </span>

                    <span className="device-detail-value">
                      {selectedDevice.enabled
                        ? rw
                          ? "Yego"
                          : "Yes"
                        : rw
                        ? "Oya"
                        : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* OWNER */}

              <div className="device-detail-section">
                <h3 className="device-detail-section-title">
                  <Link2
                    size={15}
                  />

                  {rw
                    ? "Ownership"
                    : "Ownership"}
                </h3>

                <div className="device-detail-list">
                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Owner
                    </span>

                    <span className="device-detail-value">
                      {getOwnerName(
                        selectedDevice
                      ) ||
                        (rw
                          ? "Nta owner"
                          : "Not assigned")}
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Email
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice
                          .owner
                          ?.email ||
                        "—"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Phone
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice
                          .owner
                          ?.phone ||
                        "—"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Claimed at
                    </span>

                    <span className="device-detail-value">
                      {formatDate(
                        selectedDevice.claimedAt
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* NETWORK */}

              <div className="device-detail-section">
                <h3 className="device-detail-section-title">
                  <Wifi
                    size={15}
                  />

                  {rw
                    ? "Network"
                    : "Network"}
                </h3>

                <div className="device-detail-list">
                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Gateway
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice.gatewayId ||
                        "—"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Last seen
                    </span>

                    <span className="device-detail-value">
                      {formatDate(
                        selectedDevice.lastSeen
                      )}
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Created
                    </span>

                    <span className="device-detail-value">
                      {formatDate(
                        selectedDevice.createdAt
                      )}
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Updated
                    </span>

                    <span className="device-detail-value">
                      {formatDate(
                        selectedDevice.updatedAt
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* BR SYSTEM */}

              <div className="device-detail-section">
                <h3 className="device-detail-section-title">
                  <Cpu
                    size={15}
                  />

                  {rw
                    ? "BR System"
                    : "BR System"}
                </h3>

                <div className="device-detail-list">
                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Chicks type
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice.chicksType ||
                        "—"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Number of chickens
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice.numberOfChickens ??
                        0
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Room area
                    </span>

                    <span className="device-detail-value">
                      {selectedDevice.broodingRoomArea
                        ? `${selectedDevice.broodingRoomArea} m²`
                        : "—"}
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Batch status
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice.batchStatus ||
                        "—"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Heater
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice.heaterMode ||
                        "—"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Fan
                    </span>

                    <span className="device-detail-value">
                      {selectedDevice.fanMode
                        ? `${selectedDevice.fanMode} (${selectedDevice.fanSpeed || 0}%)`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* LOCATION */}

              <div className="device-detail-section">
                <h3 className="device-detail-section-title">
                  <Activity
                    size={15}
                  />

                  {rw
                    ? "Location"
                    : "Location"}
                </h3>

                <div className="device-detail-list">
                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Country
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice
                          .location
                          ?.country ||
                        "Rwanda"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      District
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice
                          .location
                          ?.district ||
                        "—"
                      }
                    </span>
                  </div>

                  <div className="device-detail-row">
                    <span className="device-detail-label">
                      Sector
                    </span>

                    <span className="device-detail-value">
                      {
                        selectedDevice
                          .location
                          ?.sector ||
                        "—"
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="device-detail-actions">
                <button
                  className="device-primary-button"
                  onClick={() =>
                    downloadLabel(
                      selectedDevice.deviceId
                    )
                  }
                  disabled={
                    pdfLoading ===
                    selectedDevice.deviceId
                  }
                >
                  {pdfLoading ===
                  selectedDevice.deviceId ? (
                    <Loader2
                      size={14}
                      className="devices-refresh-spin"
                    />
                  ) : (
                    <Download
                      size={14}
                    />
                  )}

                  {rw
                    ? "Kuramo PDF Label"
                    : "Download PDF Label"}
                </button>

                <button
                  className="device-secondary-button"
                  onClick={() =>
                    copyValue(
                      selectedDevice.deviceId,
                      "deviceId"
                    )
                  }
                >
                  {copied ===
                  "deviceId" ? (
                    <Check
                      size={14}
                    />
                  ) : (
                    <Copy
                      size={14}
                    />
                  )}

                  {copied ===
                  "deviceId"
                    ? rw
                      ? "Byakopowe"
                      : "Copied"
                    : rw
                    ? "Kopa Device ID"
                    : "Copy Device ID"}
                </button>

                <button
                  className="device-secondary-button"
                  onClick={
                    closeDevice
                  }
                >
                  <X size={14} />

                  {rw
                    ? "Funga"
                    : "Close"}
                </button>
              </div>

              {/* SECURITY NOTE */}

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
                  gap: 9,
                  marginTop: 16,
                  padding: "11px 13px",
                  border:
                    "1px solid var(--admin-border)",
                  borderRadius: 9,
                  color:
                    "var(--admin-text-muted)",
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                <KeyRound
                  size={15}
                  style={{
                    flex:
                      "0 0 auto",
                    marginTop: 1,
                    color:
                      "var(--admin-accent)",
                  }}
                />

                <span>
                  {rw
                    ? "Security: secret key, factory key na QR token ntibigaragazwa muri device details. Bikomeza kurindwa na backend."
                    : "Security: secret key, factory key and QR token are not exposed in device details. They remain protected by the backend."}
                </span>
              </div>

              {/* LAST SEEN */}

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 7,
                  marginTop: 15,
                  color:
                    "var(--admin-text-muted)",
                  fontSize: 10,
                }}
              >
                <Clock3
                  size={13}
                />

                {selectedDevice.lastSeen
                  ? rw
                    ? `Last seen: ${formatDate(
                        selectedDevice.lastSeen
                      )}`
                    : `Last seen: ${formatDate(
                        selectedDevice.lastSeen
                      )}`
                  : rw
                  ? "Device ntirigeze igaragara online."
                  : "Device has not reported online yet."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 