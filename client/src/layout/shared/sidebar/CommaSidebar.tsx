import {
  CompanyAdminOnly,
  NonSystemAdminOnly,
  SystemAdminOnly,
} from "@/layout/auth/RoleGuard";
import NonSystemAdminSidebarContent from "./NonSystemAdminSidebar";
import SystemAdminSidebarContent from "./SystemAdminSidebar";
import { useCallback } from "react";
import {
  Building2,
  Info,
  Settings,
  Wrench,
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
import CompanyDetailsDialog from "../dialog/CompanyDetails/CompanyDetailsDialog";
import { useDialog } from "@/contexts/dialog";
import InfoDialog from "./components/InfoDialog";
import { useTranslation } from "react-i18next";
import PageSettingsDialog from "../dialog/PageSettingsDialog";
import UpcomingDueDates from "@/layout/dashboard/components/UpcomingDueDates";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpcomingDueDates } from "@/hooks/use-upcoming-due-dates";
import {
  Menu,
  MenuPanel,
  MenuItem,
  MenuTrigger,
} from "@/components/animate-ui/components/base/menu";
import SidebarHeader from "./SidebarHeader";
import SidebarUserMenu from "./SidebarUserMenu";

export default function CommaSidebar() {
  const { state } = useSidebar();
  const openDialog = useDialog((s) => s.openDialog);
  const { t } = useTranslation();
  const { data: upcomingDueDates = [] } = useUpcomingDueDates();

  const upcomingPaymentsCount = upcomingDueDates.length;

  const handleCompanyDetails = useCallback(async () => {
    openDialog({
      title: t("dialog.accountDetails.title"),
      description: t("dialog.accountDetails.description"),
      size: "3xl",
      content: <CompanyDetailsDialog />,
      showCloseButton: true,
    });
  }, [openDialog, t]);

  const handleInfo = useCallback(async () => {
    openDialog({
      title: t("dialog.info.title"),
      description: t("dialog.info.description"),
      size: "xl",
      content: <InfoDialog />,
      showCloseButton: true,
    });
  }, [openDialog, t]);

  const handlePageSettings = useCallback(() => {
    openDialog({
      title: t("sidebar.pageSettings.label"),
      description: t("sidebar.pageSettings.description"),
      size: "md",
      content: <PageSettingsDialog />,
      showCloseButton: true,
    });
  }, [openDialog, t]);

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
        {/* Page Settings */}
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <SidebarMenuButton {...props} onClick={handlePageSettings}>
                    <Settings />
                    <span className="select-none">
                      {t("sidebar.pageSettings.label")}
                    </span>
                  </SidebarMenuButton>
                )}
              />
              <TooltipContent side="right" hidden={state !== "collapsed"}>
                {t("sidebar.pageSettings.label")}
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
        <CompanyAdminOnly>
          <SidebarMenu>
            <SidebarMenuItem>
              <Menu>
                <Tooltip disableHoverablePopup>
                  <TooltipTrigger
                    render={(props) => (
                      <MenuTrigger
                        {...props}
                        render={(props) => (
                          <SidebarMenuButton {...props}>
                            <Wrench />
                            <span className="select-none">
                              {t("sidebar.footer.companyManagement.label")}
                            </span>
                          </SidebarMenuButton>
                        )}
                      />
                    )}
                  />
                  <TooltipContent side="right" hidden={state !== "collapsed"}>
                    {t("sidebar.footer.companyManagement.label")}
                  </TooltipContent>
                </Tooltip>
                <MenuPanel side="right" align="end" sideOffset={4}>
                  <MenuItem
                    onClick={handleCompanyDetails}
                    className="justify-start!"
                  >
                    <Building2 className="text-inherit bg-inherit select-none" />
                    <span>
                      {t(
                        "sidebar.footer.companyManagement.accountDetails.label",
                      )}
                    </span>
                  </MenuItem>
                </MenuPanel>
              </Menu>
            </SidebarMenuItem>
          </SidebarMenu>
        </CompanyAdminOnly>
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={(props) => (
              <SidebarMenu {...props}>
                <SidebarMenuButton onClick={handleInfo}>
                  <Info />
                  <span className="select-none">
                    {t("sidebar.footer.info.label")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenu>
            )}
          ></TooltipTrigger>
          <TooltipContent side="right" hidden={state !== "collapsed"}>
            {t("sidebar.footer.info.label")}
          </TooltipContent>
        </Tooltip>

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
