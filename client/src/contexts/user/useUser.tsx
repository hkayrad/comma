import { create } from "zustand";
import { Logger } from "@/lib/utils/logger";
import { AuthApi } from "@/lib/api/auth";

export interface User {
  username: string;
  role: number;
  companyId: string;
}

export interface LoginResult {
  user: User | null;
  requires2FA: boolean;
  tempToken: string | null;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  login: (username: string, password: string) => Promise<LoginResult>;
  refreshUser: () => Promise<void>;
}

export const useUser = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => {
    Logger.debug("Setting user data", user);
    set({ user });
  },
  clearUser: () => {
    Logger.info("Clearing user data");
    set({ user: null });
  },
  login: async (username, password) => {
    const response = await AuthApi.Login(username, password);

    Logger.info("Login response", response);

    if (response.status === 200) {
      const data = response.data;

      // Check if 2FA is required
      if (data.requires2FA) {
        return {
          user: null,
          requires2FA: true,
          tempToken: data.tempToken,
        };
      }

      // Normal login - set user
      const user = data;
      set({ user });
      return {
        user,
        requires2FA: false,
        tempToken: null,
      };
    }
    return {
      user: null,
      requires2FA: false,
      tempToken: null,
    };
  },
  refreshUser: async () => {
    try {
      const response = await AuthApi.Refresh();

      Logger.info("Refresh response", response);

      if (response.status === 200) {
        const user = response.data;
        set({ user });
      }
    } catch (error) {
      Logger.error("Failed to refresh user", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
