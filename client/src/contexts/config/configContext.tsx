import { createContext } from "react";

interface ConfigContextType {
  configs: Record<string, string>;
  isLoading: boolean;
  getConfig: (key: string) => string | null;
  refreshConfigs: () => Promise<void>;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined,
);
