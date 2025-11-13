import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarContent,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
  SidebarGroupLabel,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWebSocket } from "@/contexts/webSocket";
import { AuthApi } from "@/lib/api";
import {
  RoleBackgrounds,
  RoleColors,
  UserRole,
  type RoleBackgroundType,
  type RoleColorType,
  type UserRoleType,
} from "@/lib/enums";
import {
  EllipsisVertical,
  LogOut,
  Moon,
  Sun,
  UsersRound,
  Construction,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import { useDialog } from "@/contexts/dialog";
import { useTheme } from "@/components/theme-provider";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/contexts/user";
import { useRole } from "@/hooks/useRole";
import { useConfig } from "@/contexts/config";
import MaintenanceDialog from "@/layout/shared/dialog/MaintenanceDialog";

export default function SystemAdminSidebar() {
  const navigate = useNavigate();
  const { user, clearUser } = useUser();
  const { role } = useRole();
  const { openDialog } = useDialog();
  const { state } = useSidebar();
  const { reloadConnection, sendGetActiveUsersRequest } = useWebSocket();
  const { theme, setTheme } = useTheme();
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

  const handleLogout = useCallback(async () => {
    const promise = AuthApi.Logout();
    toast.promise(promise, {
      loading: "Çıkış yapılıyor...",
      success: () => {
        clearUser();
        navigate("/login");
        reloadConnection();
        return "Çıkış başarılı!";
      },
      error: "Çıkış yapılırken bir hata oluştu",
    });
  }, [navigate, reloadConnection, clearUser]);

  const [logoFilter, setLogoFilter] = useState("brightness(100) invert(0)");

  useEffect(() => {
    if (theme === "dark") {
      setLogoFilter("brightness(0) invert(1)");
    } else {
      setLogoFilter("brightness(1) invert(0)");
    }
  }, [theme]);

  return (
    <Sidebar className="no-print" variant="inset" collapsible="icon">
      <SidebarRail className={state === "collapsed" ? "w-2" : "w-4"} />
      <SidebarHeader>
        <NavLink
          to="/"
          onClick={() => sessionStorage.setItem("current_page", "Genel Bakış")}
          className="hover:scale-105 active:scale-100 transition-transform block w-full"
        >
          <AnimatePresence mode="wait">
            {state === "collapsed" ? (
              <motion.img
                key="icon"
                src="/hks-icon.png"
                alt="HKS.IO Logo"
                className="h-8 w-auto mx-auto clip mt-1"
                initial={{
                  opacity: 0,
                  x: 0,
                  scale: 1.2,
                  filter: `blur(4px) ${logoFilter}`,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  filter: `blur(0px) ${logoFilter}`,
                }}
                exit={{
                  opacity: 0,
                  x: -30,
                  scale: 0.8,
                  filter: `blur(4px) ${logoFilter}`,
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              />
            ) : (
              <motion.img
                key="logo"
                src="/hks-logo.png"
                alt="HKS.IO Logo"
                className="h-8 w-auto mx-auto clip mt-1"
                initial={{
                  opacity: 0,
                  x: 0,
                  scale: 1.2,
                  filter: `blur(4px) ${logoFilter}`,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  filter: `blur(0px) ${logoFilter}`,
                }}
                exit={{
                  opacity: 0,
                  x: -30,
                  scale: 0.8,
                  filter: `blur(4px) ${logoFilter}`,
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              />
            )}
          </AnimatePresence>
        </NavLink>
      </SidebarHeader>
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
      <SidebarFooter>
        <SidebarGroup className="!p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <DropdownMenu>
                  <Tooltip
                    disableHoverableContent
                    open={state === "collapsed" ? undefined : false}
                  >
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          size="lg"
                          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                          <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarFallback
                              className={`
                                                      h-8 w-8 rounded-lg select-none
                                              ${RoleBackgrounds[(role ?? 0) as RoleBackgroundType]}
                                              ${RoleColors[(role ?? 0) as RoleColorType]}
                                              `}
                            >
                              {user?.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium select-none">
                              {user?.username}
                            </span>
                            <span className="text-muted-foreground truncate text-xs select-none">
                              {UserRole[(role ?? 0) as UserRoleType]}
                            </span>
                          </div>
                          <EllipsisVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right">Hesap Ayarları</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent side="right" align="end" sideOffset={4}>
                    <DropdownMenuItem
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      {theme === "dark" ? (
                        <Sun className="text-inherit bg-inherit select-none" />
                      ) : (
                        <Moon className="text-inherit bg-inherit select-none" />
                      )}
                      <span>
                        {theme === "dark" ? "Açık Tema" : "Koyu Tema"}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      variant="destructive"
                      className="!justify-start"
                    >
                      <LogOut className="text-inherit bg-inherit select-none" />
                      <span>Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
