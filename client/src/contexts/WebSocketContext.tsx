import Cookies from "js-cookie";
import { TriangleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Logger } from "@/lib/utils/logger";
import { useConfig } from "./ConfigContext";
import { AuthApi } from "@/lib/api";
import { useNavigate } from "react-router";

interface WebSocketContextType {
    isConnected: boolean;
    reloadConnection: () => void;
    sendStartMaintenanceNotification: (startTime?: string, endTime?: string) => void;
    sendEndMaintenanceNotification: () => void;
    sendGetActiveUsersRequest: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: ReactNode;
    url: string;
}

const refreshTime = 5000; // 5 seconds

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
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-transparent ${progress === 0 ? "hidden" : ""}`}>
            <div
                className="h-full bg-green-700 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
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
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-transparent ${progress === 0 ? "hidden" : ""}`}>
            <div
                className="h-full bg-red-700 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export const WebSocketProvider = ({ children, url }: WebSocketProviderProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    const { refreshConfigs } = useConfig();
    const navigate = useNavigate();

    const connect = useCallback(() => {
        const token = Cookies.get("user_session");

        ws.current = new WebSocket(`${url}${token !== undefined ? `?token=${token}` : ''}`);

        ws.current.onopen = () => {
            setIsConnected(true);
            Logger.log("WebSocket connected on ", url);
        }

        ws.current.onclose = () => {
            setIsConnected(false);
            Logger.log("WebSocket disconnected");
            reconnectTimeout.current = setTimeout(() => {
                Logger.log("Reconnecting WebSocket...");
                connect();
            }, 3000);
        };

        ws.current.onerror = () => {
            ws.current?.close();
            setIsConnected(false);
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "NOTIFICATION":
                        const { title, body, notificationType, startTime, endTime } = data;

                        switch (notificationType) {
                            case "start_maintenance":
                                const start = startTime || `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;
                                const end = endTime || `${new Date(Date.now() + 300000).getHours().toString().padStart(2, '0')}:${new Date(Date.now() + 300000).getMinutes().toString().padStart(2, '0')}`;
                                refreshConfigs();
                                toast.error(title,
                                    {
                                        description: <>
                                            <span>{body} <br /><br /> {start && end && `Tahmini Bakım Aralığı: ${start} - ${end}`}</span>
                                            <StartMaintenanceProgressBar duration={60000} />
                                        </>,
                                        duration: 180000,
                                        icon: <TriangleAlert size={20} />,
                                        dismissible: false,
                                        closeButton: false,
                                        id: "maintenance_mode_toast",
                                        className: "relative overflow-hidden",
                                        classNames: {
                                            icon: "!mr-4"
                                        }
                                    });
                                setTimeout(() => {
                                    AuthApi.Logout().then(() => { navigate("/login"); });
                                }, 60000);
                                break;
                            case "end_maintenance":
                                refreshConfigs();
                                toast.dismiss("maintenance_mode_toast");
                                toast.success(title, {
                                    duration: refreshTime,
                                    closeButton: false,
                                    dismissible: false,
                                    description: <EndMaintenanceProgressBar duration={refreshTime} />,
                                    className: "relative overflow-hidden"
                                });
                                setTimeout(() => { window.location.reload(); }, refreshTime);
                                break;
                            default:
                                toast(title, { description: body });
                                break;
                        }
                        break;
                    case "ACTIVE_USERS":
                        toast.success(`Aktif Kullanıcı Sayısı: ${data.userCount}`, { duration: 5000 });
                        break;
                    default:
                        Logger.warn("Unknown message type:", data.type);
                }
            } catch (error) {
                Logger.error("Error parsing WebSocket message:", error);
            }
        };
    }, [url]);

    const disconnect = useCallback(() => {
        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
        }
        ws.current?.close();
    }, []);

    const reloadConnection = useCallback(() => {
        disconnect();
        reconnectTimeout.current = setTimeout(() => {
            connect();
        }, 1000);
    }, [connect, disconnect]);

    const sendStartMaintenanceNotification = useCallback((startTime?: string, endTime?: string) => {
        if (ws.current && isConnected) {
            const message = {
                type: "SEND_NOTIFICATION",
                title: "Planlı Bakım",
                body: "Planlı bakım çalışması nedeniyle otomatik olarak çıkış yapacaksınız. Lütfen yapılan işlemleri kaydedin.",
                notificationType: "start_maintenance",
                startTime: startTime || new Date(new Date().getTime() + 2 * 60 * 1000).toISOString(),
                endTime: endTime || new Date(new Date().getTime() + 5 * 60 * 1000).toISOString()
            };
            ws.current.send(JSON.stringify(message));
        }
    }, [isConnected]);

    const sendEndMaintenanceNotification = useCallback(() => {
        if (ws.current && isConnected) {
            const message = {
                type: "SEND_NOTIFICATION",
                title: `Sistem bakımı tamamlandı, ${refreshTime / 1000} saniye içinde sayfa yenilenecek.`,
                notificationType: "end_maintenance"
            };
            ws.current.send(JSON.stringify(message));
        }
    }, [isConnected]);

    const sendGetActiveUsersRequest = useCallback(() => {
        if (ws.current && isConnected) {
            const message = {
                type: "GET_ACTIVE_USERS"
            };
            ws.current.send(JSON.stringify(message));
        }
    }, [isConnected]);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return (
        <WebSocketContext.Provider value={{ isConnected, reloadConnection, sendStartMaintenanceNotification, sendEndMaintenanceNotification, sendGetActiveUsersRequest }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};