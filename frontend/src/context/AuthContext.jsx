import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { clearCachedProfile } from "../services/profileService";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const TOKEN_KEY = "auth_token";
const USER_KEY  = "auth_user";
const ROLE_KEY  = "auth_role";

const normalizeUser = (userData = {}) => {
  const email = userData.email || "";

  return {
    id:userData.id || userData._id || null,
    name:userData.name || email.split("@")[0] || "User",
    email,
    role:userData.role || "user"
  };
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser]     = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Derived state
  const role            = user?.role ?? null;
  const isAuthenticated = !!token && !!user;

  // ── Sync to localStorage on state change ──────────────────────────────────
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (role) {
      localStorage.setItem(ROLE_KEY, role);
    } else {
      localStorage.removeItem(ROLE_KEY);
    }
  }, [role]);

  // ── Actions ───────────────────────────────────────────────────────────────
  /**
   * Call after a successful auth API response.
   * @param {string} jwtToken  - Raw JWT string
   * @param {object} userData  - { id, name, email, role, ... }
   */
  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    const normalizedUser = normalizeUser(response.user);

    clearCachedProfile();
    setToken(response.token);
    setUser(normalizedUser);

    return {
      token:response.token,
      user:normalizedUser
    };
  }, []);

  const register = useCallback(async (email, password) => {
    const response = await authService.register(email, password);

    clearCachedProfile();
    return normalizeUser(response);
  }, []);

  /**
   * Clears all auth state and localStorage.
   * Navigate after calling this — AuthContext does not control routing.
   */
  const logout = useCallback(() => {
    clearCachedProfile();
    setToken(null);
    setUser(null);
  }, []);

  // ── Memoized context value ─────────────────────────────────────────────────
  const value = useMemo(() => ({
    user,
    token,
    role,
    isAuthenticated,
    login,
    register,
    logout,
  }), [user, token, role, isAuthenticated, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * Usage: const { user, token, role, isAuthenticated, login, logout } = useAuth();
 * Throws if used outside AuthProvider — fail-fast is intentional.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

export default AuthContext;
