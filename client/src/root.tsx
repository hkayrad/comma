import { Outlet, useNavigation } from "react-router";
import { ConfigProvider } from "@/contexts/config";
import { UserProvider } from "@/contexts/user";
import { DialogProvider } from "@/contexts/dialog";
import { WebSocketProvider } from "@/contexts/webSocket";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { StrictMode } from "react";

export default function Root() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <StrictMode>
      <ConfigProvider>
        <UserProvider>
          <WebSocketProvider url={import.meta.env.VITE_WEBSOCKET_URL}>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <DialogProvider>
                <Toaster
                  richColors
                  closeButton
                  position="top-right"
                  className="select-none"
                />
                {isLoading ? <div>Loading...</div> : <Outlet />}
              </DialogProvider>
            </ThemeProvider>
          </WebSocketProvider>
        </UserProvider>
      </ConfigProvider>
    </StrictMode>
  );
}
