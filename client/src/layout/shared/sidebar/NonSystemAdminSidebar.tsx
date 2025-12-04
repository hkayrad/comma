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

  const financialItems = useMemo(
    () => [
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
    ],
    [],
  );

  const devItems = useMemo(
    () => [
      {
        title: "Test Sayfası",
        url: "/dev",
        icon: TestTubeDiagonal,
        items: [],
      },
    ],
    [],
  );

  const navList = useMemo(
    () => [
      {
        title: "Finans",
        items: financialItems,
      },
      {
        title: "Geliştirme",
        items: devItems,
      },
    ],
    [financialItems, devItems],
  );

  return (
    <SidebarContent className="overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
      {navList.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
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
                            const isSubActive =
                              location.pathname === subItem.url;
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                >
                                  <NavLink
                                    to={subItem.url}
                                    className="select-none"
                                    onClick={(e) => {
                                      if (subItem.url === location.pathname) {
                                        e.preventDefault();
                                      }
                                    }}
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
                    <NavLink
                      to={item.url}
                      className="select-none"
                      onClick={(e) => {
                        if (item.url === location.pathname) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
