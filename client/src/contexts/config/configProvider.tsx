import { ConfigApi } from "@/lib/api/config";
import { Logger } from "@/lib/utils/logger";
import { useEffect, useState, type ReactNode } from "react";
import { ConfigContext } from "./configContext";

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await ConfigApi.GetConfigs();

      if (!response.success) {
        Logger.error("Failed to fetch configs:", response.message);
        return;
      }

      if (response.configs.length === 0) {
        Logger.warn("No configs found");
        return;
      }

      Logger.debug("Fetched configs:", response.configs);

      const configsData = response.configs;
      setConfigs(configsData);

      Object.entries(configsData).forEach(([key, value]) => {
        sessionStorage.setItem(key, value as string);
      });
    } catch (error) {
      Logger.error("Failed to fetch configs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfig = (key: string): string | null => {
    return configs[key] ?? sessionStorage.getItem(key) ?? null;
  };

  const refreshConfigs = async () => {
    await fetchConfigs();
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return (
    <ConfigContext.Provider
      value={{ configs, isLoading, getConfig, refreshConfigs }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
