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
  User,
  Building2,
  Palette,
} from "lucide-react";
import { TR, US } from "country-flag-icons/react/3x2";
import { Button } from "@/components/ui/button";
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
  const { state, setOpenMobile, isMobile } = useSidebar();
  const user = useUser((s) => s.user);
  const clearUser = useUser((s) => s.clearUser);
  const { role } = useRole();
  const reloadConnection = useWebSocket((s) => s.reloadConnection);
  const openDialog = useDialog((s) => s.openDialog);
  const { t, i18n } = useTranslation();

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
  }, [openDialog, t, setOpenMobile]);

  const handleNavSettings = useCallback(
    (tab?: string) => {
      setOpenMobile(false);
      navigate(tab ? `/ayarlar?tab=${tab}` : "/ayarlar");
    },
    [navigate, setOpenMobile],
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 pt-1">
        {/* Mobile User Profile Card */}
        <div
          onClick={() => handleNavSettings("hesap")}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-sidebar-accent/50 border border-sidebar-border hover:bg-sidebar-accent active:scale-[0.98] transition-all cursor-pointer"
        >
          <Avatar className="h-10 w-10 rounded-xl shrink-0">
            <AvatarFallback
              className={`
                h-10 w-10 rounded-xl select-none font-semibold text-sm
                ${RoleBackgrounds[(role ?? 0) as RoleBackgroundType]}
                ${RoleColors[(role ?? 0) as RoleColorType]}
              `}
            >
              {user?.username?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight min-w-0">
            <span className="truncate font-semibold text-sm text-foreground">
              {user?.username}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {t(`user.role.${UserRole[(role ?? 0) as UserRoleType]}`)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleNavSettings();
            }}
          >
            <User className="size-4" />
          </Button>
        </div>

        {/* Mobile Quick Action Buttons Bar */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-sidebar-accent/30 border border-sidebar-border/50">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex flex-col items-center justify-center h-12 p-1 gap-1 text-[10px] text-muted-foreground hover:text-foreground rounded-lg"
            title={theme === "dark" ? t("sidebar.footer.account.theme.light") : t("sidebar.footer.account.theme.dark")}
          >
            {theme === "dark" ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4" />}
            <span className="leading-none text-[10px] font-medium">{theme === "dark" ? "Açık" : "Koyu"}</span>
          </Button>

          {/* Language Toggle with Flag */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const nextLang = i18n.language?.startsWith("tr") ? "en" : "tr";
              i18n.changeLanguage(nextLang);
            }}
            className="flex flex-col items-center justify-center h-12 p-1 gap-1 text-[10px] text-muted-foreground hover:text-foreground rounded-lg"
            title={t("sidebar.footer.account.language")}
          >
            <div className="w-5 h-3.5 overflow-hidden rounded-[2px] inline-flex items-center justify-center border border-border/50 shadow-2xs shrink-0">
              {i18n.language?.startsWith("tr") ? (
                <TR className="w-full h-full object-cover" />
              ) : (
                <US className="w-full h-full object-cover" />
              )}
            </div>
            <span className="leading-none text-[10px] uppercase font-bold text-foreground">
              {i18n.language?.startsWith("tr") ? "TR" : "EN"}
            </span>
          </Button>

          {/* Info Dialog */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInfo}
            className="flex flex-col items-center justify-center h-12 p-1 gap-1 text-[10px] text-muted-foreground hover:text-foreground rounded-lg"
            title={t("sidebar.footer.info.label")}
          >
            <Info className="size-4" />
            <span className="leading-none text-[10px] font-medium">Bilgi</span>
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center h-12 p-1 gap-1 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-500/10 dark:text-red-400 rounded-lg"
            title={t("sidebar.footer.account.logout")}
          >
            <LogOut className="size-4" />
            <span className="leading-none text-[10px] font-medium">{t("sidebar.footer.account.logout")}</span>
          </Button>
        </div>
      </div>
    );
  }

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
                side={isMobile ? "top" : "right"}
                align={isMobile ? "start" : "end"}
                sideOffset={8}
                className="overflow-hidden w-60"
              >
                <MenuGroup>
                  <MenuItem onClick={() => handleNavSettings("hesap")}>
                    <User className="text-inherit bg-inherit select-none" />
                    <span>{t("settings.tabs.account")}</span>
                  </MenuItem>
                  <MenuItem onClick={() => handleNavSettings("sirket")}>
                    <Building2 className="text-inherit bg-inherit select-none" />
                    <span>{t("settings.tabs.company")}</span>
                  </MenuItem>
                  <MenuItem onClick={() => handleNavSettings("gorunum")}>
                    <Palette className="text-inherit bg-inherit select-none" />
                    <span>{t("settings.tabs.appearance")}</span>
                  </MenuItem>
                </MenuGroup>

                <MenuSeparator />

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