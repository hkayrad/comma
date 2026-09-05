import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { sendRefreshEvent } from "@/lib/utils";
// import addButton from "@/layout/shared/addButton";
import MaintenanceBanner from "@/layout/shared/MaintenanceBanner";
import CommaSidebar from "@/layout/shared/sidebar/CommaSidebar";
import Header from "@/layout/shared/header/Header";
import { CommaCommandPalette } from "@/layout/shared/CommaCommandPalette";
import MobileBottomNav from "@/layout/shared/navigation/MobileBottomNav";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/animate-ui/components/radix/sidebar";
import { NonSystemAdminOnly, SystemAdminOnly } from "./auth/RoleGuard";
import Admin from "./admin/Admin";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    sendRefreshEvent();
  }, [location]);

  return (
    <div className="selection:bg-foreground selection:text-background h-dvh max-h-dvh overflow-hidden flex flex-col bg-background">
      <SidebarProvider className="h-full min-h-0 max-h-dvh overflow-hidden">
        <CommaSidebar />
        <SidebarInset className="h-dvh max-h-dvh min-h-0 md:h-[calc(100dvh-1rem)] md:max-h-[calc(100dvh-1rem)] overflow-hidden flex flex-col relative ml-0! max-w-full pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          <MaintenanceBanner />
          <CommaCommandPalette />
          <SystemAdminOnly>
            <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
              <Admin />
            </div>
          </SystemAdminOnly>
          <NonSystemAdminOnly>
            <Header />
            <div className="flex-1 min-h-0 min-w-0 max-w-full flex flex-col overflow-hidden">
              <Outlet />
            </div>
            <MobileBottomNav />
          </NonSystemAdminOnly>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
