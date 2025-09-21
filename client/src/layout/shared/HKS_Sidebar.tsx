import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar";
import { Auth } from "@/lib/api"
import { Home, LogOut, ScrollText, TurkishLira, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router";

export default function HKS_Sidebar({ onMouseOver, onMouseOut }: { onMouseOver: () => void, onMouseOut: () => void }) {
    const navigate = useNavigate();
    const user = Auth.GetCurrentUser();

    const handleLogout = async () => {
        const response = await Auth.Logout();
        if (response)
            navigate("/login");
    }

    // Menu items.
    const items = [
        {
            title: "Anasayfa",
            url: "/",
            icon: Home,
        },
        {
            title: "Borç Bilgileri",
            url: "/borc_bilgileri",
            icon: ScrollText,
        },
        {
            title: "Ödemeler",
            url: "/odemeler",
            icon: TurkishLira,
        },
    ]

    return (
        <Sidebar variant="inset" collapsible="icon" onPointerEnter={onMouseOver} onPointerLeave={onMouseOut}>
            <SidebarContent>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>HKS-IO</SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title} >
                                    <SidebarMenuButton asChild>
                                        <NavLink className="transition-all" to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <span className="text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 w-full whitespace-nowrap overflow-hidden">Giriş Yapılan Kullanıcı</span>
                    <SidebarMenuItem>
                        <Button variant="ghost" className="h-8 !p-2 w-full flex justify-start">
                            <User />
                            <span className="text-sm overflow-hidden">{user?.username}</span>
                        </Button>
                    </SidebarMenuItem>
                    <SidebarSeparator className="group-data-[collapsible=icon]:!w-4 transition-all !w-11/12 !mb-2"/>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Button variant="outline" className="flex justify-start !p-2 overflow-hidden transition-all text-red-500 hover:bg-red-500 hover:!text-white" onClick={handleLogout}>
                                <LogOut />
                                <span>Çıkış Yap</span>
                            </Button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}