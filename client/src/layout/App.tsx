import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { sendRefreshEvent } from "@/lib/utils";
// import addButton from "@/layout/shared/addButton";
import MaintenanceBanner from "@/layout/shared/MaintenanceBanner";
import CommaSidebar from "@/layout/shared/sidebar/CommaSidebar";
import Header from "@/layout/shared/header/Header";
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
    <div className="selection:bg-foreground selection:text-background">
      {/*<NonSystemAdminOnly>
      </NonSystemAdminOnly>*/}
      <SidebarProvider>
        <CommaSidebar />
        <SidebarInset className="h-[calc(100dvh-1rem)] overflow-hidden relative ml-0!">
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
    </div>
  );
}
