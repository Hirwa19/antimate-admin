import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/axios";

import { useAppSettings } from "../context/AppSettingsContext";

const Organization = () => {
  const {
    language,
    theme,
    t,
  } = useAppSettings();

  const [activeTab, setActiveTab] =
    useState("departments");

  const [departments, setDepartments] =
    useState([]);

  const [positions, setPositions] =
    useState([]);

  const [teams, setTeams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  const [departmentForm, setDepartmentForm] =
    useState({
      name: "",
      code: "",
      description: "",
      active: true,
      order: 0,
    });

  const [positionForm, setPositionForm] =
    useState({
      name: "",
      code: "",
      description: "",
      department: "",
      level: "mid",
      active: true,
      order: 0,
    });

  const [teamForm, setTeamForm] =
    useState({
      name: "",
      code: "",
      description: "",
      department: "",
      active: true,
      order: 0,
    });

  /*
  |--------------------------------------------------------------------------
  | TRANSLATION
  |--------------------------------------------------------------------------
  */

  const translate = (
    key,
    english,
    kinyarwanda = english
  ) => {
    const translated =
      typeof t === "function"
        ? t(key)
        : "";

    if (
      translated &&
      translated !== key
    ) {
      return translated;
    }

    return language === "rw"
      ? kinyarwanda
      : english;
  };

  /*
  |--------------------------------------------------------------------------
  | MESSAGES
  |--------------------------------------------------------------------------
  */

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD ORGANIZATION
  |--------------------------------------------------------------------------
  */

  const loadOrganization =
    async () => {
      try {
        setLoading(true);
        clearMessages();

        const [
          departmentResponse,
          positionResponse,
          teamResponse,
        ] = await Promise.all([
          api.get("/departments"),
          api.get("/positions"),
          api.get("/teams"),
        ]);

        setDepartments(
          departmentResponse.data
            .departments || []
        );

        setPositions(
          positionResponse.data
            .positions || []
        );

        setTeams(
          teamResponse.data.teams || []
        );
      } catch (err) {
        console.error(
          "LOAD ORGANIZATION ERROR:",
          err
        );

        setError(
          err.response?.data?.error ||
            translate(
              "organizationLoadError",
              "Failed to load organization structure",
              "Kubona imiterere y'umuryango byanze"
            )
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadOrganization();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const openEditDepartment = (
    department
  ) => {
    setEditingItem(department);

    setDepartmentForm({
      name: department.name || "",
      code: department.code || "",
      description:
        department.description || "",
      active:
        department.active !== false,
      order: department.order || 0,
    });

    clearMessages();
    setShowModal(true);
  };

  const openEditPosition = (
    position
  ) => {
    setEditingItem(position);

    setPositionForm({
      name: position.name || "",
      code: position.code || "",
      description:
        position.description || "",
      department:
        position.department?._id ||
        position.department ||
        "",
      level:
        position.level || "mid",
      active:
        position.active !== false,
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
      description:
        team.description || "",
      department:
        team.department?._id ||
        team.department ||
        "",
      active:
        team.active !== false,
      order: team.order || 0,
    });

    clearMessages();
    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGES
  |--------------------------------------------------------------------------
  */

  const handleDepartmentChange = (
    e
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setDepartmentForm(
      (prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };

  const handlePositionChange = (
    e
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setPositionForm(
      (prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };

  const handleTeamChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setTeamForm(
      (prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE DEPARTMENT
  |--------------------------------------------------------------------------
  */

  const saveDepartment = async (
    e
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        name:
          departmentForm.name.trim(),

        code:
          departmentForm.code
            .trim()
            .toUpperCase(),

        description:
          departmentForm.description.trim(),

        active:
          departmentForm.active,

        order:
          Number(
            departmentForm.order
          ) || 0,
      };

      if (
        !payload.name ||
        !payload.code
      ) {
        setError(
          translate(
            "departmentRequired",
            "Department name and code are required",
            "Izina rya department na code birakenewe"
          )
        );

        return;
      }

      if (editingItem) {
        await api.put(
          `/departments/${editingItem._id}`,
          payload
        );

        setMessage(
          translate(
            "departmentUpdated",
            "Department updated successfully",
            "Department yavuguruwe neza"
          )
        );
      } else {
        await api.post(
          "/departments",
          payload
        );

        setMessage(
          translate(
            "departmentCreated",
            "Department created successfully",
            "Department yakozwe neza"
          )
        );
      }

      await loadOrganization();

      setShowModal(false);
      resetForms();
    } catch (err) {
      console.error(
        "SAVE DEPARTMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.error ||
          translate(
            "departmentSaveError",
            "Failed to save department",
            "Kubika department byanze"
          )
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE POSITION
  |--------------------------------------------------------------------------
  */

  const savePosition = async (
    e
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        name:
          positionForm.name.trim(),

        code:
          positionForm.code
            .trim()
            .toUpperCase(),

        description:
          positionForm.description.trim(),

        department:
          positionForm.department,

        level:
          positionForm.level,

        active:
          positionForm.active,

        order:
          Number(
            positionForm.order
          ) || 0,
      };

      if (
        !payload.name ||
        !payload.code ||
        !payload.department
      ) {
        setError(
          translate(
            "positionRequired",
            "Position name, code and department are required",
            "Izina rya position, code na department birakenewe"
          )
        );

        return;
      }

      if (editingItem) {
        await api.put(
          `/positions/${editingItem._id}`,
          payload
        );

        setMessage(
          translate(
            "positionUpdated",
            "Position updated successfully",
            "Position yavuguruwe neza"
          )
        );
      } else {
        await api.post(
          "/positions",
          payload
        );

        setMessage(
          translate(
            "positionCreated",
            "Position created successfully",
            "Position yakozwe neza"
          )
        );
      }

      await loadOrganization();

      setShowModal(false);
      resetForms();
    } catch (err) {
      console.error(
        "SAVE POSITION ERROR:",
        err
      );

      setError(
        err.response?.data?.error ||
          translate(
            "positionSaveError",
            "Failed to save position",
            "Kubika position byanze"
          )
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE TEAM
  |--------------------------------------------------------------------------
  */

  const saveTeam = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        name:
          teamForm.name.trim(),

        code:
          teamForm.code
            .trim()
            .toUpperCase(),

        description:
          teamForm.description.trim(),

        department:
          teamForm.department,

        active:
          teamForm.active,

        order:
          Number(
            teamForm.order
          ) || 0,
      };

      if (
        !payload.name ||
        !payload.code ||
        !payload.department
      ) {
        setError(
          translate(
            "teamRequired",
            "Team name, code and department are required",
            "Izina rya team, code na department birakenewe"
          )
        );

        return;
      }

      if (editingItem) {
        await api.put(
          `/teams/${editingItem._id}`,
          payload
        );

        setMessage(
          translate(
            "teamUpdated",
            "Team updated successfully",
            "Team yavuguruwe neza"
          )
        );
      } else {
        await api.post(
          "/teams",
          payload
        );

        setMessage(
          translate(
            "teamCreated",
            "Team created successfully",
            "Team yakozwe neza"
          )
        );
      }

      await loadOrganization();

      setShowModal(false);
      resetForms();
    } catch (err) {
      console.error(
        "SAVE TEAM ERROR:",
        err
      );

      setError(
        err.response?.data?.error ||
          translate(
            "teamSaveError",
            "Failed to save team",
            "Kubika team byanze"
          )
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const deleteDepartment = async (
    department
  ) => {
    const confirmed =
      window.confirm(
        translate(
          "deleteDepartmentConfirm",
          `Delete "${department.name}"?`,
          `Gusiba "${department.name}"?`
        )
      );

    if (!confirmed) return;

    try {
      clearMessages();

      await api.delete(
        `/departments/${department._id}`
      );

      setMessage(
        translate(
          "departmentDeleted",
          "Department deleted successfully",
          "Department yasibwe neza"
        )
      );

      await loadOrganization();
    } catch (err) {
      console.error(
        "DELETE DEPARTMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.error ||
          translate(
            "departmentDeleteError",
            "Failed to delete department",
            "Gusiba department byanze"
          )
      );
    }
  };

  const deletePosition = async (
    position
  ) => {
    const confirmed =
      window.confirm(
        translate(
          "deletePositionConfirm",
          `Delete "${position.name}"?`,
          `Gusiba "${position.name}"?`
        )
      );

    if (!confirmed) return;

    try {
      clearMessages();

      await api.delete(
        `/positions/${position._id}`
      );

      setMessage(
        translate(
          "positionDeleted",
          "Position deleted successfully",
          "Position yasibwe neza"
        )
      );

      await loadOrganization();
    } catch (err) {
      console.error(
        "DELETE POSITION ERROR:",
        err
      );

      setError(
        err.response?.data?.error ||
          translate(
            "positionDeleteError",
            "Failed to delete position",
            "Gusiba position byanze"
          )
      );
    }
  };

  const deleteTeam = async (
    team
  ) => {
    const confirmed =
      window.confirm(
        translate(
          "deleteTeamConfirm",
          `Delete "${team.name}"?`,
          `Gusiba "${team.name}"?`
        )
      );

    if (!confirmed) return;

    try {
      clearMessages();

      await api.delete(
        `/teams/${team._id}`
      );

      setMessage(
        translate(
          "teamDeleted",
          "Team deleted successfully",
          "Team yasibwe neza"
        )
      );

      await loadOrganization();
    } catch (err) {
      console.error(
        "DELETE TEAM ERROR:",
        err
      );

      setError(
        err.response?.data?.error ||
          translate(
            "teamDeleteError",
            "Failed to delete team",
            "Gusiba team byanze"
          )
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const getDepartmentName = (
    department
  ) => {
    if (!department) return "—";

    if (
      typeof department === "object"
    ) {
      return (
        department.name || "—"
      );
    }

    const found =
      departments.find(
        (item) =>
          item._id === department
      );

    return found?.name || "—";
  };

  const activeDepartments =
    useMemo(
      () =>
        departments.filter(
          (item) => item.active
        ),
      [departments]
    );

  const activePositions =
    useMemo(
      () =>
        positions.filter(
          (item) => item.active
        ),
      [positions]
    );

  const activeTeams =
    useMemo(
      () =>
        teams.filter(
          (item) => item.active
        ),
      [teams]
    );

  /*
  |--------------------------------------------------------------------------
  | LEVEL LABEL
  |--------------------------------------------------------------------------
  */

  const getLevelLabel = (
    level
  ) => {
    const labels = {
      executive: translate(
        "executive",
        "Executive",
        "Ubuyobozi Bukuru"
      ),

      management: translate(
        "management",
        "Management",
        "Ubuyobozi"
      ),

      senior: translate(
        "senior",
        "Senior",
        "Senior"
      ),

      mid: translate(
        "midLevel",
        "Mid-level",
        "Hagati"
      ),

      junior: translate(
        "junior",
        "Junior",
        "Junior"
      ),

      entry: translate(
        "entry",
        "Entry",
        "Intangiriro"
      ),

      intern: translate(
        "intern",
        "Intern",
        "Umwimenyereza"
      ),
    };

    return (
      labels[level] ||
      level ||
      "—"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | MODAL
  |--------------------------------------------------------------------------
  */

  const renderModal = () => {
    if (!showModal) return null;

    const isDepartment =
      activeTab ===
      "departments";

    const isPosition =
      activeTab ===
      "positions";

    const entityName =
      isDepartment
        ? translate(
            "department",
            "Department",
            "Department"
          )
        : isPosition
        ? translate(
            "position",
            "Position",
            "Position"
          )
        : translate(
            "team",
            "Team",
            "Team"
          );

    return (
      <div className="org-modal-backdrop">
        <div className="org-modal">
          <div className="org-modal-header">
            <div>
              <h2>
                {editingItem
                  ? translate(
                      "edit",
                      "Edit",
                      "Hindura"
                    )
                  : translate(
                      "add",
                      "Add",
                      "Ongeramo"
                    )}{" "}
                {entityName}
              </h2>

              <p>
                {translate(
                  "organizationModalDescription",
                  "Configure ANTIMATE organizational structure.",
                  "Tegura imiterere y'umuryango wa ANTIMATE."
                )}
              </p>
            </div>

            <button
              className="org-close-button"
              onClick={closeModal}
              type="button"
              aria-label={translate(
                "close",
                "Close",
                "Funga"
              )}
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
              onSubmit={
                saveDepartment
              }
              className="org-form"
            >
              <div className="org-form-grid">
                <div className="org-field">
                  <label>
                    {translate(
                      "departmentName",
                      "Department Name",
                      "Izina rya Department"
                    )}
                  </label>

                  <input
                    name="name"
                    value={
                      departmentForm.name
                    }
                    onChange={
                      handleDepartmentChange
                    }
                    placeholder={
                      language === "rw"
                        ? "Urugero: Technology & Engineering"
                        : "e.g. Technology & Engineering"
                    }
                    required
                  />
                </div>

                <div className="org-field">
                  <label>
                    {translate(
                      "code",
                      "Code",
                      "Code"
                    )}
                  </label>

                  <input
                    name="code"
                    value={
                      departmentForm.code
                    }
                    onChange={
                      handleDepartmentChange
                    }
                    placeholder="e.g. TECH"
                    required
                  />
                </div>
              </div>

              <div className="org-field">
                <label>
                  {translate(
                    "description",
                    "Description",
                    "Ibisobanuro"
                  )}
                </label>

                <textarea
                  name="description"
                  value={
                    departmentForm.description
                  }
                  onChange={
                    handleDepartmentChange
                  }
                  placeholder={
                    language === "rw"
                      ? "Sobanura iyi department..."
                      : "Describe the department..."
                  }
                  rows="4"
                />
              </div>

              <div className="org-form-grid">
                <div className="org-field">
                  <label>
                    {translate(
                      "displayOrder",
                      "Display Order",
                      "Uko bigomba gukurikirana"
                    )}
                  </label>

                  <input
                    type="number"
                    name="order"
                    value={
                      departmentForm.order
                    }
                    onChange={
                      handleDepartmentChange
                    }
                  />
                </div>

                <label className="org-checkbox">
                  <input
                    type="checkbox"
                    name="active"
                    checked={
                      departmentForm.active
                    }
                    onChange={
                      handleDepartmentChange
                    }
                  />

                  <span>
                    {translate(
                      "activeDepartment",
                      "Active Department",
                      "Department ikora"
                    )}
                  </span>
                </label>
              </div>

              <div className="org-modal-actions">
                <button
                  type="button"
                  className="org-button secondary"
                  onClick={
                    closeModal
                  }
                >
                  {translate(
                    "cancel",
                    "Cancel",
                    "Kureka"
                  )}
                </button>

                <button
                  type="submit"
                  className="org-button primary"
                  disabled={saving}
                >
                  {saving
                    ? translate(
                        "saving",
                        "Saving...",
                        "Birabikwa..."
                      )
                    : editingItem
                    ? translate(
                        "saveChanges",
                        "Save Changes",
                        "Bika impinduka"
                      )
                    : translate(
                        "createDepartment",
                        "Create Department",
                        "Kora Department"
                      )}
                </button>
              </div>
            </form>
          )}

          {isPosition && (
            <form
              onSubmit={
                savePosition
              }
              className="org-form"
            >
              <div className="org-form-grid">
                <div className="org-field">
                  <label>
                    {translate(
                      "positionName",
                      "Position Name",
                      "Izina rya Position"
                    )}
                  </label>

                  <input
                    name="name"
                    value={
                      positionForm.name
                    }
                    onChange={
                      handlePositionChange
                    }
                    placeholder={
                      language === "rw"
                        ? "Urugero: Software Engineer"
                        : "e.g. Software Engineer"
                    }
                    required
                  />
                </div>

                <div className="org-field">
                  <label>
                    {translate(
                      "code",
                      "Code",
                      "Code"
                    )}
                  </label>

                  <input
                    name="code"
                    value={
                      positionForm.code
                    }
                    onChange={
                      handlePositionChange
                    }
                    placeholder="e.g. SWE"
                    required
                  />
                </div>
              </div>

              <div className="org-form-grid">
                <div className="org-field">
                  <label>
                    {translate(
                      "department",
                      "Department",
                      "Department"
                    )}
                  </label>

                  <select
                    name="department"
                    value={
                      positionForm.department
                    }
                    onChange={
                      handlePositionChange
                    }
                    required
                  >
                    <option value="">
                      {translate(
                        "selectDepartment",
                        "Select department",
                        "Hitamo department"
                      )}
                    </option>

                    {activeDepartments.map(
                      (
                        department
                      ) => (
                        <option
                          key={
                            department._id
                          }
                          value={
                            department._id
                          }
                        >
                          {
                            department.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="org-field">
                  <label>
                    {translate(
                      "level",
                      "Level",
                      "Urwego"
                    )}
                  </label>

                  <select
                    name="level"
                    value={
                      positionForm.level
                    }
                    onChange={
                      handlePositionChange
                    }
                  >
                    <option value="executive">
                      {getLevelLabel(
                        "executive"
                      )}
                    </option>

                    <option value="management">
                      {getLevelLabel(
                        "management"
                      )}
                    </option>

                    <option value="senior">
                      {getLevelLabel(
                        "senior"
                      )}
                    </option>

                    <option value="mid">
                      {getLevelLabel(
                        "mid"
                      )}
                    </option>

                    <option value="junior">
                      {getLevelLabel(
                        "junior"
                      )}
                    </option>

                    <option value="entry">
                      {getLevelLabel(
                        "entry"
                      )}
                    </option>

                    <option value="intern">
                      {getLevelLabel(
                        "intern"
                      )}
                    </option>
                  </select>
                </div>
              </div>

              <div className="org-field">
                <label>
                  {translate(
                    "description",
                    "Description",
                    "Ibisobanuro"
                  )}
                </label>

                <textarea
                  name="description"
                  value={
                    positionForm.description
                  }
                  onChange={
                    handlePositionChange
                  }
                  placeholder={
                    language === "rw"
                      ? "Sobanura iyi position..."
                      : "Describe the position..."
                  }
                  rows="4"
                />
              </div>

              <div className="org-form-grid">
                <div className="org-field">
                  <label>
                    {translate(
                      "displayOrder",
                      "Display Order",
                      "Uko bigomba gukurikirana"
                    )}
                  </label>

                  <input
                    type="number"
                    name="order"
                    value={
                      positionForm.order
                    }
                    onChange={
                      handlePositionChange
                    }
                  />
                </div>

                <label className="org-checkbox">
                  <input
                    type="checkbox"
                    name="active"
                    checked={
                      positionForm.active
                    }
                    onChange={
                      handlePositionChange
                    }
                  />

                  <span>
                    {translate(
                      "activePosition",
                      "Active Position",
                      "Position ikora"
                    )}
                  </span>
                </label>
              </div>

              <div className="org-modal-actions">
                <button
                  type="button"
                  className="org-button secondary"
                  onClick={
                    closeModal
                  }
                >
                  {translate(
                    "cancel",
                    "Cancel",
                    "Kureka"
                  )}
                </button>

                <button
                  type="submit"
                  className="org-button primary"
                  disabled={saving}
                >
                  {saving
                    ? translate(
                        "saving",
                        "Saving...",
                        "Birabikwa..."
                      )
                    : editingItem
                    ? translate(
                        "saveChanges",
                        "Save Changes",
                        "Bika impinduka"
                      )
                    : translate(
                        "createPosition",
                        "Create Position",
                        "Kora Position"
                      )}
                </button>
              </div>
            </form>
          )}

          {!isDepartment &&
            !isPosition && (
              <form
                onSubmit={saveTeam}
                className="org-form"
              >
                <div className="org-form-grid">
                  <div className="org-field">
                    <label>
                      {translate(
                        "teamName",
                        "Team Name",
                        "Izina rya Team"
                      )}
                    </label>

                    <input
                      name="name"
                      value={
                        teamForm.name
                      }
                      onChange={
                        handleTeamChange
                      }
                      placeholder={
                        language ===
                        "rw"
                          ? "Urugero: ANTIMATE AI Team"
                          : "e.g. ANTIMATE AI Team"
                      }
                      required
                    />
                  </div>

                  <div className="org-field">
                    <label>
                      {translate(
                        "code",
                        "Code",
                        "Code"
                      )}
                    </label>

                    <input
                      name="code"
                      value={
                        teamForm.code
                      }
                      onChange={
                        handleTeamChange
                      }
                      placeholder="e.g. AI"
                      required
                    />
                  </div>
                </div>

                <div className="org-field">
                  <label>
                    {translate(
                      "department",
                      "Department",
                      "Department"
                    )}
                  </label>

                  <select
                    name="department"
                    value={
                      teamForm.department
                    }
                    onChange={
                      handleTeamChange
                    }
                    required
                  >
                    <option value="">
                      {translate(
                        "selectDepartment",
                        "Select department",
                        "Hitamo department"
                      )}
                    </option>

                    {activeDepartments.map(
                      (
                        department
                      ) => (
                        <option
                          key={
                            department._id
                          }
                          value={
                            department._id
                          }
                        >
                          {
                            department.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="org-field">
                  <label>
                    {translate(
                      "description",
                      "Description",
                      "Ibisobanuro"
                    )}
                  </label>

                  <textarea
                    name="description"
                    value={
                      teamForm.description
                    }
                    onChange={
                      handleTeamChange
                    }
                    placeholder={
                      language ===
                      "rw"
                        ? "Sobanura iyi team..."
                        : "Describe the team..."
                    }
                    rows="4"
                  />
                </div>

                <div className="org-form-grid">
                  <div className="org-field">
                    <label>
                      {translate(
                        "displayOrder",
                        "Display Order",
                        "Uko bigomba gukurikirana"
                      )}
                    </label>

                    <input
                      type="number"
                      name="order"
                      value={
                        teamForm.order
                      }
                      onChange={
                        handleTeamChange
                      }
                    />
                  </div>

                  <label className="org-checkbox">
                    <input
                      type="checkbox"
                      name="active"
                      checked={
                        teamForm.active
                      }
                      onChange={
                        handleTeamChange
                      }
                    />

                    <span>
                      {translate(
                        "activeTeam",
                        "Active Team",
                        "Team ikora"
                      )}
                    </span>
                  </label>
                </div>

                <div className="org-modal-actions">
                  <button
                    type="button"
                    className="org-button secondary"
                    onClick={
                      closeModal
                    }
                  >
                    {translate(
                      "cancel",
                      "Cancel",
                      "Kureka"
                    )}
                  </button>

                  <button
                    type="submit"
                    className="org-button primary"
                    disabled={saving}
                  >
                    {saving
                      ? translate(
                          "saving",
                          "Saving...",
                          "Birabikwa..."
                        )
                      : editingItem
                      ? translate(
                          "saveChanges",
                          "Save Changes",
                          "Bika impinduka"
                        )
                      : translate(
                          "createTeam",
                          "Create Team",
                          "Kora Team"
                        )}
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  const activeEntityLabel =
    activeTab === "departments"
      ? translate(
          "department",
          "Department",
          "Department"
        )
      : activeTab === "positions"
      ? translate(
          "position",
          "Position",
          "Position"
        )
      : translate(
          "team",
          "Team",
          "Team"
        );

  const activePluralLabel =
    activeTab === "departments"
      ? translate(
          "departments",
          "Departments",
          "Departments"
        )
      : activeTab === "positions"
      ? translate(
          "positions",
          "Positions",
          "Positions"
        )
      : translate(
          "teams",
          "Teams",
          "Teams"
        );

  const activeCount =
    activeTab === "departments"
      ? departments.length
      : activeTab === "positions"
      ? positions.length
      : teams.length;

  return (
    <div
      className={`organization-page ${
        theme === "dark"
          ? "organization-dark"
          : "organization-light"
      }`}
    >
      <style>{`

        /* ============================================================
           ORGANIZATION THEME
           ============================================================ */

        .organization-page {
          --org-bg:
            var(--admin-bg, #f8fafc);

          --org-surface:
            var(--admin-surface, #ffffff);

          --org-surface-2:
            var(--admin-surface-2, #f1f5f9);

          --org-surface-3:
            var(--admin-surface-3, #e2e8f0);

          --org-border:
            var(--admin-border, rgba(15, 23, 42, .10));

          --org-border-strong:
            var(--admin-border-strong, rgba(15, 23, 42, .18));

          --org-text:
            var(--admin-text, #0f172a);

          --org-text-secondary:
            var(--admin-text-secondary, #334155);

          --org-muted:
            var(--admin-text-muted, #64748b);

          --org-primary:
            var(--admin-primary, #3157d5);

          --org-primary-hover:
            var(--admin-primary-hover, #2749ba);

          --org-success:
            var(--admin-success, #22c55e);

          --org-danger:
            var(--admin-danger, #ef4444);

          --org-warning:
            var(--admin-warning, #f59e0b);

          width: 100%;
          min-height: 100%;

          padding: 28px;

          background:
            var(--org-bg);

          color:
            var(--org-text);

          transition:
            background-color .2s ease,
            color .2s ease;
        }

        .organization-dark {
          --org-bg:
            var(--admin-bg, #020617);

          --org-surface:
            var(--admin-surface, #0f172a);

          --org-surface-2:
            var(--admin-surface-2, #111827);

          --org-surface-3:
            var(--admin-surface-3, #1e293b);

          --org-text:
            var(--admin-text, #f8fafc);

          --org-text-secondary:
            var(--admin-text-secondary, #cbd5e1);

          --org-muted:
            var(--admin-text-muted, #94a3b8);
        }

        .org-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ============================================================
           HEADER
           ============================================================ */

        .org-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          gap: 20px;

          margin-bottom: 24px;
        }

        .org-header h1 {
          margin: 0 0 7px;

          color:
            var(--org-text);

          font-size: 28px;
          font-weight: 750;

          letter-spacing: -.02em;
        }

        .org-header p {
          margin: 0;

          color:
            var(--org-muted);

          font-size: 14px;
          line-height: 1.5;
        }

        /* ============================================================
           BUTTONS
           ============================================================ */

        .org-button {
          border: 0;

          border-radius: 9px;

          padding:
            11px 17px;

          font-size: 14px;
          font-weight: 650;

          cursor: pointer;

          transition:
            background-color .18s ease,
            color .18s ease,
            border-color .18s ease,
            transform .18s ease;
        }

        .org-button:active {
          transform:
            translateY(1px);
        }

        .org-button:disabled {
          opacity: .6;
          cursor: not-allowed;
          transform: none;
        }

        .org-button.primary {
          background:
            var(--org-primary);

          color:
            #ffffff;
        }

        .org-button.primary:hover {
          background:
            var(--org-primary-hover);
        }

        .org-button.secondary {
          background:
            var(--org-surface-3);

          color:
            var(--org-text-secondary);

          border:
            1px solid var(--org-border);
        }

        .org-button.secondary:hover {
          background:
            var(--org-surface-2);

          color:
            var(--org-text);
        }

        /* ============================================================
           STATS
           ============================================================ */

        .org-stats {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 16px;

          margin-bottom: 22px;
        }

        .org-stat {
          background:
            var(--org-surface);

          border:
            1px solid var(--org-border);

          border-radius: 13px;

          padding: 18px;

          box-shadow:
            0 3px 14px
            rgba(15, 23, 42, .04);

          transition:
            background-color .2s ease,
            border-color .2s ease;
        }

        .organization-dark .org-stat {
          box-shadow: none;
        }

        .org-stat-label {
          color:
            var(--org-muted);

          font-size: 13px;

          margin-bottom: 8px;
        }

        .org-stat-value {
          color:
            var(--org-text);

          font-size: 25px;
          font-weight: 750;
        }

        /* ============================================================
           TABS
           ============================================================ */

        .org-tabs {
          display: flex;

          gap: 5px;

          background:
            var(--org-surface);

          border:
            1px solid var(--org-border);

          border-radius: 11px;

          padding: 5px;

          margin-bottom: 18px;

          overflow-x: auto;

          scrollbar-width: none;
        }

        .org-tabs::-webkit-scrollbar {
          display: none;
        }

        .org-tab {
          flex: 1;

          min-width: 120px;

          border: 0;

          background:
            transparent;

          border-radius: 8px;

          padding:
            12px 16px;

          cursor: pointer;

          color:
            var(--org-muted);

          font-weight: 650;
          font-size: 14px;

          white-space: nowrap;

          transition:
            background-color .18s ease,
            color .18s ease;
        }

        .org-tab:hover {
          background:
            var(--org-surface-2);

          color:
            var(--org-text);
        }

        .org-tab.active {
          background:
            var(--org-primary);

          color:
            #ffffff;
        }

        .org-tab.active:hover {
          background:
            var(--org-primary-hover);

          color:
            #ffffff;
        }

        /* ============================================================
           PANEL
           ============================================================ */

        .org-panel {
          background:
            var(--org-surface);

          border:
            1px solid var(--org-border);

          border-radius: 13px;

          overflow: hidden;

          box-shadow:
            0 3px 16px
            rgba(15, 23, 42, .035);
        }

        .organization-dark .org-panel {
          box-shadow: none;
        }

        .org-panel-header {
          padding:
            19px 20px;

          display: flex;

          justify-content: space-between;
          align-items: center;

          border-bottom:
            1px solid var(--org-border);
        }

        .org-panel-header h2 {
          margin: 0 0 4px;

          color:
            var(--org-text);

          font-size: 17px;
          font-weight: 700;
        }

        .org-panel-header p {
          margin: 0;

          color:
            var(--org-muted);

          font-size: 13px;
        }

        /* ============================================================
           TABLE
           ============================================================ */

        .org-table-wrap {
          width: 100%;

          overflow-x: auto;

          -webkit-overflow-scrolling:
            touch;
        }

        .org-table {
          width: 100%;

          border-collapse:
            collapse;

          min-width: 760px;
        }

        .org-table th {
          background:
            var(--org-surface-2);

          color:
            var(--org-muted);

          font-size: 12px;

          text-transform:
            uppercase;

          letter-spacing: .04em;

          text-align: left;

          padding:
            13px 18px;

          border-bottom:
            1px solid var(--org-border);
        }

        .org-table td {
          padding:
            15px 18px;

          border-bottom:
            1px solid var(--org-border);

          color:
            var(--org-text-secondary);

          font-size: 14px;

          vertical-align:
            middle;
        }

        .org-table tbody tr {
          transition:
            background-color .16s ease;
        }

        .org-table tbody tr:hover {
          background:
            var(--org-surface-2);
        }

        .org-table tr:last-child td {
          border-bottom: 0;
        }

        .org-name {
          font-weight: 650;

          color:
            var(--org-text);
        }

        .org-description {
          color:
            var(--org-muted);

          max-width: 340px;

          line-height: 1.45;
        }

        .org-code {
          display: inline-flex;

          padding:
            4px 8px;

          border-radius: 6px;

          background:
            var(--org-surface-3);

          color:
            var(--org-text-secondary);

          font-size: 12px;

          font-weight: 700;

          letter-spacing: .04em;
        }

        /* ============================================================
           STATUS
           ============================================================ */

        .org-status {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding:
            5px 9px;

          border-radius: 20px;

          font-size: 12px;

          font-weight: 650;
        }

        .org-status.active {
          background:
            rgba(34, 197, 94, .12);

          color:
            #22a05a;
        }

        .organization-dark
        .org-status.active {
          background:
            rgba(34, 197, 94, .16);

          color:
            #4ade80;
        }

        .org-status.inactive {
          background:
            var(--org-surface-3);

          color:
            var(--org-muted);
        }

        /* ============================================================
           ACTIONS
           ============================================================ */

        .org-actions {
          display: flex;

          gap: 7px;
        }

        .org-action {
          border:
            1px solid var(--org-border-strong);

          background:
            var(--org-surface);

          color:
            var(--org-text-secondary);

          padding:
            7px 10px;

          border-radius: 7px;

          cursor: pointer;

          font-size: 12px;

          font-weight: 650;

          transition:
            background-color .16s ease,
            color .16s ease,
            border-color .16s ease;
        }

        .org-action:hover {
          background:
            var(--org-surface-2);

          color:
            var(--org-text);
        }

        .org-action.delete {
          color:
            #dc4654;
        }

        .org-action.delete:hover {
          background:
            rgba(239, 68, 68, .09);

          border-color:
            rgba(239, 68, 68, .25);
        }

        /* ============================================================
           EMPTY / LOADING
           ============================================================ */

        .org-empty,
        .org-loading {
          padding:
            55px 20px;

          text-align: center;

          color:
            var(--org-muted);

          font-size: 14px;
        }

        /* ============================================================
           ALERTS
           ============================================================ */

        .org-alert {
          margin:
            15px 0;

          padding:
            11px 13px;

          border-radius: 8px;

          font-size: 13px;

          border:
            1px solid transparent;
        }

        .org-alert-success {
          background:
            rgba(34, 197, 94, .10);

          border-color:
            rgba(34, 197, 94, .20);

          color:
            #20804b;
        }

        .organization-dark
        .org-alert-success {
          color:
            #4ade80;
        }

        .org-alert-error {
          background:
            rgba(239, 68, 68, .09);

          border-color:
            rgba(239, 68, 68, .18);

          color:
            #c43f4d;
        }

        .organization-dark
        .org-alert-error {
          color:
            #f87171;
        }

        /* ============================================================
           MODAL
           ============================================================ */

        .org-modal-backdrop {
          position: fixed;

          inset: 0;

          z-index: 1000;

          background:
            rgba(2, 6, 23, .60);

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 20px;

          overflow-y: auto;
        }

        .org-modal {
          width:
            min(650px, 100%);

          max-height:
            90vh;

          overflow-y:
            auto;

          background:
            var(--org-surface);

          color:
            var(--org-text);

          border:
            1px solid var(--org-border);

          border-radius: 15px;

          box-shadow:
            0 25px 80px
            rgba(0, 0, 0, .28);
        }

        .org-modal-header {
          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-start;

          gap: 15px;

          padding: 22px;

          border-bottom:
            1px solid var(--org-border);
        }

        .org-modal-header h2 {
          margin:
            0 0 5px;

          color:
            var(--org-text);

          font-size: 20px;
        }

        .org-modal-header p {
          margin: 0;

          color:
            var(--org-muted);

          font-size: 13px;

          line-height: 1.45;
        }

        .org-close-button {
          flex-shrink: 0;

          border:
            1px solid var(--org-border);

          background:
            var(--org-surface-3);

          color:
            var(--org-muted);

          width: 34px;
          height: 34px;

          border-radius: 8px;

          font-size: 23px;

          cursor: pointer;

          line-height: 1;

          transition:
            background-color .16s ease,
            color .16s ease;
        }

        .org-close-button:hover {
          background:
            var(--org-surface-2);

          color:
            var(--org-text);
        }

        /* ============================================================
           FORM
           ============================================================ */

        .org-form {
          padding: 22px;
        }

        .org-form-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 15px;
        }

        .org-field {
          margin-bottom: 17px;
        }

        .org-field label {
          display: block;

          margin-bottom: 7px;

          color:
            var(--org-text-secondary);

          font-size: 13px;

          font-weight: 650;
        }

        .org-field input,
        .org-field select,
        .org-field textarea {
          width: 100%;

          box-sizing: border-box;

          border:
            1px solid var(--org-border-strong);

          border-radius: 8px;

          padding:
            11px 12px;

          background:
            var(--org-surface);

          color:
            var(--org-text);

          font-size: 14px;

          outline: none;

          font-family: inherit;

          transition:
            border-color .16s ease,
            box-shadow .16s ease,
            background-color .16s ease;
        }

        .org-field input::placeholder,
        .org-field textarea::placeholder {
          color:
            var(--org-muted);

          opacity: .8;
        }

        .org-field select {
          cursor: pointer;
        }

        .organization-dark
        .org-field select option {
          background:
            var(--org-surface);

          color:
            var(--org-text);
        }

        .org-field textarea {
          resize: vertical;

          min-height: 105px;
        }

        .org-field input:focus,
        .org-field select:focus,
        .org-field textarea:focus {
          border-color:
            var(--org-primary);

          box-shadow:
            0 0 0 3px
            rgba(49, 87, 213, .12);
        }

        .organization-dark
        .org-field input:focus,
        .organization-dark
        .org-field select:focus,
        .organization-dark
        .org-field textarea:focus {
          box-shadow:
            0 0 0 3px
            rgba(99, 102, 241, .16);
        }

        /* ============================================================
           CHECKBOX
           ============================================================ */

        .org-checkbox {
          display: flex;

          align-items: center;

          gap: 9px;

          min-height: 42px;

          margin-top: 20px;

          color:
            var(--org-text-secondary);

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;
        }

        .org-checkbox input {
          width: 17px;
          height: 17px;

          margin: 0;

          accent-color:
            var(--org-primary);

          cursor: pointer;
        }

        /* ============================================================
           MODAL ACTIONS
           ============================================================ */

        .org-modal-actions {
          display: flex;

          justify-content:
            flex-end;

          gap: 9px;

          padding-top: 8px;

          border-top:
            1px solid var(--org-border);
        }

        /* ============================================================
           MOBILE
           ============================================================ */

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

          .org-modal-backdrop {
            align-items: flex-start;

            padding:
              12px;
          }

          .org-modal {
            max-height:
              calc(100vh - 24px);

            border-radius:
              12px;
          }

          .org-modal-header {
            padding:
              18px;
          }

          .org-form {
            padding:
              18px;
          }

        }

        @media (max-width: 480px) {

          .organization-page {
            padding:
              14px 10px 25px;
          }

          .org-header {
            gap: 14px;

            margin-bottom: 18px;
          }

          .org-header h1 {
            font-size: 22px;
          }

          .org-header p {
            font-size: 13px;
          }

          .org-stat {
            padding:
              15px;
          }

          .org-tabs {
            margin-bottom:
              14px;
          }

          .org-tab {
            min-width:
              105px;

            padding:
              10px 12px;

            font-size: 13px;
          }

          .org-panel-header {
            padding:
              16px;
          }

          .org-modal-actions {
            flex-direction:
              column-reverse;
          }

          .org-modal-actions
          .org-button {
            width: 100%;
          }

        }

        /* ============================================================
           REDUCED MOTION
           ============================================================ */

        @media (prefers-reduced-motion: reduce) {

          .organization-page *,
          .organization-page *::before,
          .organization-page *::after {
            transition:
              none !important;
          }

        }

      `}</style>

      <div className="org-container">

        {/* ==========================================================
            HEADER
            ========================================================== */}

        <div className="org-header">
          <div>
            <h1>
              {translate(
                "organization",
                "Organization",
                "Umuryango"
              )}
            </h1>

            <p>
              {translate(
                "organizationDescription",
                "Manage ANTIMATE departments, positions and teams.",
                "Gucunga departments, positions na teams bya ANTIMATE."
              )}
            </p>
          </div>

          <button
            className="org-button primary"
            onClick={
              openCreateModal
            }
          >
            +{" "}
            {translate(
              "add",
              "Add",
              "Ongeramo"
            )}{" "}
            {activeEntityLabel}
          </button>
        </div>

        {/* ==========================================================
            MESSAGES
            ========================================================== */}

        {message && (
          <div className="org-alert org-alert-success">
            {message}
          </div>
        )}

        {error &&
          !showModal && (
            <div className="org-alert org-alert-error">
              {error}
            </div>
          )}

        {/* ==========================================================
            STATS
            ========================================================== */}

        <div className="org-stats">

          <div className="org-stat">
            <div className="org-stat-label">
              {translate(
                "activeDepartments",
                "Active Departments",
                "Departments zikora"
              )}
            </div>

            <div className="org-stat-value">
              {
                activeDepartments.length
              }
            </div>
          </div>

          <div className="org-stat">
            <div className="org-stat-label">
              {translate(
                "activePositions",
                "Active Positions",
                "Positions zikora"
              )}
            </div>

            <div className="org-stat-value">
              {
                activePositions.length
              }
            </div>
          </div>

          <div className="org-stat">
            <div className="org-stat-label">
              {translate(
                "activeTeams",
                "Active Teams",
                "Teams zikora"
              )}
            </div>

            <div className="org-stat-value">
              {activeTeams.length}
            </div>
          </div>

        </div>

        {/* ==========================================================
            TABS
            ========================================================== */}

        <div className="org-tabs">

          <button
            className={`org-tab ${
              activeTab ===
              "departments"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab(
                "departments"
              );

              clearMessages();
            }}
          >
            {translate(
              "departments",
              "Departments",
              "Departments"
            )}
          </button>

          <button
            className={`org-tab ${
              activeTab ===
              "positions"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab(
                "positions"
              );

              clearMessages();
            }}
          >
            {translate(
              "positions",
              "Positions",
              "Positions"
            )}
          </button>

          <button
            className={`org-tab ${
              activeTab === "teams"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab(
                "teams"
              );

              clearMessages();
            }}
          >
            {translate(
              "teams",
              "Teams",
              "Teams"
            )}
          </button>

        </div>

        {/* ==========================================================
            PANEL
            ========================================================== */}

        <div className="org-panel">

          <div className="org-panel-header">

            <div>

              <h2>
                {activePluralLabel}
              </h2>

              <p>
                {translate(
                  "configuredCount",
                  `${activeCount} ${activePluralLabel.toLowerCase()} configured`,
                  `${activeCount} ${activePluralLabel.toLowerCase()} zateguwe`
                )}
              </p>

            </div>

          </div>

          {/* ========================================================
              LOADING
              ======================================================== */}

          {loading ? (
            <div className="org-loading">
              {translate(
                "loadingOrganization",
                "Loading organization...",
                "Birimo kubika imiterere y'umuryango..."
              )}
            </div>
          ) : activeTab ===
            "departments" ? (

            /* ======================================================
               DEPARTMENTS
               ====================================================== */

            departments.length ===
            0 ? (
              <div className="org-empty">
                {translate(
                  "noDepartments",
                  "No departments found.",
                  "Nta departments zabonetse."
                )}
              </div>
            ) : (
              <div className="org-table-wrap">

                <table className="org-table">

                  <thead>
                    <tr>
                      <th>
                        {translate(
                          "name",
                          "Name",
                          "Izina"
                        )}
                      </th>

                      <th>
                        {translate(
                          "code",
                          "Code",
                          "Code"
                        )}
                      </th>

                      <th>
                        {translate(
                          "description",
                          "Description",
                          "Ibisobanuro"
                        )}
                      </th>

                      <th>
                        {translate(
                          "status",
                          "Status",
                          "Imimerere"
                        )}
                      </th>

                      <th>
                        {translate(
                          "actions",
                          "Actions",
                          "Ibikorwa"
                        )}
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {departments.map(
                      (
                        department
                      ) => (
                        <tr
                          key={
                            department._id
                          }
                        >

                          <td>
                            <div className="org-name">
                              {
                                department.name
                              }
                            </div>
                          </td>

                          <td>
                            <span className="org-code">
                              {
                                department.code
                              }
                            </span>
                          </td>

                          <td>
                            <div className="org-description">
                              {
                                department.description ||
                                "—"
                              }
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
                                ? translate(
                                    "active",
                                    "Active",
                                    "Irakora"
                                  )
                                : translate(
                                    "inactive",
                                    "Inactive",
                                    "Ntirakora"
                                  )}
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
                                {translate(
                                  "edit",
                                  "Edit",
                                  "Hindura"
                                )}
                              </button>

                              <button
                                className="org-action delete"
                                onClick={() =>
                                  deleteDepartment(
                                    department
                                  )
                                }
                              >
                                {translate(
                                  "delete",
                                  "Delete",
                                  "Siba"
                                )}
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

          ) : activeTab ===
            "positions" ? (

            /* ======================================================
               POSITIONS
               ====================================================== */

            positions.length ===
            0 ? (
              <div className="org-empty">
                {translate(
                  "noPositions",
                  "No positions found.",
                  "Nta positions zabonetse."
                )}
              </div>
            ) : (
              <div className="org-table-wrap">

                <table className="org-table">

                  <thead>
                    <tr>

                      <th>
                        {translate(
                          "name",
                          "Name",
                          "Izina"
                        )}
                      </th>

                      <th>
                        {translate(
                          "code",
                          "Code",
                          "Code"
                        )}
                      </th>

                      <th>
                        {translate(
                          "department",
                          "Department",
                          "Department"
                        )}
                      </th>

                      <th>
                        {translate(
                          "level",
                          "Level",
                          "Urwego"
                        )}
                      </th>

                      <th>
                        {translate(
                          "status",
                          "Status",
                          "Imimerere"
                        )}
                      </th>

                      <th>
                        {translate(
                          "actions",
                          "Actions",
                          "Ibikorwa"
                        )}
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {positions.map(
                      (
                        position
                      ) => (
                        <tr
                          key={
                            position._id
                          }
                        >

                          <td>
                            <div className="org-name">
                              {
                                position.name
                              }
                            </div>
                          </td>

                          <td>
                            <span className="org-code">
                              {
                                position.code
                              }
                            </span>
                          </td>

                          <td>
                            {
                              getDepartmentName(
                                position.department
                              )
                            }
                          </td>

                          <td>
                            {
                              getLevelLabel(
                                position.level
                              )
                            }
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
                                ? translate(
                                    "active",
                                    "Active",
                                    "Irakora"
                                  )
                                : translate(
                                    "inactive",
                                    "Inactive",
                                    "Ntirakora"
                                  )}
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
                                {translate(
                                  "edit",
                                  "Edit",
                                  "Hindura"
                                )}
                              </button>

                              <button
                                className="org-action delete"
                                onClick={() =>
                                  deletePosition(
                                    position
                                  )
                                }
                              >
                                {translate(
                                  "delete",
                                  "Delete",
                                  "Siba"
                                )}
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

          ) : teams.length ===
            0 ? (

            /* ======================================================
               EMPTY TEAMS
               ====================================================== */

            <div className="org-empty">
              {translate(
                "noTeams",
                "No teams found.",
                "Nta teams zabonetse."
              )}
            </div>

          ) : (

            /* ======================================================
               TEAMS
               ====================================================== */

            <div className="org-table-wrap">

              <table className="org-table">

                <thead>

                  <tr>

                    <th>
                      {translate(
                        "name",
                        "Name",
                        "Izina"
                      )}
                    </th>

                    <th>
                      {translate(
                        "code",
                        "Code",
                        "Code"
                      )}
                    </th>

                    <th>
                      {translate(
                        "department",
                        "Department",
                        "Department"
                      )}
                    </th>

                    <th>
                      {translate(
                        "status",
                        "Status",
                        "Imimerere"
                      )}
                    </th>

                    <th>
                      {translate(
                        "actions",
                        "Actions",
                        "Ibikorwa"
                      )}
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {teams.map(
                    (team) => (
                      <tr
                        key={
                          team._id
                        }
                      >

                        <td>
                          <div className="org-name">
                            {
                              team.name
                            }
                          </div>
                        </td>

                        <td>
                          <span className="org-code">
                            {
                              team.code
                            }
                          </span>
                        </td>

                        <td>
                          {
                            getDepartmentName(
                              team.department
                            )
                          }
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
                              ? translate(
                                  "active",
                                  "Active",
                                  "Irakora"
                                )
                              : translate(
                                  "inactive",
                                  "Inactive",
                                  "Ntirakora"
                                )}
                          </span>
                        </td>

                        <td>
                          <div className="org-actions">

                            <button
                              className="org-action"
                              onClick={() =>
                                openEditTeam(
                                  team
                                )
                              }
                            >
                              {translate(
                                "edit",
                                "Edit",
                                "Hindura"
                              )}
                            </button>

                            <button
                              className="org-action delete"
                              onClick={() =>
                                deleteTeam(
                                  team
                                )
                              }
                            >
                              {translate(
                                "delete",
                                "Delete",
                                "Siba"
                              )}
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )}

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