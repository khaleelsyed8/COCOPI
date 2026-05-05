import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setToken, clearToken, getToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* Rehydrate on mount — verify existing token with server */
  useEffect(() => {
    const rehydrate = async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const data = await api.auth.me();       // GET /auth/me
        setUser(data.user);
      } catch {
        clearToken();                           // token expired/invalid
      } finally {
        setLoading(false);
      }
    };
    rehydrate();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.auth.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api.auth.register(name, email, password);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}