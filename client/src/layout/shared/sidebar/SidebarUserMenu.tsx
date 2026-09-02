import { useTheme } from "@/components/theme-provider";
import { useCallback } from "react";
import { AuthApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { useUser } from "@/stores/useUserStore";
import { useRole } from "@/hooks/useRole";
import { useNavigate } from "react-router";
import { useWebSocket } from "@/contexts/webSocket";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  MenuPanel,
  MenuItem,
  MenuTrigger,
  MenuGroup,
  MenuSeparator,
} from "@/components/animate-ui/components/base/menu";
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
  Info,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDialog } from "@/contexts/dialog";
import LanguageButton from "./components/LanguageButton";
import { useTranslation } from "react-i18next";
import InfoDialog from "./components/InfoDialog";

export default function SidebarUserMenu() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { state, setOpenMobile } = useSidebar();
  const user = useUser((s) => s.user);
  const clearUser = useUser((s) => s.clearUser);
  const { role } = useRole();
  const reloadConnection = useWebSocket((s) => s.reloadConnection);
  const openDialog = useDialog((s) => s.openDialog);
  const { t } = useTranslation();

  const handleLogout = useCallback(async () => {
    setOpenMobile(false);
    const promise = AuthApi.Logout();
    toast.promise(promise, {
      loading: t("notification.auth.logout.pending"),
      success: () => {
        clearUser();
        navigate("/login");
        reloadConnection();
        return t("notification.auth.logout.success");
      },
      error: t("notification.auth.logout.error"),
    });
  }, [navigate, reloadConnection, clearUser, t, setOpenMobile]);

  const handleInfo = useCallback(async () => {
    setOpenMobile(false);
    openDialog({
      title: t("dialog.info.title"),
      description: t("dialog.info.description"),
      size: "xl",
      content: <InfoDialog />,
      showCloseButton: true,
    });
  }, [openDialog, t]);

  return (
    <SidebarGroup className="p-0!">
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <Menu>
              <Tooltip disableHoverablePopup>
                <TooltipTrigger
                  render={(props) => (
                    <MenuTrigger
                      {...props}
                      render={(props) => (
                        <SidebarMenuButton
                          {...props}
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
                              {user?.username?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium select-none">
                              {user?.username}
                            </span>
                            <span className="text-muted-foreground truncate text-xs select-none">
                              {t(
                                `user.role.${UserRole[(role ?? 0) as UserRoleType]}`,
                              )}
                            </span>
                          </div>
                          <EllipsisVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                      )}
                    />
                  )}
                />
                <TooltipContent side="right" hidden={state !== "collapsed"}>
                  {t("sidebar.footer.account.label")}
                </TooltipContent>
              </Tooltip>
              <MenuPanel
                side="right"
                align="end"
                sideOffset={4}
                className="overflow-hidden"
              >
                <MenuGroup>
                  <MenuItem
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
                      {theme === "dark"
                        ? t("sidebar.footer.account.theme.light")
                        : t("sidebar.footer.account.theme.dark")}
                    </span>
                  </MenuItem>

                  <LanguageButton />
                </MenuGroup>

                <MenuSeparator />

                <MenuItem onClick={handleInfo}>
                  <Info className="text-inherit bg-inherit select-none" />
                  <span>{t("sidebar.footer.info.label")}</span>
                </MenuItem>

                <MenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="justify-start!"
                >
                  <LogOut className="text-inherit bg-inherit select-none" />
                  <span>{t("sidebar.footer.account.logout")}</span>
                </MenuItem>
              </MenuPanel>
            </Menu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}