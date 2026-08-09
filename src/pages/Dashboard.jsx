import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Cpu,
  Wifi,
  WifiOff,
  Router,
  Users,
  Bell,
  RefreshCw,
  Thermometer,
  Droplets,
  Flame,
  Fan,
  AlertTriangle,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
};

const getStatusBadge = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "online") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
        Online
      </span>
    );
  }
  if (normalized === "warning") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
        Warning
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
      <XCircle className="w-3.5 h-3.5 text-red-600" />
      Offline
    </span>
  );
};

const getAlertBadge = (severity) => {
  const normalized = String(severity || "").toLowerCase();
  if (normalized === "critical" || normalized === "high") {
    return "bg-red-100 text-red-800 border-red-200";
  }
  if (normalized === "medium" || normalized === "warning") {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
  return "bg-blue-100 text-blue-800 border-blue-200";
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(new Date());

  const [stats, setStats] = useState({
    devices: 0,
    online: 0,
    offline: 0,
    gateways: 0,
    users: 0,
    alerts: 0,
  });

  const [environment, setEnvironment] = useState({
    temperature: 0,
    humidity: 0,
  });

  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

 const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
  if (isManualRefresh) setRefreshing(true);

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await axios.get(
      `${API}/api/dashboard/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data || {};
    const dashboardStats = data.stats || {};

    setStats((prev) => ({
      ...prev,
      users: dashboardStats.users ?? 0,
      devices: dashboardStats.devices ?? 0,
      online: dashboardStats.activeDevices ?? 0,
      offline:
        (dashboardStats.devices ?? 0) -
        (dashboardStats.activeDevices ?? 0),
    }));

    setError(false);

    console.log("Dashboard API:", data);
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
    setError(true);
  } finally {
    setLoading(false);
    if (isManualRefresh) setRefreshing(false);
  }
}, []);
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const socket = io(API, { transports: ["websocket", "polling"] });

    socket.on("dashboard:update", (data) => {
      if (!data) return;
      if (data.stats) setStats(data.stats);
      if (data.environment) setEnvironment(data.environment);
      if (Array.isArray(data.devices)) setDevices(data.devices);
      if (Array.isArray(data.alerts)) setAlerts(data.alerts);fetch
    });

    socket.on("telemetry:update", (telemetry) => {
      if (!telemetry) return;
      if (telemetry.temperature !== undefined || telemetry.humidity !== undefined) {
        setEnvironment((prev) => ({
          temperature: telemetry.temperature ?? prev.temperature,
          humidity: telemetry.humidity ?? prev.humidity,
        }));
      }
      if (telemetry.deviceId) {
        setDevices((prev) =>
          prev.map((dev) =>
            dev.id === telemetry.deviceId || dev.deviceId === telemetry.deviceId
              ? { ...dev, ...telemetry, lastSeen: telemetry.lastSeen || new Date().toISOString() }
              : dev
          )
        );
      }
    });

    socket.on("alert:new", (newAlert) => {
      if (!newAlert) return;
      setAlerts((prev) => [newAlert, ...prev]);
      setStats((prev) => ({ ...prev, alerts: prev.alerts + 1 }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const heaterStatus = useMemo(() => {
    return environment.temperature < 20 ? "ON" : "OFF";
  }, [environment.temperature]);

  const fanStatus = useMemo(() => {
    return environment.temperature > 30 ? "ON" : "OFF";
  }, [environment.temperature]);

  const statCards = useMemo(
    () => [
      {
        title: "Total Devices",
        value: stats.devices,
        desc: "Registered endpoint sensors",
        icon: Cpu,
        color: "text-blue-600 bg-blue-50 border-blue-100",
      },
      {
        title: "Online Devices",
        value: stats.online,
        desc: "Active & sending telemetry",
        icon: Wifi,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      },
      {
        title: "Offline Devices",
        value: stats.offline,
        desc: "Disconnected or silent",
        icon: WifiOff,
        color: "text-rose-600 bg-rose-50 border-rose-100",
      },
      {
        title: "Total Gateways",
        value: stats.gateways,
        desc: "Active network bridges",
        icon: Router,
        color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      },
      {
        title: "Total Users",
        value: stats.users,
        desc: "Registered administrators",
        icon: Users,
        color: "text-purple-600 bg-purple-50 border-purple-100",
      },
      {
        title: "Active Alerts",
        value: stats.alerts,
        desc: "Requires immediate attention",
        icon: Bell,
        color: "text-amber-600 bg-amber-50 border-amber-100",
      },
    ],
    [stats]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow border border-gray-200 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Failed to load telemetry and system metrics from the API gateway server.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow transition-colors w-full"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              ANTIMATE ADMIN
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{formatDateTime(now)}</span>
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl shadow hover:shadow-md transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white p-5 rounded-2xl shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 flex items-start justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-3xl font-black text-gray-900 mt-2">{card.value ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
                </div>
                <div className={`p-3 rounded-xl border ${card.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </section>

        <section className="bg-white p-6 rounded-2xl shadow border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-blue-600" />
            Live Environment Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Avg Temperature</p>
                <p className="text-xl font-bold text-gray-900">
                  {environment.temperature !== undefined ? `${environment.temperature}°C` : "--"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Avg Humidity</p>
                <p className="text-xl font-bold text-gray-900">
                  {environment.humidity !== undefined ? `${environment.humidity}%` : "--"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex items-center gap-4">
              <div
                className={`p-3 rounded-lg ${
                  heaterStatus === "ON"
                    ? "bg-amber-100 text-amber-600 animate-pulse"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Heater Status</p>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded ${
                    heaterStatus === "ON"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {heaterStatus}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex items-center gap-4">
              <div
                className={`p-3 rounded-lg ${
                  fanStatus === "ON"
                    ? "bg-cyan-100 text-cyan-600 animate-spin"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <Fan className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Fan Status</p>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded ${
                    fanStatus === "ON"
                      ? "bg-cyan-100 text-cyan-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {fanStatus}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  Device Status
                </h2>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {devices.length} Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 px-2">Device ID</th>
                      <th className="pb-3 px-2">Farm</th>
                      <th className="pb-3 px-2">Temperature</th>
                      <th className="pb-3 px-2">Humidity</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {devices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                          No device records found.
                        </td>
                      </tr>
                    ) : (
                      devices.map((device, idx) => (
                        <tr
                          key={device.id || device.deviceId || idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-2 font-mono font-medium text-gray-900">
                            {device.id || device.deviceId || "N/A"}
                          </td>
                          <td className="py-3 px-2 text-gray-600 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            {device.farm || "Unassigned"}
                          </td>
                          <td className="py-3 px-2 text-gray-700">
                            {device.temperature !== undefined ? `${device.temperature}°C` : "--"}
                          </td>
                          <td className="py-3 px-2 text-gray-700">
                            {device.humidity !== undefined ? `${device.humidity}%` : "--"}
                          </td>
                          <td className="py-3 px-2">{getStatusBadge(device.status)}</td>
                          <td className="py-3 px-2 text-xs text-gray-400">
                            {device.lastSeen
                              ? new Date(device.lastSeen).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Just now"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                Recent Alerts
              </h2>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                {alerts.length} New
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No recent alert triggers.
                </div>
              ) : (
                alerts.map((alert, idx) => (
                  <div
                    key={alert.id || idx}
                    className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getAlertBadge(
                          alert.severity
                        )}`}
                      >
                        {alert.severity || "INFO"}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.time
                          ? new Date(alert.time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Now"}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-1">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}