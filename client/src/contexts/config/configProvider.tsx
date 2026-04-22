import { useEffect, type ReactNode } from "react";
import { useConfig } from "./useConfig";

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const fetchConfigs = useConfig((state) => state.fetchConfigs);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return <>{children}</>;
};
