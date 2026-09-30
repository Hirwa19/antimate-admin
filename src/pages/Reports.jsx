import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

export default function Reports() {
  const { language, theme } =
    useAppSettings();

  const isRw =
    language === "rw" ||
    language === "kinyarwanda";

  const isDark =
    theme === "dark";

  const [scope, setScope] =
    useState("team");

  const [overview, setOverview] =
    useState(null);

  const [analytics, setAnalytics] =
    useState(null);

  const [reports, setReports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [analyticsLoading, setAnalyticsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });

  /*
  ============================================================
  TRANSLATIONS
  ============================================================
  */

  const t = useMemo(
    () => ({
      title: isRw
        ? "Raporo"
        : "Reports",

      subtitle: isRw
        ? "Raporo z'imirimo, iterambere n'imikorere y'ikigo"
        : "Company reporting, progress and performance intelligence",

      refresh: isRw
        ? "Kongera"
        : "Refresh",

      create: isRw
        ? "Kora Raporo"
        : "Create Report",

      scope: isRw
        ? "Reba"
        : "View",

      team: isRw
        ? "Ikipe Yanjye"
        : "My Team",

      my: isRw
        ? "Raporo Zanjye"
        : "My Reports",

      department: isRw
        ? "Department Yanjye"
        : "My Department",

      company: isRw
        ? "Ikigo Cyose"
        : "Company",

      totalReports: isRw
        ? "Raporo Zose"
        : "Total Reports",

      averageProgress: isRw
        ? "Impuzandengo y'Iterambere"
        : "Average Progress",

      pendingReview: isRw
        ? "Zitegereje Isuzuma"
        : "Pending Review",

      approved: isRw
        ? "Zemejwe"
        : "Approved",

      flagged: isRw
        ? "Zashyizwe ku Murongo"
        : "Flagged",

      approvalRate: isRw
        ? "Igipimo cyo Kwemeza"
        : "Approval Rate",

      analytics: isRw
        ? "Isesengura"
        : "Analytics",

      progressTrend: isRw
        ? "Iterambere"
        : "Progress Trend",

      departments: isRw
        ? "Departments"
        : "Departments",

      employees: isRw
        ? "Abakozi"
        : "Employees",

      challenges: isRw
        ? "Imbogamizi"
        : "Challenges",

      blockers: isRw
        ? "Ibibuza Akazi"
        : "Blockers",

      recentReports: isRw
        ? "Raporo Zigezweho"
        : "Recent Reports",

      search: isRw
        ? "Shakisha raporo..."
        : "Search reports...",

      allStatuses: isRw
        ? "Status zose"
        : "All statuses",

      allTypes: isRw
        ? "Ubwoko bwose"
        : "All types",

      noReports: isRw
        ? "Nta raporo zabonetse."
        : "No reports found.",

      loading: isRw
        ? "Birimo gutegurwa..."
        : "Loading...",

      error: isRw
        ? "Hari ikibazo cyo kubona raporo."
        : "Failed to load reports.",

      draft: isRw
        ? "Draft"
        : "Draft",

      submitted: isRw
        ? "Yoherejwe"
        : "Submitted",

      underReview: isRw
        ? "Irimo Gusuzumwa"
        : "Under Review",

      approvedStatus: isRw
        ? "Yemejwe"
        : "Approved",

      rejected: isRw
        ? "Yanzwe"
        : "Rejected",

      needsRevision: isRw
        ? "Isaba Gukosorwa"
        : "Needs Revision",

      daily: isRw
        ? "Buri munsi"
        : "Daily",

      weekly: isRw
        ? "Buri cyumweru"
        : "Weekly",

      monthly: isRw
        ? "Buri kwezi"
        : "Monthly",

      project: isRw
        ? "Umushinga"
        : "Project",

      incident: isRw
        ? "Incident"
        : "Incident",

      field: isRw
        ? "Field"
        : "Field",

      progress: isRw
        ? "Progress"
        : "Progress",

      other: isRw
        ? "Ibindi"
        : "Other",

      reports: isRw
        ? "raporo"
        : "reports",

      view: isRw
        ? "Reba"
        : "View",

      previous: isRw
        ? "Ibanza"
        : "Previous",

      next: isRw
        ? "Komeza"
        : "Next",

      insight: isRw
        ? "Insight"
        : "Insight",

      noInsights: isRw
        ? "Nta makuru yihariye yabonetse."
        : "No specific insights available.",
    }),
    [isRw]
  );

  /*
  ============================================================
  LOAD OVERVIEW + REPORTS
  ============================================================
  */

  const loadReports = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          scope,
          page,
          limit: 10,
        };

        if (search.trim()) {
          params.search =
            search.trim();
        }

        if (statusFilter) {
          params.status =
            statusFilter;
        }

        if (typeFilter) {
          params.reportType =
            typeFilter;
        }

        const [
          overviewResponse,
          reportsResponse,
        ] = await Promise.all([
          api.get(
            "/reports/overview",
            {
              params: {
                scope,
              },
            }
          ),

          api.get(
            "/reports",
            {
              params,
            }
          ),
        ]);

        if (
          overviewResponse.data
            ?.success
        ) {
          setOverview(
            overviewResponse.data
              .overview || null
          );
        }

        if (
          reportsResponse.data
            ?.success
        ) {
          setReports(
            reportsResponse.data
              .reports || []
          );

          setPagination(
            reportsResponse.data
              .pagination || {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0,
            }
          );
        }
      } catch (err) {
        console.error(
          "REPORTS LOAD ERROR:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            t.error
        );
      } finally {
        setLoading(false);
      }
    },
    [
      scope,
      page,
      search,
      statusFilter,
      typeFilter,
      t.error,
    ]
  );

  /*
  ============================================================
  LOAD ANALYTICS
  ============================================================
  */

  const loadAnalytics =
    useCallback(
      async () => {
        try {
          setAnalyticsLoading(
            true
          );

          const response =
            await api.get(
              "/reports/analytics",
              {
                params: {
                  scope,
                },
              }
            );

          if (
            response.data
              ?.success
          ) {
            setAnalytics(
              response.data
            );
          }
        } catch (err) {
          console.error(
            "REPORT ANALYTICS ERROR:",
            err
          );
        } finally {
          setAnalyticsLoading(
            false
          );
        }
      },
      [scope]
    );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  /*
  ============================================================
  REFRESH
  ============================================================
  */

  const refreshAll = () => {
    loadReports();
    loadAnalytics();
  };

  /*
  ============================================================
  HELPERS
  ============================================================
  */

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "—";
    }

    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "—";
    }

    return value.toLocaleDateString(
      isRw
        ? "rw-RW"
        : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const getEmployeeName = (
    employee
  ) => {
    if (!employee) {
      return isRw
        ? "Ntabwo azwi"
        : "Unknown";
    }

    return (
      employee.fullName ||
      [
        employee.firstName,
        employee.secondName,
      ]
        .filter(Boolean)
        .join(" ") ||
      employee.email ||
      "Unknown"
    );
  };

  const getStatusLabel = (
    status
  ) => {
    const labels = {
      draft: t.draft,
      submitted: t.submitted,
      under_review:
        t.underReview,
      approved:
        t.approvedStatus,
      rejected:
        t.rejected,
      needs_revision:
        t.needsRevision,
    };

    return (
      labels[status] ||
      status ||
      "—"
    );
  };

  const getTypeLabel = (
    type
  ) => {
    const labels = {
      daily: t.daily,
      weekly: t.weekly,
      monthly: t.monthly,
      project: t.project,
      incident: t.incident,
      field: t.field,
      progress: t.progress,
      other: t.other,
    };

    return (
      labels[type] ||
      type ||
      "—"
    );
  };

  const getStatusClass = (
    status
  ) => {
    return `status-${String(
      status || ""
    ).replace(
      /_/g,
      "-"
    )}`;
  };

  /*
  ============================================================
  CSS VARIABLES
  ============================================================
  */

  const css = `
    .reports-page {
      --reports-bg: ${
        isDark
          ? "#0b1020"
          : "#f6f8fc"
      };
      --reports-card: ${
        isDark
          ? "#121a2d"
          : "#ffffff"
      };
      --reports-border: ${
        isDark
          ? "#25314a"
          : "#e5e9f2"
      };
      --reports-text: ${
        isDark
          ? "#f3f6fb"
          : "#172033"
      };
      --reports-muted: ${
        isDark
          ? "#9ba8bd"
          : "#687386"
      };
      --reports-primary: #3157d5;
      --reports-primary-soft: ${
        isDark
          ? "rgba(49,87,213,.16)"
          : "#eef2ff"
      };
      --reports-purple: #7654d9;
      --reports-green: #159570;
      --reports-orange: #d98424;
      --reports-red: #d64b55;

      min-height: 100%;
      background: var(--reports-bg);
      color: var(--reports-text);
      padding: 24px;
      box-sizing: border-box;
    }

    .reports-container {
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
    }

    .reports-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 24px;
    }

    .reports-heading h1 {
      margin: 0 0 7px;
      font-size: 28px;
      line-height: 1.2;
      font-weight: 750;
      letter-spacing: -.4px;
    }

    .reports-heading p {
      margin: 0;
      color: var(--reports-muted);
      font-size: 14px;
      line-height: 1.5;
    }

    .reports-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .reports-button {
      height: 42px;
      border: 1px solid var(--reports-border);
      background: var(--reports-card);
      color: var(--reports-text);
      border-radius: 9px;
      padding: 0 15px;
      font-size: 13px;
      font-weight: 650;
      cursor: pointer;
      transition: .18s ease;
    }

    .reports-button:hover {
      border-color: var(--reports-primary);
      color: var(--reports-primary);
    }

    .reports-button.primary {
      background: var(--reports-primary);
      border-color: var(--reports-primary);
      color: #fff;
    }

    .reports-button.primary:hover {
      opacity: .92;
      color: #fff;
    }

    .reports-button:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    .reports-scope-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      margin-bottom: 20px;
      background: var(--reports-card);
      border: 1px solid var(--reports-border);
      border-radius: 12px;
      overflow-x: auto;
    }

    .scope-label {
      color: var(--reports-muted);
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: .4px;
    }

    .scope-button {
      border: 1px solid transparent;
      background: transparent;
      color: var(--reports-muted);
      border-radius: 8px;
      height: 36px;
      padding: 0 13px;
      font-size: 13px;
      font-weight: 650;
      white-space: nowrap;
      cursor: pointer;
    }

    .scope-button:hover {
      color: var(--reports-text);
      background: var(--reports-primary-soft);
    }

    .scope-button.active {
      background: var(--reports-primary-soft);
      color: var(--reports-primary);
      border-color: rgba(49,87,213,.18);
    }

    .reports-error {
      padding: 13px 15px;
      margin-bottom: 18px;
      border: 1px solid rgba(214,75,85,.25);
      background: ${
        isDark
          ? "rgba(214,75,85,.1)"
          : "#fff2f3"
      };
      color: var(--reports-red);
      border-radius: 9px;
      font-size: 13px;
    }

    .reports-kpi-grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 13px;
      margin-bottom: 20px;
    }

    .reports-kpi {
      min-width: 0;
      background: var(--reports-card);
      border: 1px solid var(--reports-border);
      border-radius: 12px;
      padding: 17px;
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 13px;
    }

    .kpi-label {
      color: var(--reports-muted);
      font-size: 12px;
      font-weight: 650;
      line-height: 1.3;
    }

    .kpi-icon {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: var(--reports-primary-soft);
      color: var(--reports-primary);
      font-size: 14px;
      flex-shrink: 0;
    }

    .kpi-value {
      font-size: 25px;
      line-height: 1;
      font-weight: 750;
      letter-spacing: -.5px;
    }

    .kpi-sub {
      margin-top: 8px;
      color: var(--reports-muted);
      font-size: 11px;
    }

    .reports-main-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.65fr) minmax(320px, .85fr);
      gap: 18px;
      margin-bottom: 20px;
    }

    .reports-panel {
      min-width: 0;
      background: var(--reports-card);
      border: 1px solid var(--reports-border);
      border-radius: 12px;
      overflow: hidden;
    }

    .panel-header {
      padding: 16px 18px;
      border-bottom: 1px solid var(--reports-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }

    .panel-header h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 720;
    }

    .panel-header span {
      color: var(--reports-muted);
      font-size: 11px;
    }

    .trend-content {
      padding: 18px;
    }

    .trend-chart {
      min-height: 210px;
      display: flex;
      align-items: flex-end;
      gap: 8px;
      overflow-x: auto;
      padding: 10px 4px 4px;
    }

    .trend-empty {
      width: 100%;
      min-height: 190px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--reports-muted);
      font-size: 13px;
    }

    .trend-item {
      min-width: 36px;
      flex: 1 0 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      gap: 7px;
      height: 190px;
    }

    .trend-value {
      color: var(--reports-muted);
      font-size: 9px;
    }

    .trend-bar-wrap {
      width: 100%;
      max-width: 34px;
      height: 135px;
      display: flex;
      align-items: flex-end;
    }

    .trend-bar {
      width: 100%;
      min-height: 3px;
      background: var(--reports-primary);
      border-radius: 5px 5px 2px 2px;
      transition: height .3s ease;
    }

    .trend-date {
      color: var(--reports-muted);
      font-size: 9px;
      white-space: nowrap;
    }

    .insights-list {
      padding: 4px 0;
    }

    .insight-item {
      display: flex;
      gap: 11px;
      padding: 13px 18px;
      border-bottom: 1px solid var(--reports-border);
    }

    .insight-item:last-child {
      border-bottom: 0;
    }

    .insight-indicator {
      width: 7px;
      height: 7px;
      margin-top: 6px;
      border-radius: 50%;
      background: var(--reports-primary);
      flex-shrink: 0;
    }

    .insight-indicator.high {
      background: var(--reports-red);
    }

    .insight-indicator.medium {
      background: var(--reports-orange);
    }

    .insight-indicator.low {
      background: var(--reports-green);
    }

    .insight-title {
      font-size: 12px;
      font-weight: 720;
      margin-bottom: 3px;
    }

    .insight-message {
      color: var(--reports-muted);
      font-size: 11px;
      line-height: 1.45;
    }

    .reports-secondary-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-bottom: 20px;
    }

    .ranking-list {
      padding: 4px 0;
    }

    .ranking-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 15px;
      padding: 12px 18px;
      border-bottom: 1px solid var(--reports-border);
    }

    .ranking-row:last-child {
      border-bottom: 0;
    }

    .ranking-name {
      min-width: 0;
      font-size: 12px;
      font-weight: 650;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ranking-meta {
      color: var(--reports-muted);
      font-size: 10px;
      margin-top: 3px;
    }

    .ranking-value {
      font-size: 12px;
      font-weight: 750;
      align-self: center;
    }

    .reports-table-panel {
      margin-top: 0;
    }

    .table-toolbar {
      padding: 13px 18px;
      display: flex;
      gap: 9px;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--reports-border);
    }

    .reports-input,
    .reports-select {
      height: 38px;
      border: 1px solid var(--reports-border);
      background: ${
        isDark
          ? "#0f1728"
          : "#fbfcfe"
      };
      color: var(--reports-text);
      border-radius: 8px;
      padding: 0 11px;
      font-size: 12px;
      outline: none;
    }

    .reports-input {
      flex: 1;
      min-width: 210px;
    }

    .reports-input:focus,
    .reports-select:focus {
      border-color: var(--reports-primary);
    }

    .table-scroll {
      overflow-x: auto;
    }

    .reports-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 820px;
    }

    .reports-table th {
      padding: 11px 18px;
      text-align: left;
      color: var(--reports-muted);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .45px;
      font-weight: 750;
      background: ${
        isDark
          ? "#10182a"
          : "#fafbfe"
      };
      border-bottom: 1px solid var(--reports-border);
    }

    .reports-table td {
      padding: 13px 18px;
      font-size: 12px;
      border-bottom: 1px solid var(--reports-border);
      vertical-align: middle;
    }

    .reports-table tbody tr:hover {
      background: ${
        isDark
          ? "rgba(255,255,255,.025)"
          : "#fafbff"
      };
    }

    .report-title-cell {
      max-width: 280px;
      font-weight: 680;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .employee-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .employee-name {
      font-weight: 650;
    }

    .employee-email {
      color: var(--reports-muted);
      font-size: 10px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      min-height: 25px;
      padding: 0 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-draft {
      background: ${
        isDark
          ? "rgba(155,168,189,.12)"
          : "#eef1f5"
      };
      color: var(--reports-muted);
    }

    .status-submitted {
      background: ${
        isDark
          ? "rgba(49,87,213,.15)"
          : "#edf1ff"
      };
      color: var(--reports-primary);
    }

    .status-under-review {
      background: ${
        isDark
          ? "rgba(217,132,36,.15)"
          : "#fff4e4"
      };
      color: var(--reports-orange);
    }

    .status-approved {
      background: ${
        isDark
          ? "rgba(21,149,112,.15)"
          : "#eaf8f4"
      };
      color: var(--reports-green);
    }

    .status-rejected {
      background: ${
        isDark
          ? "rgba(214,75,85,.15)"
          : "#fff0f1"
      };
      color: var(--reports-red);
    }

    .status-needs-revision {
      background: ${
        isDark
          ? "rgba(217,132,36,.15)"
          : "#fff4e4"
      };
      color: var(--reports-orange);
    }

    .progress-cell {
      min-width: 110px;
    }

    .progress-line {
      height: 5px;
      width: 100%;
      background: ${
        isDark
          ? "#25314a"
          : "#e9edf4"
      };
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .progress-fill {
      height: 100%;
      background: var(--reports-primary);
      border-radius: inherit;
    }

    .progress-text {
      color: var(--reports-muted);
      font-size: 10px;
    }

    .flagged-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--reports-red);
      margin-right: 5px;
    }

    .table-empty {
      padding: 42px 20px;
      text-align: center;
      color: var(--reports-muted);
      font-size: 13px;
    }

    .table-loading {
      padding: 42px 20px;
      text-align: center;
      color: var(--reports-muted);
      font-size: 13px;
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      padding: 13px 18px;
      color: var(--reports-muted);
      font-size: 11px;
    }

    .pagination-actions {
      display: flex;
      gap: 7px;
    }

    .pagination-button {
      height: 32px;
      padding: 0 10px;
      border-radius: 7px;
      border: 1px solid var(--reports-border);
      background: var(--reports-card);
      color: var(--reports-text);
      cursor: pointer;
      font-size: 11px;
    }

    .pagination-button:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    .reports-loading-screen {
      min-height: 420px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--reports-muted);
      font-size: 13px;
    }

    @media (max-width: 1250px) {
      .reports-kpi-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 950px) {
      .reports-main-grid {
        grid-template-columns: 1fr;
      }

      .reports-secondary-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 700px) {
      .reports-page {
        padding: 15px;
      }

      .reports-header {
        flex-direction: column;
      }

      .reports-actions {
        width: 100%;
      }

      .reports-button {
        flex: 1;
      }

      .reports-kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .reports-kpi {
        padding: 14px;
      }

      .kpi-value {
        font-size: 22px;
      }

      .reports-scope-bar {
        border-radius: 9px;
      }
    }

    @media (max-width: 430px) {
      .reports-kpi-grid {
        grid-template-columns: 1fr 1fr;
        gap: 9px;
      }

      .kpi-label {
        font-size: 10px;
      }

      .kpi-value {
        font-size: 19px;
      }

      .kpi-icon {
        display: none;
      }

      .reports-heading h1 {
        font-size: 24px;
      }
    }
  `;

  /*
  ============================================================
  CHART DATA
  ============================================================
  */

  const trend =
    analytics?.progressTrend || [];

  const maxTrend =
    Math.max(
      ...trend.map(
        (item) =>
          Number(
            item.averageProgress
          ) || 0
      ),
      1
    );

  const departments =
    analytics?.departmentPerformance ||
    [];

  const employees =
    analytics?.employeePerformance ||
    [];

  const challenges =
    analytics?.challengeStats || [];

  const blockers =
    analytics?.blockerStats || [];

  const insights =
    analytics?.insights || [];

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="reports-page">
      <style>{css}</style>

      <div className="reports-container">
        <header className="reports-header">
          <div className="reports-heading">
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>

          <div className="reports-actions">
            <button
              type="button"
              className="reports-button"
              onClick={refreshAll}
              disabled={
                loading ||
                analyticsLoading
              }
            >
              ↻ {t.refresh}
            </button>

            <button
              type="button"
              className="reports-button primary"
              onClick={() =>
                window.location.assign(
                  "/reports/create"
                )
              }
            >
              + {t.create}
            </button>
          </div>
        </header>

        <div className="reports-scope-bar">
          <span className="scope-label">
            {t.scope}
          </span>

          {[
            {
              value: "my",
              label: t.my,
            },
            {
              value: "team",
              label: t.team,
            },
            {
              value: "department",
              label: t.department,
            },
            {
              value: "company",
              label: t.company,
            },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={`scope-button ${
                scope === item.value
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setScope(
                  item.value
                );
                setPage(1);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="reports-error">
            {error}
          </div>
        )}

        {loading && !overview ? (
          <div className="reports-loading-screen">
            {t.loading}
          </div>
        ) : (
          <>
            <section className="reports-kpi-grid">
              <div className="reports-kpi">
                <div className="kpi-top">
                  <span className="kpi-label">
                    {t.totalReports}
                  </span>
                  <span className="kpi-icon">
                    R
                  </span>
                </div>

                <div className="kpi-value">
                  {overview?.total ??
                    0}
                </div>

                <div className="kpi-sub">
                  {overview?.drafts ??
                    0}{" "}
                  {t.draft.toLowerCase()}
                </div>
              </div>

              <div className="reports-kpi">
                <div className="kpi-top">
                  <span className="kpi-label">
                    {t.averageProgress}
                  </span>
                  <span className="kpi-icon">
                    %
                  </span>
                </div>

                <div className="kpi-value">
                  {overview?.averageProgress ??
                    0}
                  %
                </div>

                <div className="kpi-sub">
                  {overview?.total ??
                    0}{" "}
                  {t.reports}
                </div>
              </div>

              <div className="reports-kpi">
                <div className="kpi-top">
                  <span className="kpi-label">
                    {t.pendingReview}
                  </span>
                  <span className="kpi-icon">
                    !
                  </span>
                </div>

                <div className="kpi-value">
                  {analytics?.summary
                    ?.pendingReview ??
                    0}
                </div>

                <div className="kpi-sub">
                  {t.submitted}
                </div>
              </div>

              <div className="reports-kpi">
                <div className="kpi-top">
                  <span className="kpi-label">
                    {t.approved}
                  </span>
                  <span className="kpi-icon">
                    ✓
                  </span>
                </div>

                <div className="kpi-value">
                  {overview?.approved ??
                    0}
                </div>

                <div className="kpi-sub">
                  {overview?.completionRate ??
                    0}
                  %
                </div>
              </div>

              <div className="reports-kpi">
                <div className="kpi-top">
                  <span className="kpi-label">
                    {t.flagged}
                  </span>
                  <span className="kpi-icon">
                    ⚑
                  </span>
                </div>

                <div className="kpi-value">
                  {overview?.flagged ??
                    0}
                </div>

                <div className="kpi-sub">
                  {isRw
                    ? "Bisaba kwitabwaho"
                    : "Requires attention"}
                </div>
              </div>

              <div className="reports-kpi">
                <div className="kpi-top">
                  <span className="kpi-label">
                    {t.approvalRate}
                  </span>
                  <span className="kpi-icon">
                    A
                  </span>
                </div>

                <div className="kpi-value">
                  {analytics?.summary
                    ?.approvalRate ??
                    0}
                  %
                </div>

                <div className="kpi-sub">
                  {isRw
                    ? "Mu raporo zasuzumwe"
                    : "Of reviewable reports"}
                </div>
              </div>
            </section>

            <section className="reports-main-grid">
              <div className="reports-panel">
                <div className="panel-header">
                  <h2>
                    {t.progressTrend}
                  </h2>

                  <span>
                    {analyticsLoading
                      ? t.loading
                      : `${trend.length} ${
                          isRw
                            ? "points"
                            : "points"
                        }`}
                  </span>
                </div>

                <div className="trend-content">
                  {trend.length ===
                  0 ? (
                    <div className="trend-empty">
                      {isRw
                        ? "Nta trend iraboneka."
                        : "No progress trend available."}
                    </div>
                  ) : (
                    <div className="trend-chart">
                      {trend.map(
                        (
                          item,
                          index
                        ) => {
                          const value =
                            Number(
                              item.averageProgress
                            ) || 0;

                          const height =
                            Math.max(
                              3,
                              (value /
                                maxTrend) *
                                100
                            );

                          return (
                            <div
                              className="trend-item"
                              key={`${item.date}-${index}`}
                              title={`${item.date}: ${value}%`}
                            >
                              <span className="trend-value">
                                {value}%
                              </span>

                              <div className="trend-bar-wrap">
                                <div
                                  className="trend-bar"
                                  style={{
                                    height: `${height}%`,
                                  }}
                                />
                              </div>

                              <span className="trend-date">
                                {item.date?.slice(
                                  5
                                )}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="reports-panel">
                <div className="panel-header">
                  <h2>
                    {t.analytics}
                  </h2>

                  <span>
                    {t.insight}
                  </span>
                </div>

                <div className="insights-list">
                  {insights.length ===
                  0 ? (
                    <div className="table-empty">
                      {t.noInsights}
                    </div>
                  ) : (
                    insights
                      .slice(0, 7)
                      .map(
                        (
                          insight,
                          index
                        ) => (
                          <div
                            className="insight-item"
                            key={`${insight.type}-${index}`}
                          >
                            <span
                              className={`insight-indicator ${
                                insight.severity ||
                                ""
                              }`}
                            />

                            <div>
                              <div className="insight-title">
                                {
                                  insight.title
                                }
                              </div>

                              <div className="insight-message">
                                {
                                  insight.message
                                }
                              </div>
                            </div>
                          </div>
                        )
                      )
                  )}
                </div>
              </div>
            </section>

            <section className="reports-secondary-grid">
              <div className="reports-panel">
                <div className="panel-header">
                  <h2>
                    {t.departments}
                  </h2>

                  <span>
                    {departments.length}
                  </span>
                </div>

                <div className="ranking-list">
                  {departments.length ===
                  0 ? (
                    <div className="table-empty">
                      {isRw
                        ? "Nta department iboneka."
                        : "No department data."}
                    </div>
                  ) : (
                    departments
                      .slice(0, 7)
                      .map(
                        (
                          department,
                          index
                        ) => (
                          <div
                            className="ranking-row"
                            key={
                              department.departmentId ||
                              index
                            }
                          >
                            <div>
                              <div className="ranking-name">
                                {department.departmentName ||
                                  department.departmentCode ||
                                  "—"}
                              </div>

                              <div className="ranking-meta">
                                {
                                  department.reportCount
                                }{" "}
                                {t.reports}
                                {" · "}
                                {
                                  department.approved
                                }{" "}
                                {t.approved.toLowerCase()}
                              </div>
                            </div>

                            <div className="ranking-value">
                              {
                                department.averageProgress
                              }
                              %
                            </div>
                          </div>
                        )
                      )
                  )}
                </div>
              </div>

              <div className="reports-panel">
                <div className="panel-header">
                  <h2>
                    {t.employees}
                  </h2>

                  <span>
                    {employees.length}
                  </span>
                </div>

                <div className="ranking-list">
                  {employees.length ===
                  0 ? (
                    <div className="table-empty">
                      {isRw
                        ? "Nta bakozi bafite raporo."
                        : "No employee report data."}
                    </div>
                  ) : (
                    employees
                      .slice(0, 7)
                      .map(
                        (
                          employee,
                          index
                        ) => (
                          <div
                            className="ranking-row"
                            key={
                              employee.employeeId ||
                              index
                            }
                          >
                            <div>
                              <div className="ranking-name">
                                {
                                  employee.fullName
                                }
                              </div>

                              <div className="ranking-meta">
                                {
                                  employee.reportCount
                                }{" "}
                                {t.reports}
                                {" · "}
                                {
                                  employee.approved
                                }{" "}
                                {t.approved.toLowerCase()}
                              </div>
                            </div>

                            <div className="ranking-value">
                              {
                                employee.averageProgress
                              }
                              %
                            </div>
                          </div>
                        )
                      )
                  )}
                </div>
              </div>
            </section>

            <section className="reports-secondary-grid">
              <div className="reports-panel">
                <div className="panel-header">
                  <h2>
                    {t.challenges}
                  </h2>

                  <span>
                    Top 10
                  </span>
                </div>

                <div className="ranking-list">
                  {challenges.length ===
                  0 ? (
                    <div className="table-empty">
                      {isRw
                        ? "Nta mbogamizi zanditswe."
                        : "No challenges recorded."}
                    </div>
                  ) : (
                    challenges
                      .slice(0, 7)
                      .map(
                        (
                          challenge,
                          index
                        ) => (
                          <div
                            className="ranking-row"
                            key={`${challenge.text}-${index}`}
                          >
                            <div>
                              <div className="ranking-name">
                                {
                                  challenge.text
                                }
                              </div>

                              <div className="ranking-meta">
                                {challenge.count}{" "}
                                {isRw
                                  ? "reports"
                                  : "reports"}
                              </div>
                            </div>

                            <div className="ranking-value">
                              #{index + 1}
                            </div>
                          </div>
                        )
                      )
                  )}
                </div>
              </div>

              <div className="reports-panel">
                <div className="panel-header">
                  <h2>
                    {t.blockers}
                  </h2>

                  <span>
                    Top 10
                  </span>
                </div>

                <div className="ranking-list">
                  {blockers.length ===
                  0 ? (
                    <div className="table-empty">
                      {isRw
                        ? "Nta bibazo bibangamira akazi byanditswe."
                        : "No blockers recorded."}
                    </div>
                  ) : (
                    blockers
                      .slice(0, 7)
                      .map(
                        (
                          blocker,
                          index
                        ) => (
                          <div
                            className="ranking-row"
                            key={`${blocker.text}-${index}`}
                          >
                            <div>
                              <div className="ranking-name">
                                {
                                  blocker.text
                                }
                              </div>

                              <div className="ranking-meta">
                                {blocker.count}{" "}
                                {isRw
                                  ? "reports"
                                  : "reports"}
                              </div>
                            </div>

                            <div className="ranking-value">
                              #{index + 1}
                            </div>
                          </div>
                        )
                      )
                  )}
                </div>
              </div>
            </section>

            <section className="reports-panel reports-table-panel">
              <div className="panel-header">
                <h2>
                  {t.recentReports}
                </h2>

                <span>
                  {pagination.total || 0}{" "}
                  {t.reports}
                </span>
              </div>

              <div className="table-toolbar">
                <input
                  className="reports-input"
                  type="search"
                  placeholder={
                    t.search
                  }
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target
                        .value
                    );
                    setPage(1);
                  }}
                />

                <select
                  className="reports-select"
                  value={
                    statusFilter
                  }
                  onChange={(event) => {
                    setStatusFilter(
                      event.target
                        .value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    {t.allStatuses}
                  </option>

                  <option value="draft">
                    {t.draft}
                  </option>

                  <option value="submitted">
                    {t.submitted}
                  </option>

                  <option value="under_review">
                    {t.underReview}
                  </option>

                  <option value="approved">
                    {t.approvedStatus}
                  </option>

                  <option value="rejected">
                    {t.rejected}
                  </option>

                  <option value="needs_revision">
                    {t.needsRevision}
                  </option>
                </select>

                <select
                  className="reports-select"
                  value={
                    typeFilter
                  }
                  onChange={(event) => {
                    setTypeFilter(
                      event.target
                        .value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    {t.allTypes}
                  </option>

                  <option value="daily">
                    {t.daily}
                  </option>

                  <option value="weekly">
                    {t.weekly}
                  </option>

                  <option value="monthly">
                    {t.monthly}
                  </option>

                  <option value="project">
                    {t.project}
                  </option>

                  <option value="incident">
                    {t.incident}
                  </option>

                  <option value="field">
                    {t.field}
                  </option>

                  <option value="progress">
                    {t.progress}
                  </option>

                  <option value="other">
                    {t.other}
                  </option>
                </select>
              </div>

              <div className="table-scroll">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>
                        {isRw
                          ? "Raporo"
                          : "Report"}
                      </th>

                      <th>
                        {isRw
                          ? "Umukozi"
                          : "Employee"}
                      </th>

                      <th>
                        {isRw
                          ? "Ubwoko"
                          : "Type"}
                      </th>

                      <th>
                        {isRw
                          ? "Status"
                          : "Status"}
                      </th>

                      <th>
                        {isRw
                          ? "Progress"
                          : "Progress"}
                      </th>

                      <th>
                        {isRw
                          ? "Igihe"
                          : "Period"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="table-loading"
                        >
                          {t.loading}
                        </td>
                      </tr>
                    ) : reports.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="table-empty"
                        >
                          {t.noReports}
                        </td>
                      </tr>
                    ) : (
                      reports.map(
                        (report) => (
                          <tr
                            key={
                              report._id
                            }
                          >
                            <td>
                              <div className="report-title-cell">
                                {report.flagged && (
                                  <span className="flagged-dot" />
                                )}

                                {
                                  report.title
                                }
                              </div>
                            </td>

                            <td>
                              <div className="employee-cell">
                                <span className="employee-name">
                                  {getEmployeeName(
                                    report.author
                                  )}
                                </span>

                                {report
                                  .author
                                  ?.email && (
                                  <span className="employee-email">
                                    {
                                      report
                                        .author
                                        .email
                                    }
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              {getTypeLabel(
                                report.reportType
                              )}
                            </td>

                            <td>
                              <span
                                className={`status-pill ${getStatusClass(
                                  report.status
                                )}`}
                              >
                                {getStatusLabel(
                                  report.status
                                )}
                              </span>
                            </td>

                            <td className="progress-cell">
                              <div className="progress-line">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        Number(
                                          report.progress
                                        ) ||
                                          0,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>

                              <div className="progress-text">
                                {
                                  report.progress
                                }
                                %
                              </div>
                            </td>

                            <td>
                              <div>
                                {formatDate(
                                  report.periodStart
                                )}
                              </div>

                              <div
                                style={{
                                  color:
                                    "var(--reports-muted)",
                                  fontSize:
                                    "10px",
                                  marginTop:
                                    "3px",
                                }}
                              >
                                →
                                {" "}
                                {formatDate(
                                  report.periodEnd
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <span>
                  {pagination.total ||
                    0}{" "}
                  {t.reports}
                  {" · "}
                  {pagination.page ||
                    1}
                  /
                  {pagination.pages ||
                    1}
                </span>

                <div className="pagination-actions">
                  <button
                    type="button"
                    className="pagination-button"
                    disabled={
                      page <= 1 ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        (value) =>
                          Math.max(
                            value - 1,
                            1
                          )
                      )
                    }
                  >
                    {t.previous}
                  </button>

                  <button
                    type="button"
                    className="pagination-button"
                    disabled={
                      page >=
                        (pagination.pages ||
                          1) ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        (value) =>
                          value + 1
                      )
                    }
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}