import { Outlet, useLocation } from "react-router";
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
import { NonSystemAdminOnly, SystemAdminOnly } from "./auth/RoleGuard";
import Admin from "./admin/Admin";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    sendRefreshEvent();
  }, [location]);

  return (
    <div className="selection:bg-foreground selection:text-background">
      <NonSystemAdminOnly>
        <FloatingButton />
      </NonSystemAdminOnly>
      <BreadcrumbProvider>
        <SidebarProvider>
          <HksSidebar />
          <SidebarInset className="h-[calc(100dvh-1rem)] overflow-hidden relative">
            <MaintenanceBanner />
            <SystemAdminOnly>
              <Admin />
            </SystemAdminOnly>
            <NonSystemAdminOnly>
              <Header />
              <Outlet />
            </NonSystemAdminOnly>
          </SidebarInset>
        </SidebarProvider>
      </BreadcrumbProvider>
    </div>
  );
}
