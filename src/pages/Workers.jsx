import { useEffect, useMemo, useState } from "react";

import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  ChevronDown,
} from "lucide-react";

import api from "../api/axios";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNavigate } from "react-router-dom";

export default function Workers() {
  const { language } = useAppSettings();
  const navigate = useNavigate();

  const isRw = language === "rw";

  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerToDelete, setWorkerToDelete] = useState(null);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ============================================================
     LOAD WORKERS
  ============================================================ */

  const loadWorkers = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await api.get("/workers");

      console.log("WORKERS:", res.data);

      /*
       * Backend may return:
       * [
       *   ...
       * ]
       *
       * or:
       * {
       *   workers: [...]
       * }
       */

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.workers)
          ? res.data.workers
          : [];

      setWorkers(data);
    } catch (err) {
      console.error(
        "LOAD WORKERS ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          (isRw
            ? "Abakozi ntibashoboye kuboneka."
            : "Workers could not be loaded.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  /* ============================================================
     ROLES
  ============================================================ */

  const roles = useMemo(() => {
    const uniqueRoles = new Set();

    workers.forEach((worker) => {
      if (worker?.role) {
        uniqueRoles.add(String(worker.role));
      }
    });

    return Array.from(uniqueRoles).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [workers]);

  /* ============================================================
     FILTER + SEARCH + SORT
  ============================================================ */

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = workers.filter((worker) => {
      const name =
        worker?.fullName ||
        worker?.name ||
        "";

      const email =
        worker?.email ||
        "";

      const phone =
        worker?.phone ||
        "";

      const role =
        worker?.role ||
        "";

      const matchesSearch =
        !query ||
        String(name).toLowerCase().includes(query) ||
        String(email).toLowerCase().includes(query) ||
        String(phone).toLowerCase().includes(query) ||
        String(role).toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" ||
        String(role) === String(roleFilter);

      return matchesSearch && matchesRole;
    });

    result.sort((a, b) => {
      if (sortBy === "role") {
        return String(a?.role || "").localeCompare(
          String(b?.role || "")
        );
      }

      if (sortBy === "email") {
        return String(a?.email || "").localeCompare(
          String(b?.email || "")
        );
      }

      return String(
        a?.fullName ||
          a?.name ||
          ""
      ).localeCompare(
        String(
          b?.fullName ||
            b?.name ||
            ""
        )
      );
    });

    return result;
  }, [
    workers,
    search,
    roleFilter,
    sortBy,
  ]);

  /* ============================================================
     DELETE WORKER
  ============================================================ */

  const deleteWorker = async () => {
    if (!workerToDelete?._id) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(
        `/workers/${workerToDelete._id}`
      );

      setWorkers((current) =>
        current.filter(
          (worker) =>
            worker._id !== workerToDelete._id
        )
      );

      setWorkerToDelete(null);

      setSuccess(
        isRw
          ? "Umukozi yasibwe neza."
          : "Worker deleted successfully."
      );
    } catch (err) {
      console.error(
        "DELETE WORKER ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          (isRw
            ? "Umukozi ntiyashoboye gusibwa."
            : "Worker could not be deleted.")
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ============================================================
     WORKER STATUS
  ============================================================ */

  const getWorkerStatus = (worker) => {
    /*
     * Supports several possible backend fields:
     * active
     * isActive
     * status
     */

    if (
      worker?.active === false ||
      worker?.isActive === false ||
      String(worker?.status).toLowerCase() ===
        "inactive"
    ) {
      return "inactive";
    }

    return "active";
  };

  /* ============================================================
     DISPLAY HELPERS
  ============================================================ */

  const getWorkerName = (worker) =>
    worker?.fullName ||
    worker?.name ||
    "—";

  const getWorkerRole = (worker) =>
    worker?.role ||
    "—";

  const getWorkerEmail = (worker) =>
    worker?.email ||
    "—";

  const getWorkerPhone = (worker) =>
    worker?.phone ||
    "—";

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="workers-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="workers-header">

        <div className="workers-header-text">

          <div className="workers-breadcrumb">
            <Users size={14} />

            <span>
              {isRw
                ? "Administration"
                : "Administration"}
            </span>

            <span>/</span>

            <span>
              {isRw
                ? "Abakozi"
                : "Workers"}
            </span>
          </div>

          <h1>
            {isRw
              ? "ANTIMATE Staff"
              : "ANTIMATE Staff"}
          </h1>

          <p>
            {isRw
              ? "Genzura abakozi ba ANTIMATE, inshingano zabo n'amakuru yabo."
              : "Manage ANTIMATE staff, roles and worker information."}
          </p>

        </div>

        <div className="workers-header-actions">

          <button
            type="button"
            className="workers-refresh-button"
            onClick={() => loadWorkers(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "workers-spin"
                  : ""
              }
            />

            <span>
              {isRw
                ? "Refresh"
                : "Refresh"}
            </span>
          </button>

          <button
            type="button"
            className="workers-create-button"
            onClick={() =>
              navigate("/create-worker")
            }
          >
            <UserPlus size={17} />

            <span>
              {isRw
                ? "Ongeramo umukozi"
                : "Add Worker"}
            </span>
          </button>

        </div>

      </header>


      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="workers-alert workers-alert-error">

          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>

        </div>
      )}


      {success && (
        <div className="workers-alert workers-alert-success">

          <CheckCircle2 size={18} />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <X size={17} />
          </button>

        </div>
      )}


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      {!loading && (
        <div className="workers-summary">

          <div className="workers-summary-item">

            <Users size={17} />

            <div>
              <strong>
                {workers.length}
              </strong>

              <span>
                {isRw
                  ? "Abakozi bose"
                  : "Total workers"}
              </span>
            </div>

          </div>


          <div className="workers-summary-divider" />


          <div className="workers-summary-item">

            <Shield size={17} />

            <div>
              <strong>
                {roles.length}
              </strong>

              <span>
                {isRw
                  ? "Inshingano"
                  : "Roles"}
              </span>
            </div>

          </div>


          <div className="workers-summary-divider" />


          <div className="workers-summary-item">

            <span className="workers-summary-status-dot" />

            <div>
              <strong>
                {
                  workers.filter(
                    (worker) =>
                      getWorkerStatus(
                        worker
                      ) === "active"
                  ).length
                }
              </strong>

              <span>
                {isRw
                  ? "Bakora"
                  : "Active"}
              </span>
            </div>

          </div>

        </div>
      )}


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      {!loading && workers.length > 0 && (
        <div className="workers-toolbar">

          <div className="workers-search">

            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={
                isRw
                  ? "Shakisha umukozi..."
                  : "Search workers..."
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                <X size={15} />
              </button>
            )}

          </div>


          <div className="workers-select-group">

            <label>
              {isRw
                ? "Role"
                : "Role"}
            </label>

            <div className="workers-select-wrapper">

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  {isRw
                    ? "Inshingano zose"
                    : "All roles"}
                </option>

                {roles.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </select>

              <ChevronDown size={15} />

            </div>

          </div>


          <div className="workers-select-group">

            <label>
              {isRw
                ? "Tondeka"
                : "Sort"}
            </label>

            <div className="workers-select-wrapper">

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
              >
                <option value="name">
                  {isRw
                    ? "Izina"
                    : "Name"}
                </option>

                <option value="role">
                  {isRw
                    ? "Role"
                    : "Role"}
                </option>

                <option value="email">
                  {isRw
                    ? "Email"
                    : "Email"}
                </option>
              </select>

              <ChevronDown size={15} />

            </div>

          </div>

        </div>
      )}


      {/* ======================================================
          RESULT COUNT
      ====================================================== */}

      {!loading && workers.length > 0 && (
        <div className="workers-result-count">

          {isRw
            ? `Herekanwe ${filteredWorkers.length} muri ${workers.length} bakozi`
            : `Showing ${filteredWorkers.length} of ${workers.length} workers`}

        </div>
      )}


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <section className="workers-loading">

          <RefreshCw
            size={27}
            className="workers-spin"
          />

          <strong>
            {isRw
              ? "Turimo gushaka abakozi..."
              : "Loading workers..."}
          </strong>

          <span>
            {isRw
              ? "Tegereza gato."
              : "Please wait a moment."}
          </span>

        </section>
      )}


      {/* ======================================================
          WORKER LIST
      ====================================================== */}

      {!loading &&
        filteredWorkers.length > 0 && (

          <section className="workers-list-section">

            <div className="workers-list-header">

              <span>
                {isRw
                  ? "Umukozi"
                  : "Worker"}
              </span>

              <span>
                {isRw
                  ? "Contact"
                  : "Contact"}
              </span>

              <span>
                {isRw
                  ? "Role"
                  : "Role"}
              </span>

              <span>
                {isRw
                  ? "Status"
                  : "Status"}
              </span>

              <span>
                {isRw
                  ? "Actions"
                  : "Actions"}
              </span>

            </div>


            <div className="workers-list">

              {filteredWorkers.map(
                (worker) => {

                  const status =
                    getWorkerStatus(
                      worker
                    );

                  return (
                    <div
                      className="worker-row"
                      key={worker._id}
                    >

                      {/* WORKER */}

                      <div className="worker-main">

                        <div className="worker-avatar">
                          {getWorkerName(
                            worker
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="worker-main-info">

                          <strong>
                            {getWorkerName(
                              worker
                            )}
                          </strong>

                          <span>
                            {getWorkerEmail(
                              worker
                            )}
                          </span>

                        </div>

                      </div>


                      {/* CONTACT */}

                      <div className="worker-contact">

                        <div>
                          <Mail size={14} />

                          <span>
                            {getWorkerEmail(
                              worker
                            )}
                          </span>
                        </div>

                        <div>
                          <Phone size={14} />

                          <span>
                            {getWorkerPhone(
                              worker
                            )}
                          </span>
                        </div>

                      </div>


                      {/* ROLE */}

                      <div className="worker-role">

                        <span>
                          {getWorkerRole(
                            worker
                          )}
                        </span>

                      </div>


                      {/* STATUS */}

                      <div>

                        <span
                          className={
                            status ===
                            "active"
                              ? "worker-status worker-status-active"
                              : "worker-status worker-status-inactive"
                          }
                        >
                          <span />

                          {status ===
                          "active"
                            ? isRw
                              ? "Akora"
                              : "Active"
                            : isRw
                              ? "Ntakora"
                              : "Inactive"}
                        </span>

                      </div>


                      {/* ACTIONS */}

                      <div className="worker-actions">

                        <button
                          type="button"
                          title={
                            isRw
                              ? "Reba umukozi"
                              : "View worker"
                          }
                          onClick={() =>
                            setSelectedWorker(
                              worker
                            )
                          }
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="worker-delete-action"
                          title={
                            isRw
                              ? "Siba umukozi"
                              : "Delete worker"
                          }
                          onClick={() =>
                            setWorkerToDelete(
                              worker
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>
        )}


      {/* ======================================================
          NO SEARCH RESULTS
      ====================================================== */}

      {!loading &&
        workers.length > 0 &&
        filteredWorkers.length === 0 && (

          <section className="workers-empty workers-empty-search">

            <Search size={29} />

            <h2>
              {isRw
                ? "Nta mukozi wabonetse"
                : "No workers found"}
            </h2>

            <p>
              {isRw
                ? "Hindura ibyo washakishije cyangwa filter wakoresheje."
                : "Try changing your search or role filter."}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
              }}
            >
              {isRw
                ? "Siba filters"
                : "Clear filters"}
            </button>

          </section>
        )}


      {/* ======================================================
          EMPTY DATABASE
      ====================================================== */}

      {!loading &&
        workers.length === 0 && (

          <section className="workers-empty">

            <div className="workers-empty-icon">
              <Users size={31} />
            </div>

            <h2>
              {isRw
                ? "Nta bakozi baraboneka"
                : "No workers yet"}
            </h2>

            <p>
              {isRw
                ? "Nta mukozi urashyirwa muri ANTIMATE Staff. Ongeramo umukozi mushya kugirango atangire gukoresha system."
                : "There are no workers in ANTIMATE Staff yet. Add a worker to give them access to the system."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/create-worker")
              }
            >
              <UserPlus size={17} />

              {isRw
                ? "Ongeramo umukozi"
                : "Add Worker"}
            </button>

          </section>
        )}


      {/* ======================================================
          WORKER DETAILS MODAL
      ====================================================== */}

      {selectedWorker && (
        <div
          className="workers-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedWorker(null);
            }
          }}
        >

          <section className="workers-modal">

            <div className="workers-modal-header">

              <div>
                <span className="workers-modal-eyebrow">
                  {isRw
                    ? "AMAKURU Y'UMUKOZI"
                    : "WORKER DETAILS"}
                </span>

                <h2>
                  {getWorkerName(
                    selectedWorker
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedWorker(null)
                }
              >
                <X size={18} />
              </button>

            </div>


            <div className="workers-modal-body">

              <div className="workers-modal-profile">

                <div className="worker-avatar worker-avatar-large">
                  {getWorkerName(
                    selectedWorker
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <strong>
                    {getWorkerName(
                      selectedWorker
                    )}
                  </strong>

                  <span>
                    {getWorkerRole(
                      selectedWorker
                    )}
                  </span>

                </div>

              </div>


              <div className="workers-detail-list">

                <DetailItem
                  icon={<Mail size={16} />}
                  label={
                    isRw
                      ? "Email"
                      : "Email"
                  }
                  value={getWorkerEmail(
                    selectedWorker
                  )}
                />

                <DetailItem
                  icon={<Phone size={16} />}
                  label={
                    isRw
                      ? "Telefone"
                      : "Phone"
                  }
                  value={getWorkerPhone(
                    selectedWorker
                  )}
                />

                <DetailItem
                  icon={<Shield size={16} />}
                  label={
                    isRw
                      ? "Role"
                      : "Role"
                  }
                  value={getWorkerRole(
                    selectedWorker
                  )}
                />

                <DetailItem
                  icon={<Users size={16} />}
                  label={
                    isRw
                      ? "Status"
                      : "Status"
                  }
                  value={
                    getWorkerStatus(
                      selectedWorker
                    ) === "active"
                      ? isRw
                        ? "Akora"
                        : "Active"
                      : isRw
                        ? "Ntakora"
                        : "Inactive"
                  }
                />

              </div>

            </div>


            <div className="workers-modal-footer">

              <button
                type="button"
                className="workers-modal-close"
                onClick={() =>
                  setSelectedWorker(null)
                }
              >
                {isRw
                  ? "Funga"
                  : "Close"}
              </button>

              <button
                type="button"
                className="workers-modal-delete"
                onClick={() => {
                  setWorkerToDelete(
                    selectedWorker
                  );

                  setSelectedWorker(null);
                }}
              >
                <Trash2 size={16} />

                {isRw
                  ? "Siba umukozi"
                  : "Delete worker"}
              </button>

            </div>

          </section>

        </div>
      )}


      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {workerToDelete && (
        <div
          className="workers-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget &&
              !deleting
            ) {
              setWorkerToDelete(null);
            }
          }}
        >

          <section className="workers-confirm-modal">

            <div className="workers-confirm-icon">
              <Trash2 size={24} />
            </div>

            <h2>
              {isRw
                ? "Siba umukozi?"
                : "Delete worker?"}
            </h2>

            <p>
              {isRw
                ? `Ugiye gusiba ${getWorkerName(
                    workerToDelete
                  )}. Iki gikorwa ntigishobora gusubizwa.`
                : `You are about to delete ${getWorkerName(
                    workerToDelete
                  )}. This action cannot be undone.`}
            </p>

            <div className="workers-confirm-actions">

              <button
                type="button"
                className="workers-confirm-cancel"
                onClick={() =>
                  setWorkerToDelete(null)
                }
                disabled={deleting}
              >
                {isRw
                  ? "Kureka"
                  : "Cancel"}
              </button>

              <button
                type="button"
                className="workers-confirm-delete"
                onClick={deleteWorker}
                disabled={deleting}
              >

                {deleting ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="workers-spin"
                    />

                    {isRw
                      ? "Birimo gusiba..."
                      : "Deleting..."}
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />

                    {isRw
                      ? "Yego, Siba"
                      : "Yes, Delete"}
                  </>
                )}

              </button>

            </div>

          </section>

        </div>
      )}


      {/* ======================================================
          CSS
      ====================================================== */}

      <style>{`

        .workers-page {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 4px 0 40px;
          color: var(--admin-text);
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .workers-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .workers-header-text {
          min-width: 0;
        }

        .workers-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          color: var(--admin-text-muted);
          font-size: 12px;
        }

        .workers-header h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1.2;
          font-weight: 760;
          letter-spacing: -.5px;
        }

        .workers-header p {
          margin: 7px 0 0;
          color: var(--admin-text-muted);
          font-size: 14px;
          line-height: 1.55;
        }


        .workers-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-shrink: 0;
        }

        .workers-refresh-button,
        .workers-add-button {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition:
            opacity .18s ease,
            transform .18s ease;
        }

        .workers-refresh-button {
          border: 1px solid var(--admin-border);
          background: var(--admin-surface);
          color: var(--admin-text);
        }

        .workers-refresh-button:hover {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
        }

        .workers-add-button {
          border: 1px solid var(--admin-accent);
          background: var(--admin-accent);
          color: #fff;
        }

        .workers-add-button:hover {
          opacity: .91;
          transform: translateY(-1px);
        }

        .workers-refresh-button:disabled,
        .workers-add-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }


        /* =====================================================
           ALERT
        ===================================================== */

        .workers-alert {
          min-height: 45px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding: 0 12px;
          border-radius: 8px;
          font-size: 12px;
        }

        .workers-alert span {
          flex: 1;
        }

        .workers-alert button {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .workers-alert-error {
          border: 1px solid rgba(239, 107, 107, .25);
          background: rgba(239, 107, 107, .06);
          color: #ef8585;
        }

        .workers-alert-success {
          border: 1px solid rgba(69, 201, 130, .25);
          background: rgba(69, 201, 130, .06);
          color: #55ca88;
        }


        /* =====================================================
           SUMMARY
        ===================================================== */

        .workers-summary {
          display: flex;
          align-items: center;
          min-height: 72px;
          margin-bottom: 16px;
          padding: 0 18px;
          border: 1px solid var(--admin-border);
          border-radius: 11px;
          background: var(--admin-surface);
        }

        .workers-summary-item {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 150px;
        }

        .workers-summary-item > svg {
          color: var(--admin-accent);
        }

        .workers-summary-item > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .workers-summary-item strong {
          font-size: 16px;
          font-weight: 760;
        }

        .workers-summary-item span {
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .workers-summary-divider {
          width: 1px;
          height: 34px;
          margin: 0 20px;
          background: var(--admin-border);
        }

        .workers-summary-status-dot {
          width: 9px !important;
          height: 9px;
          display: block;
          border-radius: 50%;
          background: #4bc985;
        }


        /* =====================================================
           TOOLBAR
        ===================================================== */

        .workers-toolbar {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 9px;
        }

        .workers-search {
          height: 40px;
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 11px;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          background: var(--admin-surface);
        }

        .workers-search > svg {
          flex-shrink: 0;
          color: var(--admin-text-muted);
        }

        .workers-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: none;
          background: transparent;
          color: var(--admin-text);
          font-size: 12px;
        }

        .workers-search input::placeholder {
          color: var(--admin-text-muted);
        }

        .workers-search button {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 0;
          background: transparent;
          color: var(--admin-text-muted);
          cursor: pointer;
        }

        .workers-select-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .workers-select-group label {
          color: var(--admin-text-muted);
          font-size: 10px;
          font-weight: 650;
        }

        .workers-select-wrapper {
          position: relative;
          min-width: 135px;
        }

        .workers-select-wrapper select {
          width: 100%;
          height: 40px;
          appearance: none;
          padding: 0 31px 0 11px;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          outline: none;
          background: var(--admin-surface);
          color: var(--admin-text);
          cursor: pointer;
          font-size: 12px;
        }

        .workers-select-wrapper > svg {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--admin-text-muted);
        }


        /* =====================================================
           RESULT COUNT
        ===================================================== */

        .workers-result-count {
          margin: 0 0 8px;
          color: var(--admin-text-muted);
          font-size: 11px;
        }


        /* =====================================================
           LIST
        ===================================================== */

        .workers-list-section {
          border: 1px solid var(--admin-border);
          border-radius: 11px;
          background: var(--admin-surface);
          overflow: hidden;
        }

        .workers-list-header,
        .worker-row {
          display: grid;
          grid-template-columns:
            minmax(210px, 1.4fr)
            minmax(190px, 1.2fr)
            minmax(100px, .7fr)
            minmax(90px, .55fr)
            82px;
          align-items: center;
          column-gap: 18px;
        }

        .workers-list-header {
          min-height: 43px;
          padding: 0 17px;
          border-bottom: 1px solid var(--admin-border);
          background: var(--admin-surface-subtle);
          color: var(--admin-text-muted);
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .35px;
        }

        .worker-row {
          min-height: 78px;
          padding: 10px 17px;
          border-bottom: 1px solid var(--admin-border);
          transition: background .15s ease;
        }

        .worker-row:last-child {
          border-bottom: 0;
        }

        .worker-row:hover {
          background: var(--admin-surface-subtle);
        }


        /* =====================================================
           WORKER
        ===================================================== */

        .worker-main {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .worker-avatar {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
          font-size: 13px;
          font-weight: 800;
        }

        .worker-main-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .worker-main-info strong {
          overflow: hidden;
          color: var(--admin-text);
          font-size: 12px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .worker-main-info span {
          overflow: hidden;
          color: var(--admin-text-muted);
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }


        /* =====================================================
           CONTACT
        ===================================================== */

        .worker-contact {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .worker-contact > div {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--admin-text-muted);
          font-size: 10px;
        }

        .worker-contact > div span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }


        /* =====================================================
           ROLE
        ===================================================== */

        .worker-role span {
          display: inline-flex;
          max-width: 100%;
          overflow: hidden;
          padding: 5px 8px;
          border: 1px solid var(--admin-border);
          border-radius: 6px;
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
          font-size: 10px;
          font-weight: 650;
          text-overflow: ellipsis;
          white-space: nowrap;
        }


        /* =====================================================
           STATUS
        ===================================================== */

        .worker-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
        }

        .worker-status > span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .worker-status-active {
          color: #4bc985;
        }

        .worker-status-inactive {
          color: var(--admin-text-muted);
        }


        /* =====================================================
           ACTIONS
        ===================================================== */

        .worker-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
        }

        .worker-actions button {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border: 1px solid var(--admin-border);
          border-radius: 7px;
          background: var(--admin-surface-subtle);
          color: var(--admin-text-muted);
          cursor: pointer;
          transition:
            color .15s ease,
            border-color .15s ease,
            background .15s ease;
        }

        .worker-actions button:hover {
          border-color: var(--admin-accent);
          color: var(--admin-accent);
        }

        .worker-actions .worker-delete-action:hover {
          border-color: #ef7777;
          color: #ef7777;
        }


        /* =====================================================
           EMPTY
        ===================================================== */

        .workers-empty,
        .workers-loading {
          min-height: 310px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 35px 20px;
          border: 1px dashed var(--admin-border);
          border-radius: 11px;
          background: var(--admin-surface);
          text-align: center;
        }

        .workers-empty-search {
          min-height: 250px;
        }

        .workers-empty-icon {
          width: 61px;
          height: 61px;
          display: grid;
          place-items: center;
          margin-bottom: 14px;
          border-radius: 50%;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .workers-empty > svg {
          margin-bottom: 13px;
          color: var(--admin-text-muted);
        }

        .workers-empty h2,
        .workers-loading strong {
          margin: 0;
          font-size: 16px;
          font-weight: 720;
        }

        .workers-empty p {
          max-width: 470px;
          margin: 7px 0 17px;
          color: var(--admin-text-muted);
          font-size: 11px;
          line-height: 1.6;
        }

        .workers-empty button {
          min-height: 39px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 13px;
          border: 1px solid var(--admin-accent);
          border-radius: 8px;
          background: var(--admin-accent);
          color: #fff;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }


        /* =====================================================
           LOADING
        ===================================================== */

        .workers-loading {
          min-height: 270px;
          gap: 8px;
          border-style: solid;
        }

        .workers-loading svg {
          margin-bottom: 4px;
          color: var(--admin-accent);
        }

        .workers-loading span {
          color: var(--admin-text-muted);
          font-size: 11px;
        }


        /* =====================================================
           MODAL
        ===================================================== */

        .workers-modal-overlay {
          position: fixed;
          z-index: 1000;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, .55);
          backdrop-filter: blur(4px);
        }

        .workers-modal {
          width: 100%;
          max-width: 540px;
          max-height: calc(100vh - 40px);
          overflow: auto;
          border: 1px solid var(--admin-border);
          border-radius: 13px;
          background: var(--admin-surface);
          box-shadow: 0 22px 60px rgba(0, 0, 0, .35);
        }

        .workers-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--admin-border);
        }

        .workers-modal-eyebrow {
          color: var(--admin-text-muted);
          font-size: 9px;
          font-weight: 750;
          letter-spacing: .7px;
        }

        .workers-modal-header h2 {
          margin: 5px 0 0;
          font-size: 19px;
        }

        .workers-modal-header > button {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid var(--admin-border);
          border-radius: 7px;
          background: var(--admin-surface-subtle);
          color: var(--admin-text-muted);
          cursor: pointer;
        }

        .workers-modal-body {
          padding: 20px;
        }

        .workers-modal-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid var(--admin-border);
        }

        .worker-avatar-large {
          width: 48px;
          height: 48px;
          font-size: 16px;
        }

        .workers-modal-profile > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .workers-modal-profile strong {
          font-size: 14px;
        }

        .workers-modal-profile span {
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .workers-detail-list {
          display: flex;
          flex-direction: column;
        }

        .workers-detail-item {
          min-height: 55px;
          display: flex;
          align-items: center;
          gap: 11px;
          border-bottom: 1px solid var(--admin-border);
        }

        .workers-detail-item:last-child {
          border-bottom: 0;
        }

        .workers-detail-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 7px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .workers-detail-item > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .workers-detail-item small {
          color: var(--admin-text-muted);
          font-size: 9px;
        }

        .workers-detail-item strong {
          overflow-wrap: anywhere;
          font-size: 12px;
        }

        .workers-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 15px 20px;
          border-top: 1px solid var(--admin-border);
        }

        .workers-modal-close,
        .workers-modal-delete {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 13px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .workers-modal-close {
          border: 1px solid var(--admin-border);
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
        }

        .workers-modal-delete {
          border: 1px solid rgba(239, 119, 119, .35);
          background: rgba(239, 119, 119, .08);
          color: #ef7777;
        }


        /* =====================================================
           DELETE CONFIRM
        ===================================================== */

        .workers-confirm-modal {
          width: 100%;
          max-width: 420px;
          padding: 24px;
          border: 1px solid var(--admin-border);
          border-radius: 13px;
          background: var(--admin-surface);
          text-align: center;
          box-shadow: 0 22px 60px rgba(0, 0, 0, .35);
        }

        .workers-confirm-icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: rgba(239, 119, 119, .08);
          color: #ef7777;
        }

        .workers-confirm-modal h2 {
          margin: 0;
          font-size: 18px;
        }

        .workers-confirm-modal p {
          margin: 8px auto 20px;
          color: var(--admin-text-muted);
          font-size: 11px;
          line-height: 1.65;
        }

        .workers-confirm-actions {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .workers-confirm-actions button {
          min-height: 39px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 14px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .workers-confirm-cancel {
          border: 1px solid var(--admin-border);
          background: var(--admin-surface-subtle);
          color: var(--admin-text);
        }

        .workers-confirm-delete {
          border: 1px solid #ef7777;
          background: #ef7777;
          color: white;
        }

        .workers-confirm-actions button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }


        /* =====================================================
           ANIMATION
        ===================================================== */

        .workers-spin {
          animation: workers-spin 1s linear infinite;
        }

        @keyframes workers-spin {
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

        @media (max-width: 1050px) {

          .workers-list-header,
          .worker-row {
            grid-template-columns:
              minmax(190px, 1.3fr)
              minmax(160px, 1fr)
              minmax(90px, .7fr)
              85px
              70px;
          }

          .worker-contact > div:last-child {
            display: none;
          }

        }


        @media (max-width: 850px) {

          .workers-header {
            align-items: stretch;
            flex-direction: column;
          }

          .workers-header-actions {
            width: 100%;
          }

          .workers-refresh-button,
          .workers-add-button {
            flex: 1;
          }

          .workers-toolbar {
            align-items: stretch;
            flex-wrap: wrap;
          }

          .workers-search {
            flex-basis: 100%;
          }

        }


        @media (max-width: 700px) {

          .workers-summary {
            flex-wrap: wrap;
            gap: 12px;
            padding: 12px;
          }

          .workers-summary-item {
            min-width: 120px;
            flex: 1;
          }

          .workers-summary-divider {
            display: none;
          }

          .workers-list-section {
            border-radius: 9px;
          }

          .workers-list-header {
            display: none;
          }

          .worker-row {
            display: flex;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 13px;
            padding: 14px;
          }

          .worker-main {
            width: calc(100% - 48px);
          }

          .worker-contact {
            width: 100%;
            padding-left: 47px;
          }

          .worker-role {
            flex: 1;
          }

          .worker-actions {
            margin-left: auto;
          }

        }


        @media (max-width: 480px) {

          .workers-page {
            padding-bottom: 25px;
          }

          .workers-header h1 {
            font-size: 25px;
          }

          .workers-header-actions {
            flex-direction: column;
          }

          .workers-refresh-button,
          .workers-add-button {
            width: 100%;
          }

          .workers-summary-item {
            min-width: 100px;
          }

          .workers-toolbar {
            flex-direction: column;
          }

          .workers-search,
          .workers-select-group,
          .workers-select-wrapper {
            width: 100%;
          }

          .workers-select-wrapper {
            min-width: 0;
          }

          .workers-modal-overlay {
            padding: 10px;
          }

          .workers-modal {
            max-height: calc(100vh - 20px);
          }

          .workers-modal-header,
          .workers-modal-body {
            padding: 15px;
          }

          .workers-modal-footer {
            padding: 13px 15px;
          }

          .workers-confirm-modal {
            padding: 20px;
          }

        }

      `}</style>

    </div>
  );
}


/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="workers-detail-item">

      <div className="workers-detail-icon">
        {icon}
      </div>

      <div>
        <small>
          {label}
        </small>

        <strong>
          {value || "—"}
        </strong>
      </div>

    </div>
  );
}