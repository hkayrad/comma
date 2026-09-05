import {
  SidebarGroup,
  SidebarContent,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWebSocket } from "@/contexts/webSocket";

import { UsersRound, Construction } from "lucide-react";
import { useDialog } from "@/contexts/dialog";
import { useCallback } from "react";
import { useConfig } from "@/stores/useConfigStore";
import MaintenanceDialog from "@/layout/shared/dialog/MaintenanceDialog";
import { useTranslation } from "react-i18next";

export default function SystemAdminSidebarContent() {
  const openDialog = useDialog((s) => s.openDialog);
  const { state, setOpenMobile } = useSidebar();
  const sendGetActiveUsersRequest = useWebSocket(
    (s) => s.sendGetActiveUsersRequest,
  );
  const { t } = useTranslation();

  const configs = useConfig((s) => s.configs);

  const handleToggleMaintenance = useCallback(async () => {
    setOpenMobile(false);
    openDialog({
      title:
        configs?.maintenanceMode === "active"
          ? t("dialog.maintenanceMode.end.title")
          : t("dialog.maintenanceMode.start.title"),
      description:
        configs?.maintenanceMode === "active"
          ? t("dialog.maintenanceMode.end.description")
          : t("dialog.maintenanceMode.start.description"),
      size: "md",
      content: <MaintenanceDialog />,
      showCloseButton: true,
    });
  }, [configs?.maintenanceMode, openDialog, t, setOpenMobile]);
  const handleGetActiveUsers = useCallback(() => {
    setOpenMobile(false);
    sendGetActiveUsersRequest();
  }, [sendGetActiveUsersRequest, setOpenMobile]);

  return (
    <SidebarContent className="gap-0">
      <SidebarGroup>
        <SidebarGroupLabel className="w-full! whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="w-full whitespace-nowrap overflow-hidden text-ellipsis select-none">
            {t("sidebar.sysAdmin.actions")}
          </span>
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu className="gap-1 md:gap-0.5">
            <Tooltip
              disableHoverablePopup
              open={state === "collapsed" ? undefined : false}
            >
              <TooltipTrigger
                render={(props) => (
                  <SidebarMenuButton
                    {...props}
                    onClick={handleToggleMaintenance}
                    className="h-11 md:h-8 text-sm font-medium rounded-xl md:rounded-lg px-3"
                  >
                    <Construction className="size-5 md:size-4 text-inherit bg-inherit select-none" />
                    <span>{t("sidebar.sysAdmin.actions.maintenanceMode")}</span>
                  </SidebarMenuButton>
                )}
              />
              <TooltipContent side="right">
                {t("sidebar.sysAdmin.actions.maintenanceMode")}
              </TooltipContent>
            </Tooltip>
            <Tooltip
              disableHoverablePopup
              open={state === "collapsed" ? undefined : false}
            >
              <TooltipTrigger
                render={(props) => (
                  <SidebarMenuButton
                    {...props}
                    onClick={handleGetActiveUsers}
                    className="h-11 md:h-8 text-sm font-medium rounded-xl md:rounded-lg px-3"
                  >
                    <UsersRound className="size-5 md:size-4 text-inherit bg-inherit select-none" />
                    <span>{t("sidebar.sysAdmin.actions.activeUsers")}</span>
                  </SidebarMenuButton>
                )}
              />
              <TooltipContent side="right">
                {t("sidebar.sysAdmin.actions.activeUsers")}
              </TooltipContent>
            </Tooltip>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
