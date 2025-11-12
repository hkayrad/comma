import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
import { useConfig } from "@/contexts/config";
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
  BanknoteArrowDown,
  BanknoteArrowUp,
  Building2,
  Component,
  Construction,
  EllipsisVertical,
  LogOut,
  Moon,
  Scroll,
  ScrollText,
  ShieldUser,
  Sun,
  UsersRound,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import MaintenanceDialog from "@/layout/shared/dialog/MaintenanceDialog";
import { useDialog } from "@/contexts/dialog";
import HksSidebarItem from "./components/HksSidebarItem";
import { useTheme } from "@/components/theme-provider";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CompanyApi } from "@/lib/api/company";
import CompanyDetailsDialog from "@/layout/shared/dialog/CompanyDetails/CompanyDetailsDialog";
import { useUser } from "@/contexts/user";
import { AdminOnly } from "@/layout/auth/RoleGuard";
import { useRole } from "@/hooks/useRole";

export default function HksSidebar() {
  const navigate = useNavigate();
  const { user, clearUser } = useUser();
  const { role } = useRole();
  const { openDialog } = useDialog();
  const { state } = useSidebar();
  const { reloadConnection, sendGetActiveUsersRequest } = useWebSocket();
  const { configs } = useConfig();
  const { theme, setTheme } = useTheme();

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
      console.error("Şirket logoları alınırken bir hata oluştu:", error);
    }
  }, []);

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

  const handleCompanyDetails = useCallback(async () => {
    openDialog({
      title: "Şirket Detayları",
      description: "Şirket bilgilerinizi görüntüleyin ve düzenleyin.",
      size: "3xl",
      content: <CompanyDetailsDialog />,
      showCloseButton: true,
    });
  }, [openDialog]);

  const handleGetActiveUsers = useCallback(() => {
    sendGetActiveUsersRequest();
  }, [sendGetActiveUsersRequest]);

  const financialItems = useMemo(
    () => ({
      overview: {
        title: null,
        url: "",
        items: [
          {
            title: "Genel Bakış",
            url: "/",
            icon: Component,
          },
        ],
      },
      receivable: {
        title: "Alacak Bilgileri",
        url: "/alacaklar",
        items: [
          {
            title: "Alacaklar",
            url: "/borclar",
            icon: ScrollText,
          },
          {
            title: "Gelen Ödemeler",
            url: "/odemeler",
            icon: BanknoteArrowDown,
          },
        ],
      },
      payable: {
        title: "Borç Bilgileri",
        url: "/verecekler",
        items: [
          {
            title: "Borçlar",
            url: "/borclar",
            icon: Scroll,
          },
          {
            title: "Giden Ödemeler",
            url: "/odemeler",
            icon: BanknoteArrowUp,
          },
        ],
      },
      dev: {
        title: "TESTING",
        url: "",
        items: [
          {
            title: "Test Sayfası",
            url: "/dev",
            icon: Component,
          },
        ],
      },
    }),
    [],
  );

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
          className="hover:scale-105 active:scale-100 transition-transform block w-full"
        >
          <AnimatePresence mode="wait">
            {state === "collapsed" ? (
              <motion.img
                key="icon"
                src={logoSrc.small}
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
                src={logoSrc.large}
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
        {Object.entries(financialItems).map(
          ([key, group]) =>
            key !== "dev" && (
              <SidebarGroup key={key}>
                {group.title && (
                  <SidebarGroupLabel className="!w-full whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="w-full whitespace-nowrap overflow-hidden text-ellipsis select-none">
                      {group.title}
                    </span>
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <HksSidebarItem
                        key={item.title}
                        item={item}
                        group={group}
                        state={state}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ),
        )}
        {Object.entries(financialItems).map(
          ([key, group]) =>
            import.meta.env.VITE_NODE_ENV === "development" &&
            key === "dev" && (
              <SidebarGroup key={key}>
                {group.title && (
                  <SidebarGroupLabel className="!w-full whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="w-full whitespace-nowrap overflow-hidden text-ellipsis select-none">
                      {group.title}
                    </span>
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <HksSidebarItem
                        key={item.title}
                        item={item}
                        group={group}
                        state={state}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ),
        )}
      </SidebarContent>
      <SidebarFooter>
        <AdminOnly>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <Tooltip
                  disableHoverableContent
                  open={state === "collapsed" ? undefined : false}
                >
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton>
                        <ShieldUser />
                        <span className="select-none">Yönetici Araçları</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Yönetici Araçları
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent side="right" align="end" sideOffset={4}>
                  <DropdownMenuItem
                    onClick={handleToggleMaintenance}
                    className="!justify-start"
                  >
                    <Construction className="text-inherit bg-inherit select-none" />
                    <span>Bakım Modu</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleGetActiveUsers}
                    className="!justify-start"
                  >
                    <UsersRound className="text-inherit bg-inherit select-none" />
                    <span>Aktif Kullanıcılar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleCompanyDetails}
                    className="!justify-start"
                  >
                    <Building2 className="text-inherit bg-inherit select-none" />
                    <span>Şirket Detayları</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator className="!mx-0" />
        </AdminOnly>
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
