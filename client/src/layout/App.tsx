import { Outlet, useLocation } from "react-router";
import { DialogProvider } from "@/contexts/DialogContext";
import { useEffect } from "react";
import { sendRefreshEvent } from "@/lib/utils";
import FloatingButton from "@/layout/shared/FloatingButton";
import MaintenanceBanner from "@/layout/shared/MaintenanceBanner";
import HksSidebar from "@/layout/shared/sidebar/HksSidebar";
import Header from "@/layout/shared/header/Header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/animate-ui/components/radix/sidebar";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    sendRefreshEvent();
  }, [location]);

  return (
    <div className="selection:bg-foreground selection:text-background">
      <DialogProvider>
        <FloatingButton />
        <SidebarProvider>
          <HksSidebar />
          <SidebarInset className="h-[calc(100dvh-1rem)] overflow-hidden relative">
            <MaintenanceBanner />
            <Header />
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </DialogProvider>
    </div>
  );
}
