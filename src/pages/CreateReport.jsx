import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

export default function CreateReport() {
  const navigate = useNavigate();
  const { language, theme } = useAppSettings();

  const isRw =
    language === "rw" ||
    language === "kinyarwanda";

  const isDark = theme === "dark";

  const t = useMemo(
    () => ({
      title: isRw
        ? "Kora Raporo"
        : "Create Report",

      subtitle: isRw
        ? "Andika raporo y'imirimo n'iterambere ryawe."
        : "Document your work, progress and operational updates.",

      back: isRw ? "Subira kuri Reports" : "Back to Reports",

      saveDraft: isRw
        ? "Bika nka Draft"
        : "Save Draft",

      submit: isRw
        ? "Ohereza Raporo"
        : "Submit Report",

      basic: isRw
        ? "Amakuru y'ibanze"
        : "Basic Information",

      reportTitle: isRw
        ? "Umutwe wa Raporo"
        : "Report Title",

      titlePlaceholder: isRw
        ? "Urugero: Raporo y'ibikorwa by'icyumweru"
        : "Example: Weekly operational progress report",

      type: isRw ? "Ubwoko" : "Report Type",

      periodStart: isRw
        ? "Itariki Itangira"
        : "Period Start",

      periodEnd: isRw
        ? "Itariki Irangira"
        : "Period End",

      summary: isRw
        ? "Incamake"
        : "Summary",

      summaryPlaceholder: isRw
        ? "Sobanura muri make ibyakozwe n'ibyagezweho..."
        : "Briefly describe the work completed and current situation...",

      progress: isRw
        ? "Iterambere"
        : "Progress",

      priority: isRw
        ? "Icyihutirwa"
        : "Priority",

      activities: isRw
        ? "Ibikorwa"
        : "Activities",

      activityTitle: isRw
        ? "Izina ry'Igikorwa"
        : "Activity Title",

      activityDescription: isRw
        ? "Ibisobanuro"
        : "Description",

      achievements: isRw
        ? "Ibyagezweho"
        : "Achievements",

      challenges: isRw
        ? "Imbogamizi"
        : "Challenges",

      blockers: isRw
        ? "Ibibuza Akazi"
        : "Blockers",

      resources: isRw
        ? "Ibikoresho / Ubufasha Bukenewe"
        : "Resources Needed",

      nextActions: isRw
        ? "Ibikorwa Bikurikira"
        : "Next Actions",

      metrics: isRw
        ? "Metrics / KPIs"
        : "Metrics / KPIs",

      metricName: isRw
        ? "Izina rya Metric"
        : "Metric Name",

      value: isRw ? "Agaciro" : "Value",

      target: isRw ? "Target" : "Target",

      unit: isRw ? "Unit" : "Unit",

      add: isRw ? "Ongeraho" : "Add",

      remove: isRw ? "Kuraho" : "Remove",

      description: isRw
        ? "Ibisobanuro"
        : "Description",

      priorityLabel: isRw
        ? "Urwego rw'icyihutirwa"
        : "Priority",

      required: isRw
        ? "Iyi field irakenewe."
        : "This field is required.",

      success: isRw
        ? "Raporo yabitswe neza."
        : "Report saved successfully.",

      submitSuccess: isRw
        ? "Raporo yoherejwe neza."
        : "Report submitted successfully.",

      error: isRw
        ? "Raporo ntiyabashije kubikwa."
        : "Failed to save report.",

      daily: isRw ? "Buri munsi" : "Daily",

      weekly: isRw ? "Buri cyumweru" : "Weekly",

      monthly: isRw ? "Buri kwezi" : "Monthly",

      project: isRw ? "Umushinga" : "Project",

      incident: isRw ? "Incident" : "Incident",

      field: isRw ? "Field" : "Field",

      progressType: isRw ? "Iterambere" : "Progress",

      other: isRw ? "Ibindi" : "Other",

      low: isRw ? "Nto" : "Low",

      medium: isRw ? "Hagati" : "Medium",

      high: isRw ? "Hejuru" : "High",

      critical: isRw ? "Critical" : "Critical",

      noActivities: isRw
        ? "Nta bikorwa byongeweho."
        : "No activities added yet.",

      addActivity: isRw
        ? "Ongeraho Igikorwa"
        : "Add Activity",

      addItem: isRw
        ? "Ongeraho"
        : "Add Item",

      itemPlaceholder: isRw
        ? "Andika hano..."
        : "Enter item...",

      metricPlaceholder: isRw
        ? "Urugero: Completed Tasks"
        : "Example: Completed Tasks",

      cancel: isRw ? "Hagarika" : "Cancel",

      saving: isRw ? "Birimo kubikwa..." : "Saving...",
    }),
    [isRw]
  );

  const [form, setForm] = useState({
    title: "",
    reportType: "weekly",
    periodStart: "",
    periodEnd: "",
    summary: "",
    progress: 0,
    priority: "medium",
  });

  const [activities, setActivities] = useState([]);

  const [achievements, setAchievements] = useState([]);

  const [challenges, setChallenges] = useState([]);

  const [blockers, setBlockers] = useState([]);

  const [resourcesNeeded, setResourcesNeeded] = useState([]);

  const [nextActions, setNextActions] = useState([]);

  const [metrics, setMetrics] = useState([]);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addActivity = () => {
    setActivities((current) => [
      ...current,
      {
        title: "",
        description: "",
        status: "completed",
        progress: 100,
      },
    ]);
  };

  const updateActivity = (
    index,
    field,
    value
  ) => {
    setActivities((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeActivity = (index) => {
    setActivities((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const addListItem = (setter) => {
    setter((current) => [
      ...current,
      {
        text: "",
        priority: "medium",
      },
    ]);
  };

  const updateListItem = (
    setter,
    index,
    field,
    value
  ) => {
    setter((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeListItem = (
    setter,
    index
  ) => {
    setter((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const addMetric = () => {
    setMetrics((current) => [
      ...current,
      {
        name: "",
        value: "",
        target: "",
        unit: "",
        note: "",
      },
    ]);
  };

  const updateMetric = (
    index,
    field,
    value
  ) => {
    setMetrics((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeMetric = (index) => {
    setMetrics((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const cleanList = (items) =>
    items
      .filter(
        (item) =>
          item.text &&
          item.text.trim()
      )
      .map((item) => ({
        text: item.text.trim(),
        priority: item.priority,
      }));

  const cleanActivities = activities
    .filter(
      (activity) =>
        activity.title &&
        activity.title.trim()
    )
    .map((activity) => ({
      title: activity.title.trim(),
      description:
        activity.description?.trim() ||
        "",
      status: activity.status,
      progress: Number(
        activity.progress
      ) || 0,
    }));

  const cleanMetrics = metrics
    .filter(
      (metric) =>
        metric.name &&
        metric.name.trim()
    )
    .map((metric) => ({
      name: metric.name.trim(),
      value:
        metric.value === ""
          ? null
          : Number.isNaN(
              Number(metric.value)
            )
          ? metric.value
          : Number(metric.value),
      target:
        metric.target === ""
          ? null
          : Number.isNaN(
              Number(metric.target)
            )
          ? metric.target
          : Number(metric.target),
      unit:
        metric.unit?.trim() || "",
      note: "",
    }));

  const saveReport = async (
    shouldSubmit
  ) => {
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError(
        `${t.reportTitle}: ${t.required}`
      );
      return;
    }

    if (
      !form.periodStart ||
      !form.periodEnd
    ) {
      setError(
        isRw
          ? "Shyiramo igihe raporo ireba."
          : "Please select the report period."
      );
      return;
    }

    if (
      new Date(form.periodEnd) <
      new Date(form.periodStart)
    ) {
      setError(
        isRw
          ? "Itariki irangira ntishobora kuba mbere y'itariki itangira."
          : "Period end cannot be before period start."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),

        reportType:
          form.reportType,

        periodStart:
          form.periodStart,

        periodEnd:
          form.periodEnd,

        summary:
          form.summary.trim(),

        progress:
          Number(form.progress) || 0,

        priority:
          form.priority,

        activities:
          cleanActivities,

        achievements:
          cleanList(achievements),

        challenges:
          cleanList(challenges),

        blockers:
          cleanList(blockers),

        resourcesNeeded:
          cleanList(resourcesNeeded),

        nextActions:
          cleanList(nextActions),

        metrics:
          cleanMetrics,

        status: "draft",
      };

      const response =
        await api.post(
          "/reports",
          payload
        );

      if (
        !response.data?.success
      ) {
        throw new Error(
          response.data?.message ||
            t.error
        );
      }

      const createdReport =
        response.data.report;

      if (shouldSubmit) {
        await api.post(
          `/reports/${createdReport._id}/submit`
        );

        setSuccess(
          t.submitSuccess
        );
      } else {
        setSuccess(
          t.success
        );
      }

      setTimeout(() => {
        navigate("/reports");
      }, 800);
    } catch (err) {
      console.error(
        "CREATE REPORT ERROR:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          err.message ||
          t.error
      );
    } finally {
      setSaving(false);
    }
  };

  const css = `
    .create-report-page {
      --cr-bg: ${
        isDark
          ? "#0b1020"
          : "#f6f8fc"
      };
      --cr-card: ${
        isDark
          ? "#121a2d"
          : "#ffffff"
      };
      --cr-border: ${
        isDark
          ? "#25314a"
          : "#e4e8f0"
      };
      --cr-text: ${
        isDark
          ? "#f3f6fb"
          : "#172033"
      };
      --cr-muted: ${
        isDark
          ? "#9ba8bd"
          : "#687386"
      };
      --cr-primary: #3157d5;
      --cr-primary-soft: ${
        isDark
          ? "rgba(49,87,213,.15)"
          : "#eef2ff"
      };
      --cr-danger: #d64b55;

      min-height: 100%;
      background: var(--cr-bg);
      color: var(--cr-text);
      padding: 24px;
      box-sizing: border-box;
    }

    .create-report-container {
      width: 100%;
      max-width: 1100px;
      margin: 0 auto;
    }

    .create-report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 22px;
    }

    .create-report-heading h1 {
      margin: 0 0 7px;
      font-size: 27px;
      line-height: 1.2;
      font-weight: 750;
    }

    .create-report-heading p {
      margin: 0;
      color: var(--cr-muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .back-button {
      height: 40px;
      padding: 0 13px;
      border: 1px solid var(--cr-border);
      border-radius: 8px;
      background: var(--cr-card);
      color: var(--cr-text);
      cursor: pointer;
      font-size: 12px;
      font-weight: 650;
    }

    .back-button:hover {
      border-color: var(--cr-primary);
      color: var(--cr-primary);
    }

    .form-panel {
      background: var(--cr-card);
      border: 1px solid var(--cr-border);
      border-radius: 12px;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .form-panel-header {
      padding: 16px 18px;
      border-bottom: 1px solid var(--cr-border);
    }

    .form-panel-header h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 720;
    }

    .form-panel-body {
      padding: 18px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 15px;
    }

    .field {
      min-width: 0;
    }

    .field.full {
      grid-column: 1 / -1;
    }

    .field label {
      display: block;
      margin-bottom: 7px;
      font-size: 11px;
      color: var(--cr-muted);
      font-weight: 700;
    }

    .field input,
    .field textarea,
    .field select {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--cr-border);
      background: ${
        isDark
          ? "#0f1728"
          : "#fbfcfe"
      };
      color: var(--cr-text);
      border-radius: 8px;
      outline: none;
      font-family: inherit;
      font-size: 12px;
    }

    .field input,
    .field select {
      height: 40px;
      padding: 0 11px;
    }

    .field textarea {
      min-height: 115px;
      padding: 11px;
      resize: vertical;
      line-height: 1.5;
    }

    .field input:focus,
    .field textarea:focus,
    .field select:focus {
      border-color: var(--cr-primary);
    }

    .range-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .range-wrap input {
      flex: 1;
    }

    .range-value {
      width: 48px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--cr-primary-soft);
      color: var(--cr-primary);
      border-radius: 7px;
      font-size: 12px;
      font-weight: 750;
    }

    .section-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .list-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 125px auto;
      gap: 9px;
      align-items: center;
    }

    .list-row input,
    .list-row select {
      width: 100%;
      height: 38px;
      box-sizing: border-box;
      border: 1px solid var(--cr-border);
      border-radius: 8px;
      padding: 0 10px;
      background: ${
        isDark
          ? "#0f1728"
          : "#fbfcfe"
      };
      color: var(--cr-text);
      font-size: 12px;
      outline: none;
    }

    .list-row input:focus,
    .list-row select:focus {
      border-color: var(--cr-primary);
    }

    .remove-button {
      height: 38px;
      min-width: 38px;
      border: 1px solid var(--cr-border);
      border-radius: 8px;
      background: transparent;
      color: var(--cr-danger);
      cursor: pointer;
      font-size: 15px;
    }

    .remove-button:hover {
      background: ${
        isDark
          ? "rgba(214,75,85,.1)"
          : "#fff1f2"
      };
    }

    .add-button {
      height: 37px;
      padding: 0 12px;
      border: 1px dashed var(--cr-primary);
      border-radius: 8px;
      background: var(--cr-primary-soft);
      color: var(--cr-primary);
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      margin-top: 10px;
    }

    .activity-card {
      border: 1px solid var(--cr-border);
      border-radius: 9px;
      padding: 13px;
      margin-bottom: 10px;
    }

    .activity-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr 130px 100px auto;
      gap: 9px;
      align-items: end;
    }

    .activity-grid input,
    .activity-grid select {
      width: 100%;
      height: 38px;
      box-sizing: border-box;
      border: 1px solid var(--cr-border);
      border-radius: 8px;
      padding: 0 9px;
      background: ${
        isDark
          ? "#0f1728"
          : "#fbfcfe"
      };
      color: var(--cr-text);
      outline: none;
      font-size: 11px;
    }

    .activity-grid label {
      display: block;
      color: var(--cr-muted);
      font-size: 9px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .metric-row {
      display: grid;
      grid-template-columns: 1.4fr .8fr .8fr .7fr auto;
      gap: 9px;
      align-items: center;
    }

    .metric-row input {
      height: 38px;
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--cr-border);
      border-radius: 8px;
      padding: 0 9px;
      background: ${
        isDark
          ? "#0f1728"
          : "#fbfcfe"
      };
      color: var(--cr-text);
      outline: none;
      font-size: 11px;
    }

    .empty-section {
      padding: 15px;
      border: 1px dashed var(--cr-border);
      border-radius: 8px;
      color: var(--cr-muted);
      font-size: 11px;
      text-align: center;
    }

    .message {
      padding: 12px 14px;
      border-radius: 8px;
      margin-bottom: 15px;
      font-size: 12px;
    }

    .message.error {
      color: var(--cr-danger);
      background: ${
        isDark
          ? "rgba(214,75,85,.1)"
          : "#fff1f2"
      };
      border: 1px solid rgba(214,75,85,.22);
    }

    .message.success {
      color: #159570;
      background: ${
        isDark
          ? "rgba(21,149,112,.1)"
          : "#edf9f5"
      };
      border: 1px solid rgba(21,149,112,.22);
    }

    .form-footer {
      position: sticky;
      bottom: 0;
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      padding: 13px 0;
      background: var(--cr-bg);
    }

    .footer-button {
      height: 42px;
      padding: 0 17px;
      border-radius: 8px;
      border: 1px solid var(--cr-border);
      background: var(--cr-card);
      color: var(--cr-text);
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .footer-button.primary {
      background: var(--cr-primary);
      border-color: var(--cr-primary);
      color: #fff;
    }

    .footer-button:hover {
      opacity: .92;
    }

    .footer-button:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    @media (max-width: 900px) {
      .activity-grid {
        grid-template-columns: 1fr 1fr;
      }

      .metric-row {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 650px) {
      .create-report-page {
        padding: 15px;
      }

      .create-report-header {
        flex-direction: column;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .field.full {
        grid-column: auto;
      }

      .list-row {
        grid-template-columns: 1fr auto;
      }

      .list-row select {
        grid-column: 1;
      }

      .activity-grid {
        grid-template-columns: 1fr;
      }

      .metric-row {
        grid-template-columns: 1fr;
      }

      .form-footer {
        position: static;
        flex-direction: column-reverse;
      }

      .footer-button {
        width: 100%;
      }
    }
  `;

  return (
    <div className="create-report-page">
      <style>{css}</style>

      <div className="create-report-container">
        <header className="create-report-header">
          <div className="create-report-heading">
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/reports")
            }
          >
            ← {t.back}
          </button>
        </header>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            {success}
          </div>
        )}

        <section className="form-panel">
          <div className="form-panel-header">
            <h2>{t.basic}</h2>
          </div>

          <div className="form-panel-body">
            <div className="form-grid">
              <div className="field full">
                <label>
                  {t.reportTitle} *
                </label>

                <input
                  type="text"
                  value={form.title}
                  placeholder={
                    t.titlePlaceholder
                  }
                  onChange={(event) =>
                    updateForm(
                      "title",
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>{t.type}</label>

                <select
                  value={
                    form.reportType
                  }
                  onChange={(event) =>
                    updateForm(
                      "reportType",
                      event.target
                        .value
                    )
                  }
                >
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
                    {t.progressType}
                  </option>

                  <option value="other">
                    {t.other}
                  </option>
                </select>
              </div>

              <div className="field">
                <label>{t.priority}</label>

                <select
                  value={
                    form.priority
                  }
                  onChange={(event) =>
                    updateForm(
                      "priority",
                      event.target
                        .value
                    )
                  }
                >
                  <option value="low">
                    {t.low}
                  </option>

                  <option value="medium">
                    {t.medium}
                  </option>

                  <option value="high">
                    {t.high}
                  </option>

                  <option value="critical">
                    {t.critical}
                  </option>
                </select>
              </div>

              <div className="field">
                <label>
                  {t.periodStart} *
                </label>

                <input
                  type="date"
                  value={
                    form.periodStart
                  }
                  onChange={(event) =>
                    updateForm(
                      "periodStart",
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>
                  {t.periodEnd} *
                </label>

                <input
                  type="date"
                  value={
                    form.periodEnd
                  }
                  onChange={(event) =>
                    updateForm(
                      "periodEnd",
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div className="field full">
                <label>
                  {t.summary}
                </label>

                <textarea
                  value={
                    form.summary
                  }
                  placeholder={
                    t.summaryPlaceholder
                  }
                  onChange={(event) =>
                    updateForm(
                      "summary",
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div className="field full">
                <label>
                  {t.progress}
                </label>

                <div className="range-wrap">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={
                      form.progress
                    }
                    onChange={(event) =>
                      updateForm(
                        "progress",
                        event.target
                          .value
                      )
                    }
                  />

                  <div className="range-value">
                    {form.progress}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-panel-header">
            <h2>{t.activities}</h2>
          </div>

          <div className="form-panel-body">
            {activities.length ===
            0 ? (
              <div className="empty-section">
                {t.noActivities}
              </div>
            ) : (
              activities.map(
                (
                  activity,
                  index
                ) => (
                  <div
                    className="activity-card"
                    key={index}
                  >
                    <div className="activity-grid">
                      <div>
                        <label>
                          {
                            t.activityTitle
                          }
                        </label>

                        <input
                          value={
                            activity.title
                          }
                          onChange={(
                            event
                          ) =>
                            updateActivity(
                              index,
                              "title",
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label>
                          {
                            t.activityDescription
                          }
                        </label>

                        <input
                          value={
                            activity.description
                          }
                          onChange={(
                            event
                          ) =>
                            updateActivity(
                              index,
                              "description",
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label>
                          Status
                        </label>

                        <select
                          value={
                            activity.status
                          }
                          onChange={(
                            event
                          ) =>
                            updateActivity(
                              index,
                              "status",
                              event
                                .target
                                .value
                            )
                          }
                        >
                          <option value="completed">
                            Completed
                          </option>

                          <option value="in_progress">
                            In Progress
                          </option>

                          <option value="pending">
                            Pending
                          </option>

                          <option value="blocked">
                            Blocked
                          </option>
                        </select>
                      </div>

                      <div>
                        <label>
                          %
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            activity.progress
                          }
                          onChange={(
                            event
                          ) =>
                            updateActivity(
                              index,
                              "progress",
                              Math.min(
                                100,
                                Math.max(
                                  0,
                                  Number(
                                    event
                                      .target
                                      .value
                                  ) || 0
                                )
                              )
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="remove-button"
                        onClick={() =>
                          removeActivity(
                            index
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              )
            )}

            <button
              type="button"
              className="add-button"
              onClick={addActivity}
            >
              + {t.addActivity}
            </button>
          </div>
        </section>

        {[
          {
            title: t.achievements,
            items: achievements,
            setter: setAchievements,
          },
          {
            title: t.challenges,
            items: challenges,
            setter: setChallenges,
          },
          {
            title: t.blockers,
            items: blockers,
            setter: setBlockers,
          },
          {
            title: t.resources,
            items: resourcesNeeded,
            setter: setResourcesNeeded,
          },
          {
            title: t.nextActions,
            items: nextActions,
            setter: setNextActions,
          },
        ].map(
          (section) => (
            <section
              className="form-panel"
              key={section.title}
            >
              <div className="form-panel-header">
                <h2>
                  {section.title}
                </h2>
              </div>

              <div className="form-panel-body">
                <div className="section-list">
                  {section.items.length ===
                  0 ? (
                    <div className="empty-section">
                      {t.itemPlaceholder}
                    </div>
                  ) : (
                    section.items.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          className="list-row"
                          key={index}
                        >
                          <input
                            type="text"
                            value={
                              item.text
                            }
                            placeholder={
                              t.itemPlaceholder
                            }
                            onChange={(
                              event
                            ) =>
                              updateListItem(
                                section.setter,
                                index,
                                "text",
                                event
                                  .target
                                  .value
                              )
                            }
                          />

                          <select
                            value={
                              item.priority
                            }
                            onChange={(
                              event
                            ) =>
                              updateListItem(
                                section.setter,
                                index,
                                "priority",
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="low">
                              {t.low}
                            </option>

                            <option value="medium">
                              {t.medium}
                            </option>

                            <option value="high">
                              {t.high}
                            </option>

                            <option value="critical">
                              {t.critical}
                            </option>
                          </select>

                          <button
                            type="button"
                            className="remove-button"
                            onClick={() =>
                              removeListItem(
                                section.setter,
                                index
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      )
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="add-button"
                  onClick={() =>
                    addListItem(
                      section.setter
                    )
                  }
                >
                  + {t.addItem}
                </button>
              </div>
            </section>
          )
        )}

        <section className="form-panel">
          <div className="form-panel-header">
            <h2>{t.metrics}</h2>
          </div>

          <div className="form-panel-body">
            {metrics.length ===
            0 ? (
              <div className="empty-section">
                {isRw
                  ? "Nta metrics zashyizwemo."
                  : "No metrics added yet."}
              </div>
            ) : (
              <div className="section-list">
                {metrics.map(
                  (
                    metric,
                    index
                  ) => (
                    <div
                      className="metric-row"
                      key={index}
                    >
                      <input
                        type="text"
                        placeholder={
                          t.metricPlaceholder
                        }
                        value={
                          metric.name
                        }
                        onChange={(
                          event
                        ) =>
                          updateMetric(
                            index,
                            "name",
                            event
                              .target
                              .value
                          )
                        }
                      />

                      <input
                        type="text"
                        placeholder={
                          t.value
                        }
                        value={
                          metric.value
                        }
                        onChange={(
                          event
                        ) =>
                          updateMetric(
                            index,
                            "value",
                            event
                              .target
                              .value
                          )
                        }
                      />

                      <input
                        type="text"
                        placeholder={
                          t.target
                        }
                        value={
                          metric.target
                        }
                        onChange={(
                          event
                        ) =>
                          updateMetric(
                            index,
                            "target",
                            event
                              .target
                              .value
                          )
                        }
                      />

                      <input
                        type="text"
                        placeholder={
                          t.unit
                        }
                        value={
                          metric.unit
                        }
                        onChange={(
                          event
                        ) =>
                          updateMetric(
                            index,
                            "unit",
                            event
                              .target
                              .value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="remove-button"
                        onClick={() =>
                          removeMetric(
                            index
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <button
              type="button"
              className="add-button"
              onClick={addMetric}
            >
              + {t.add}
            </button>
          </div>
        </section>

        <div className="form-footer">
          <button
            type="button"
            className="footer-button"
            disabled={saving}
            onClick={() =>
              navigate("/reports")
            }
          >
            {t.cancel}
          </button>

          <button
            type="button"
            className="footer-button"
            disabled={saving}
            onClick={() =>
              saveReport(false)
            }
          >
            {saving
              ? t.saving
              : t.saveDraft}
          </button>

          <button
            type="button"
            className="footer-button primary"
            disabled={saving}
            onClick={() =>
              saveReport(true)
            }
          >
            {saving
              ? t.saving
              : t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}