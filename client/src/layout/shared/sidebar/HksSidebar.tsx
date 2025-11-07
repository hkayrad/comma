import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarSeparator, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfig } from "@/contexts/ConfigContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { AuthApi, useCurrentUser } from "@/lib/api"
import { RoleBackgrounds, RoleColors, UserRole, type RoleBackgroundType, type RoleColorType, type UserRoleType } from "@/lib/enums";
import { BanknoteArrowDown, BanknoteArrowUp, Component, Construction, EllipsisVertical, LogOut, Moon, Scroll, ScrollText, ShieldUser, Sun } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import MaintenanceDialog from "../dialog/MaintenanceDialog";
import { useDialog } from "@/contexts/DialogContext";
import HksSidebarItem from "./components/HksSidebarItem";
import { useTheme } from "@/components/theme-provider";

export default function HksSidebar() {
    const navigate = useNavigate();
    const user = useCurrentUser();
    const { openDialog } = useDialog();
    const { state } = useSidebar();
    const { reloadConnection } = useWebSocket();
    const { configs } = useConfig();
    const { theme, setTheme } = useTheme();

    const handleLogout = async () => {
        const promise = AuthApi.Logout();
        toast.promise(promise, {
            loading: "Çıkış yapılıyor...",
            success: () => {
                navigate("/login");
                reloadConnection();
                return "Çıkış başarılı!";
            },
            error: "Çıkış yapılırken bir hata oluştu"
        });
    }

    const handleToggleMaintenance = async () => {
        openDialog({
            title: configs?.maintenanceMode === "active" ? "Planlı Bakımı Bitir" : "Planlı Bakım Başlat",
            description: configs?.maintenanceMode === "active" ? "Bakımı sonlandırmak istediğinize emin misiniz?" : "Sistemi bakım moduna almak istediğinize emin misiniz? Bu işlem tüm kullanıcıların sistemden çıkış yapmasına neden olacaktır.",
            size: "md",
            content: <MaintenanceDialog />,
            showCloseButton: true,
        });
    }

    const financialItems = {
        overview: {
            title: null,
            url: "",
            items: [
                {
                    title: "Genel Bakış",
                    url: "/",
                    icon: Component,
                },
            ]
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
            ]
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
            ]
        }
    }

    return (
        <Sidebar
            className="no-print"
            variant="inset"
            collapsible="icon"
        >
            <SidebarContent>
                <SidebarRail />
                {
                    Object.entries(financialItems).map(([key, group]) => (
                        <SidebarGroup key={key}>
                            {
                                group.title && (
                                    <SidebarGroupLabel className="!w-full whitespace-nowrap overflow-hidden text-ellipsis">
                                        <span className="w-full whitespace-nowrap overflow-hidden text-ellipsis select-none">
                                            {group.title}
                                        </span>
                                    </SidebarGroupLabel>
                                )
                            }
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <HksSidebarItem key={item.title} item={item} group={group} state={state} />
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))
                }
            </SidebarContent>
            <SidebarFooter>
                {
                    user?.role === 1 && (
                        <>
                            <SidebarMenu>

                                <SidebarMenuItem>
                                    <DropdownMenu>
                                        <Tooltip
                                            disableHoverableContent
                                            open={state === "collapsed" ? undefined : false}>
                                            <TooltipTrigger asChild>
                                                <DropdownMenuTrigger asChild>
                                                    <SidebarMenuButton onClick={handleToggleMaintenance}>
                                                        <ShieldUser />
                                                        <span className="select-none">Yönetici Araçları</span>
                                                    </SidebarMenuButton>
                                                </DropdownMenuTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                Yönetici Araçları
                                            </TooltipContent>
                                        </Tooltip>
                                        <DropdownMenuContent
                                            side="right"
                                            align="end"
                                            sideOffset={4}
                                        >
                                            <DropdownMenuItem
                                                onClick={handleToggleMaintenance}
                                                className="!justify-start">
                                                <Construction className="text-inherit bg-inherit select-none" />
                                                <span>Bakım Modu</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            </SidebarMenu>
                            <SidebarSeparator className="!mx-0" />
                        </>
                    )
                }
                <SidebarGroup className="!p-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            {/* <Tooltip
                                disableHoverableContent
                                open={state === "collapsed" ? undefined : false}>
                                <TooltipTrigger asChild>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={toggleSidebar}>
                                            {state === "expanded" ? <SidebarCloseIcon /> : <SidebarOpenIcon />}
                                            <span className="select-none">Kenarlığı Küçült</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    Kenarlığı Büyüt
                                </TooltipContent>
                            </Tooltip>
                            <SidebarSeparator className="!mx-0" /> */}
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <Tooltip
                                        disableHoverableContent
                                        open={state === "collapsed" ? undefined : false}>
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
                                                ${RoleBackgrounds[(user?.role ?? 0) as RoleBackgroundType]}
                                                ${RoleColors[(user?.role ?? 0) as RoleColorType]}
                                                `
                                                            }
                                                        >
                                                            {user?.username.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                                        <span className="truncate font-medium select-none">{user?.username}</span>
                                                        <span className="text-muted-foreground truncate text-xs select-none">
                                                            {UserRole[(user?.role ?? 0) as UserRoleType]}
                                                        </span>
                                                    </div>
                                                    <EllipsisVertical className="ml-auto size-4" />
                                                </SidebarMenuButton>
                                            </DropdownMenuTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            Hesap Ayarları
                                        </TooltipContent>
                                    </Tooltip>
                                    <DropdownMenuContent
                                        side="right"
                                        align="end"
                                        sideOffset={4}
                                    >
                                        <DropdownMenuItem
                                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                        >
                                            {theme === "dark" ? (
                                                <Sun className="text-inherit bg-inherit select-none" />
                                            ) : (
                                                <Moon className="text-inherit bg-inherit select-none" />
                                            )}
                                            <span>{theme === "dark" ? "Açık Tema" : "Koyu Tema"}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="!justify-start !text-red-600 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-950/30 hover:!text-red-800 dark:hover:!text-red-300">
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
        </Sidebar >
    )
}