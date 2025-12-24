import { Outlet, useNavigation } from "react-router";
import { ConfigProvider } from "@/contexts/config";
import { UserProvider } from "@/contexts/user";
import { DialogProvider } from "@/contexts/dialog";
import { WebSocketProvider } from "@/contexts/webSocket";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { StrictMode } from "react";
import { Spinner } from "./components/ui/spinner";
import { Check, CircleX, Info, TriangleAlert, X } from "lucide-react";

export default function Root() {
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";

    return (
        <StrictMode>
            <ConfigProvider>
                <UserProvider>
                    <WebSocketProvider url={import.meta.env.VITE_WEBSOCKET_URL}>
                        <ThemeProvider
                            defaultTheme="light"
                            storageKey="comma-theme"
                        >
                            <DialogProvider>
                                <Toaster
                                    richColors
                                    closeButton
                                    position="top-right"
                                    className="select-none"
                                    icons={{
                                        loading: <Spinner />,
                                        success: <Check size={16} />,
                                        error: <CircleX size={16} />,
                                        info: <Info size={16} />,
                                        warning: <TriangleAlert size={16} />,
                                        close: <X size={12} />,
                                    }}
                                />
                                {isLoading ? <Spinner /> : <Outlet />}
                            </DialogProvider>
                        </ThemeProvider>
                    </WebSocketProvider>
                </UserProvider>
            </ConfigProvider>
        </StrictMode>
    );
}
