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
import { useConfig } from "@/contexts/config";
import MaintenanceDialog from "@/layout/shared/dialog/MaintenanceDialog";

export default function SystemAdminSidebarContent() {
  const { openDialog } = useDialog();
  const { state } = useSidebar();
  const { sendGetActiveUsersRequest } = useWebSocket();

  const { configs } = useConfig();

  const handleToggleMaintenance = useCallback(async () => {
    openDialog({
      title:
        configs?.maintenanceMode === "active"
          ? "Planlı Bakımı Bitir"
          : "Planlı Bakım Başlat",
      description:
        configs?.maintenanceMode === "active"
          ? "Bakımı sonlandırmak istediğinize emin misiniz?"
          : "Sistemi bakım moduna almak istediğinize emin misiniz? Bu işlem tüm kullanıcıların sistemden çıkış yapmasına neden olacaktır.",
      size: "md",
      content: <MaintenanceDialog />,
      showCloseButton: true,
    });
  }, [configs?.maintenanceMode, openDialog]);
  const handleGetActiveUsers = useCallback(() => {
    sendGetActiveUsersRequest();
  }, [sendGetActiveUsersRequest]);

  return (
    <SidebarContent className="gap-0">
      <SidebarGroup>
        <SidebarGroupLabel className="!w-full whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="w-full whitespace-nowrap overflow-hidden text-ellipsis select-none">
            Admin Eylemleri
          </span>
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu>
            <Tooltip
              disableHoverableContent
              open={state === "collapsed" ? undefined : false}
            >
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  onClick={handleToggleMaintenance}
                  className="!justify-start"
                >
                  <Construction className="text-inherit bg-inherit select-none" />
                  <span>Bakım Modu</span>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right">Bakım Modu</TooltipContent>
            </Tooltip>
            <Tooltip
              disableHoverableContent
              open={state === "collapsed" ? undefined : false}
            >
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  onClick={handleGetActiveUsers}
                  className="!justify-start"
                >
                  <UsersRound className="text-inherit bg-inherit select-none" />
                  <span>Aktif Kullanıcılar</span>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right">Aktif Kullanıcılar</TooltipContent>
            </Tooltip>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
