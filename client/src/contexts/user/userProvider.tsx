import { useCallback, useEffect, useState, type ReactNode } from "react";
import { UserContext, type User } from "./userContext";
import { Logger } from "@/lib/utils/logger";
import { AuthApi } from "@/lib/api/auth";

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUser = () => {
    Logger.info("Getting user data");
    return user;
  };

  const setUser = (user: User | null) => {
    Logger.debug("Setting user data", user);
    setUserData(user);
  };

  const clearUser = () => {
    Logger.info("Clearing user data");
    setUserData(null);
  };

  const login = useCallback(async (username: string, password: string) => {
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
      setUser(user);
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
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await AuthApi.Refresh();

      Logger.info("Refresh response", response);

      if (response.status === 200) {
        const user = response.data;
        setUser(user);
      }
    } catch (error) {
      Logger.error("Failed to refresh user", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider
      value={{ user, getUser, setUser, login, clearUser, isLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};
