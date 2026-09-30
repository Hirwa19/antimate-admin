import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const Organization = () => {
  const [activeTab, setActiveTab] = useState("departments");

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    code: "",
    description: "",
    active: true,
    order: 0,
  });

  const [positionForm, setPositionForm] = useState({
    name: "",
    code: "",
    description: "",
    department: "",
    level: "mid",
    active: true,
    order: 0,
  });

  const [teamForm, setTeamForm] = useState({
    name: "",
    code: "",
    description: "",
    department: "",
    active: true,
    order: 0,
  });

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const loadOrganization = async () => {
    try {
      setLoading(true);
      clearMessages();

      const [departmentResponse, positionResponse, teamResponse] =
        await Promise.all([
          api.get("/departments"),
          api.get("/positions"),
          api.get("/teams"),
        ]);

      setDepartments(
        departmentResponse.data.departments || []
      );

      setPositions(
        positionResponse.data.positions || []
      );

      setTeams(teamResponse.data.teams || []);
    } catch (err) {
      console.error("LOAD ORGANIZATION ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Failed to load organization structure"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, []);

  const resetForms = () => {
    setDepartmentForm({
      name: "",
      code: "",
      description: "",
      active: true,
      order: 0,
    });

    setPositionForm({
      name: "",
      code: "",
      description: "",
      department: "",
      level: "mid",
      active: true,
      order: 0,
    });

    setTeamForm({
      name: "",
      code: "",
      description: "",
      department: "",
      active: true,
      order: 0,
    });

    setEditingItem(null);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForms();
    clearMessages();
  };

  const openCreateModal = () => {
    resetForms();
    clearMessages();
    setShowModal(true);
  };

  const openEditDepartment = (department) => {
    setEditingItem(department);

    setDepartmentForm({
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
      active: department.active !== false,
      order: department.order || 0,
    });

    clearMessages();
    setShowModal(true);
  };

  const openEditPosition = (position) => {
    setEditingItem(position);

    setPositionForm({
      name: position.name || "",
      code: position.code || "",
      description: position.description || "",
      department: position.department?._id || position.department || "",
      level: position.level || "mid",
      active: position.active !== false,
      order: position.order || 0,
    });

    clearMessages();
    setShowModal(true);
  };

  const openEditTeam = (team) => {
    setEditingItem(team);

    setTeamForm({
      name: team.name || "",
      code: team.code || "",
      description: team.description || "",
      department: team.department?._id || team.department || "",
      active: team.active !== false,
      order: team.order || 0,
    });

    clearMessages();
    setShowModal(true);
  };

  const handleDepartmentChange = (e) => {
    const { name, value, type, checked } = e.target;

    setDepartmentForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePositionChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPositionForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTeamChange = (e) => {
    const { name, value, type, checked } = e.target;

    setTeamForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveDepartment = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        name: departmentForm.name.trim(),
        code: departmentForm.code.trim().toUpperCase(),
        description: departmentForm.description.trim(),
        active: departmentForm.active,
        order: Number(departmentForm.order) || 0,
      };

      if (!payload.name || !payload.code) {
        setError("Department name and code are required");
        return;
      }

      if (editingItem) {
        await api.put(
          `/departments/${editingItem._id}`,
          payload
        );

        setMessage("Department updated successfully");
      } else {
        await api.post("/departments", payload);

        setMessage("Department created successfully");
      }

      await loadOrganization();
      setShowModal(false);
      resetForms();
    } catch (err) {
      console.error("SAVE DEPARTMENT ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Failed to save department"
      );
    } finally {
      setSaving(false);
    }
  };

  const savePosition = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        name: positionForm.name.trim(),
        code: positionForm.code.trim().toUpperCase(),
        description: positionForm.description.trim(),
        department: positionForm.department,
        level: positionForm.level,
        active: positionForm.active,
        order: Number(positionForm.order) || 0,
      };

      if (
        !payload.name ||
        !payload.code ||
        !payload.department
      ) {
        setError(
          "Position name, code and department are required"
        );
        return;
      }

      if (editingItem) {
        await api.put(
          `/positions/${editingItem._id}`,
          payload
        );

        setMessage("Position updated successfully");
      } else {
        await api.post("/positions", payload);

        setMessage("Position created successfully");
      }

      await loadOrganization();
      setShowModal(false);
      resetForms();
    } catch (err) {
      console.error("SAVE POSITION ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Failed to save position"
      );
    } finally {
      setSaving(false);
    }
  };

  const saveTeam = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        name: teamForm.name.trim(),
        code: teamForm.code.trim().toUpperCase(),
        description: teamForm.description.trim(),
        department: teamForm.department,
        active: teamForm.active,
        order: Number(teamForm.order) || 0,
      };

      if (
        !payload.name ||
        !payload.code ||
        !payload.department
      ) {
        setError(
          "Team name, code and department are required"
        );
        return;
      }

      if (editingItem) {
        await api.put(
          `/teams/${editingItem._id}`,
          payload
        );

        setMessage("Team updated successfully");
      } else {
        await api.post("/teams", payload);

        setMessage("Team created successfully");
      }

      await loadOrganization();
      setShowModal(false);
      resetForms();
    } catch (err) {
      console.error("SAVE TEAM ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Failed to save team"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteDepartment = async (department) => {
    const confirmed = window.confirm(
      `Delete "${department.name}"?`
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await api.delete(
        `/departments/${department._id}`
      );

      setMessage("Department deleted successfully");

      await loadOrganization();
    } catch (err) {
      console.error("DELETE DEPARTMENT ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Failed to delete department"
      );
    }
  };

  const deletePosition = async (position) => {
    const confirmed = window.confirm(
      `Delete "${position.name}"?`
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await api.delete(
        `/positions/${position._id}`
      );

      setMessage("Position deleted successfully");

      await loadOrganization();
    } catch (err) {
      console.error("DELETE POSITION ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Failed to delete position"
      );
    }
  };

  const deleteTeam = async (team) => {
    const confirmed = window.confirm(
      `Delete "${team.name}"?`
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await api.delete(`/teams/${team._id}`);

      setMessage("Team deleted successfully");

      await loadOrganization();
    } catch (err) {
      console.error("DELETE TEAM ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Failed to delete team"
      );
    }
  };

  const getDepartmentName = (department) => {
    if (!department) return "—";

    if (typeof department === "object") {
      return department.name || "—";
    }

    const found = departments.find(
      (item) => item._id === department
    );

    return found?.name || "—";
  };

  const activeDepartments = useMemo(
    () => departments.filter((item) => item.active),
    [departments]
  );

  const activePositions = useMemo(
    () => positions.filter((item) => item.active),
    [positions]
  );

  const activeTeams = useMemo(
    () => teams.filter((item) => item.active),
    [teams]
  );

  const renderModal = () => {
    if (!showModal) return null;

    const isDepartment = activeTab === "departments";
    const isPosition = activeTab === "positions";

    return (
      <div className="org-modal-backdrop">
        <div className="org-modal">
          <div className="org-modal-header">
            <div>
              <h2>
                {editingItem
                  ? "Edit"
                  : "Add"}{" "}
                {isDepartment
                  ? "Department"
                  : isPosition
                  ? "Position"
                  : "Team"}
              </h2>

              <p>
                Configure ANTIMATE organizational
                structure.
              </p>
            </div>

            <button
              className="org-close-button"
              onClick={closeModal}
              type="button"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="org-alert org-alert-error">
              {error}
            </div>
          )}

          {isDepartment && (
            <form
              onSubmit={saveDepartment}
              className="org-form"
            >
              <div className="org-form-grid">
                <div className="org-field">
                  <label>Department Name</label>

                  <input
                    name="name"
                    value={departmentForm.name}
                    onChange={handleDepartmentChange}
                    placeholder="e.g. Technology & Engineering"
                    required
                  />
                </div>

                <div className="org-field">
                  <label>Code</label>

                  <input
                    name="code"
                    value={departmentForm.code}
                    onChange={handleDepartmentChange}
                    placeholder="e.g. TECH"
                    required
                  />
                </div>
              </div>

              <div className="org-field">
                <label>Description</label>

                <textarea
                  name="description"
                  value={departmentForm.description}
                  onChange={handleDepartmentChange}
                  placeholder="Describe the department..."
                  rows="4"
                />
              </div>

              <div className="org-form-grid">
                <div className="org-field">
                  <label>Display Order</label>

                  <input
                    type="number"
                    name="order"
                    value={departmentForm.order}
                    onChange={handleDepartmentChange}
                  />
                </div>

                <label className="org-checkbox">
                  <input
                    type="checkbox"
                    name="active"
                    checked={departmentForm.active}
                    onChange={handleDepartmentChange}
                  />

                  <span>Active Department</span>
                </label>
              </div>

              <div className="org-modal-actions">
                <button
                  type="button"
                  className="org-button secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="org-button primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingItem
                    ? "Save Changes"
                    : "Create Department"}
                </button>
              </div>
            </form>
          )}

          {isPosition && (
            <form
              onSubmit={savePosition}
              className="org-form"
            >
              <div className="org-form-grid">
                <div className="org-field">
                  <label>Position Name</label>

                  <input
                    name="name"
                    value={positionForm.name}
                    onChange={handlePositionChange}
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>

                <div className="org-field">
                  <label>Code</label>

                  <input
                    name="code"
                    value={positionForm.code}
                    onChange={handlePositionChange}
                    placeholder="e.g. SWE"
                    required
                  />
                </div>
              </div>

              <div className="org-form-grid">
                <div className="org-field">
                  <label>Department</label>

                  <select
                    name="department"
                    value={positionForm.department}
                    onChange={handlePositionChange}
                    required
                  >
                    <option value="">
                      Select department
                    </option>

                    {activeDepartments.map(
                      (department) => (
                        <option
                          key={department._id}
                          value={department._id}
                        >
                          {department.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="org-field">
                  <label>Level</label>

                  <select
                    name="level"
                    value={positionForm.level}
                    onChange={handlePositionChange}
                  >
                    <option value="executive">
                      Executive
                    </option>
                    <option value="management">
                      Management
                    </option>
                    <option value="senior">
                      Senior
                    </option>
                    <option value="mid">
                      Mid-level
                    </option>
                    <option value="junior">
                      Junior
                    </option>
                    <option value="entry">
                      Entry
                    </option>
                    <option value="intern">
                      Intern
                    </option>
                  </select>
                </div>
              </div>

              <div className="org-field">
                <label>Description</label>

                <textarea
                  name="description"
                  value={positionForm.description}
                  onChange={handlePositionChange}
                  placeholder="Describe the position..."
                  rows="4"
                />
              </div>

              <div className="org-form-grid">
                <div className="org-field">
                  <label>Display Order</label>

                  <input
                    type="number"
                    name="order"
                    value={positionForm.order}
                    onChange={handlePositionChange}
                  />
                </div>

                <label className="org-checkbox">
                  <input
                    type="checkbox"
                    name="active"
                    checked={positionForm.active}
                    onChange={handlePositionChange}
                  />

                  <span>Active Position</span>
                </label>
              </div>

              <div className="org-modal-actions">
                <button
                  type="button"
                  className="org-button secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="org-button primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingItem
                    ? "Save Changes"
                    : "Create Position"}
                </button>
              </div>
            </form>
          )}

          {!isDepartment && !isPosition && (
            <form
              onSubmit={saveTeam}
              className="org-form"
            >
              <div className="org-form-grid">
                <div className="org-field">
                  <label>Team Name</label>

                  <input
                    name="name"
                    value={teamForm.name}
                    onChange={handleTeamChange}
                    placeholder="e.g. ANTIMATE AI Team"
                    required
                  />
                </div>

                <div className="org-field">
                  <label>Code</label>

                  <input
                    name="code"
                    value={teamForm.code}
                    onChange={handleTeamChange}
                    placeholder="e.g. AI"
                    required
                  />
                </div>
              </div>

              <div className="org-field">
                <label>Department</label>

                <select
                  name="department"
                  value={teamForm.department}
                  onChange={handleTeamChange}
                  required
                >
                  <option value="">
                    Select department
                  </option>

                  {activeDepartments.map(
                    (department) => (
                      <option
                        key={department._id}
                        value={department._id}
                      >
                        {department.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="org-field">
                <label>Description</label>

                <textarea
                  name="description"
                  value={teamForm.description}
                  onChange={handleTeamChange}
                  placeholder="Describe the team..."
                  rows="4"
                />
              </div>

              <div className="org-form-grid">
                <div className="org-field">
                  <label>Display Order</label>

                  <input
                    type="number"
                    name="order"
                    value={teamForm.order}
                    onChange={handleTeamChange}
                  />
                </div>

                <label className="org-checkbox">
                  <input
                    type="checkbox"
                    name="active"
                    checked={teamForm.active}
                    onChange={handleTeamChange}
                  />

                  <span>Active Team</span>
                </label>
              </div>

              <div className="org-modal-actions">
                <button
                  type="button"
                  className="org-button secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="org-button primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingItem
                    ? "Save Changes"
                    : "Create Team"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="organization-page">
      <style>{`
        .organization-page {
          min-height: 100%;
          padding: 28px;
          background: #f6f8fc;
          color: #172033;
        }

        .org-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .org-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .org-header h1 {
          margin: 0 0 7px;
          font-size: 28px;
          font-weight: 750;
        }

        .org-header p {
          margin: 0;
          color: #687386;
          font-size: 14px;
        }

        .org-button {
          border: 0;
          border-radius: 9px;
          padding: 11px 17px;
          font-size: 14px;
          font-weight: 650;
          cursor: pointer;
          transition: .2s ease;
        }

        .org-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .org-button.primary {
          background: #3157d5;
          color: white;
        }

        .org-button.primary:hover {
          background: #2749ba;
        }

        .org-button.secondary {
          background: #eef1f6;
          color: #303a4d;
        }

        .org-button.secondary:hover {
          background: #e3e7ef;
        }

        .org-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .org-stat {
          background: white;
          border: 1px solid #e3e7ef;
          border-radius: 13px;
          padding: 18px;
        }

        .org-stat-label {
          color: #758095;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .org-stat-value {
          font-size: 25px;
          font-weight: 750;
        }

        .org-tabs {
          display: flex;
          gap: 5px;
          background: white;
          border: 1px solid #e3e7ef;
          border-radius: 11px;
          padding: 5px;
          margin-bottom: 18px;
        }

        .org-tab {
          flex: 1;
          border: 0;
          background: transparent;
          border-radius: 8px;
          padding: 12px 16px;
          cursor: pointer;
          color: #697489;
          font-weight: 650;
          font-size: 14px;
        }

        .org-tab.active {
          background: #eef2ff;
          color: #3157d5;
        }

        .org-panel {
          background: white;
          border: 1px solid #e3e7ef;
          border-radius: 13px;
          overflow: hidden;
        }

        .org-panel-header {
          padding: 19px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #edf0f4;
        }

        .org-panel-header h2 {
          margin: 0 0 4px;
          font-size: 17px;
        }

        .org-panel-header p {
          margin: 0;
          color: #7a8495;
          font-size: 13px;
        }

        .org-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .org-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        .org-table th {
          background: #fafbfc;
          color: #697489;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .04em;
          text-align: left;
          padding: 13px 18px;
          border-bottom: 1px solid #edf0f4;
        }

        .org-table td {
          padding: 15px 18px;
          border-bottom: 1px solid #f0f2f5;
          font-size: 14px;
          vertical-align: middle;
        }

        .org-table tr:last-child td {
          border-bottom: 0;
        }

        .org-name {
          font-weight: 650;
          color: #1c2638;
        }

        .org-description {
          color: #7a8495;
          max-width: 340px;
          line-height: 1.45;
        }

        .org-code {
          display: inline-flex;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f0f3f8;
          color: #455067;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .04em;
        }

        .org-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 650;
        }

        .org-status.active {
          background: #eaf8f0;
          color: #23804b;
        }

        .org-status.inactive {
          background: #f1f2f4;
          color: #737b89;
        }

        .org-actions {
          display: flex;
          gap: 7px;
        }

        .org-action {
          border: 1px solid #dfe3ea;
          background: white;
          color: #435069;
          padding: 7px 10px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 650;
        }

        .org-action:hover {
          background: #f6f8fb;
        }

        .org-action.delete {
          color: #c13b48;
        }

        .org-empty {
          padding: 45px 20px;
          text-align: center;
          color: #7b8595;
        }

        .org-loading {
          padding: 60px 20px;
          text-align: center;
          color: #6f7a8c;
        }

        .org-alert {
          margin: 15px 20px;
          padding: 11px 13px;
          border-radius: 8px;
          font-size: 13px;
        }

        .org-alert-success {
          background: #eaf8f0;
          color: #247749;
        }

        .org-alert-error {
          background: #fff0f1;
          color: #bd3e49;
        }

        .org-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(18, 25, 38, .48);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .org-modal {
          width: min(650px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
        }

        .org-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 22px;
          border-bottom: 1px solid #edf0f4;
        }

        .org-modal-header h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .org-modal-header p {
          margin: 0;
          color: #788294;
          font-size: 13px;
        }

        .org-close-button {
          border: 0;
          background: #f1f3f6;
          color: #5c6677;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          font-size: 23px;
          cursor: pointer;
          line-height: 1;
        }

        .org-form {
          padding: 22px;
        }

        .org-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .org-field {
          margin-bottom: 17px;
        }

        .org-field label {
          display: block;
          margin-bottom: 7px;
          color: #39445a;
          font-size: 13px;
          font-weight: 650;
        }

        .org-field input,
        .org-field select,
        .org-field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dce1e9;
          border-radius: 8px;
          padding: 11px 12px;
          background: white;
          color: #202b3d;
          font-size: 14px;
          outline: none;
          font-family: inherit;
        }

        .org-field textarea {
          resize: vertical;
        }

        .org-field input:focus,
        .org-field select:focus,
        .org-field textarea:focus {
          border-color: #6d82df;
          box-shadow: 0 0 0 3px rgba(49,87,213,.08);
        }

        .org-checkbox {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 42px;
          margin-top: 20px;
          color: #424d61;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .org-checkbox input {
          width: 17px;
          height: 17px;
          accent-color: #3157d5;
        }

        .org-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding-top: 8px;
          border-top: 1px solid #edf0f4;
        }

        @media (max-width: 800px) {
          .organization-page {
            padding: 18px;
          }

          .org-header {
            flex-direction: column;
          }

          .org-header .org-button {
            width: 100%;
          }

          .org-stats {
            grid-template-columns: 1fr;
          }

          .org-form-grid {
            grid-template-columns: 1fr;
          }

          .org-tabs {
            overflow-x: auto;
          }

          .org-tab {
            min-width: 120px;
          }
        }
      `}</style>

      <div className="org-container">
        <div className="org-header">
          <div>
            <h1>Organization</h1>
            <p>
              Manage ANTIMATE departments, positions and
              teams.
            </p>
          </div>

          <button
            className="org-button primary"
            onClick={openCreateModal}
          >
            + Add{" "}
            {activeTab === "departments"
              ? "Department"
              : activeTab === "positions"
              ? "Position"
              : "Team"}
          </button>
        </div>

        {message && (
          <div className="org-alert org-alert-success">
            {message}
          </div>
        )}

        {error && !showModal && (
          <div className="org-alert org-alert-error">
            {error}
          </div>
        )}

        <div className="org-stats">
          <div className="org-stat">
            <div className="org-stat-label">
              Active Departments
            </div>

            <div className="org-stat-value">
              {activeDepartments.length}
            </div>
          </div>

          <div className="org-stat">
            <div className="org-stat-label">
              Active Positions
            </div>

            <div className="org-stat-value">
              {activePositions.length}
            </div>
          </div>

          <div className="org-stat">
            <div className="org-stat-label">
              Active Teams
            </div>

            <div className="org-stat-value">
              {activeTeams.length}
            </div>
          </div>
        </div>

        <div className="org-tabs">
          <button
            className={`org-tab ${
              activeTab === "departments"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab("departments");
              clearMessages();
            }}
          >
            Departments
          </button>

          <button
            className={`org-tab ${
              activeTab === "positions"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab("positions");
              clearMessages();
            }}
          >
            Positions
          </button>

          <button
            className={`org-tab ${
              activeTab === "teams" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("teams");
              clearMessages();
            }}
          >
            Teams
          </button>
        </div>

        <div className="org-panel">
          <div className="org-panel-header">
            <div>
              <h2>
                {activeTab === "departments"
                  ? "Departments"
                  : activeTab === "positions"
                  ? "Positions"
                  : "Teams"}
              </h2>

              <p>
                {activeTab === "departments"
                  ? `${departments.length} departments configured`
                  : activeTab === "positions"
                  ? `${positions.length} positions configured`
                  : `${teams.length} teams configured`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="org-loading">
              Loading organization...
            </div>
          ) : activeTab === "departments" ? (
            departments.length === 0 ? (
              <div className="org-empty">
                No departments found.
              </div>
            ) : (
              <div className="org-table-wrap">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {departments.map(
                      (department) => (
                        <tr key={department._id}>
                          <td>
                            <div className="org-name">
                              {department.name}
                            </div>
                          </td>

                          <td>
                            <span className="org-code">
                              {department.code}
                            </span>
                          </td>

                          <td>
                            <div className="org-description">
                              {department.description ||
                                "—"}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`org-status ${
                                department.active
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              {department.active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td>
                            <div className="org-actions">
                              <button
                                className="org-action"
                                onClick={() =>
                                  openEditDepartment(
                                    department
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="org-action delete"
                                onClick={() =>
                                  deleteDepartment(
                                    department
                                  )
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "positions" ? (
            positions.length === 0 ? (
              <div className="org-empty">
                No positions found.
              </div>
            ) : (
              <div className="org-table-wrap">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Department</th>
                      <th>Level</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {positions.map((position) => (
                      <tr key={position._id}>
                        <td>
                          <div className="org-name">
                            {position.name}
                          </div>
                        </td>

                        <td>
                          <span className="org-code">
                            {position.code}
                          </span>
                        </td>

                        <td>
                          {getDepartmentName(
                            position.department
                          )}
                        </td>

                        <td>
                          {position.level
                            ? position.level
                                .charAt(0)
                                .toUpperCase() +
                              position.level.slice(1)
                            : "—"}
                        </td>

                        <td>
                          <span
                            className={`org-status ${
                              position.active
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {position.active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <div className="org-actions">
                            <button
                              className="org-action"
                              onClick={() =>
                                openEditPosition(
                                  position
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="org-action delete"
                              onClick={() =>
                                deletePosition(
                                  position
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : teams.length === 0 ? (
            <div className="org-empty">
              No teams found.
            </div>
          ) : (
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {teams.map((team) => (
                    <tr key={team._id}>
                      <td>
                        <div className="org-name">
                          {team.name}
                        </div>
                      </td>

                      <td>
                        <span className="org-code">
                          {team.code}
                        </span>
                      </td>

                      <td>
                        {getDepartmentName(
                          team.department
                        )}
                      </td>

                      <td>
                        <span
                          className={`org-status ${
                            team.active
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {team.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="org-actions">
                          <button
                            className="org-action"
                            onClick={() =>
                              openEditTeam(team)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="org-action delete"
                            onClick={() =>
                              deleteTeam(team)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default Organization;