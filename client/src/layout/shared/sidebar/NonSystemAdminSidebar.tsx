import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/primitives/radix/collapsible";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  ChevronRight,
  Component,
  HandCoins,
  PiggyBank,
  Scroll,
  ScrollText,
  TestTubeDiagonal,
} from "lucide-react";
import { useMemo } from "react";
import { NavLink, useLocation } from "react-router";

export default function NonSystemAdminSidebarContent() {
  const location = useLocation();

  const navMain = useMemo(() => {
    const items = [
      {
        title: "Genel Bakış",
        url: "/",
        icon: Component,
        items: [],
      },
      {
        title: "Alacak Bilgileri",
        url: "/alacaklar",
        icon: PiggyBank,
        items: [
          {
            title: "Alacaklar",
            url: "/alacaklar",
            icon: ScrollText,
          },
          {
            title: "Gelen Ödemeler",
            url: "/alacaklar/odemeler",
            icon: BanknoteArrowDown,
          },
        ],
      },
      {
        title: "Borç Bilgileri",
        url: "/borclar",
        icon: HandCoins,
        items: [
          {
            title: "Borçlar",
            url: "/borclar",
            icon: Scroll,
          },
          {
            title: "Giden Ödemeler",
            url: "/borclar/odemeler",
            icon: BanknoteArrowUp,
          },
        ],
      },
    ];

    if (import.meta.env.VITE_NODE_ENV === "development") {
      items.push({
        title: "Test Sayfası",
        url: "/dev",
        icon: TestTubeDiagonal,
        items: [],
      });
    }

    return items;
  }, []);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Finans</SidebarGroupLabel>
        <SidebarMenu>
          {navMain.map((item) => {
            const isActive =
              item.url === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.url);

            if (item.items && item.items.length > 0) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                      >
                        {item.icon && <item.icon />}
                        <span className="select-none">{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isSubActive = location.pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                              >
                                <NavLink
                                  to={subItem.url}
                                  className="select-none"
                                >
                                  {subItem.icon && <subItem.icon />}
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <NavLink to={item.url} className="select-none">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
