import { useCallback, useEffect, useState, type ReactNode } from "react";
import { UserContext, type User } from "./userContext";
import { Logger } from "@/lib/utils/logger";
import { AuthApi } from "@/lib/api";

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
    Logger.info("Setting user data", user);
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
      const user = response.data;
      setUser(user);
      return user;
    }
    return null;
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
    <UserContext.Provider value={{ user, getUser, login, clearUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
