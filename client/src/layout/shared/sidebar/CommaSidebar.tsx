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
import { SyncStatus } from "./SyncStatus";

export default function CommaSidebar() {
  const navigate = useNavigate();
  const { state, setOpenMobile, isMobile } = useSidebar();
  const { t } = useTranslation();
  const { data: upcomingDueDates = [] } = useUpcomingDueDates();

  const upcomingPaymentsCount = upcomingDueDates.length;

  const handleSettings = useCallback(() => {
    setOpenMobile(false);
    navigate("/ayarlar");
  }, [navigate, setOpenMobile]);

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

      <SidebarFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-2">
        <SyncStatus />
        {/* Unified Settings */}
        <SidebarMenu className="gap-1 md:gap-0.5">
          <SidebarMenuItem>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <SidebarMenuButton {...props} onClick={handleSettings} className="h-11 md:h-8 text-sm font-medium rounded-xl md:rounded-lg px-3">
                    <Settings className="size-5 md:size-4 shrink-0" />
                    <span className="select-none flex-1 truncate">
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

          {/* Notifications button for upcoming due dates */}
          <SidebarMenuItem>
            <Popover>
              <Tooltip disableHoverablePopup>
                <TooltipTrigger
                  render={(props) => (
                    <PopoverTrigger
                      {...props}
                      render={(popoverProps) => (
                        <SidebarMenuButton {...popoverProps} className="h-11 md:h-8 text-sm font-medium rounded-xl md:rounded-lg px-3">
                          <div className="relative shrink-0">
                            <Bell className="size-5 md:size-4" />
                            {upcomingPaymentsCount > 0 && !isMobile && (
                              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-sidebar" />
                            )}
                          </div>
                          <span className="select-none flex-1 truncate">
                            {t("dashboard.upcomingDueDates.title")}
                          </span>
                          {upcomingPaymentsCount > 0 && isMobile && (
                            <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
                              {upcomingPaymentsCount}
                            </span>
                          )}
                        </SidebarMenuButton>
                      )}
                    />
                  )}
                />
                <TooltipContent side="right" hidden={state !== "collapsed"}>
                  {t("dashboard.upcomingDueDates.title")}
                </TooltipContent>
              </Tooltip>
              <PopoverContent
                side={isMobile ? "top" : "right"}
                align={isMobile ? "center" : "end"}
                sideOffset={8}
                className="w-[min(22rem,calc(100vw-2rem))] p-0 shadow-xl rounded-xl overflow-hidden"
              >
                <UpcomingDueDates />
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="mx-0!" />

        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
