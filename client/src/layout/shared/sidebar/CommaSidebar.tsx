import {
  NonSystemAdminOnly,
  SystemAdminOnly,
} from "@/layout/auth/RoleGuard";
import NonSystemAdminSidebarContent from "./NonSystemAdminSidebar";
import SystemAdminSidebarContent from "./SystemAdminSidebar";
import { useCallback } from "react";
import {
  Settings,
  Bell,
} from "lucide-react";
import {
  Sidebar,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import UpcomingDueDates from "@/layout/dashboard/components/UpcomingDueDates";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpcomingDueDates } from "@/hooks/use-upcoming-due-dates";
import SidebarHeader from "./SidebarHeader";
import SidebarUserMenu from "./SidebarUserMenu";

export default function CommaSidebar() {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { t } = useTranslation();
  const { data: upcomingDueDates = [] } = useUpcomingDueDates();

  const upcomingPaymentsCount = upcomingDueDates.length;

  const handleSettings = useCallback(() => {
    navigate("/ayarlar");
  }, [navigate]);

  return (
    <Sidebar className="no-print" variant="inset" collapsible="icon">
      <SidebarRail className="w-3" />
      <SidebarHeader />

      {/* SIDEBAR CONTENT */}
      <NonSystemAdminOnly>
        <NonSystemAdminSidebarContent />
      </NonSystemAdminOnly>
      <SystemAdminOnly>
        <SystemAdminSidebarContent />
      </SystemAdminOnly>
      {/* END SIDEBAR CONTENT */}

      <SidebarFooter>
        {/* Unified Settings */}
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <SidebarMenuButton {...props} onClick={handleSettings}>
                    <Settings />
                    <span className="select-none">
                      {t("sidebar.footer.account.settings")}
                    </span>
                  </SidebarMenuButton>
                )}
              />
              <TooltipContent side="right" hidden={state !== "collapsed"}>
                {t("sidebar.footer.account.settings")}
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Notifications button for upcoming due dates */}
        <Popover>
          <Tooltip disableHoverablePopup>
            <TooltipTrigger
              render={(props) => (
                <PopoverTrigger
                  {...props}
                  render={(popoverProps) => (
                    <SidebarMenuButton {...popoverProps}>
                      <div className="relative">
                        <Bell className="h-4 w-4" />
                        {upcomingPaymentsCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-sidebar" />
                        )}
                      </div>
                      <span className="select-none">
                        {t("dashboard.upcomingDueDates.title")}
                      </span>
                    </SidebarMenuButton>
                  )}
                />
              )}
            />
            <TooltipContent side="right" hidden={state !== "collapsed"}>
              {t("dashboard.upcomingDueDates.title")}
            </TooltipContent>
          </Tooltip>
          <PopoverContent side="right" align="end" className="w-80 p-0">
            <UpcomingDueDates />
          </PopoverContent>
        </Popover>

        <SidebarSeparator className="mx-0!" />

        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
