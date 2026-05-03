import {
  CompanyAdminOnly,
  NonSystemAdminOnly,
  SystemAdminOnly,
} from "@/layout/auth/RoleGuard";
import NonSystemAdminSidebarContent from "./NonSystemAdminSidebar";
import SystemAdminSidebarContent from "./SystemAdminSidebar";
import { useTheme } from "@/components/theme-provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { useUser } from "@/contexts/user";
import { useRole } from "@/hooks/useRole";
import { NavLink, useLocation, useNavigate } from "react-router";
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
  Building2,
  EllipsisVertical,
  Info,
  LogOut,
  Moon,
  Settings,
  Sun,
  //UsersRound,
  Wrench,
  Bell,
} from "lucide-react";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import { AnimatePresence, motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CompanyApi } from "@/lib/api/company";
import CompanyDetailsDialog from "../dialog/CompanyDetails/CompanyDetailsDialog";
import { useDialog } from "@/contexts/dialog";
import { Logger } from "@/lib/utils/logger";
import InfoDialog from "./components/InfoDialog";
import LanguageButton from "./components/LanguageButton";
import { useTranslation } from "react-i18next";
import UserSettingsDialog from "../dialog/UserSettingsDialog";
import PageSettingsDialog from "../dialog/PageSettingsDialog";
import UpcomingDueDates from "@/layout/dashboard/components/UpcomingDueDates";
import { CommaImage } from "@/components/shared/CommaImage";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpcomingDueDates } from "@/hooks/use-upcoming-due-dates";

export default function CommaSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const user = useUser((s) => s.user);
  const clearUser = useUser((s) => s.clearUser);
  const { role } = useRole();
  const reloadConnection = useWebSocket((s) => s.reloadConnection);
  const openDialog = useDialog((s) => s.openDialog);
  const { t } = useTranslation();
  const { data: upcomingDueDates = [] } = useUpcomingDueDates();

  const upcomingPaymentsCount = upcomingDueDates.length;

  const handleLogout = useCallback(async () => {
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
  }, [navigate, reloadConnection, clearUser, t]);

  const [logoFilter, setLogoFilter] = useState("brightness(100) invert(0)");
  const [logos, setLogos] = useState<{
    smallLogo: string;
    largeLogo: string;
  }>({
    smallLogo: "",
    largeLogo: "",
  });
  const [cacheBuster, setCacheBuster] = useState<number>(() => Date.now());
  const logoSrc = useMemo(
    () => ({
      small: logos.smallLogo
        ? `${import.meta.env.VITE_API_URL}${logos.smallLogo}?t=${cacheBuster}`
        : "/icon.webp",
      large: logos.largeLogo
        ? `${import.meta.env.VITE_API_URL}${logos.largeLogo}?t=${cacheBuster}`
        : "/logo.webp",
    }),
    [logos.largeLogo, logos.smallLogo, cacheBuster],
  );

  const fetchLogos = useCallback(async () => {
    try {
      const response = await CompanyApi.GetLogos();
      if (response.success) {
        setLogos(response.data);
      }
    } catch (error) {
      Logger.error("Şirket logoları alınırken bir hata oluştu:", error);
    }
  }, []);

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

  const handleSettings = useCallback(() => {
    openDialog({
      title: t("dialog.settings.title"),
      description: t("dialog.settings.description"),
      size: "lg",
      content: <UserSettingsDialog />,
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

  useEffect(() => {
    if (theme === "dark") {
      setLogoFilter("brightness(0) invert(1)");
    } else {
      setLogoFilter("brightness(1) invert(0)");
    }
  }, [theme]);

  useEffect(() => {
    fetchLogos();
    window.addEventListener("logo:refresh", fetchLogos);
    return () => {
      window.removeEventListener("logo:refresh", fetchLogos);
    };
  }, [fetchLogos]);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setCacheBuster(Date.now());
      },
      4 * 60 * 60 * 1000,
    ); // 4 hours

    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar className="no-print" variant="inset" collapsible="icon">
      <SidebarRail className="w-3" />
      <SidebarHeader>
        <NavLink
          to="/"
          onClick={(e) => {
            if (location.pathname === "/") {
              e.preventDefault();
            }
          }}
          className="hover:scale-105 active:scale-100 transition-transform flex items-center justify-center w-full h-9"
        >
          <AnimatePresence mode="wait">
            {state === "collapsed" ? (
              <motion.div
                key="icon"
                className="h-full w-auto mx-auto"
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
                transition={{
                  duration: 0.25,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <CommaImage
                  src={logoSrc.small}
                  alt="Comma Logo"
                  containerClassName="h-full w-auto"
                  className="object-contain"
                  loading="eager"
                />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                className="h-full w-auto mx-auto"
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
                transition={{
                  duration: 0.25,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <CommaImage
                  src={logoSrc.large}
                  alt="Comma Logo"
                  containerClassName="h-full w-auto"
                  className="object-contain"
                  loading="eager"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>
      </SidebarHeader>

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

                    <MenuItem onClick={handleSettings}>
                      <Settings className="text-inherit bg-inherit select-none" />
                      <span>{t("sidebar.footer.account.settings")}</span>
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
      </SidebarFooter>
    </Sidebar>
  );
}
