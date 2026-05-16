import { createContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";
import { clearTeacherProfileCache } from "../utils/teacherProfileCache";
import { store } from "../store/store";
import { clearTeacherProfile } from "../store/teacherProfileSlice";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser());
  const [token, setToken] = useState(storage.getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) storage.setToken(token);
    else storage.clearToken();
  }, [token]);

  useEffect(() => {
    if (user) storage.setUser(user);
    else storage.clearUser();
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      toast.success("Login successful");
      return data.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    storage.clearAuth();
    clearTeacherProfileCache();
    store.dispatch(clearTeacherProfile());
    toast.success("Logged out");
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch };
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      updateUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
