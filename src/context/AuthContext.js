import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:9000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email, role, token }
  const [loading, setLoading] = useState(true);

  // On mount, check for saved token and validate it
  useEffect(() => {
    const saved = localStorage.getItem("nutrisync_auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate token with /api/auth/me
        fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${parsed.token}` },
        })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data) => {
            setUser({ ...data.user, token: parsed.token });
            setLoading(false);
          })
          .catch(() => {
            localStorage.removeItem("nutrisync_auth");
            setLoading(false);
          });
      } catch {
        localStorage.removeItem("nutrisync_auth");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    const authUser = { ...data.user, token: data.token };
    setUser(authUser);
    localStorage.setItem("nutrisync_auth", JSON.stringify(authUser));
    return authUser;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    const authUser = { ...data.user, token: data.token };
    setUser(authUser);
    localStorage.setItem("nutrisync_auth", JSON.stringify(authUser));
    return authUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("nutrisync_auth");
  }, []);

  // Helper: get auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    if (!user?.token) return {};
    return { Authorization: `Bearer ${user.token}` };
  }, [user]);

  // Role checks
  const isPatient = user?.role === "patient";
  const isDoctor = user?.role === "doctor";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        getAuthHeaders,
        isPatient,
        isDoctor,
        isAdmin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default AuthContext;
