import {
  CompanyAdminOnly,
  NonSystemAdminOnly,
  SystemAdminOnly,
} from "@/layout/auth/RoleGuard";
import NonSystemAdminSidebarContent from "./NonSystemAdminSidebar";
import SystemAdminSidebarContent from "./SystemAdminSidebar";
import { useTheme } from "@/components/theme-provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthApi } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/contexts/user";
import { useRole } from "@/hooks/useRole";
import { NavLink, useNavigate } from "react-router";
import { useWebSocket } from "@/contexts/webSocket";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
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
  LogOut,
  Moon,
  Sun,
  UsersRound,
  Wrench,
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

export default function HksSidebar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const { user, clearUser } = useUser();
  const { role } = useRole();
  const { reloadConnection } = useWebSocket();
  const { openDialog } = useDialog();

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
  const [logos, setLogos] = useState<{ smallLogo: string; largeLogo: string }>({
    smallLogo: "",
    largeLogo: "",
  });
  const [cacheBuster, setCacheBuster] = useState<number>(Date.now());
  const logoSrc = useMemo(
    () => ({
      small: logos.smallLogo
        ? `${import.meta.env.VITE_API_URL}${logos.smallLogo}?t=${cacheBuster}`
        : "/hks-icon.png",
      large: logos.largeLogo
        ? `${import.meta.env.VITE_API_URL}${logos.largeLogo}?t=${cacheBuster}`
        : "/hks-logo.png",
    }),
    [logos.largeLogo, logos.smallLogo, cacheBuster],
  );

  const fetchLogos = useCallback(async () => {
    try {
      const response = await CompanyApi.GetLogos();
      if (response.success) {
        setLogos(response.data);
        setCacheBuster(Date.now());
      }
    } catch (error) {
      Logger.error("Şirket logoları alınırken bir hata oluştu:", error);
    }
  }, []);

  const handleCompanyDetails = useCallback(async () => {
    openDialog({
      title: "Hesap Detayları",
      description: "Hesap bilgilerinizi görüntüleyin ve düzenleyin.",
      size: "3xl",
      content: <CompanyDetailsDialog />,
      showCloseButton: true,
    });
  }, [openDialog]);

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

  return (
    <Sidebar className="no-print" variant="inset" collapsible="icon">
      <SidebarRail className={state === "collapsed" ? "w-2" : "w-4"} />
      <SidebarHeader>
        <NavLink
          to="/"
          onClick={() => sessionStorage.setItem("current_page", "Genel Bakış")}
          className="hover:scale-105 active:scale-100 transition-transform flex items-center justify-center w-full h-8"
        >
          <AnimatePresence mode="wait">
            {state === "collapsed" ? (
              <motion.img
                key="icon"
                src={logoSrc.small}
                alt="HKS.IO Logo"
                className="h-full mx-auto !bg-contain"
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
                src={logoSrc.large}
                alt="HKS.IO Logo"
                className="h-full w-auto mx-auto !bg-contain"
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

      {/* SIDEBAR CONTENT */}
      <NonSystemAdminOnly>
        <NonSystemAdminSidebarContent />
      </NonSystemAdminOnly>
      <SystemAdminOnly>
        <SystemAdminSidebarContent />
      </SystemAdminOnly>
      {/* END SIDEBAR CONTENT */}

      <SidebarFooter>
        <CompanyAdminOnly>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <Tooltip disableHoverableContent>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton>
                        <Wrench />
                        <span className="select-none">Yönetim</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right" hidden={state !== "collapsed"}>
                    Yönetim
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent side="right" align="end" sideOffset={4}>
                  {/*<DropdownMenuItem
                    onClick={() => {}}
                    className="!justify-start"
                  >
                    <UsersRound className="text-inherit bg-inherit select-none" />
                    <span>Kullanıcıları Düzenle</span>
                  </DropdownMenuItem>*/}
                  <DropdownMenuItem
                    onClick={handleCompanyDetails}
                    className="!justify-start"
                  >
                    <Building2 className="text-inherit bg-inherit select-none" />
                    <span>Hesap Detayları</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator className="!mx-0" />
        </CompanyAdminOnly>
        <SidebarGroup className="!p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <DropdownMenu>
                  <Tooltip disableHoverableContent>
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
                    <TooltipContent side="right" hidden={state !== "collapsed"}>
                      Hesap Ayarları
                    </TooltipContent>
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
