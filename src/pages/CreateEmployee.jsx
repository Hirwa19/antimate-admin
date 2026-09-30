import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateEmployee() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [creating, setCreating] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    secondName: "",
    phone: "",
    email: "",
    password: "",

    department: "",
    position: "",
    team: "",
    manager: "",

    employmentType: "full_time",
    accessLevel: "staff",

    otp: "",
  });

  // ============================================================
  // LOAD ORGANIZATION DATA
  // ============================================================

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [
        departmentsResponse,
        positionsResponse,
        teamsResponse,
        employeesResponse,
      ] = await Promise.all([
        api.get("/departments"),
        api.get("/positions"),
        api.get("/teams"),
        api.get("/workers"),
      ]);

      setDepartments(
        Array.isArray(departmentsResponse.data)
          ? departmentsResponse.data
          : departmentsResponse.data?.departments || []
      );

      setPositions(
        Array.isArray(positionsResponse.data)
          ? positionsResponse.data
          : positionsResponse.data?.positions || []
      );

      setTeams(
        Array.isArray(teamsResponse.data)
          ? teamsResponse.data
          : teamsResponse.data?.teams || []
      );

      setEmployees(
        Array.isArray(employeesResponse.data)
          ? employeesResponse.data
          : employeesResponse.data?.workers || []
      );
    } catch (err) {
      console.error(
        "LOAD ORGANIZATION DATA ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load organization data."
      );
    } finally {
      setLoadingData(false);
    }
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");

    // Department changed
    if (name === "department") {
      setForm((prev) => ({
        ...prev,
        department: value,
        position: "",
        team: "",
      }));
    }
  };

  // ============================================================
  // FILTER POSITIONS
  // ============================================================

  const filteredPositions = useMemo(() => {
    if (!form.department) {
      return [];
    }

    return positions.filter(
      (position) => {
        const departmentId =
          position.department?._id ||
          position.department;

        return (
          String(departmentId) ===
          String(form.department)
        );
      }
    );
  }, [
    positions,
    form.department,
  ]);

  // ============================================================
  // FILTER TEAMS
  // ============================================================

  const filteredTeams = useMemo(() => {
    if (!form.department) {
      return [];
    }

    return teams.filter(
      (team) => {
        const departmentId =
          team.department?._id ||
          team.department;

        return (
          String(departmentId) ===
          String(form.department)
        );
      }
    );
  }, [
    teams,
    form.department,
  ]);

  // ============================================================
  // MANAGERS
  // ============================================================

  const managers = useMemo(() => {
    return employees.filter((employee) => {
      if (employee.status) {
        return employee.status === "active";
      }

      return employee.active !== false;
    });
  }, [employees]);

  // ============================================================
  // SEND OTP
  // ============================================================

  const handleSendOTP = async () => {
    setError("");
    setMessage("");

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }

    try {
      setSendingOTP(true);

      const response = await api.post(
        "/workers/send-otp",
        {
          phone: form.phone.trim(),
          email: form.email.trim().toLowerCase(),
        }
      );

      if (response.data?.success) {
        setOtpSent(true);

        setOtpExpiresIn(
          response.data.expiresIn || 300
        );

        setMessage(
          "OTP sent successfully. Check the employee's phone."
        );
      } else {
        setError(
          response.data?.message ||
            "Failed to send OTP."
        );
      }
    } catch (err) {
      console.error(
        "SEND EMPLOYEE OTP ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to send OTP."
      );
    } finally {
      setSendingOTP(false);
    }
  };

  // ============================================================
  // OTP COUNTDOWN
  // ============================================================

  useEffect(() => {
    if (!otpSent || otpExpiresIn <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpExpiresIn((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setOtpSent(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    otpSent,
    otpExpiresIn,
  ]);

  // ============================================================
  // FORMAT OTP TIME
  // ============================================================

  const formatOTPTime = () => {
    const minutes = Math.floor(
      otpExpiresIn / 60
    );

    const seconds =
      otpExpiresIn % 60;

    return `${minutes}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // ============================================================
  // CREATE EMPLOYEE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    // ----------------------------------------------------------
    // Frontend validation
    // ----------------------------------------------------------

    if (
      !form.firstName.trim() ||
      !form.secondName.trim()
    ) {
      setError(
        "First name and second name are required."
      );
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!form.department) {
      setError("Please select a department.");
      return;
    }

    if (!form.position) {
      setError("Please select a position.");
      return;
    }

    if (!form.team) {
      setError("Please select a team.");
      return;
    }

    if (!form.otp) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{4}$/.test(form.otp)) {
      setError(
        "OTP must contain exactly 4 digits."
      );
      return;
    }

    try {
      setCreating(true);

      const response = await api.post(
        "/workers",
        {
          firstName:
            form.firstName.trim(),

          secondName:
            form.secondName.trim(),

          phone:
            form.phone.trim(),

          email:
            form.email.trim().toLowerCase(),

          password:
            form.password,

          otp:
            form.otp.trim(),

          department:
            form.department,

          position:
            form.position,

          team:
            form.team,

          manager:
            form.manager || null,

          employmentType:
            form.employmentType,

          accessLevel:
            form.accessLevel,

          // Keep legacy role compatible
          role: getLegacyRole(
            form.accessLevel
          ),
        }
      );

      if (response.data?.success) {
        setMessage(
          "Employee created successfully."
        );

        setOtpSent(false);
        setOtpExpiresIn(0);

        setTimeout(() => {
          navigate("/workers");
        }, 1200);
      } else {
        setError(
          response.data?.message ||
            "Failed to create employee."
        );
      }
    } catch (err) {
      console.error(
        "CREATE EMPLOYEE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create employee."
      );
    } finally {
      setCreating(false);
    }
  };

  // ============================================================
  // LEGACY ROLE
  // ============================================================

  const getLegacyRole = (
    accessLevel
  ) => {
    if (
      accessLevel === "superadmin"
    ) {
      return "admin";
    }

    if (
      accessLevel === "admin"
    ) {
      return "admin";
    }

    if (
      accessLevel === "manager"
    ) {
      return "admin";
    }

    return "worker";
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setForm({
      firstName: "",
      secondName: "",
      phone: "",
      email: "",
      password: "",

      department: "",
      position: "",
      team: "",
      manager: "",

      employmentType: "full_time",
      accessLevel: "staff",

      otp: "",
    });

    setOtpSent(false);
    setOtpExpiresIn(0);
    setMessage("");
    setError("");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="create-employee-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .create-employee-page {
          min-height: 100vh;
          background: #f6f8fc;
          padding: 28px;
          color: #172033;
        }

        .create-employee-container {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
        }

        .create-employee-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .header-left h1 {
          margin: 0 0 7px;
          font-size: 28px;
          font-weight: 750;
          letter-spacing: -0.5px;
        }

        .header-left p {
          margin: 0;
          color: #687386;
          font-size: 14px;
        }

        .back-button {
          border: 1px solid #dce2ec;
          background: #ffffff;
          color: #263248;
          height: 42px;
          padding: 0 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 650;
          transition: 0.2s ease;
        }

        .back-button:hover {
          background: #f1f4f9;
        }

        .employee-form {
          background: #ffffff;
          border: 1px solid #e3e8f0;
          border-radius: 16px;
          box-shadow: 0 8px 28px rgba(26, 42, 72, 0.05);
          overflow: hidden;
        }

        .form-section {
          padding: 25px;
          border-bottom: 1px solid #edf0f5;
        }

        .form-section:last-child {
          border-bottom: 0;
        }

        .section-heading {
          margin-bottom: 20px;
        }

        .section-heading h2 {
          margin: 0 0 5px;
          font-size: 17px;
          font-weight: 750;
        }

        .section-heading p {
          margin: 0;
          color: #7a8495;
          font-size: 13px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .form-grid.three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .form-group {
          min-width: 0;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-label {
          display: block;
          margin-bottom: 7px;
          color: #273247;
          font-size: 13px;
          font-weight: 650;
        }

        .required {
          color: #d33b4f;
        }

        .form-input,
        .form-select {
          width: 100%;
          height: 44px;
          padding: 0 13px;
          border: 1px solid #d9dfe9;
          border-radius: 9px;
          outline: none;
          background: #ffffff;
          color: #172033;
          font-size: 14px;
          transition: border 0.2s ease,
            box-shadow 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: #5865f2;
          box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
        }

        .form-input::placeholder {
          color: #a0a8b6;
        }

        .form-select:disabled {
          background: #f3f5f8;
          color: #9aa2b0;
          cursor: not-allowed;
        }

        .field-help {
          margin-top: 6px;
          color: #8a93a2;
          font-size: 12px;
          line-height: 1.4;
        }

        .otp-row {
          display: flex;
          gap: 10px;
        }

        .otp-row .form-input {
          flex: 1;
        }

        .otp-button {
          height: 44px;
          padding: 0 18px;
          border: 0;
          border-radius: 9px;
          background: #5865f2;
          color: #ffffff;
          cursor: pointer;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .otp-button:hover {
          background: #4754df;
        }

        .otp-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .otp-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 9px;
          padding: 9px 11px;
          border-radius: 8px;
          background: #f4f6ff;
          color: #4e5bd5;
          font-size: 12px;
        }

        .otp-expired {
          color: #c43c4f;
          background: #fff4f5;
        }

        .alert {
          margin: 0 25px 20px;
          padding: 12px 14px;
          border-radius: 9px;
          font-size: 13px;
          line-height: 1.45;
        }

        .alert-error {
          background: #fff2f3;
          border: 1px solid #ffd7db;
          color: #b52e40;
        }

        .alert-success {
          background: #eefaf3;
          border: 1px solid #ccebd8;
          color: #207a45;
        }

        .loading-box {
          padding: 35px;
          text-align: center;
          color: #707b8e;
          font-size: 14px;
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          padding: 20px 25px;
          background: #fafbfc;
          border-top: 1px solid #edf0f5;
        }

        .secondary-button,
        .primary-button {
          height: 44px;
          padding: 0 20px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .secondary-button {
          border: 1px solid #d9dfe9;
          background: #ffffff;
          color: #344055;
        }

        .secondary-button:hover {
          background: #f1f3f7;
        }

        .primary-button {
          border: 0;
          background: #5865f2;
          color: #ffffff;
        }

        .primary-button:hover {
          background: #4754df;
        }

        .primary-button:disabled,
        .secondary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .required-note {
          margin-top: 15px;
          color: #8a93a2;
          font-size: 12px;
        }

        @media (max-width: 800px) {
          .create-employee-page {
            padding: 18px;
          }

          .form-grid.three {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .create-employee-page {
            padding: 12px;
          }

          .create-employee-header {
            flex-direction: column;
          }

          .header-left h1 {
            font-size: 23px;
          }

          .back-button {
            width: 100%;
          }

          .form-section {
            padding: 18px;
          }

          .form-grid,
          .form-grid.three {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }

          .otp-row {
            flex-direction: column;
          }

          .otp-button {
            width: 100%;
          }

          .form-footer {
            padding: 17px 18px;
            flex-direction: column-reverse;
          }

          .form-footer button {
            width: 100%;
          }

          .alert {
            margin-left: 18px;
            margin-right: 18px;
          }
        }
      `}</style>

      <div className="create-employee-container">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="create-employee-header">
          <div className="header-left">
            <h1>Create Employee</h1>
            <p>
              Add a new employee to the ANTIMATE organization.
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/workers")
            }
          >
            ← Back to Employees
          </button>
        </div>

        {/* ================================================== */}
        {/* FORM */}
        {/* ================================================== */}

        <form
          className="employee-form"
          onSubmit={handleSubmit}
        >

          {/* ================================================== */}
          {/* PERSONAL INFORMATION */}
          {/* ================================================== */}

          <section className="form-section">
            <div className="section-heading">
              <h2>Personal Information</h2>
              <p>
                Basic information about the employee.
              </p>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label className="form-label">
                  First Name{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  className="form-input"
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  autoComplete="given-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Second Name{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  className="form-input"
                  type="text"
                  name="secondName"
                  value={form.secondName}
                  onChange={handleChange}
                  placeholder="Enter second name"
                  autoComplete="family-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  className="form-input"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0780000000"
                  autoComplete="tel"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="employee@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="form-group full">
                <label className="form-label">
                  Password{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  className="form-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />

                <div className="field-help">
                  The employee will use this password when signing in.
                </div>
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* ORGANIZATION */}
          {/* ================================================== */}

          <section className="form-section">
            <div className="section-heading">
              <h2>Organization</h2>
              <p>
                Define where the employee belongs within ANTIMATE.
              </p>
            </div>

            {loadingData ? (
              <div className="loading-box">
                Loading organization structure...
              </div>
            ) : (
              <div className="form-grid three">

                {/* DEPARTMENT */}

                <div className="form-group">
                  <label className="form-label">
                    Department{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <select
                    className="form-select"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select department
                    </option>

                    {departments
                      .filter(
                        (department) =>
                          department.active !== false
                      )
                      .map((department) => (
                        <option
                          key={department._id}
                          value={department._id}
                        >
                          {department.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* POSITION */}

                <div className="form-group">
                  <label className="form-label">
                    Position{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <select
                    className="form-select"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    disabled={
                      !form.department
                    }
                  >
                    <option value="">
                      {!form.department
                        ? "Select department first"
                        : filteredPositions.length === 0
                        ? "No positions available"
                        : "Select position"}
                    </option>

                    {filteredPositions
                      .filter(
                        (position) =>
                          position.active !== false
                      )
                      .map((position) => (
                        <option
                          key={position._id}
                          value={position._id}
                        >
                          {position.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* TEAM */}

                <div className="form-group">
                  <label className="form-label">
                    Team{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <select
                    className="form-select"
                    name="team"
                    value={form.team}
                    onChange={handleChange}
                    disabled={
                      !form.department
                    }
                  >
                    <option value="">
                      {!form.department
                        ? "Select department first"
                        : filteredTeams.length === 0
                        ? "No teams available"
                        : "Select team"}
                    </option>

                    {filteredTeams
                      .filter(
                        (team) =>
                          team.active !== false
                      )
                      .map((team) => (
                        <option
                          key={team._id}
                          value={team._id}
                        >
                          {team.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* MANAGER */}

                <div className="form-group">
                  <label className="form-label">
                    Manager
                  </label>

                  <select
                    className="form-select"
                    name="manager"
                    value={form.manager}
                    onChange={handleChange}
                  >
                    <option value="">
                      No manager
                    </option>

                    {managers.map(
                      (employee) => (
                        <option
                          key={employee._id}
                          value={employee._id}
                        >
                          {employee.fullName ||
                            `${employee.firstName || ""} ${employee.secondName || ""}`.trim()}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* EMPLOYMENT TYPE */}

                <div className="form-group">
                  <label className="form-label">
                    Employment Type
                  </label>

                  <select
                    className="form-select"
                    name="employmentType"
                    value={
                      form.employmentType
                    }
                    onChange={handleChange}
                  >
                    <option value="full_time">
                      Full Time
                    </option>

                    <option value="part_time">
                      Part Time
                    </option>

                    <option value="contract">
                      Contract
                    </option>

                    <option value="intern">
                      Intern
                    </option>

                    <option value="volunteer">
                      Volunteer
                    </option>

                    <option value="temporary">
                      Temporary
                    </option>
                  </select>
                </div>

                {/* ACCESS LEVEL */}

                <div className="form-group">
                  <label className="form-label">
                    Access Level
                  </label>

                  <select
                    className="form-select"
                    name="accessLevel"
                    value={
                      form.accessLevel
                    }
                    onChange={handleChange}
                  >
                    <option value="staff">
                      Staff
                    </option>

                    <option value="limited">
                      Limited
                    </option>

                    <option value="manager">
                      Manager
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                    <option value="superadmin">
                      Superadmin
                    </option>
                  </select>

                  <div className="field-help">
                    Controls the employee's system access level.
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ================================================== */}
          {/* OTP */}
          {/* ================================================== */}

          <section className="form-section">
            <div className="section-heading">
              <h2>Phone Verification</h2>
              <p>
                Verify the employee's phone before creating the account.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Verification OTP{" "}
                <span className="required">
                  *
                </span>
              </label>

              <div className="otp-row">
                <input
                  className="form-input"
                  type="text"
                  name="otp"
                  value={form.otp}
                  onChange={(event) => {
                    const value =
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);

                    setForm((prev) => ({
                      ...prev,
                      otp: value,
                    }));

                    setError("");
                    setMessage("");
                  }}
                  placeholder="Enter 4-digit OTP"
                  inputMode="numeric"
                  maxLength={4}
                />

                <button
                  type="button"
                  className="otp-button"
                  onClick={
                    handleSendOTP
                  }
                  disabled={
                    sendingOTP ||
                    !form.phone ||
                    !form.email ||
                    loadingData
                  }
                >
                  {sendingOTP
                    ? "Sending..."
                    : otpSent
                    ? "Resend OTP"
                    : "Send OTP"}
                </button>
              </div>

              {otpSent &&
                otpExpiresIn > 0 && (
                  <div className="otp-status">
                    <span>
                      OTP has been sent successfully.
                    </span>

                    <strong>
                      {formatOTPTime()}
                    </strong>
                  </div>
                )}

              {!otpSent &&
                form.phone &&
                form.email && (
                  <div className="field-help">
                    Click "Send OTP" to send a verification code through the ANTIMATE Gateway.
                  </div>
                )}
            </div>
          </section>

          {/* ================================================== */}
          {/* ALERTS */}
          {/* ================================================== */}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <div className="form-footer">

            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
              disabled={creating}
            >
              Clear
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={
                creating ||
                loadingData
              }
            >
              {creating
                ? "Creating Employee..."
                : "Create Employee"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}