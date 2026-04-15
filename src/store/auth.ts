import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  age: number;
  bio?: string;
  avatar_url?: string;
  city?: string;
  is_verified: boolean;
  created_at: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  logout: async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } finally {
      localStorage.removeItem("access_token");
      set({ user: null });
      window.location.href = "/login";
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get("/api/v1/users/me");
      set({ user: data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
