import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  Cloud,
  CreditCard,
  Database,
  Gauge,
  Globe2,
  HardDrive,
  Radio,
  RefreshCw,
  Server,
  Users,
  UserCog,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

/* =========================================================
   HELPERS
========================================================= */

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return 0;
};

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const formatNumber = (value) => {
  return new Intl.NumberFormat().format(
    toNumber(value)
  );
};

const formatCompactNumber = (value) => {
  const number = toNumber(value);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return String(number);
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const formatTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const isOnlineStatus = (value) => {
  const status = normalizeStatus(value);

  return [
    "online",
    "connected",
    "active",
    "up",
    "healthy",
    "operational",
    "running",
  ].includes(status);
};

const isOfflineStatus = (value) => {
  const status = normalizeStatus(value);

  return [
    "offline",
    "disconnected",
    "inactive",
    "down",
    "failed",
    "unhealthy",
    "stopped",
  ].includes(status);
};

const getActivityTime = (item) => {
  return (
    item?.createdAt ||
    item?.timestamp ||
    item?.time ||
    item?.date ||
    item?.updatedAt ||
    item?.lastSeen ||
    null
  );
};

const getActivityMessage = (
  item,
  isRw
) => {
  if (!item) {
    return isRw
      ? "Igikorwa cya system."
      : "System activity.";
  }

  if (
    item.message ||
    item.description ||
    item.action
  ) {
    return (
      item.message ||
      item.description ||
      item.action
    );
  }

  if (
    item.type === "user" ||
    item.type === "user_registered"
  ) {
    return isRw
      ? "User mushya yiyandikishije."
      : "New user registered.";
  }

  if (
    item.type === "worker" ||
    item.type === "worker_created"
  ) {
    return isRw
      ? "Umukozi mushya yongerewe."
      : "New worker created.";
  }

  if (
    item.type === "gateway"
  ) {
    return isRw
      ? "Gateway yahindutse status."
      : "Gateway status changed.";
  }

  if (
    item.type === "device" ||
    item.type === "br_system" ||
    item.type === "node"
  ) {
    return isRw
      ? "BR System yahindutse status."
      : "BR System status changed.";
  }

  if (
    item.type === "payment"
  ) {
    return isRw
      ? "Payment activity nshya."
      : "New payment activity.";
  }

  if (
    item.type === "subscription"
  ) {
    return isRw
      ? "Subscription activity nshya."
      : "New subscription activity.";
  }

  if (
    item.type === "ai"
  ) {
    return isRw
      ? "ANTIMATE AI yakoreshejwe."
      : "ANTIMATE AI was used.";
  }

  return isRw
    ? "Igikorwa gishya kuri platform."
    : "New platform activity.";
};

const getAlertSeverity = (alert) => {
  const severity = normalizeStatus(
    alert?.severity ||
      alert?.level ||
      alert?.priority ||
      "info"
  );

  if (
    severity === "critical" ||
    severity === "high"
  ) {
    return "critical";
  }

  if (
    severity === "warning" ||
    severity === "medium"
  ) {
    return "warning";
  }

  return "info";
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  type = "default",
}) {
  return (
    <div className="admin-stat">
      <div className={`admin-stat-icon ${type}`}>
        <Icon size={19} />
      </div>

      <div className="admin-stat-content">
        <span>{label}</span>

        <strong>
          {formatCompactNumber(value)}
        </strong>

        {description && (
          <small>
            {description}
          </small>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({
  icon: Icon,
  label,
  value,
  online,
  description,
}) {
  return (
    <div className="system-status-row">
      <div className="system-status-left">
        <div className="system-status-icon">
          <Icon size={17} />
        </div>

        <div>
          <strong>{label}</strong>

          {description && (
            <span>
              {description}
            </span>
          )}
        </div>
      </div>

      <div
        className={`system-status-value ${
          online
            ? "status-good"
            : "status-bad"
        }`}
      >
        <span />

        {value}
      </div>
    </div>
  );
}

/* =========================================================
   NETWORK BAR
========================================================= */

function NetworkBar({
  label,
  total,
  online,
  offline,
  isRw,
  icon: Icon,
}) {
  const safeTotal = Math.max(
    toNumber(total),
    0
  );

  const safeOnline = Math.min(
    Math.max(toNumber(online), 0),
    safeTotal
  );

  const safeOffline = Math.max(
    toNumber(offline),
    0
  );

  const percentage =
    safeTotal > 0
      ? Math.round(
          (safeOnline / safeTotal) * 100
        )
      : 0;

  return (
    <div className="network-item">
      <div className="network-item-header">
        <div className="network-title">
          <div className="network-icon">
            <Icon size={17} />
          </div>

          <div>
            <strong>{label}</strong>

            <span>
              {formatNumber(safeTotal)}{" "}
              {isRw
                ? "zose"
                : "total"}
            </span>
          </div>
        </div>

        <strong className="network-percentage">
          {percentage}%
        </strong>
      </div>

      <div className="network-progress">
        <div
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="network-meta">
        <span className="network-online">
          <span />
          {formatNumber(safeOnline)}{" "}
          {isRw
            ? "online"
            : "online"}
        </span>

        <span className="network-offline">
          <span />
          {formatNumber(safeOffline)}{" "}
          {isRw
            ? "offline"
            : "offline"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const {
    language,
  } = useAppSettings();

  const isRw =
    language === "rw";

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [lastSync, setLastSync] =
    useState(null);

  const [dashboard, setDashboard] =
    useState({
      users: 0,

      workers: 0,

      brSystems: 0,
      brSystemsOnline: 0,
      brSystemsOffline: 0,

      gateways: 0,
      gatewaysOnline: 0,
      gatewaysOffline: 0,

      subscriptions: 0,
      activeSubscriptions: 0,

      payments: 0,
      revenue: 0,

      alerts: 0,
      criticalAlerts: 0,

      aiRequests: 0,
      aiUsers: 0,
      aiActions: 0,

      telemetryMessages: 0,

      cloud: "unknown",
      mqtt: "unknown",
      database: "unknown",
      socket: "unknown",

      activities: [],
      alertsList: [],
    });

  /* =======================================================
     PARSE BACKEND RESPONSE
  ======================================================= */

  const parseDashboardData =
    useCallback(
      (data) => {
        const root =
          data?.data || data || {};

        const stats =
          root?.stats ||
          root?.statistics ||
          {};

        const platform =
          root?.platform ||
          root?.platformStats ||
          {};

        const network =
          root?.network ||
          {};

        const nodes =
          root?.brSystems ||
          root?.brSystem ||
          root?.nodes ||
          root?.devices ||
          [];

        const gateways =
          root?.gateways ||
          [];

        const users =
          root?.users ||
          [];

        const workers =
          root?.workers ||
          [];

        const subscriptions =
          root?.subscriptions ||
          {};

        const payments =
          root?.payments ||
          {};

        const ai =
          root?.ai ||
          root?.antimateAI ||
          root?.aiStats ||
          {};

        const system =
          root?.system ||
          root?.health ||
          root?.services ||
          {};

        const activities =
          root?.activities ||
          root?.recentActivity ||
          root?.activity ||
          [];

        const alerts =
          root?.alerts ||
          root?.recentAlerts ||
          [];

        /* -----------------------------------------------
           BR SYSTEMS
        ------------------------------------------------ */

        const brSystemTotal =
          firstValue(
            stats.brSystems,
            stats.brSystem,
            stats.nodes,
            stats.devices,
            network.brSystems,
            network.nodes,
            Array.isArray(nodes)
              ? nodes.length
              : 0
          );

        const brOnline =
          firstValue(
            stats.brSystemsOnline,
            stats.onlineBrSystems,
            stats.onlineNodes,
            stats.activeDevices,
            stats.activeNodes,
            network.brSystemsOnline,
            network.nodesOnline,
            Array.isArray(nodes)
              ? nodes.filter((item) =>
                  isOnlineStatus(
                    item?.status ||
                      item?.connectionStatus
                  )
                ).length
              : 0
          );

        const brOffline =
          firstValue(
            stats.brSystemsOffline,
            stats.offlineBrSystems,
            stats.offlineNodes,
            network.brSystemsOffline,
            network.nodesOffline,
            Math.max(
              toNumber(
                brSystemTotal
              ) -
                toNumber(
                  brOnline
                ),
              0
            )
          );

        /* -----------------------------------------------
           GATEWAYS
        ------------------------------------------------ */

        const gatewayTotal =
          firstValue(
            stats.gateways,
            network.gateways,
            Array.isArray(gateways)
              ? gateways.length
              : 0
          );

        const gatewayOnline =
          firstValue(
            stats.gatewaysOnline,
            stats.onlineGateways,
            network.gatewaysOnline,
            Array.isArray(gateways)
              ? gateways.filter(
                  (item) =>
                    isOnlineStatus(
                      item?.status ||
                        item?.connectionStatus
                    )
                ).length
              : 0
          );

        const gatewayOffline =
          firstValue(
            stats.gatewaysOffline,
            stats.offlineGateways,
            network.gatewaysOffline,
            Math.max(
              toNumber(
                gatewayTotal
              ) -
                toNumber(
                  gatewayOnline
                ),
              0
            )
          );

        /* -----------------------------------------------
           USERS
        ------------------------------------------------ */

        const userTotal =
          firstValue(
            stats.users,
            platform.users,
            stats.totalUsers,
            Array.isArray(users)
              ? users.length
              : 0
          );

        /* -----------------------------------------------
           WORKERS
        ------------------------------------------------ */

        const workerTotal =
          firstValue(
            stats.workers,
            stats.staff,
            platform.workers,
            platform.staff,
            stats.totalWorkers,
            Array.isArray(workers)
              ? workers.length
              : 0
          );

        /* -----------------------------------------------
           SUBSCRIPTIONS
        ------------------------------------------------ */

        const subscriptionTotal =
          firstValue(
            stats.subscriptions,
            subscriptions.total,
            subscriptions.count,
            platform.subscriptions
          );

        const activeSubscriptions =
          firstValue(
            stats.activeSubscriptions,
            subscriptions.active,
            subscriptions.activeCount
          );

        /* -----------------------------------------------
           PAYMENTS
        ------------------------------------------------ */

        const paymentTotal =
          firstValue(
            stats.payments,
            payments.total,
            payments.count
          );

        const revenue =
          firstValue(
            stats.revenue,
            payments.revenue,
            payments.totalRevenue,
            payments.amount
          );

        /* -----------------------------------------------
           ALERTS
        ------------------------------------------------ */

        const alertTotal =
          firstValue(
            stats.alerts,
            stats.totalAlerts,
            alerts.length
          );

        const criticalAlerts =
          firstValue(
            stats.criticalAlerts,
            stats.critical,
            Array.isArray(alerts)
              ? alerts.filter(
                  (alert) =>
                    getAlertSeverity(
                      alert
                    ) === "critical"
                ).length
              : 0
          );

        /* -----------------------------------------------
           AI
        ------------------------------------------------ */

        const aiRequestTotal =
          firstValue(
            ai.requests,
            ai.totalRequests,
            ai.requestsToday,
            stats.aiRequests,
            stats.aiUsage,
            stats.aiInteractions
          );

        const aiUserTotal =
          firstValue(
            ai.users,
            ai.activeUsers,
            ai.usersUsingAI,
            stats.aiUsers
          );

        const aiActionTotal =
          firstValue(
            ai.actions,
            ai.totalActions,
            ai.agentActions,
            stats.aiActions
          );

        /* -----------------------------------------------
           TELEMETRY
        ------------------------------------------------ */

        const telemetryTotal =
          firstValue(
            stats.telemetryMessages,
            stats.telemetry,
            stats.messages,
            network.telemetry
          );

        /* -----------------------------------------------
           SYSTEM HEALTH
        ------------------------------------------------ */

        const cloudStatus =
          firstValue(
            system.cloud,
            system.cloudStatus,
            root.cloudStatus,
            "unknown"
          );

        const mqttStatus =
          firstValue(
            system.mqtt,
            system.mqttStatus,
            root.mqttStatus,
            "unknown"
          );

        const databaseStatus =
          firstValue(
            system.database,
            system.databaseStatus,
            root.databaseStatus,
            "unknown"
          );

        const socketStatus =
          firstValue(
            system.socket,
            system.socketStatus,
            root.socket,
            "unknown"
          );

        setDashboard({
          users: toNumber(
            userTotal
          ),

          workers: toNumber(
            workerTotal
          ),

          brSystems: toNumber(
            brSystemTotal
          ),

          brSystemsOnline:
            toNumber(brOnline),

          brSystemsOffline:
            toNumber(brOffline),

          gateways:
            toNumber(gatewayTotal),

          gatewaysOnline:
            toNumber(gatewayOnline),

          gatewaysOffline:
            toNumber(gatewayOffline),

          subscriptions:
            toNumber(
              subscriptionTotal
            ),

          activeSubscriptions:
            toNumber(
              activeSubscriptions
            ),

          payments:
            toNumber(paymentTotal),

          revenue:
            toNumber(revenue),

          alerts:
            toNumber(alertTotal),

          criticalAlerts:
            toNumber(
              criticalAlerts
            ),

          aiRequests:
            toNumber(
              aiRequestTotal
            ),

          aiUsers:
            toNumber(
              aiUserTotal
            ),

          aiActions:
            toNumber(
              aiActionTotal
            ),

          telemetryMessages:
            toNumber(
              telemetryTotal
            ),

          cloud:
            cloudStatus,

          mqtt:
            mqttStatus,

          database:
            databaseStatus,

          socket:
            socketStatus,

          activities:
            Array.isArray(
              activities
            )
              ? activities
              : [],

          alertsList:
            Array.isArray(alerts)
              ? alerts
              : [],
        });
      },
      []
    );

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  const fetchDashboard =
    useCallback(
      async (
        manual = false
      ) => {
        try {
          if (manual) {
            setRefreshing(true);
          }

          setError("");

          const response =
            await api.get(
              "/dashboard/stats"
            );

          console.log(
            "ANTIMATE ADMIN DASHBOARD:",
            response.data
          );

          parseDashboardData(
            response.data
          );

          setLastSync(
            new Date()
          );
        } catch (err) {
          console.error(
            "DASHBOARD LOAD ERROR:",
            err.response?.data ||
              err.message ||
              err
          );

          setError(
            err.response?.data
              ?.message ||
              (isRw
                ? "Dashboard ntishoboye kubona amakuru ya platform."
                : "Unable to load platform dashboard data.")
          );
        } finally {
          setLoading(false);

          if (manual) {
            setRefreshing(false);
          }
        }
      },
      [
        parseDashboardData,
        isRw,
      ]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* =======================================================
     SOCKET.IO
     
     We intentionally do not create a second socket
     connection here because AppLayout / backend can
     provide real-time updates independently.
     
     Dashboard refresh remains the safe fallback.
  ======================================================= */

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const platformHealth =
    useMemo(() => {
      const values = [
        dashboard.cloud,
        dashboard.mqtt,
        dashboard.database,
        dashboard.socket,
      ];

      const known = values.filter(
        (value) =>
          normalizeStatus(
            value
          ) !== "unknown"
      );

      if (!known.length) {
        return "unknown";
      }

      const healthy =
        known.filter(
          isOnlineStatus
        ).length;

      return healthy ===
        known.length
        ? "healthy"
        : "warning";
    }, [dashboard]);

  const activities =
    useMemo(() => {
      return [
        ...dashboard.activities,
      ]
        .sort((a, b) => {
          const first =
            new Date(
              getActivityTime(a) ||
                0
            ).getTime();

          const second =
            new Date(
              getActivityTime(b) ||
                0
            ).getTime();

          return second - first;
        })
        .slice(0, 8);
    }, [dashboard.activities]);

  const alerts =
    useMemo(() => {
      return [
        ...dashboard.alertsList,
      ]
        .sort((a, b) => {
          const first =
            new Date(
              getActivityTime(a) ||
                0
            ).getTime();

          const second =
            new Date(
              getActivityTime(b) ||
                0
            ).getTime();

          return second - first;
        })
        .slice(0, 6);
    }, [dashboard.alertsList]);

  /* =======================================================
     MAIN METRICS
  ======================================================= */

  const metrics = [
    {
      label: isRw
        ? "BR Systems"
        : "BR Systems",
      value:
        dashboard.brSystems,
      description:
        isRw
          ? `${dashboard.brSystemsOnline} online`
          : `${dashboard.brSystemsOnline} online`,
      icon: HardDrive,
      type: "blue",
    },

    {
      label: isRw
        ? "Gateways"
        : "Gateways",
      value:
        dashboard.gateways,
      description:
        isRw
          ? `${dashboard.gatewaysOnline} online`
          : `${dashboard.gatewaysOnline} online`,
      icon: Radio,
      type: "indigo",
    },

    {
      label: isRw
        ? "Users"
        : "Users",
      value:
        dashboard.users,
      description:
        isRw
          ? "Platform users"
          : "Platform users",
      icon: Users,
      type: "purple",
    },

    {
      label: isRw
        ? "Abakozi"
        : "Workers",
      value:
        dashboard.workers,
      description:
        isRw
          ? "ANTIMATE staff"
          : "ANTIMATE staff",
      icon: UserCog,
      type: "green",
    },

    {
      label: "ANTIMATE AI",
      value:
        dashboard.aiRequests,
      description:
        isRw
          ? "AI requests"
          : "AI requests",
      icon: Bot,
      type: "cyan",
    },

    {
      label: isRw
        ? "Subscriptions"
        : "Subscriptions",
      value:
        dashboard.activeSubscriptions,
      description:
        isRw
          ? "Active plans"
          : "Active plans",
      icon: CreditCard,
      type: "amber",
    },
  ];

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="platform-state">
        <div className="platform-state-content">
          <div className="platform-state-icon">
            <RefreshCw
              size={32}
              className="dashboard-spin"
            />
          </div>

          <h2>
            {isRw
              ? "ANTIMATE Admin irimo gutangira"
              : "ANTIMATE Admin is loading"}
          </h2>

          <p>
            {isRw
              ? "Turimo gukusanya amakuru ya platform..."
              : "Collecting platform-wide operational data..."}
          </p>
        </div>

        <style>{dashboardStyles}</style>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="platform-dashboard">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="platform-header">
        <div className="platform-header-main">

          <div className="platform-breadcrumb">
            <Globe2 size={13} />

            <span>
              ANTIMATE
            </span>

            <span>/</span>

            <span>
              Admin
            </span>

            <span>/</span>

            <strong>
              {isRw
                ? "Incamake"
                : "Overview"}
            </strong>
          </div>

          <div className="platform-title-row">

            <div>
              <h1>
                {isRw
                  ? "ANTIMATE Platform Overview"
                  : "ANTIMATE Platform Overview"}
              </h1>

              <p>
                {isRw
                  ? "Reba uko ecosystem yose ya ANTIMATE ihagaze, kuva kuri BR Systems na Gateways kugeza kuri Users, AI na Cloud."
                  : "Monitor the complete ANTIMATE ecosystem — BR Systems, gateways, users, AI, subscriptions and cloud infrastructure."}
              </p>
            </div>

            <button
              type="button"
              className="platform-refresh"
              onClick={() =>
                fetchDashboard(true)
              }
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "dashboard-spin"
                    : ""
                }
              />

              {refreshing
                ? isRw
                  ? "Biravugururwa..."
                  : "Refreshing..."
                : isRw
                  ? "Vugurura"
                  : "Refresh"}
            </button>

          </div>

          <div className="platform-meta">

            <span>
              <Clock3 size={13} />

              {isRw
                ? "Last sync"
                : "Last sync"}

              {" "}

              {lastSync
                ? formatDateTime(
                    lastSync
                  )
                : "—"}
            </span>

            <span className="platform-health">
              <span
                className={
                  platformHealth ===
                  "healthy"
                    ? "health-dot good"
                    : platformHealth ===
                        "warning"
                      ? "health-dot warning"
                      : "health-dot unknown"
                }
              />

              {platformHealth ===
              "healthy"
                ? isRw
                  ? "Platform iri gukora"
                  : "Platform operational"
                : platformHealth ===
                    "warning"
                  ? isRw
                    ? "Hari services zikeneye kurebwa"
                    : "Some services need attention"
                  : isRw
                    ? "Health status unknown"
                    : "Health status unknown"}
            </span>

          </div>
        </div>
      </header>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="platform-alert platform-alert-error">

          <AlertCircle size={18} />

          <div>
            <strong>
              {isRw
                ? "Dashboard error"
                : "Dashboard error"}
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchDashboard(true)
            }
          >
            <RefreshCw size={15} />

            {isRw
              ? "Ongera"
              : "Retry"}
          </button>

        </div>
      )}

      {/* ===================================================
          MAIN METRICS
      =================================================== */}

      <section className="admin-stat-list">

        {metrics.map(
          (metric) => (
            <StatCard
              key={
                metric.label
              }
              {...metric}
            />
          )
        )}

      </section>

      {/* ===================================================
          NETWORK OVERVIEW
      =================================================== */}

      <section className="platform-section">

        <div className="platform-section-header">

          <div>
            <span className="section-kicker">
              NETWORK
            </span>

            <h2>
              {isRw
                ? "Connected Infrastructure"
                : "Connected Infrastructure"}
            </h2>

            <p>
              {isRw
                ? "Imiterere rusange ya BR Systems na Gateways ziri muri ANTIMATE Cloud."
                : "Global connectivity status across BR Systems and ANTIMATE gateways."}
            </p>
          </div>

          <div className="section-live">
            <span />

            {isRw
              ? "LIVE NETWORK"
              : "LIVE NETWORK"}
          </div>

        </div>

        <div className="network-list">

          <NetworkBar
            label={
              isRw
                ? "BR Systems / Nodes"
                : "BR Systems / Nodes"
            }
            total={
              dashboard.brSystems
            }
            online={
              dashboard.brSystemsOnline
            }
            offline={
              dashboard.brSystemsOffline
            }
            isRw={isRw}
            icon={HardDrive}
          />

          <NetworkBar
            label={
              isRw
                ? "Gateways"
                : "Gateways"
            }
            total={
              dashboard.gateways
            }
            online={
              dashboard.gatewaysOnline
            }
            offline={
              dashboard.gatewaysOffline
            }
            isRw={isRw}
            icon={Radio}
          />

        </div>

      </section>

      {/* ===================================================
          SECONDARY OVERVIEW
      =================================================== */}

      <section className="platform-section">

        <div className="platform-section-header">

          <div>
            <span className="section-kicker">
              PLATFORM
            </span>

            <h2>
              {isRw
                ? "Platform Activity"
                : "Platform Activity"}
            </h2>

            <p>
              {isRw
                ? "Imibare y'ingenzi ijyanye n'abakoresha, subscriptions, payments na telemetry."
                : "Key business and operational activity across the platform."}
            </p>
          </div>

        </div>

        <div className="platform-overview-list">

          {/* USERS */}

          <div className="overview-row">

            <div className="overview-row-icon purple">
              <Users size={18} />
            </div>

            <div className="overview-row-main">
              <strong>
                {isRw
                  ? "Users"
                  : "Users"}
              </strong>

              <span>
                {isRw
                  ? "Abakoresha brooder-frontend"
                  : "People using brooder-frontend"}
              </span>
            </div>

            <strong className="overview-number">
              {formatNumber(
                dashboard.users
              )}
            </strong>

          </div>

          {/* WORKERS */}

          <div className="overview-row">

            <div className="overview-row-icon green">
              <UserCog size={18} />
            </div>

            <div className="overview-row-main">
              <strong>
                {isRw
                  ? "ANTIMATE Staff"
                  : "ANTIMATE Staff"}
              </strong>

              <span>
                {isRw
                  ? "Abakozi bafite access kuri admin"
                  : "Staff with administrative access"}
              </span>
            </div>

            <strong className="overview-number">
              {formatNumber(
                dashboard.workers
              )}
            </strong>

          </div>

          {/* SUBSCRIPTIONS */}

          <div className="overview-row">

            <div className="overview-row-icon amber">
              <CreditCard size={18} />
            </div>

            <div className="overview-row-main">
              <strong>
                {isRw
                  ? "Active Subscriptions"
                  : "Active Subscriptions"}
              </strong>

              <span>
                {formatNumber(
                  dashboard.activeSubscriptions
                )}{" "}
                {isRw
                  ? `muri ${formatNumber(
                      dashboard.subscriptions
                    )} zose`
                  : `of ${formatNumber(
                      dashboard.subscriptions
                    )} total`}
              </span>
            </div>

            <strong className="overview-number">
              {formatNumber(
                dashboard.activeSubscriptions
              )}
            </strong>

          </div>

          {/* PAYMENTS */}

          <div className="overview-row">

            <div className="overview-row-icon blue">
              <CreditCard size={18} />
            </div>

            <div className="overview-row-main">
              <strong>
                {isRw
                  ? "Payments"
                  : "Payments"}
              </strong>

              <span>
                {isRw
                  ? "Payment activity"
                  : "Payment activity"}
              </span>
            </div>

            <strong className="overview-number">
              {formatNumber(
                dashboard.payments
              )}
            </strong>

          </div>

          {/* TELEMETRY */}

          <div className="overview-row">

            <div className="overview-row-icon cyan">
              <Activity size={18} />
            </div>

            <div className="overview-row-main">
              <strong>
                {isRw
                  ? "Telemetry"
                  : "Telemetry"}
              </strong>

              <span>
                {isRw
                  ? "Messages zakiri muri Cloud"
                  : "Telemetry messages received"}
              </span>
            </div>

            <strong className="overview-number">
              {formatCompactNumber(
                dashboard.telemetryMessages
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* ===================================================
          AI + SYSTEM HEALTH
      =================================================== */}

      <div className="platform-two-column">

        {/* =================================================
            AI
        ================================================= */}

        <section className="platform-section ai-section">

          <div className="platform-section-header">

            <div>
              <span className="section-kicker">
                INTELLIGENCE
              </span>

              <h2>
                ANTIMATE AI
              </h2>

              <p>
                {isRw
                  ? "Imikoreshereze ya AI muri platform."
                  : "Artificial intelligence activity across the platform."}
              </p>
            </div>

            <div className="ai-status">
              <span />

              {isRw
                ? "AI ACTIVE"
                : "AI ACTIVE"}
            </div>

          </div>

          <div className="ai-overview">

            <div className="ai-main-number">

              <div className="ai-main-icon">
                <Bot size={25} />
              </div>

              <div>
                <span>
                  {isRw
                    ? "AI Requests"
                    : "AI Requests"}
                </span>

                <strong>
                  {formatNumber(
                    dashboard.aiRequests
                  )}
                </strong>

                <small>
                  {isRw
                    ? "AI interactions"
                    : "AI interactions"}
                </small>
              </div>

            </div>

            <div className="ai-stat-list">

              <div>
                <span>
                  {isRw
                    ? "AI Users"
                    : "AI Users"}
                </span>

                <strong>
                  {formatNumber(
                    dashboard.aiUsers
                  )}
                </strong>
              </div>

              <div>
                <span>
                  {isRw
                    ? "AI Actions"
                    : "AI Actions"}
                </span>

                <strong>
                  {formatNumber(
                    dashboard.aiActions
                  )}
                </strong>
              </div>

            </div>

          </div>

          <div className="ai-description">
            <Zap size={16} />

            <span>
              {isRw
                ? "ANTIMATE AI ishobora gusesengura amakuru ya BR Systems, gufasha users no gutanga ibikorwa bishingiye ku makuru ari muri Cloud."
                : "ANTIMATE AI can analyze BR System data, assist users and trigger intelligent actions using platform data."}
            </span>
          </div>

        </section>

        {/* =================================================
            SYSTEM HEALTH
        ================================================= */}

        <section className="platform-section">

          <div className="platform-section-header">

            <div>
              <span className="section-kicker">
                INFRASTRUCTURE
              </span>

              <h2>
                {isRw
                  ? "System Health"
                  : "System Health"}
              </h2>

              <p>
                {isRw
                  ? "Services z'ingenzi ANTIMATE ikoresha."
                  : "Core services powering the ANTIMATE platform."}
              </p>
            </div>

            <Gauge
              size={20}
              className="health-header-icon"
            />

          </div>

          <div className="system-status-list">

            <StatusRow
              icon={Cloud}
              label="ANTIMATE Cloud"
              description={
                isRw
                  ? "Application/API"
                  : "Application/API"
              }
              value={
                isOnlineStatus(
                  dashboard.cloud
                )
                  ? "ONLINE"
                  : normalizeStatus(
                        dashboard.cloud
                    ) === "unknown"
                    ? "UNKNOWN"
                    : "OFFLINE"
              }
              online={isOnlineStatus(
                dashboard.cloud
              )}
            />

            <StatusRow
              icon={Radio}
              label="MQTT"
              description={
                isRw
                  ? "Gateway messaging"
                  : "Gateway messaging"
              }
              value={
                isOnlineStatus(
                  dashboard.mqtt
                )
                  ? "CONNECTED"
                  : normalizeStatus(
                        dashboard.mqtt
                    ) === "unknown"
                    ? "UNKNOWN"
                    : "DISCONNECTED"
              }
              online={isOnlineStatus(
                dashboard.mqtt
              )}
            />

            <StatusRow
              icon={Database}
              label="MongoDB"
              description={
                isRw
                  ? "Platform database"
                  : "Platform database"
              }
              value={
                isOnlineStatus(
                  dashboard.database
                )
                  ? "CONNECTED"
                  : normalizeStatus(
                        dashboard.database
                    ) === "unknown"
                    ? "UNKNOWN"
                    : "OFFLINE"
              }
              online={isOnlineStatus(
                dashboard.database
              )}
            />

            <StatusRow
              icon={Wifi}
              label="Realtime"
              description={
                isRw
                  ? "Live updates"
                  : "Live updates"
              }
              value={
                isOnlineStatus(
                  dashboard.socket
                )
                  ? "CONNECTED"
                  : normalizeStatus(
                        dashboard.socket
                    ) === "unknown"
                    ? "UNKNOWN"
                    : "OFFLINE"
              }
              online={isOnlineStatus(
                dashboard.socket
              )}
            />

          </div>

        </section>

      </div>

      {/* ===================================================
          ACTIVITY + ALERTS
      =================================================== */}

      <div className="platform-two-column">

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <section className="platform-section">

          <div className="platform-section-header">

            <div>
              <span className="section-kicker">
                ACTIVITY
              </span>

              <h2>
                {isRw
                  ? "Recent Platform Activity"
                  : "Recent Platform Activity"}
              </h2>

              <p>
                {isRw
                  ? "Ibikorwa bishya byabaye kuri ecosystem."
                  : "Latest activity across the ANTIMATE ecosystem."}
              </p>
            </div>

            <Activity
              size={20}
              className="section-header-icon"
            />

          </div>

          <div className="activity-list">

            {activities.length ===
            0 ? (
              <div className="empty-platform">

                <Activity
                  size={26}
                />

                <strong>
                  {isRw
                    ? "Nta activity ihari"
                    : "No recent activity"}
                </strong>

                <span>
                  {isRw
                    ? "Platform activities zizagaragara hano."
                    : "Platform activities will appear here."}
                </span>

              </div>
            ) : (
              activities.map(
                (
                  item,
                  index
                ) => (
                  <div
                    className="activity-row"
                    key={
                      item?._id ||
                      item?.id ||
                      index
                    }
                  >

                    <div className="activity-dot">
                      <span />
                    </div>

                    <div className="activity-main">

                      <strong>
                        {getActivityMessage(
                          item,
                          isRw
                        )}
                      </strong>

                      <span>
                        {item?.actor ||
                          item?.user ||
                          item?.worker ||
                          item?.type ||
                          "ANTIMATE"}

                        {" • "}

                        {formatTime(
                          getActivityTime(
                            item
                          )
                        )}
                      </span>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </section>

        {/* =================================================
            ALERTS
        ================================================= */}

        <section className="platform-section">

          <div className="platform-section-header">

            <div>
              <span className="section-kicker">
                MONITORING
              </span>

              <h2>
                {isRw
                  ? "Recent Alerts"
                  : "Recent Alerts"}
              </h2>

              <p>
                {isRw
                  ? "Alerts ziri muri platform."
                  : "Operational alerts requiring attention."}
              </p>
            </div>

            <div className="alert-total">
              {formatNumber(
                dashboard.alerts
              )}
            </div>

          </div>

          <div className="alert-list">

            {alerts.length ===
            0 ? (
              <div className="empty-platform">

                <CheckCircle2
                  size={27}
                />

                <strong>
                  {isRw
                    ? "Nta alerts nshya"
                    : "No recent alerts"}
                </strong>

                <span>
                  {isRw
                    ? "Platform isa n'aho imeze neza."
                    : "No recent operational alerts detected."}
                </span>

              </div>
            ) : (
              alerts.map(
                (
                  alert,
                  index
                ) => {
                  const severity =
                    getAlertSeverity(
                      alert
                    );

                  return (
                    <div
                      key={
                        alert?._id ||
                        alert?.id ||
                        index
                      }
                      className={`platform-alert-row ${severity}`}
                    >

                      <div className="alert-row-icon">

                        {severity ===
                        "critical" ? (
                          <AlertTriangle
                            size={16}
                          />
                        ) : severity ===
                          "warning" ? (
                          <AlertCircle
                            size={16}
                          />
                        ) : (
                          <Activity
                            size={16}
                          />
                        )}

                      </div>

                      <div className="alert-row-main">

                        <div>
                          <strong>
                            {alert?.title ||
                              alert?.name ||
                              alert?.type ||
                              severity.toUpperCase()}
                          </strong>

                          <span>
                            {formatTime(
                              getActivityTime(
                                alert
                              )
                            )}
                          </span>
                        </div>

                        <p>
                          {alert?.message ||
                            alert?.description ||
                            (isRw
                              ? "System alert."
                              : "System alert.")}
                        </p>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

          {dashboard.criticalAlerts >
            0 && (
            <div className="critical-summary">

              <XCircle size={16} />

              <span>
                {isRw
                  ? `${formatNumber(
                      dashboard.criticalAlerts
                    )} critical alerts zisaba kwitabwaho.`
                  : `${formatNumber(
                      dashboard.criticalAlerts
                    )} critical alerts require attention.`}
              </span>

            </div>
          )}

        </section>

      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="platform-footer">

        <div>
          <span className="footer-dot" />

          {isRw
            ? "ANTIMATE Cloud platform monitoring active"
            : "ANTIMATE Cloud platform monitoring active"}
        </div>

        <span>
          {isRw
            ? "Admin Operations"
            : "Admin Operations"}
        </span>

      </footer>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style>{dashboardStyles}</style>

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const dashboardStyles = `

.platform-dashboard {
  width: 100%;
  max-width: 1250px;
  margin: 0 auto;
  padding: 4px 0 40px;
  color: var(--admin-text);
}

/* =========================================================
   HEADER
========================================================= */

.platform-header {
  margin-bottom: 24px;
}

.platform-header-main {
  width: 100%;
}

.platform-breadcrumb {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
  color: var(--admin-text-muted);
  font-size: 11px;
}

.platform-breadcrumb strong {
  color: var(--admin-text);
  font-weight: 650;
}

.platform-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
}

.platform-title-row h1 {
  margin: 0;
  color: var(--admin-text);
  font-size: 28px;
  line-height: 1.2;
  font-weight: 780;
  letter-spacing: -.6px;
}

.platform-title-row p {
  max-width: 760px;
  margin: 8px 0 0;
  color: var(--admin-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.platform-refresh {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 0 14px;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: var(--admin-surface);
  color: var(--admin-text);
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
  transition:
    border-color .18s ease,
    background .18s ease,
    transform .18s ease;
}

.platform-refresh:hover {
  border-color: var(--admin-accent);
  background: var(--admin-surface-subtle);
  transform: translateY(-1px);
}

.platform-refresh:disabled {
  opacity: .55;
  cursor: wait;
  transform: none;
}

.platform-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 13px;
  color: var(--admin-text-muted);
  font-size: 10px;
}

.platform-meta > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.platform-health {
  font-weight: 650;
}

.health-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.health-dot.good {
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, .10);
}

.health-dot.warning {
  background: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, .10);
}

.health-dot.unknown {
  background: #94a3b8;
}

/* =========================================================
   ERROR
========================================================= */

.platform-alert {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 18px;
  padding: 12px 14px;
  border-radius: 9px;
  font-size: 12px;
}

.platform-alert > div {
  min-width: 0;
  flex: 1;
}

.platform-alert strong {
  display: block;
  margin-bottom: 2px;
}

.platform-alert span {
  display: block;
  color: inherit;
  opacity: .82;
}

.platform-alert button {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 1px solid currentColor;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 11px;
  font-weight: 650;
}

.platform-alert-error {
  border: 1px solid rgba(239, 68, 68, .24);
  background: rgba(239, 68, 68, .06);
  color: #dc2626;
}

/* =========================================================
   STATISTICS
========================================================= */

.admin-stat-list {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border-top: 1px solid var(--admin-border);
  border-bottom: 1px solid var(--admin-border);
  margin-bottom: 28px;
}

.admin-stat {
  min-height: 91px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 16px;
  border-right: 1px solid var(--admin-border);
  background: var(--admin-surface);
}

.admin-stat:last-child {
  border-right: none;
}

.admin-stat-icon {
  width: 39px;
  height: 39px;
  flex: 0 0 39px;
  display: grid;
  place-items: center;
  border-radius: 9px;
}

.admin-stat-icon.blue {
  background: rgba(37, 99, 235, .10);
  color: #2563eb;
}

.admin-stat-icon.indigo {
  background: rgba(79, 70, 229, .10);
  color: #4f46e5;
}

.admin-stat-icon.purple {
  background: rgba(147, 51, 234, .10);
  color: #9333ea;
}

.admin-stat-icon.green {
  background: rgba(16, 185, 129, .10);
  color: #059669;
}

.admin-stat-icon.cyan {
  background: rgba(8, 145, 178, .10);
  color: #0891b2;
}

.admin-stat-icon.amber {
  background: rgba(217, 119, 6, .10);
  color: #d97706;
}

.admin-stat-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-stat-content > span {
  color: var(--admin-text-muted);
  font-size: 10px;
  font-weight: 650;
}

.admin-stat-content strong {
  margin-top: 4px;
  color: var(--admin-text);
  font-size: 21px;
  line-height: 1;
  font-weight: 800;
}

.admin-stat-content small {
  margin-top: 5px;
  overflow: hidden;
  color: var(--admin-text-muted);
  font-size: 9px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* =========================================================
   SECTION
========================================================= */

.platform-section {
  margin-bottom: 26px;
}

.platform-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
}

.section-kicker {
  display: block;
  margin-bottom: 4px;
  color: var(--admin-text-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .13em;
}

.platform-section-header h2 {
  margin: 0;
  color: var(--admin-text);
  font-size: 16px;
  font-weight: 750;
}

.platform-section-header p {
  margin: 5px 0 0;
  color: var(--admin-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.section-live {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #059669;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .09em;
  white-space: nowrap;
}

.section-live > span,
.ai-status > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, .10);
}

.section-header-icon,
.health-header-icon {
  color: var(--admin-text-muted);
}

/* =========================================================
   NETWORK
========================================================= */

.network-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--admin-border);
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface);
}

.network-item {
  padding: 17px 19px;
  border-bottom: 1px solid var(--admin-border);
}

.network-item:last-child {
  border-bottom: none;
}

.network-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.network-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.network-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--admin-accent-soft);
  color: var(--admin-accent);
}

.network-title > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.network-title strong {
  color: var(--admin-text);
  font-size: 12px;
  font-weight: 700;
}

.network-title span {
  color: var(--admin-text-muted);
  font-size: 10px;
}

.network-percentage {
  color: var(--admin-text);
  font-size: 13px;
}

.network-progress {
  height: 6px;
  overflow: hidden;
  margin: 15px 0 9px 45px;
  border-radius: 999px;
  background: var(--admin-surface-subtle);
}

.network-progress > div {
  height: 100%;
  border-radius: inherit;
  background: var(--admin-accent);
  transition: width .4s ease;
}

.network-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 45px;
  font-size: 9px;
}

.network-online,
.network-offline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.network-online {
  color: #059669;
}

.network-offline {
  color: #dc2626;
}

.network-online > span,
.network-offline > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.network-online > span {
  background: #10b981;
}

.network-offline > span {
  background: #ef4444;
}

/* =========================================================
   PLATFORM OVERVIEW LIST
========================================================= */

.platform-overview-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--admin-border);
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface);
}

.overview-row {
  min-height: 70px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--admin-border);
}

.overview-row:last-child {
  border-bottom: none;
}

.overview-row-icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  display: grid;
  place-items: center;
  border-radius: 8px;
}

.overview-row-icon.purple {
  background: rgba(147, 51, 234, .09);
  color: #9333ea;
}

.overview-row-icon.green {
  background: rgba(16, 185, 129, .09);
  color: #059669;
}

.overview-row-icon.amber {
  background: rgba(217, 119, 6, .09);
  color: #d97706;
}

.overview-row-icon.blue {
  background: rgba(37, 99, 235, .09);
  color: #2563eb;
}

.overview-row-icon.cyan {
  background: rgba(8, 145, 178, .09);
  color: #0891b2;
}

.overview-row-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.overview-row-main strong {
  color: var(--admin-text);
  font-size: 12px;
  font-weight: 700;
}

.overview-row-main span {
  color: var(--admin-text-muted);
  font-size: 10px;
}

.overview-number {
  color: var(--admin-text);
  font-size: 16px;
  font-weight: 800;
}

/* =========================================================
   TWO COLUMNS
========================================================= */

.platform-two-column {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
  gap: 28px;
  align-items: start;
}

/* =========================================================
   AI
========================================================= */

.ai-section {
  min-width: 0;
}

.ai-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #059669;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
}

.ai-overview {
  display: flex;
  align-items: stretch;
  border-top: 1px solid var(--admin-border);
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface);
}

.ai-main-number {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-right: 1px solid var(--admin-border);
}

.ai-main-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--admin-accent-soft);
  color: var(--admin-accent);
}

.ai-main-number > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ai-main-number span {
  color: var(--admin-text-muted);
  font-size: 10px;
  font-weight: 650;
}

.ai-main-number strong {
  color: var(--admin-text);
  font-size: 26px;
  line-height: 1;
  font-weight: 820;
}

.ai-main-number small {
  color: var(--admin-text-muted);
  font-size: 9px;
}

.ai-stat-list {
  min-width: 145px;
  display: flex;
  flex-direction: column;
}

.ai-stat-list > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 13px 16px;
}

.ai-stat-list > div + div {
  border-top: 1px solid var(--admin-border);
}

.ai-stat-list span {
  color: var(--admin-text-muted);
  font-size: 9px;
}

.ai-stat-list strong {
  color: var(--admin-text);
  font-size: 15px;
  font-weight: 780;
}

.ai-description {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: var(--admin-surface-subtle);
  color: var(--admin-text-muted);
  font-size: 10px;
  line-height: 1.6;
}

.ai-description svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--admin-accent);
}

/* =========================================================
   SYSTEM HEALTH
========================================================= */

.system-status-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--admin-border);
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface);
}

.system-status-row {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 11px 15px;
  border-bottom: 1px solid var(--admin-border);
}

.system-status-row:last-child {
  border-bottom: none;
}

.system-status-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.system-status-icon {
  width: 33px;
  height: 33px;
  display: grid;
  place-items: center;
  flex: 0 0 33px;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  color: var(--admin-text-muted);
}

.system-status-left > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.system-status-left strong {
  color: var(--admin-text);
  font-size: 11px;
}

.system-status-left span {
  color: var(--admin-text-muted);
  font-size: 9px;
}

.system-status-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
}

.system-status-value > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-good {
  color: #059669;
}

.status-good > span {
  background: #10b981;
}

.status-bad {
  color: #dc2626;
}

.status-bad > span {
  background: #ef4444;
}

/* =========================================================
   ACTIVITY
========================================================= */

.activity-list,
.alert-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--admin-border);
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface);
}

.activity-row {
  display: flex;
  gap: 11px;
  padding: 13px 15px;
  border-bottom: 1px solid var(--admin-border);
}

.activity-row:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 29px;
  height: 29px;
  flex: 0 0 29px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--admin-accent-soft);
}

.activity-dot span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--admin-accent);
}

.activity-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-main strong {
  color: var(--admin-text);
  font-size: 11px;
  font-weight: 650;
  line-height: 1.45;
}

.activity-main span {
  color: var(--admin-text-muted);
  font-size: 9px;
}

/* =========================================================
   ALERTS
========================================================= */

.alert-total {
  min-width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  padding: 0 7px;
  border-radius: 7px;
  background: rgba(217, 119, 6, .09);
  color: #b45309;
  font-size: 10px;
  font-weight: 800;
}

.platform-alert-row {
  display: flex;
  gap: 10px;
  padding: 13px 15px;
  border-bottom: 1px solid var(--admin-border);
}

.platform-alert-row:last-child {
  border-bottom: none;
}

.alert-row-icon {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  display: grid;
  place-items: center;
  border-radius: 8px;
}

.platform-alert-row.critical .alert-row-icon {
  background: rgba(239, 68, 68, .09);
  color: #dc2626;
}

.platform-alert-row.warning .alert-row-icon {
  background: rgba(245, 158, 11, .10);
  color: #d97706;
}

.platform-alert-row.info .alert-row-icon {
  background: rgba(37, 99, 235, .09);
  color: #2563eb;
}

.alert-row-main {
  min-width: 0;
  flex: 1;
}

.alert-row-main > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.alert-row-main strong {
  color: var(--admin-text);
  font-size: 10px;
  font-weight: 750;
}

.alert-row-main > div > span {
  color: var(--admin-text-muted);
  font-size: 8px;
}

.alert-row-main p {
  margin: 4px 0 0;
  color: var(--admin-text-muted);
  font-size: 9px;
  line-height: 1.5;
}

.critical-summary {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  padding: 9px 11px;
  border: 1px solid rgba(239, 68, 68, .18);
  border-radius: 7px;
  background: rgba(239, 68, 68, .05);
  color: #dc2626;
  font-size: 9px;
  font-weight: 650;
}

/* =========================================================
   EMPTY
========================================================= */

.empty-platform {
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  padding: 25px;
  text-align: center;
  color: var(--admin-text-muted);
}

.empty-platform svg {
  margin-bottom: 3px;
  color: var(--admin-accent);
}

.empty-platform strong {
  color: var(--admin-text);
  font-size: 11px;
}

.empty-platform span {
  font-size: 9px;
}

/* =========================================================
   FOOTER
========================================================= */

.platform-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding-top: 4px;
  color: var(--admin-text-muted);
  font-size: 9px;
}

.platform-footer > div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

/* =========================================================
   STATE
========================================================= */

.platform-state {
  min-height: 65vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: var(--admin-text);
}

.platform-state-content {
  display: flex;
  align-items: center;
  flex-direction: column;
  max-width: 400px;
  text-align: center;
}

.platform-state-icon {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  margin-bottom: 17px;
  border-radius: 16px;
  background: var(--admin-accent-soft);
  color: var(--admin-accent);
}

.platform-state-content h2 {
  margin: 0;
  font-size: 18px;
}

.platform-state-content p {
  margin: 7px 0 0;
  color: var(--admin-text-muted);
  font-size: 11px;
  line-height: 1.6;
}

/* =========================================================
   ANIMATION
========================================================= */

.dashboard-spin {
  animation: dashboard-spin-animation 0.8s linear infinite;
}

@keyframes dashboard-spin-animation {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1120px) {

  .admin-stat-list {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .admin-stat:nth-child(3) {
    border-right: none;
  }

  .admin-stat:nth-child(-n + 3) {
    border-bottom:
      1px solid var(--admin-border);
  }

  .platform-two-column {
    grid-template-columns: 1fr;
    gap: 5px;
  }

}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 760px) {

  .platform-dashboard {
    padding-bottom: 25px;
  }

  .platform-title-row {
    align-items: stretch;
    flex-direction: column;
  }

  .platform-title-row h1 {
    font-size: 23px;
  }

  .platform-title-row p {
    font-size: 12px;
  }

  .platform-refresh {
    width: 100%;
  }

  .platform-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .admin-stat-list {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    margin-left: -1px;
    margin-right: -1px;
  }

  .admin-stat {
    min-height: 75px;
    padding: 11px;
    border-bottom:
      1px solid var(--admin-border);
  }

  .admin-stat:nth-child(odd) {
    border-right:
      1px solid var(--admin-border);
  }

  .admin-stat:nth-child(even) {
    border-right: none;
  }

  .admin-stat-icon {
    width: 33px;
    height: 33px;
    flex-basis: 33px;
  }

  .admin-stat-content strong {
    font-size: 18px;
  }

  .admin-stat-content > span {
    font-size: 9px;
  }

  .admin-stat-content small {
    font-size: 8px;
  }

  .platform-section-header {
    align-items: flex-start;
  }

  .network-progress {
    margin-left: 0;
  }

  .network-meta {
    margin-left: 0;
  }

  .ai-overview {
    flex-direction: column;
  }

  .ai-main-number {
    border-right: none;
    border-bottom:
      1px solid var(--admin-border);
  }

  .ai-stat-list {
    min-width: 0;
    display: grid;
    grid-template-columns:
      repeat(2, 1fr);
  }

  .ai-stat-list > div + div {
    border-top: none;
    border-left:
      1px solid var(--admin-border);
  }

  .platform-footer {
    align-items: flex-start;
    flex-direction: column;
  }

}

/* =========================================================
   SMALL PHONE
========================================================= */

@media (max-width: 430px) {

  .platform-breadcrumb {
    font-size: 9px;
  }

  .platform-title-row h1 {
    font-size: 21px;
  }

  .admin-stat {
    gap: 8px;
    padding: 9px;
  }

  .admin-stat-icon {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
  }

  .admin-stat-content strong {
    font-size: 17px;
  }

  .overview-row {
    padding: 11px;
  }

  .overview-row-main span {
    font-size: 9px;
  }

  .overview-number {
    font-size: 14px;
  }

  .network-item {
    padding: 14px;
  }

  .ai-main-number {
    padding: 15px;
  }

  .ai-main-number strong {
    font-size: 22px;
  }

}
`;