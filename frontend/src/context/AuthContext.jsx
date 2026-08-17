import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cspm_token");
    if (token) {
      authAPI.me()
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem("cspm_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("cspm_token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (email, password, name) => {
    const res = await authAPI.register({ email, password, name });
    localStorage.setItem("cspm_token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("cspm_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
