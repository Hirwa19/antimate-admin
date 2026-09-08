import { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  User,
  CreditCard,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";

export default function CreateWorker() {
  const navigate = useNavigate();
  const { language } = useAppSettings();

  const isRw = language === "rw";

  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [otp, setOtp] = useState("");

  const [step, setStep] = useState("form");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [countdown, setCountdown] = useState(0);

  /*
   * Keep these roles synchronized with the roles
   * accepted by your backend.
   */
  const roles = useMemo(
    () => [
      "Admin",
      "Manager",
      "Technician",
      "Support",
      "Worker",
    ],
    []
  );

  /* ============================================================
     OTP COUNTDOWN
  ============================================================ */

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  /* ============================================================
     FORM UPDATE
  ============================================================ */

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateForm = () => {
    if (!form.fullName.trim()) {
      return isRw
        ? "Andika amazina yuzuye y'umukozi."
        : "Enter the worker's full name.";
    }

    if (!form.idNumber.trim()) {
      return isRw
        ? "Andika ID Number y'umukozi."
        : "Enter the worker's ID number.";
    }

    if (!form.phone.trim()) {
      return isRw
        ? "Andika numero ya telefone."
        : "Enter the worker's phone number.";
    }

    if (!form.email.trim()) {
      return isRw
        ? "Andika email y'umukozi."
        : "Enter the worker's email.";
    }

    if (!form.password) {
      return isRw
        ? "Andika password."
        : "Enter a password.";
    }

    if (form.password.length < 6) {
      return isRw
        ? "Password igomba kuba nibura characters 6."
        : "Password must contain at least 6 characters.";
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      return isRw
        ? "Passwords ntizihura."
        : "Passwords do not match.";
    }

    if (!form.role) {
      return isRw
        ? "Hitamo role y'umukozi."
        : "Select a worker role.";
    }

    return "";
  };

  /* ============================================================
     SEND OTP
  ============================================================ */

  const sendOtp = async () => {
    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSendingOtp(true);
      setError("");
      setSuccess("");

      /*
       * OTP endpoint:
       *
       * Replace only this endpoint if your backend
       * uses a different OTP route.
       *
       * The worker is NOT created yet.
       */

      const res = await api.post(
        "/workers/send-otp",
        {
          phone: form.phone,
          email: form.email,
        }
      );

      console.log(
        "WORKER OTP RESPONSE:",
        res.data
      );

      setStep("otp");

      setCountdown(60);

      setSuccess(
        isRw
          ? "OTP yoherejwe. Reba kuri telefone y'umukozi."
          : "OTP sent. Check the worker's phone."
      );
    } catch (err) {
      console.error(
        "SEND WORKER OTP ERROR:",
        err.response?.data ||
          err.message
      );

      setError(
        err.response?.data?.message ||
          (isRw
            ? "OTP ntiyoherejwe."
            : "OTP could not be sent.")
      );
    } finally {
      setSendingOtp(false);
    }
  };

  /* ============================================================
     CREATE WORKER
  ============================================================ */

  const createWorker = async () => {
    if (!otp.trim()) {
      setError(
        isRw
          ? "Andika OTP woherejwe."
          : "Enter the OTP you received."
      );

      return;
    }

    if (otp.trim().length < 4) {
      setError(
        isRw
          ? "OTP ntabwo yuzuye."
          : "The OTP is incomplete."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      /*
       * OTP is sent together with the worker creation
       * request.
       *
       * This preserves the existing:
       * POST /workers
       * workflow.
       */

      const payload = {
        fullName: form.fullName.trim(),
        idNumber: form.idNumber.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        otp: otp.trim(),
      };

      const res = await api.post(
        "/workers",
        payload
      );

      console.log(
        "CREATED WORKER:",
        res.data
      );

      setSuccess(
        isRw
          ? "Umukozi yakozwe neza."
          : "Worker created successfully."
      );

      setStep("created");

    } catch (err) {
      console.error(
        "CREATE WORKER ERROR:",
        err.response?.data ||
          err.message
      );

      setError(
        err.response?.data?.message ||
          (isRw
            ? "Umukozi ntiyashoboye gukorwa."
            : "Worker could not be created.")
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RESEND OTP
  ============================================================ */

  const resendOtp = async () => {
    if (countdown > 0) {
      return;
    }

    await sendOtp();
  };

  /* ============================================================
     RESET
  ============================================================ */

  const createAnother = () => {
    setForm({
      fullName: "",
      idNumber: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    });

    setOtp("");

    setStep("form");

    setError("");
    setSuccess("");

    setCountdown(0);
  };

  /* ============================================================
     INPUT
  ============================================================ */

  const inputClass = "worker-form-input";

  return (
    <div className="create-worker-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="create-worker-header">

        <div>

          <div className="create-worker-breadcrumb">

            <UserPlus size={14} />

            <span>
              Administration
            </span>

            <span>/</span>

            <span>
              {isRw
                ? "Ongeramo umukozi"
                : "Create Worker"}
            </span>

          </div>

          <h1>
            {isRw
              ? "Ongeramo Umukozi"
              : "Create Worker"}
          </h1>

          <p>
            {isRw
              ? "Kora konti y'umukozi mushya wa ANTIMATE kandi uyigenzure ukoresheje OTP."
              : "Create a new ANTIMATE staff account and verify it using OTP."}
          </p>

        </div>


        <button
          type="button"
          className="worker-back-button"
          onClick={() =>
            navigate("/workers")
          }
        >
          <ArrowLeft size={17} />

          {isRw
            ? "Subira ku bakozi"
            : "Back to Workers"}
        </button>

      </header>


      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="worker-alert worker-alert-error">

          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>
      )}


      {success && (
        <div className="worker-alert worker-alert-success">

          <CheckCircle2 size={18} />

          <span>{success}</span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            ×
          </button>

        </div>
      )}


      {/* ======================================================
          CREATED
      ====================================================== */}

      {step === "created" && (
        <section className="worker-created">

          <div className="worker-created-icon">
            <CheckCircle2 size={34} />
          </div>

          <h2>
            {isRw
              ? "Umukozi yakozwe neza"
              : "Worker created successfully"}
          </h2>

          <p>
            {isRw
              ? `${form.fullName} yamaze gushyirwa muri ANTIMATE Staff.`
              : `${form.fullName} has been added to ANTIMATE Staff.`}
          </p>

          <div className="worker-created-actions">

            <button
              type="button"
              className="worker-secondary-button"
              onClick={() =>
                navigate("/workers")
              }
            >
              <ArrowLeft size={16} />

              {isRw
                ? "Subira ku bakozi"
                : "Back to Workers"}
            </button>

            <button
              type="button"
              className="worker-primary-button"
              onClick={createAnother}
            >
              <UserPlus size={16} />

              {isRw
                ? "Ongeramo undi"
                : "Create Another"}
            </button>

          </div>

        </section>
      )}


      {/* ======================================================
          MAIN FORM
      ====================================================== */}

      {step !== "created" && (
        <div className="create-worker-workspace">


          {/* ==================================================
              PROGRESS
          ================================================== */}

          <div className="worker-progress">

            <div
              className={
                step === "form"
                  ? "worker-progress-step active"
                  : "worker-progress-step done"
              }
            >
              <span>1</span>

              <div>
                <strong>
                  {isRw
                    ? "Amakuru"
                    : "Information"}
                </strong>

                <small>
                  {isRw
                    ? "Amakuru y'umukozi"
                    : "Worker information"}
                </small>
              </div>
            </div>


            <div className="worker-progress-line" />


            <div
              className={
                step === "otp"
                  ? "worker-progress-step active"
                  : "worker-progress-step"
              }
            >
              <span>2</span>

              <div>
                <strong>
                  OTP
                </strong>

                <small>
                  {isRw
                    ? "Kwemeza numero"
                    : "Verify phone"}
                </small>
              </div>
            </div>

          </div>


          {/* ==================================================
              FORM
          ================================================== */}

          {step === "form" && (
            <section className="worker-form-section">

              <div className="worker-section-header">

                <div className="worker-section-icon">
                  <User size={19} />
                </div>

                <div>
                  <h2>
                    {isRw
                      ? "Amakuru y'umukozi"
                      : "Worker Information"}
                  </h2>

                  <p>
                    {isRw
                      ? "Uzuza amakuru yose akenewe mbere yo kohereza OTP."
                      : "Complete the required worker information before sending the OTP."}
                  </p>
                </div>

              </div>


              <div className="worker-form-body">


                {/* FULL NAME */}

                <FormField
                  icon={<User size={16} />}
                  label={
                    isRw
                      ? "Amazina yuzuye"
                      : "Full Name"
                  }
                  required
                >
                  <input
                    className={inputClass}
                    value={form.fullName}
                    onChange={(e) =>
                      updateField(
                        "fullName",
                        e.target.value
                      )
                    }
                    placeholder={
                      isRw
                        ? "Urugero: Hirwa Salem"
                        : "e.g. John Doe"
                    }
                    autoComplete="name"
                  />
                </FormField>


                {/* ID */}

                <FormField
                  icon={
                    <CreditCard size={16} />
                  }
                  label={
                    isRw
                      ? "ID Number"
                      : "ID Number"
                  }
                  required
                >
                  <input
                    className={inputClass}
                    value={form.idNumber}
                    onChange={(e) =>
                      updateField(
                        "idNumber",
                        e.target.value
                      )
                    }
                    placeholder={
                      isRw
                        ? "Andika ID Number"
                        : "Enter ID number"
                    }
                    autoComplete="off"
                  />
                </FormField>


                {/* PHONE */}

                <FormField
                  icon={
                    <Phone size={16} />
                  }
                  label={
                    isRw
                      ? "Telefone"
                      : "Phone"
                  }
                  required
                >
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="+250 7XX XXX XXX"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </FormField>


                {/* EMAIL */}

                <FormField
                  icon={
                    <Mail size={16} />
                  }
                  label="Email"
                  required
                >
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="worker@antimate.ai"
                    autoComplete="email"
                  />
                </FormField>


                {/* PASSWORD */}

                <FormField
                  icon={
                    <Lock size={16} />
                  }
                  label={
                    isRw
                      ? "Password"
                      : "Password"
                  }
                  required
                >
                  <div className="worker-password-input">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      className={inputClass}
                      value={form.password}
                      onChange={(e) =>
                        updateField(
                          "password",
                          e.target.value
                        )
                      }
                      placeholder={
                        isRw
                          ? "Nibura characters 6"
                          : "At least 6 characters"
                      }
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>
                </FormField>


                {/* CONFIRM PASSWORD */}

                <FormField
                  icon={
                    <Lock size={16} />
                  }
                  label={
                    isRw
                      ? "Emeza Password"
                      : "Confirm Password"
                  }
                  required
                >
                  <div className="worker-password-input">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      className={inputClass}
                      value={
                        form.confirmPassword
                      }
                      onChange={(e) =>
                        updateField(
                          "confirmPassword",
                          e.target.value
                        )
                      }
                      placeholder={
                        isRw
                          ? "Subiramo password"
                          : "Repeat password"
                      }
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>
                </FormField>


                {/* ROLE */}

                <FormField
                  icon={
                    <ShieldCheck size={16} />
                  }
                  label="Role"
                  required
                >

                  <div className="worker-select-wrapper">

                    <select
                      className={inputClass}
                      value={form.role}
                      onChange={(e) =>
                        updateField(
                          "role",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        {isRw
                          ? "Hitamo Role"
                          : "Select Role"}
                      </option>

                      {roles.map(
                        (role) => (
                          <option
                            key={role}
                            value={role}
                          >
                            {role}
                          </option>
                        )
                      )}

                    </select>

                    <ChevronDown
                      size={16}
                    />

                  </div>

                </FormField>

              </div>


              {/* SECURITY NOTE */}

              <div className="worker-security-note">

                <ShieldCheck size={19} />

                <div>

                  <strong>
                    {isRw
                      ? "OTP verification"
                      : "OTP verification"}
                  </strong>

                  <p>
                    {isRw
                      ? "Nyuma yo kuzuza aya makuru, OTP izoherezwa kuri telefone y'umukozi kugirango hemezwe ko numero ari iye."
                      : "After completing this form, an OTP will be sent to the worker's phone to verify the phone number."}
                  </p>

                </div>

              </div>


              {/* ACTION */}

              <div className="worker-form-footer">

                <button
                  type="button"
                  className="worker-secondary-button"
                  onClick={() =>
                    navigate("/workers")
                  }
                >
                  <ArrowLeft size={16} />

                  {isRw
                    ? "Kureka"
                    : "Cancel"}
                </button>


                <button
                  type="button"
                  className="worker-primary-button"
                  onClick={sendOtp}
                  disabled={sendingOtp}
                >

                  {sendingOtp ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="worker-spin"
                      />

                      {isRw
                        ? "Kohereza OTP..."
                        : "Sending OTP..."}
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />

                      {isRw
                        ? "Ohereza OTP"
                        : "Send OTP"}
                    </>
                  )}

                </button>

              </div>

            </section>
          )}


          {/* ==================================================
              OTP
          ================================================== */}

          {step === "otp" && (
            <section className="worker-otp-section">

              <div className="worker-otp-icon">
                <KeyRound size={30} />
              </div>

              <span className="worker-otp-label">
                OTP VERIFICATION
              </span>

              <h2>
                {isRw
                  ? "Emeza telefone y'umukozi"
                  : "Verify worker phone"}
              </h2>

              <p>
                {isRw
                  ? `Andika OTP twohereje kuri ${form.phone}.`
                  : `Enter the OTP sent to ${form.phone}.`}
              </p>


              <div className="worker-otp-input-wrapper">

                <input
                  value={otp}
                  onChange={(e) => {
                    const value =
                      e.target.value
                        .replace(
                          /[^0-9]/g,
                          ""
                        )
                        .slice(0, 6);

                    setOtp(value);
                    setError("");
                  }}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="worker-otp-input"
                />

              </div>


              <div className="worker-otp-meta">

                <div>
                  <Clock3 size={15} />

                  {countdown > 0 ? (
                    <span>
                      {isRw
                        ? `Ongera wohereze muri ${countdown}s`
                        : `Resend in ${countdown}s`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={
                        resendOtp
                      }
                      disabled={
                        sendingOtp
                      }
                    >
                      {sendingOtp ? (
                        <>
                          <RefreshCw
                            size={14}
                            className="worker-spin"
                          />

                          {isRw
                            ? "Ohereza..."
                            : "Sending..."}
                        </>
                      ) : (
                        <>
                          <RefreshCw
                            size={14}
                          />

                          {isRw
                            ? "Ongera wohereze OTP"
                            : "Resend OTP"}
                        </>
                      )}
                    </button>
                  )}

                </div>

              </div>


              <div className="worker-otp-summary">

                <div>
                  <span>
                    {isRw
                      ? "Umukozi"
                      : "Worker"}
                  </span>

                  <strong>
                    {form.fullName}
                  </strong>
                </div>

                <div>
                  <span>
                    {isRw
                      ? "Telefone"
                      : "Phone"}
                  </span>

                  <strong>
                    {form.phone}
                  </strong>
                </div>

                <div>
                  <span>
                    Role
                  </span>

                  <strong>
                    {form.role}
                  </strong>
                </div>

              </div>


              <div className="worker-otp-actions">

                <button
                  type="button"
                  className="worker-secondary-button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                    setError("");
                    setSuccess("");
                  }}
                  disabled={loading}
                >
                  <ArrowLeft size={16} />

                  {isRw
                    ? "Hindura amakuru"
                    : "Edit information"}
                </button>


                <button
                  type="button"
                  className="worker-primary-button"
                  onClick={
                    createWorker
                  }
                  disabled={
                    loading ||
                    otp.length < 4
                  }
                >

                  {loading ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="worker-spin"
                      />

                      {isRw
                        ? "Turimo gukora..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={16}
                      />

                      {isRw
                        ? "Emeza & Kora Worker"
                        : "Verify & Create Worker"}
                    </>
                  )}

                </button>

              </div>

            </section>
          )}

        </div>
      )}


      {/* ======================================================
          CSS
      ====================================================== */}

      <style>{`

        .create-worker-page {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 4px 0 40px;
          color: var(--admin-text);
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .create-worker-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .create-worker-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .create-worker-header h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1.2;
          font-weight: 760;
          letter-spacing: -.5px;
        }

        .create-worker-header p {
          margin: 7px 0 0;
          color: var(--admin-text-muted);
          font-size: 13px;
          line-height: 1.55;
        }


        .worker-back-button {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 13px;
          flex-shrink: 0;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: var(--admin-surface);
          color: var(--admin-text);
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
        }

        .worker-back-button:hover {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
        }


        /* =====================================================
           ALERTS
        ===================================================== */

        .worker-alert {
          min-height: 45px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding: 0 12px;
          border-radius: 8px;
          font-size: 12px;
        }

        .worker-alert span {
          flex: 1;
        }

        .worker-alert button {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 20px;
        }

        .worker-alert-error {
          border: 1px solid rgba(239, 107, 107, .25);
          background: rgba(239, 107, 107, .06);
          color: #ef8585;
        }

        .worker-alert-success {
          border: 1px solid rgba(69, 201, 130, .25);
          background: rgba(69, 201, 130, .06);
          color: #55ca88;
        }


        /* =====================================================
           WORKSPACE
        ===================================================== */

        .create-worker-workspace {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }


        /* =====================================================
           PROGRESS
        ===================================================== */

        .worker-progress {
          display: flex;
          align-items: center;
          padding: 14px 18px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          background: var(--admin-surface);
        }

        .worker-progress-step {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 160px;
          color: var(--admin-text-muted);
        }

        .worker-progress-step > span {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid var(--admin-border);
          border-radius: 50%;
          font-size: 11px;
          font-weight: 750;
        }

        .worker-progress-step > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .worker-progress-step strong {
          font-size: 11px;
        }

        .worker-progress-step small {
          font-size: 9px;
        }

        .worker-progress-step.active {
          color: var(--admin-accent);
        }

        .worker-progress-step.active > span {
          border-color: var(--admin-accent);
          background: var(--admin-accent-soft);
        }

        .worker-progress-step.done {
          color: #4bc985;
        }

        .worker-progress-step.done > span {
          border-color: #4bc985;
        }

        .worker-progress-line {
          height: 1px;
          flex: 1;
          max-width: 180px;
          margin: 0 15px;
          background: var(--admin-border);
        }


        /* =====================================================
           FORM SECTION
        ===================================================== */

        .worker-form-section {
          border: 1px solid var(--admin-border);
          border-radius: 12px;
          background: var(--admin-surface);
          overflow: hidden;
        }

        .worker-section-header {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--admin-border);
        }

        .worker-section-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .worker-section-header h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 720;
        }

        .worker-section-header p {
          margin: 4px 0 0;
          color: var(--admin-text-muted);
          font-size: 11px;
          line-height: 1.5;
        }


        /* =====================================================
           FORM BODY
        ===================================================== */

        .worker-form-body {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 20px;
          padding: 20px;
        }

        .worker-form-field {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .worker-form-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--admin-text);
          font-size: 11px;
          font-weight: 680;
        }

        .worker-form-label svg {
          color: var(--admin-text-muted);
        }

        .worker-required {
          color: #ef7777;
        }


        .worker-form-input {
          width: 100%;
          height: 42px;
          box-sizing: border-box;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          outline: none;
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
          padding: 0 11px;
          font-size: 12px;
          transition:
            border-color .15s ease,
            box-shadow .15s ease;
        }

        .worker-form-input::placeholder {
          color: var(--admin-text-muted);
          opacity: .75;
        }

        .worker-form-input:focus {
          border-color: var(--admin-accent);
          box-shadow:
            0 0 0 3px
            var(--admin-accent-soft);
        }


        .worker-password-input {
          position: relative;
        }

        .worker-password-input .worker-form-input {
          padding-right: 43px;
        }

        .worker-password-input button {
          position: absolute;
          top: 50%;
          right: 6px;
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          transform: translateY(-50%);
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: var(--admin-text-muted);
          cursor: pointer;
        }

        .worker-password-input button:hover {
          color: var(--admin-accent);
        }


        /* =====================================================
           SELECT
        ===================================================== */

        .worker-select-wrapper {
          position: relative;
        }

        .worker-select-wrapper select {
          appearance: none;
          padding-right: 35px;
          cursor: pointer;
        }

        .worker-select-wrapper > svg {
          position: absolute;
          top: 50%;
          right: 11px;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--admin-text-muted);
        }


        /* =====================================================
           SECURITY NOTE
        ===================================================== */

        .worker-security-note {
          display: flex;
          gap: 11px;
          margin: 0 20px 20px;
          padding: 13px;
          border: 1px solid var(--admin-border);
          border-radius: 9px;
          background: var(--admin-surface-subtle);
        }

        .worker-security-note > svg {
          flex-shrink: 0;
          color: var(--admin-accent);
        }

        .worker-security-note strong {
          display: block;
          margin-bottom: 4px;
          font-size: 11px;
        }

        .worker-security-note p {
          margin: 0;
          color: var(--admin-text-muted);
          font-size: 10px;
          line-height: 1.6;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .worker-form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 15px 20px;
          border-top: 1px solid var(--admin-border);
        }

        .worker-primary-button,
        .worker-secondary-button {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .worker-primary-button {
          border: 1px solid var(--admin-accent);
          background: var(--admin-accent);
          color: white;
        }

        .worker-primary-button:hover {
          opacity: .91;
        }

        .worker-secondary-button {
          border: 1px solid var(--admin-border);
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
        }

        .worker-secondary-button:hover {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
        }

        .worker-primary-button:disabled,
        .worker-secondary-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }


        /* =====================================================
           OTP
        ===================================================== */

        .worker-otp-section {
          max-width: 650px;
          width: 100%;
          margin: 0 auto;
          padding: 35px 30px;
          border: 1px solid var(--admin-border);
          border-radius: 12px;
          background: var(--admin-surface);
          text-align: center;
        }

        .worker-otp-icon {
          width: 61px;
          height: 61px;
          display: grid;
          place-items: center;
          margin: 0 auto 13px;
          border-radius: 50%;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .worker-otp-label {
          color: var(--admin-text-muted);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .8px;
        }

        .worker-otp-section h2 {
          margin: 7px 0 5px;
          font-size: 20px;
        }

        .worker-otp-section > p {
          max-width: 450px;
          margin: 0 auto;
          color: var(--admin-text-muted);
          font-size: 11px;
          line-height: 1.6;
        }


        .worker-otp-input-wrapper {
          max-width: 330px;
          margin: 22px auto 10px;
        }

        .worker-otp-input {
          width: 100%;
          height: 58px;
          box-sizing: border-box;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          outline: none;
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
          text-align: center;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;
          font-size: 23px;
          font-weight: 750;
          letter-spacing: 7px;
        }

        .worker-otp-input:focus {
          border-color: var(--admin-accent);
          box-shadow:
            0 0 0 3px
            var(--admin-accent-soft);
        }


        .worker-otp-meta {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .worker-otp-meta > div {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--admin-text-muted);
          font-size: 10px;
        }

        .worker-otp-meta button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: var(--admin-accent);
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
        }

        .worker-otp-meta button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }


        .worker-otp-summary {
          display: flex;
          align-items: stretch;
          justify-content: center;
          margin: 0 auto 22px;
          border: 1px solid var(--admin-border);
          border-radius: 9px;
          overflow: hidden;
          text-align: left;
        }

        .worker-otp-summary > div {
          min-width: 0;
          flex: 1;
          padding: 11px;
          border-right: 1px solid var(--admin-border);
        }

        .worker-otp-summary > div:last-child {
          border-right: 0;
        }

        .worker-otp-summary span {
          display: block;
          margin-bottom: 4px;
          color: var(--admin-text-muted);
          font-size: 9px;
        }

        .worker-otp-summary strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
        }


        .worker-otp-actions {
          display: flex;
          justify-content: center;
          gap: 8px;
        }


        /* =====================================================
           CREATED
        ===================================================== */

        .worker-created {
          min-height: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 35px 20px;
          border: 1px solid var(--admin-border);
          border-radius: 12px;
          background: var(--admin-surface);
          text-align: center;
        }

        .worker-created-icon {
          width: 67px;
          height: 67px;
          display: grid;
          place-items: center;
          margin-bottom: 16px;
          border-radius: 50%;
          background: rgba(69, 201, 130, .08);
          color: #4bc985;
        }

        .worker-created h2 {
          margin: 0;
          font-size: 20px;
        }

        .worker-created p {
          margin: 7px 0 20px;
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .worker-created-actions {
          display: flex;
          gap: 8px;
        }


        /* =====================================================
           ANIMATION
        ===================================================== */

        .worker-spin {
          animation: worker-spin 1s linear infinite;
        }

        @keyframes worker-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 800px) {

          .create-worker-header {
            align-items: stretch;
            flex-direction: column;
          }

          .worker-back-button {
            width: 100%;
          }

          .worker-form-body {
            grid-template-columns: 1fr;
          }

          .worker-progress-step {
            min-width: 0;
          }

          .worker-progress-line {
            max-width: none;
          }

        }


        @media (max-width: 600px) {

          .create-worker-header h1 {
            font-size: 25px;
          }

          .worker-progress {
            padding: 12px;
          }

          .worker-progress-step > div {
            display: none;
          }

          .worker-progress-step {
            justify-content: center;
          }

          .worker-progress-line {
            margin: 0 8px;
          }

          .worker-section-header {
            padding: 15px;
          }

          .worker-form-body {
            padding: 15px;
          }

          .worker-security-note {
            margin: 0 15px 15px;
          }

          .worker-form-footer {
            flex-direction: column-reverse;
            padding: 13px 15px;
          }

          .worker-form-footer button {
            width: 100%;
          }

          .worker-otp-section {
            padding: 28px 17px;
          }

          .worker-otp-summary {
            flex-direction: column;
          }

          .worker-otp-summary > div {
            border-right: 0;
            border-bottom: 1px solid var(--admin-border);
          }

          .worker-otp-summary > div:last-child {
            border-bottom: 0;
          }

          .worker-otp-actions {
            flex-direction: column-reverse;
          }

          .worker-otp-actions button {
            width: 100%;
          }

          .worker-created-actions {
            width: 100%;
            flex-direction: column-reverse;
          }

          .worker-created-actions button {
            width: 100%;
          }

        }


        @media (max-width: 400px) {

          .worker-otp-input {
            height: 53px;
            font-size: 20px;
            letter-spacing: 5px;
          }

        }

      `}</style>

    </div>
  );
}


/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
  icon,
  label,
  required = false,
  children,
}) {
  return (
    <div className="worker-form-field">

      <label className="worker-form-label">

        {icon}

        <span>
          {label}
        </span>

        {required && (
          <span className="worker-required">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}