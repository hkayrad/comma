import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { WebSocketContext } from "./webSocketContext";
import { toast } from "sonner";
import { Logger } from "@/lib/utils/logger";
import { AuthApi } from "@/lib/api/auth";
import { TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router";
import { useConfig } from "@/contexts/config";
import { useTranslation } from "react-i18next";

interface WebSocketProviderProps {
    children: ReactNode;
    url: string;
}

const refreshTime = 5000; // 5 secondss

export const WebSocketProvider = ({
    children,
    url,
}: WebSocketProviderProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnect = useRef(true);
    const { refreshConfigs } = useConfig();
    const navigate = useNavigate();
    const refreshConfigsRef = useRef(refreshConfigs);
    const navigateRef = useRef(navigate);
    const { t } = useTranslation();

    // Keep refs up to date
    useEffect(() => {
        refreshConfigsRef.current = refreshConfigs;
        navigateRef.current = navigate;
    }, [refreshConfigs, navigate]);

    const connect = useCallback(() => {
        // Close existing connection if any
        if (ws.current) {
            ws.current.onclose = null; // Prevent reconnection logic
            ws.current.close();
            ws.current = null;
        }

        // Cookies are automatically sent with the WebSocket upgrade request
        // No need to manually add token to URL
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            setIsConnected(true);
            Logger.debug("WebSocket connected on ", url);
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            Logger.debug("WebSocket disconnected");
            if (shouldReconnect.current) {
                reconnectTimeout.current = setTimeout(() => {
                    Logger.debug("Reconnecting WebSocket...");
                    connect();
                }, 3000);
            }
        };

        ws.current.onerror = () => {
            ws.current?.close();
            setIsConnected(false);
        };

        ws.current.onmessage = (event: any) => {
            try {
                const data = JSON.parse(event.data);
                const {
                    type,
                    title,
                    body,
                    notificationType,
                    startTime,
                    endTime,
                } = data;

                switch (type) {
                    case "NOTIFICATION":
                        switch (notificationType) {
                            case "start_maintenance": {
                                const start =
                                    startTime ||
                                    `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;
                                const end =
                                    endTime ||
                                    `${new Date(Date.now() + 300000).getHours().toString().padStart(2, "0")}:${new Date(Date.now() + 300000).getMinutes().toString().padStart(2, "0")}`;
                                refreshConfigsRef.current();
                                toast.error(
                                    t("notification.startMaintenance.title"),
                                    {
                                        description: (
                                            <>
                                                <span>
                                                    {t(
                                                        "notification.startMaintenance.body",
                                                    )}{" "}
                                                    <br />
                                                    <br />
                                                    {start &&
                                                        end &&
                                                        t(
                                                            "notification.startMaintenance.estimatedMaintenanceInterval",
                                                            { start, end },
                                                        )}
                                                </span>
                                                <StartMaintenanceProgressBar
                                                    duration={60000}
                                                />
                                            </>
                                        ),
                                        duration: 180000,
                                        icon: <TriangleAlert size={16} />,
                                        dismissible: false,
                                        closeButton: false,
                                        id: "maintenance_mode_toast",
                                        className: "relative overflow-hidden",
                                        classNames: {
                                            icon: "mr-4!",
                                        },
                                    },
                                );
                                setTimeout(() => {
                                    AuthApi.Logout().then(() => {
                                        navigateRef.current("/login");
                                    });
                                }, 60000);
                                break;
                            }
                            case "end_maintenance": {
                                refreshConfigsRef.current();
                                toast.dismiss("maintenance_mode_toast");
                                toast.success(
                                    t("notification.endMaintenance.title", {
                                        refreshTime: refreshTime / 1000,
                                    }),
                                    {
                                        duration: refreshTime,
                                        closeButton: false,
                                        dismissible: false,
                                        description: (
                                            <EndMaintenanceProgressBar
                                                duration={refreshTime}
                                            />
                                        ),
                                        className: "relative overflow-hidden",
                                    },
                                );
                                setTimeout(() => {
                                    window.location.reload();
                                }, refreshTime);
                                break;
                            }
                            default:
                                toast(title, { description: body });
                                break;
                        }
                        break;
                    case "ACTIVE_USERS":
                        toast.success(
                            t("notification.activeUserCount", {
                                count: data.userCount,
                            }),
                            {
                                duration: 5000,
                            },
                        );
                        break;
                    default:
                        Logger.warn("Unknown message type:", data.type);
                }
            } catch (error) {
                Logger.error("Error parsing WebSocket message:", error);
            }
        };
    }, [url, t]);

    const disconnect = useCallback(() => {
        shouldReconnect.current = false;
        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
        }
        ws.current?.close();
    }, []);

    const reloadConnection = useCallback(() => {
        disconnect();
        reconnectTimeout.current = setTimeout(() => {
            shouldReconnect.current = true;
            connect();
        }, 1000);
    }, [connect, disconnect]);

    const sendStartMaintenanceNotification = useCallback(
        (startTime?: string, endTime?: string) => {
            if (ws.current && isConnected) {
                const message = {
                    type: "SEND_NOTIFICATION",
                    notificationType: "start_maintenance",
                    startTime:
                        startTime ||
                        new Date(
                            new Date().getTime() + 2 * 60 * 1000,
                        ).toISOString(),
                    endTime:
                        endTime ||
                        new Date(
                            new Date().getTime() + 5 * 60 * 1000,
                        ).toISOString(),
                };
                ws.current.send(JSON.stringify(message));
            }
        },
        [isConnected],
    );

    const sendEndMaintenanceNotification = useCallback(() => {
        if (ws.current && isConnected) {
            const message = {
                type: "SEND_NOTIFICATION",
                notificationType: "end_maintenance",
            };
            ws.current.send(JSON.stringify(message));
        }
    }, [isConnected]);

    const sendGetActiveUsersRequest = useCallback(() => {
        if (ws.current && isConnected) {
            const message = {
                type: "GET_ACTIVE_USERS",
            };
            ws.current.send(JSON.stringify(message));
        }
    }, [isConnected]);

    useEffect(() => {
        shouldReconnect.current = true;
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return (
        <WebSocketContext.Provider
            value={{
                isConnected,
                reloadConnection,
                sendStartMaintenanceNotification,
                sendEndMaintenanceNotification,
                sendGetActiveUsersRequest,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

const StartMaintenanceProgressBar = ({ duration }: { duration: number }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const decrement = 100 / (duration / 100);
                return Math.max(0, prev - decrement);
            });
        }, 100);

        return () => clearInterval(interval);
    }, [duration]);

    return (
        <div
            className={`absolute bottom-0 left-0 right-0 h-1 bg-transparent ${progress === 0 ? "hidden" : ""}`}
        >
            <div
                className="h-full bg-red-700 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

const EndMaintenanceProgressBar = ({ duration }: { duration: number }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const decrement = 100 / (duration / 100);
                return Math.max(0, prev - decrement);
            });
        }, 100);

        return () => clearInterval(interval);
    }, [duration]);

    return (
        <div
            className={`absolute bottom-0 left-0 right-0 h-1 bg-transparent ${progress === 0 ? "hidden" : ""}`}
        >
            <div
                className="h-full bg-green-700 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};
