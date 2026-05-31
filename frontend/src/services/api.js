import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Reads token directly from localStorage — intentionally decoupled from context
// to avoid circular dependencies and work in non-React contexts (e.g., service calls).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Global 401 handling: clears stale auth and redirects to login.
// Extend here for token refresh logic (swap reject for a refresh call).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      // Hard redirect — avoids stale context state
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
