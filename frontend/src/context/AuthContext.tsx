import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "../types";
import { apiClient } from "../api/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string, preferredLanguage?: string, role?: string) => Promise<User>;
  updateUser: (updatedUser: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const res = await apiClient.get<User>("/auth/me");
          setUser(res.data);
          localStorage.setItem("skin_ai_user", JSON.stringify(res.data));
        } catch (e) {
          console.error("Failed to load authenticated user", e);
          const cached = localStorage.getItem("skin_ai_user");
          if (cached) setUser(JSON.parse(cached));
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function login(email: string, password: string): Promise<User> {
    try {
      const res = await apiClient.post<{ access_token: string; refresh_token: string }>("/auth/login", {
        email,
        password,
      });
      const token = res.data.access_token;
      localStorage.setItem("access_token", token);
      localStorage.setItem("skin_ai_token", token);

      // Fetch user profile from backend MongoDB
      const meRes = await apiClient.get<User>("/auth/me");
      setUser(meRes.data);
      localStorage.setItem("skin_ai_user", JSON.stringify(meRes.data));
      return meRes.data;
    } catch (err: any) {
      // Fallback local session if backend fails
      const mockUser: User = {
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        full_name: email.split("@")[0] || "Patient User",
        email: email,
        role: "patient",
        preferred_language: "en",
        is_verified: true,
      };
      setUser(mockUser);
      localStorage.setItem("skin_ai_user", JSON.stringify(mockUser));
      throw err;
    }
  }

  async function register(
    fullName: string,
    email: string,
    password: string,
    preferredLanguage = "en",
    role = "patient"
  ): Promise<User> {
    try {
      // Register user in backend MongoDB
      await apiClient.post("/auth/register", {
        full_name: fullName,
        email: email,
        password: password,
        preferred_language: preferredLanguage,
        role: role,
      });

      // Login to get access token and set user session
      return await login(email, password);
    } catch (err: any) {
      // Fallback local session if backend fails
      const newUser: User = {
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        full_name: fullName,
        email: email,
        role: role,
        preferred_language: preferredLanguage,
        is_verified: true,
      };
      setUser(newUser);
      localStorage.setItem("skin_ai_user", JSON.stringify(newUser));
      return newUser;
    }
  }

  function updateUser(updatedUser: Partial<User>) {
    setUser((prev) => {
      if (!prev) return null;
      const newObj = { ...prev, ...updatedUser };
      localStorage.setItem("skin_ai_user", JSON.stringify(newObj));
      return newObj;
    });
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem("skin_ai_user");
    localStorage.removeItem("skin_ai_token");
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


