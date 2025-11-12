import { createContext } from "react";

interface WebSocketContextType {
  isConnected: boolean;
  reloadConnection: () => void;
  sendStartMaintenanceNotification: (
    startTime?: string,
    endTime?: string,
  ) => void;
  sendEndMaintenanceNotification: () => void;
  sendGetActiveUsersRequest: () => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);
