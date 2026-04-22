import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DashboardSettings {
  showOverviewCards: boolean;
  showStatisticsChart: boolean;
  useContextMenuForActions: boolean;
}

interface DashboardSettingsStore extends DashboardSettings {
  setShowOverviewCards: (value: boolean) => void;
  setShowStatisticsChart: (value: boolean) => void;
  setUseContextMenuForActions: (value: boolean) => void;
}

const STORAGE_KEY = "dashboard-settings";

export const useDashboardSettings = create<DashboardSettingsStore>()(
  persist(
    (set) => ({
      showOverviewCards: true,
      showStatisticsChart: true,
      useContextMenuForActions: false,

      setShowOverviewCards: (showOverviewCards) => set({ showOverviewCards }),
      setShowStatisticsChart: (showStatisticsChart) =>
        set({ showStatisticsChart }),
      setUseContextMenuForActions: (useContextMenuForActions) =>
        set({ useContextMenuForActions }),
    }),
    {
      name: STORAGE_KEY,
    },
  ),
);
