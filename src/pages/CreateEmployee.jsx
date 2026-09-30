import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

export default function CreateEmployee() {
  const navigate = useNavigate();

  const {
    language,
    theme,
    t,
  } = useAppSettings();

  const isDark = theme === "dark";

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
  // TRANSLATIONS
  // ============================================================

  const translations = {
    en: {
      createEmployee: "Create Employee",
      createEmployeeDescription:
        "Add a new employee to the ANTIMATE organization.",
      backToEmployees: "Back to Employees",

      personalInformation: "Personal Information",
      personalInformationDescription:
        "Basic information about the employee.",

      firstName: "First Name",
      secondName: "Second Name",
      phone: "Phone",
      email: "Email",
      password: "Password",

      enterFirstName: "Enter first name",
      enterSecondName: "Enter second name",
      phonePlaceholder: "e.g. 0780000000",
      emailPlaceholder: "employee@example.com",
      minimumPassword: "Minimum 6 characters",

      passwordHelp:
        "The employee will use this password when signing in.",

      organization: "Organization",
      organizationDescription:
        "Define where the employee belongs within ANTIMATE.",

      department: "Department",
      position: "Position",
      team: "Team",
      manager: "Manager",
      employmentType: "Employment Type",
      accessLevel: "Access Level",

      selectDepartment: "Select department",
      selectDepartmentFirst: "Select department first",
      noPositions: "No positions available",
      selectPosition: "Select position",
      noTeams: "No teams available",
      selectTeam: "Select team",
      noManager: "No manager",

      fullTime: "Full Time",
      partTime: "Part Time",
      contract: "Contract",
      intern: "Intern",
      volunteer: "Volunteer",
      temporary: "Temporary",

      staff: "Staff",
      limited: "Limited",
      managerLevel: "Manager",
      adminLevel: "Admin",
      superadmin: "Superadmin",

      accessLevelHelp:
        "Controls the employee's system access level.",

      phoneVerification: "Phone Verification",
      phoneVerificationDescription:
        "Verify the employee's phone before creating the account.",

      verificationOTP: "Verification OTP",
      enterOTP: "Enter 4-digit OTP",
      sendOTP: "Send OTP",
      resendOTP: "Resend OTP",
      sending: "Sending...",

      otpSent:
        "OTP has been sent successfully.",
      otpSentPhone:
        "OTP sent successfully. Check the employee's phone.",
      otpGatewayHelp:
        'Click "Send OTP" to send a verification code through the ANTIMATE Gateway.',

      loadingOrganization:
        "Loading organization structure...",

      clear: "Clear",
      creatingEmployee: "Creating Employee...",
      createEmployeeButton: "Create Employee",

      required: "Required",

      firstSecondRequired:
        "First name and second name are required.",
      phoneRequired:
        "Phone number is required.",
      emailRequired:
        "Email address is required.",
      passwordRequired:
        "Password must contain at least 6 characters.",
      departmentRequired:
        "Please select a department.",
      positionRequired:
        "Please select a position.",
      teamRequired:
        "Please select a team.",
      otpRequired:
        "Please enter the OTP.",
      otpInvalid:
        "OTP must contain exactly 4 digits.",

      failedLoad:
        "Failed to load organization data.",
      failedSendOTP:
        "Failed to send OTP.",
      employeeCreated:
        "Employee created successfully.",
      failedCreate:
        "Failed to create employee.",
    },

    rw: {
      createEmployee: "Kora Umukozi",
      createEmployeeDescription:
        "Ongeramo umukozi mushya muri ANTIMATE.",
      backToEmployees: "Subira ku Bakozi",

      personalInformation: "Amakuru y’Umukozi",
      personalInformationDescription:
        "Amakuru y’ibanze y’umukozi.",

      firstName: "Izina rya mbere",
      secondName: "Izina rya kabiri",
      phone: "Telefoni",
      email: "Imeyili",
      password: "Ijambobanga",

      enterFirstName: "Andika izina rya mbere",
      enterSecondName: "Andika izina rya kabiri",
      phonePlaceholder: "urugero: 0780000000",
      emailPlaceholder: "employee@example.com",
      minimumPassword: "Nibura inyuguti 6",

      passwordHelp:
        "Umukozi azakoresha iri jambobanga igihe yinjira muri sisitemu.",

      organization: "Imiterere y’Ikigo",
      organizationDescription:
        "Garagaza aho umukozi abarizwa muri ANTIMATE.",

      department: "Ishami",
      position: "Umwanya",
      team: "Itsinda",
      manager: "Umuyobozi",
      employmentType: "Ubwoko bw’Akazi",
      accessLevel: "Urwego rw’Uburenganzira",

      selectDepartment: "Hitamo ishami",
      selectDepartmentFirst: "Banza uhitemo ishami",
      noPositions: "Nta myanya ihari",
      selectPosition: "Hitamo umwanya",
      noTeams: "Nta matsinda ahari",
      selectTeam: "Hitamo itsinda",
      noManager: "Nta muyobozi",

      fullTime: "Igihe cyose",
      partTime: "Igice cy’igihe",
      contract: "Amasezerano",
      intern: "Umunyeshuri uri muri stage",
      volunteer: "Umukorerabushake",
      temporary: "Igihe gito",

      staff: "Umukozi",
      limited: "Uburenganzira buke",
      managerLevel: "Umuyobozi",
      adminLevel: "Admin",
      superadmin: "Superadmin",

      accessLevelHelp:
        "Igena urwego rw’uburenganzira umukozi afite muri sisitemu.",

      phoneVerification: "Kwemeza Telefoni",
      phoneVerificationDescription:
        "Emeza telefoni y’umukozi mbere yo gukora konti.",

      verificationOTP: "OTP yo Kwemeza",
      enterOTP: "Andika OTP y’imibare 4",
      sendOTP: "Ohereza OTP",
      resendOTP: "Ongera wohereze OTP",
      sending: "Birimo koherezwa...",

      otpSent:
        "OTP yoherejwe neza.",
      otpSentPhone:
        "OTP yoherejwe neza. Reba telefoni y’umukozi.",
      otpGatewayHelp:
        'Kanda "Ohereza OTP" kugira ngo kode yo kwemeza yoherezwe binyuze kuri ANTIMATE Gateway.',

      loadingOrganization:
        "Imiterere y’ikigo irimo gutegurwa...",

      clear: "Siba",
      creatingEmployee: "Umukozi ari gukorwa...",
      createEmployeeButton: "Kora Umukozi",

      required: "Birakenewe",

      firstSecondRequired:
        "Izina rya mbere n’izina rya kabiri birakenewe.",
      phoneRequired:
        "Numero ya telefoni irakenewe.",
      emailRequired:
        "Imeyili irakenewe.",
      passwordRequired:
        "Ijambobanga rigomba kuba rifite nibura inyuguti 6.",
      departmentRequired:
        "Hitamo ishami.",
      positionRequired:
        "Hitamo umwanya.",
      teamRequired:
        "Hitamo itsinda.",
      otpRequired:
        "Andika OTP.",
      otpInvalid:
        "OTP igomba kuba igizwe n’imibare 4 gusa.",

      failedLoad:
        "Kugera ku makuru y’imiterere y’ikigo byanze.",
      failedSendOTP:
        "Kohereza OTP byanze.",
      employeeCreated:
        "Umukozi yakozwe neza.",
      failedCreate:
        "Gukora umukozi byanze.",
    },
  };

  const tr = (key) => {
    return (
      translations[language]?.[key] ||
      translations.en[key] ||
      key
    );
  };

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
          tr("failedLoad")
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

    return positions.filter((position) => {
      const departmentId =
        position.department?._id ||
        position.department;

      return (
        String(departmentId) ===
        String(form.department)
      );
    });
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

    return teams.filter((team) => {
      const departmentId =
        team.department?._id ||
        team.department;

      return (
        String(departmentId) ===
        String(form.department)
      );
    });
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
      setError(tr("phoneRequired"));
      return;
    }

    if (!form.email.trim()) {
      setError(tr("emailRequired"));
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

        setMessage(tr("otpSentPhone"));
      } else {
        setError(
          response.data?.message ||
            tr("failedSendOTP")
        );
      }
    } catch (err) {
      console.error(
        "SEND EMPLOYEE OTP ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          tr("failedSendOTP")
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

    if (
      !form.firstName.trim() ||
      !form.secondName.trim()
    ) {
      setError(
        tr("firstSecondRequired")
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(tr("phoneRequired"));
      return;
    }

    if (!form.email.trim()) {
      setError(tr("emailRequired"));
      return;
    }

    if (form.password.length < 6) {
      setError(
        tr("passwordRequired")
      );
      return;
    }

    if (!form.department) {
      setError(
        tr("departmentRequired")
      );
      return;
    }

    if (!form.position) {
      setError(
        tr("positionRequired")
      );
      return;
    }

    if (!form.team) {
      setError(
        tr("teamRequired")
      );
      return;
    }

    if (!form.otp) {
      setError(tr("otpRequired"));
      return;
    }

    if (!/^\d{4}$/.test(form.otp)) {
      setError(tr("otpInvalid"));
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

          role: getLegacyRole(
            form.accessLevel
          ),
        }
      );

      if (response.data?.success) {
        setMessage(
          tr("employeeCreated")
        );

        setOtpSent(false);
        setOtpExpiresIn(0);

        setTimeout(() => {
          navigate("/workers");
        }, 1200);
      } else {
        setError(
          response.data?.message ||
            tr("failedCreate")
        );
      }
    } catch (err) {
      console.error(
        "CREATE EMPLOYEE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          tr("failedCreate")
      );
    } finally {
      setCreating(false);
    }
  };

  // ============================================================
  // LEGACY ROLE
  // ============================================================

  const getLegacyRole = (accessLevel) => {
    if (
      accessLevel === "superadmin" ||
      accessLevel === "admin" ||
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
    <div
      className={`create-employee-page ${
        isDark ? "theme-dark" : "theme-light"
      }`}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        .create-employee-page {
          min-height: 100vh;
          padding: 28px;
          transition:
            background 0.25s ease,
            color 0.25s ease;
        }

        /* =====================================================
           LIGHT THEME
        ===================================================== */

        .theme-light {
          --page-bg: #f6f8fc;
          --text-main: #172033;
          --text-secondary: #687386;
          --text-muted: #7a8495;
          --text-label: #273247;
          --border: #e3e8f0;
          --border-soft: #edf0f5;
          --input-border: #d9dfe9;
          --surface: #ffffff;
          --surface-soft: #fafbfc;
          --input-bg: #ffffff;
          --disabled-bg: #f3f5f8;
          --disabled-text: #9aa2b0;
          --placeholder: #a0a8b6;
          --primary: #5865f2;
          --primary-hover: #4754df;
          --back-bg: #ffffff;
          --back-hover: #f1f4f9;
          --button-text: #ffffff;
          --secondary-text: #344055;
          --otp-bg: #f4f6ff;
          --otp-text: #4e5bd5;
          --success-bg: #eefaf3;
          --success-border: #ccebd8;
          --success-text: #207a45;
          --error-bg: #fff2f3;
          --error-border: #ffd7db;
          --error-text: #b52e40;
          --shadow: 0 8px 28px rgba(26, 42, 72, 0.05);
        }

        /* =====================================================
           DARK THEME
        ===================================================== */

        .theme-dark {
          --page-bg: #0d1117;
          --text-main: #f1f5f9;
          --text-secondary: #9aa7b8;
          --text-muted: #8d99aa;
          --text-label: #dce4ef;
          --border: #252d3a;
          --border-soft: #202733;
          --input-border: #303948;
          --surface: #151b24;
          --surface-soft: #111720;
          --input-bg: #10161f;
          --disabled-bg: #1b222d;
          --disabled-text: #697585;
          --placeholder: #697585;
          --primary: #6875f5;
          --primary-hover: #5663e5;
          --back-bg: #151b24;
          --back-hover: #1d2530;
          --button-text: #ffffff;
          --secondary-text: #d8e0eb;
          --otp-bg: #1a2040;
          --otp-text: #aeb6ff;
          --success-bg: #10291d;
          --success-border: #1f5938;
          --success-text: #75d99d;
          --error-bg: #32171b;
          --error-border: #6a2c34;
          --error-text: #ff929f;
          --shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
        }

        .create-employee-page {
          background: var(--page-bg);
          color: var(--text-main);
        }

        .create-employee-container {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
        }

        /* =====================================================
           HEADER
        ===================================================== */

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
          color: var(--text-main);
        }

        .header-left p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .back-button {
          border: 1px solid var(--input-border);
          background: var(--back-bg);
          color: var(--secondary-text);
          height: 42px;
          padding: 0 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 650;
          transition: 0.2s ease;
        }

        .back-button:hover {
          background: var(--back-hover);
        }

        /* =====================================================
           FORM
        ===================================================== */

        .employee-form {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .form-section {
          padding: 25px;
          border-bottom: 1px solid var(--border-soft);
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
          color: var(--text-main);
        }

        .section-heading p {
          margin: 0;
          color: var(--text-muted);
          font-size: 13px;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .form-grid.three {
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
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
          color: var(--text-label);
          font-size: 13px;
          font-weight: 650;
        }

        .required {
          color: #e45768;
        }

        .form-input,
        .form-select {
          width: 100%;
          height: 44px;
          padding: 0 13px;
          border: 1px solid var(--input-border);
          border-radius: 9px;
          outline: none;
          background: var(--input-bg);
          color: var(--text-main);
          font-size: 14px;
          transition:
            border 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: var(--primary);
          box-shadow:
            0 0 0 3px
            rgba(104, 117, 245, 0.12);
        }

        .form-input::placeholder {
          color: var(--placeholder);
        }

        .form-select:disabled {
          background: var(--disabled-bg);
          color: var(--disabled-text);
          cursor: not-allowed;
        }

        .form-select option {
          background: var(--input-bg);
          color: var(--text-main);
        }

        .field-help {
          margin-top: 6px;
          color: var(--text-muted);
          font-size: 12px;
          line-height: 1.4;
        }

        /* =====================================================
           OTP
        ===================================================== */

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
          background: var(--primary);
          color: var(--button-text);
          cursor: pointer;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .otp-button:hover {
          background: var(--primary-hover);
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
          background: var(--otp-bg);
          color: var(--otp-text);
          font-size: 12px;
        }

        /* =====================================================
           ALERTS
        ===================================================== */

        .alert {
          margin: 0 25px 20px;
          padding: 12px 14px;
          border-radius: 9px;
          font-size: 13px;
          line-height: 1.45;
        }

        .alert-error {
          background: var(--error-bg);
          border: 1px solid var(--error-border);
          color: var(--error-text);
        }

        .alert-success {
          background: var(--success-bg);
          border: 1px solid var(--success-border);
          color: var(--success-text);
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .loading-box {
          padding: 35px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .form-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          padding: 20px 25px;
          background: var(--surface-soft);
          border-top: 1px solid var(--border-soft);
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
          border: 1px solid var(--input-border);
          background: var(--back-bg);
          color: var(--secondary-text);
        }

        .secondary-button:hover {
          background: var(--back-hover);
        }

        .primary-button {
          border: 0;
          background: var(--primary);
          color: var(--button-text);
        }

        .primary-button:hover {
          background: var(--primary-hover);
        }

        .primary-button:disabled,
        .secondary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 800px) {
          .create-employee-page {
            padding: 18px;
          }

          .form-grid.three {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
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
            <h1>
              {tr("createEmployee")}
            </h1>

            <p>
              {tr("createEmployeeDescription")}
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/workers")
            }
          >
            ← {tr("backToEmployees")}
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
              <h2>
                {tr("personalInformation")}
              </h2>

              <p>
                {tr(
                  "personalInformationDescription"
                )}
              </p>
            </div>

            <div className="form-grid">

              {/* FIRST NAME */}

              <div className="form-group">
                <label className="form-label">
                  {tr("firstName")}{" "}
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
                  placeholder={tr(
                    "enterFirstName"
                  )}
                  autoComplete="given-name"
                />
              </div>

              {/* SECOND NAME */}

              <div className="form-group">
                <label className="form-label">
                  {tr("secondName")}{" "}
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
                  placeholder={tr(
                    "enterSecondName"
                  )}
                  autoComplete="family-name"
                />
              </div>

              {/* PHONE */}

              <div className="form-group">
                <label className="form-label">
                  {tr("phone")}{" "}
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
                  placeholder={tr(
                    "phonePlaceholder"
                  )}
                  autoComplete="tel"
                />
              </div>

              {/* EMAIL */}

              <div className="form-group">
                <label className="form-label">
                  {tr("email")}{" "}
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
                  placeholder={tr(
                    "emailPlaceholder"
                  )}
                  autoComplete="email"
                />
              </div>

              {/* PASSWORD */}

              <div className="form-group full">
                <label className="form-label">
                  {tr("password")}{" "}
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
                  placeholder={tr(
                    "minimumPassword"
                  )}
                  autoComplete="new-password"
                />

                <div className="field-help">
                  {tr("passwordHelp")}
                </div>
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* ORGANIZATION */}
          {/* ================================================== */}

          <section className="form-section">
            <div className="section-heading">
              <h2>
                {tr("organization")}
              </h2>

              <p>
                {tr(
                  "organizationDescription"
                )}
              </p>
            </div>

            {loadingData ? (
              <div className="loading-box">
                {tr(
                  "loadingOrganization"
                )}
              </div>
            ) : (
              <div className="form-grid three">

                {/* DEPARTMENT */}

                <div className="form-group">
                  <label className="form-label">
                    {tr("department")}{" "}
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
                      {tr(
                        "selectDepartment"
                      )}
                    </option>

                    {departments
                      .filter(
                        (department) =>
                          department.active !==
                          false
                      )
                      .map(
                        (department) => (
                          <option
                            key={
                              department._id
                            }
                            value={
                              department._id
                            }
                          >
                            {department.name}
                          </option>
                        )
                      )}
                  </select>
                </div>

                {/* POSITION */}

                <div className="form-group">
                  <label className="form-label">
                    {tr("position")}{" "}
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
                        ? tr(
                            "selectDepartmentFirst"
                          )
                        : filteredPositions.length ===
                          0
                        ? tr(
                            "noPositions"
                          )
                        : tr(
                            "selectPosition"
                          )}
                    </option>

                    {filteredPositions
                      .filter(
                        (position) =>
                          position.active !==
                          false
                      )
                      .map(
                        (position) => (
                          <option
                            key={
                              position._id
                            }
                            value={
                              position._id
                            }
                          >
                            {position.name}
                          </option>
                        )
                      )}
                  </select>
                </div>

                {/* TEAM */}

                <div className="form-group">
                  <label className="form-label">
                    {tr("team")}{" "}
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
                        ? tr(
                            "selectDepartmentFirst"
                          )
                        : filteredTeams.length ===
                          0
                        ? tr("noTeams")
                        : tr(
                            "selectTeam"
                          )}
                    </option>

                    {filteredTeams
                      .filter(
                        (team) =>
                          team.active !==
                          false
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
                    {tr("manager")}
                  </label>

                  <select
                    className="form-select"
                    name="manager"
                    value={form.manager}
                    onChange={handleChange}
                  >
                    <option value="">
                      {tr("noManager")}
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
                    {tr(
                      "employmentType"
                    )}
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
                      {tr("fullTime")}
                    </option>

                    <option value="part_time">
                      {tr("partTime")}
                    </option>

                    <option value="contract">
                      {tr("contract")}
                    </option>

                    <option value="intern">
                      {tr("intern")}
                    </option>

                    <option value="volunteer">
                      {tr("volunteer")}
                    </option>

                    <option value="temporary">
                      {tr("temporary")}
                    </option>
                  </select>
                </div>

                {/* ACCESS LEVEL */}

                <div className="form-group">
                  <label className="form-label">
                    {tr("accessLevel")}
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
                      {tr("staff")}
                    </option>

                    <option value="limited">
                      {tr("limited")}
                    </option>

                    <option value="manager">
                      {tr("managerLevel")}
                    </option>

                    <option value="admin">
                      {tr("adminLevel")}
                    </option>

                    <option value="superadmin">
                      {tr("superadmin")}
                    </option>
                  </select>

                  <div className="field-help">
                    {tr(
                      "accessLevelHelp"
                    )}
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
              <h2>
                {tr(
                  "phoneVerification"
                )}
              </h2>

              <p>
                {tr(
                  "phoneVerificationDescription"
                )}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                {tr("verificationOTP")}{" "}
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
                  placeholder={tr(
                    "enterOTP"
                  )}
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
                    ? tr("sending")
                    : otpSent
                    ? tr("resendOTP")
                    : tr("sendOTP")}
                </button>
              </div>

              {otpSent &&
                otpExpiresIn > 0 && (
                  <div className="otp-status">
                    <span>
                      {tr("otpSent")}
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
                    {tr(
                      "otpGatewayHelp"
                    )}
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
              {tr("clear")}
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
                ? tr(
                    "creatingEmployee"
                  )
                : tr(
                    "createEmployeeButton"
                  )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}