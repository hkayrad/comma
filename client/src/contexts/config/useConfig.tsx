import { create } from "zustand";
import { ConfigApi } from "@/lib/api/config";
import { Logger } from "@/lib/utils/logger";

interface ConfigState {
  configs: Record<string, string>;
  isLoading: boolean;
  fetchConfigs: () => Promise<void>;
  getConfig: (key: string) => string | null;
  refreshConfigs: () => Promise<void>;
}

export const useConfig = create<ConfigState>((set, get) => ({
  configs: {},
  isLoading: true,
  fetchConfigs: async () => {
    set({ isLoading: true });
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
      set({ configs: configsData });

      Object.entries(configsData).forEach(([key, value]) => {
        sessionStorage.setItem(key, value as string);
      });
    } catch (error) {
      Logger.error("Failed to fetch configs:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  getConfig: (key: string) => {
    return get().configs[key] ?? sessionStorage.getItem(key) ?? null;
  },
  refreshConfigs: async () => {
    await get().fetchConfigs();
  },
}));
