import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarSeparator, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Auth, useCurrentUser } from "@/lib/api"
import { RoleBackgrounds, RoleColors, UserRole, type RoleBackgroundType, type RoleColorType, type UserRoleType } from "@/lib/enums";
import { BanknoteArrowDown, BanknoteArrowUp, Component, EllipsisVertical, LogOut, Scroll, ScrollText, SidebarCloseIcon, SidebarOpenIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";

export default function HksSidebar() {
    const navigate = useNavigate();
    const user = useCurrentUser();

    const { toggleSidebar, state } = useSidebar();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        const promise = Auth.Logout();
        toast.promise(promise, {
            loading: "Çıkış yapılıyor...",
            success: () => {
                navigate("/login");
                return "Çıkış başarılı!";
            },
            error: "Çıkış yapılırken bir hata oluştu"
        });
    }

    const sidebarItems = {
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
            title: "Verecek Bilgileri",
            url: "/verecekler",
            items: [
                {
                    title: "Verecekler",
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
                    Object.entries(sidebarItems).map(([key, group]) => (
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
                                        <Tooltip
                                            disableHoverableContent
                                            key={item.title}
                                            open={state === "collapsed" ? undefined : false}>
                                            <TooltipTrigger asChild>
                                                <SidebarMenuItem>
                                                    <SidebarMenuButton asChild>
                                                        <NavLink className="transition-all" to={group.url + item.url}>
                                                            <item.icon />
                                                            <span className="select-none">{item.title}</span>
                                                        </NavLink>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                {item.title}
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))
                }
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu className="gap-2">
                    <Tooltip
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
                    <SidebarSeparator className="!mx-0" />
                    <SidebarMenuItem>
                        <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
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
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side="right"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem asChild>
                                    <Button
                                        onClick={handleLogout}
                                        variant="ghost"
                                        className="w-full !justify-start !text-red-600 hover:!bg-red-100 hover:!text-red-800">
                                        <LogOut className="text-inherit bg-inherit select-none" />
                                        Çıkış Yap
                                    </Button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    )
}