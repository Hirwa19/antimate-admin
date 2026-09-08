import axios from "axios";

// ============================================================
// ANTIMATE API CLIENT
// ============================================================
//
// VITE_API_URL example:
//
// https://brooder-backend.onrender.com
//
// The "/api" prefix is added here automatically.
//
// Therefore:
//
// api.get("/devices")
//
// becomes:
//
// https://brooder-backend.onrender.com/api/devices
//
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL;

// ============================================================
// VALIDATE API URL
// ============================================================

if (!API_URL) {
  console.error(
    "❌ VITE_API_URL is missing."
  );
}

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL:
    API_URL
      ? `${API_URL.replace(/\/+$/, "")}/api`
      : "/api",

  timeout: 30000,

  headers: {
    "Content-Type":
      "application/json",

    Accept:
      "application/json",
  },
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
//
// Automatically attaches JWT token:
//
// Authorization: Bearer <token>
//
// ============================================================

api.interceptors.request.use(
  (config) => {
    try {
      const token =
        localStorage.getItem(
          "token"
        );

      if (token) {
        config.headers =
          config.headers || {};

        config.headers.Authorization =
          `Bearer ${token}`;
      }
    } catch (error) {
      console.warn(
        "⚠️ Could not read authentication token:",
        error
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
//
// Does NOT automatically logout or redirect.
//
// This is intentional because brooder-frontend may already
// depend on its own authentication behavior.
//
// It simply normalizes/logs useful API errors.
//
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    // --------------------------------------------------------
    // No response from server
    // --------------------------------------------------------

    if (!error.response) {
      console.error(
        "❌ API NETWORK ERROR:",
        error.message
      );

      return Promise.reject(
        error
      );
    }

    // --------------------------------------------------------
    // Server response
    // --------------------------------------------------------

    const status =
      error.response.status;

    const data =
      error.response.data;

    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    if (status === 401) {
      console.warn(
        "⚠️ API 401 Unauthorized:",
        data
      );
    }

    // --------------------------------------------------------
    // Permission
    // --------------------------------------------------------

    if (status === 403) {
      console.warn(
        "⚠️ API 403 Permission denied:",
        data
      );
    }

    // --------------------------------------------------------
    // Not found
    // --------------------------------------------------------

    if (status === 404) {
      console.warn(
        "⚠️ API 404 Route not found:",
        error.config?.url
      );
    }

    // --------------------------------------------------------
    // Server error
    // --------------------------------------------------------

    if (status >= 500) {
      console.error(
        "🔥 API SERVER ERROR:",
        status,
        data
      );
    }

    return Promise.reject(
      error
    );
  }
);

// ============================================================
// EXPORT
// ============================================================

export default api;