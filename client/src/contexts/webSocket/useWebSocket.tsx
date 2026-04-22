import { create } from "zustand";

interface WebSocketStore {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Actions
  reloadConnection: () => void;
  sendStartMaintenanceNotification: (
    startTime?: string,
    endTime?: string,
  ) => void;
  sendEndMaintenanceNotification: () => void;
  sendGetActiveUsersRequest: () => void;

  setActions: (actions: {
    reloadConnection: () => void;
    sendStartMaintenanceNotification: (
      startTime?: string,
      endTime?: string,
    ) => void;
    sendEndMaintenanceNotification: () => void;
    sendGetActiveUsersRequest: () => void;
  }) => void;
}

export const useWebSocket = create<WebSocketStore>((set) => ({
  isConnected: false,
  setIsConnected: (isConnected) => set({ isConnected }),

  reloadConnection: () => {},
  sendStartMaintenanceNotification: () => {},
  sendEndMaintenanceNotification: () => {},
  sendGetActiveUsersRequest: () => {},

  setActions: (actions) => set({ ...actions }),
}));
