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
    <div className="selection:bg-foreground selection:text-background min-h-dvh flex flex-col bg-background">
      <SidebarProvider>
        <CommaSidebar />
        <SidebarInset className="min-h-dvh flex flex-col relative ml-0! max-w-full overflow-x-hidden md:h-[calc(100dvh-1rem)] md:overflow-hidden pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          <MaintenanceBanner />
          <CommaCommandPalette />
          <SystemAdminOnly>
            <Admin />
          </SystemAdminOnly>
          <NonSystemAdminOnly>
            <Header />
            <main className="flex-1 min-w-0 max-w-full flex flex-col overflow-x-hidden">
              <Outlet />
            </main>
            <MobileBottomNav />
          </NonSystemAdminOnly>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
