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
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/animate-ui/primitives/base/collapsible";
import {
  Menu,
  MenuPanel,
  MenuItem,
  MenuGroupLabel,
  MenuTrigger,
  MenuGroup,
} from "@/components/animate-ui/components/base/menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Users,
  Clock,
  Receipt,
  Calculator,
  UserCheck,
} from "lucide-react";

import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export default function NonSystemAdminSidebarContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const financialItems = useMemo(
    () => [
      {
        title: t("sidebar.nonSysAdmin.finance.overview"),
        url: "/",
        icon: Component,
        items: [],
      },
      {
        title: t("sidebar.nonSysAdmin.finance.receivableInfo"),
        url: "/alacaklar",
        icon: PiggyBank,
        items: [
          {
            title: t("sidebar.nonSysAdmin.finance.receivableInfo.receivables"),
            url: "/alacaklar",
            icon: ScrollText,
          },
          {
            title: t(
              "sidebar.nonSysAdmin.finance.receivableInfo.incomingPayments",
            ),
            url: "/alacaklar/odemeler",
            icon: BanknoteArrowDown,
          },
        ],
      },
      {
        title: t("sidebar.nonSysAdmin.finance.payableInfo"),
        url: "/borclar",
        icon: HandCoins,
        items: [
          {
            title: t("sidebar.nonSysAdmin.finance.payableInfo.payables"),
            url: "/borclar",
            icon: Scroll,
          },
          {
            title: t(
              "sidebar.nonSysAdmin.finance.payableInfo.outgoingPayments",
            ),
            url: "/borclar/odemeler",
            icon: BanknoteArrowUp,
          },
        ],
      },
    ],
    [t],
  );

  const employeeItems = useMemo(
    () => [
      {
        title: t("sidebar.nonSysAdmin.employees.list"),
        url: "/calisanlar",
        icon: Users,
      },
      {
        title: t("sidebar.nonSysAdmin.employees.pdks"),
        url: "/calisanlar/pdks",
        icon: Clock,
      },
      {
        title: t("sidebar.nonSysAdmin.employees.advancesAndGarnishments"),
        url: "/calisanlar/avans-icra",
        icon: Receipt,
      },
      {
        title: t("sidebar.nonSysAdmin.employees.payroll"),
        url: "/calisanlar/bordro",
        icon: Calculator,
      },
    ],
    [t],
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
    () =>
      [
        {
          title: t("sidebar.nonSysAdmin.finance"),
          items: financialItems,
        },
        {
          title: t("sidebar.nonSysAdmin.employees"),
          items: [
            {
              title: t("sidebar.nonSysAdmin.employees"),
              url: "/calisanlar",
              icon: UserCheck,
              items: employeeItems,
            },
          ],
        },
        import.meta.env.DEV
          ? {
            title: "Geliştirme",
            items: devItems,
          }
          : null,
      ].filter((item) => item !== null),
    [financialItems, employeeItems, devItems, t],
  );


  const { state, setOpenMobile, isMobile } = useSidebar();

  const renderCollapsedItem = (item: any, isActive: boolean) => (
    <SidebarMenuItem key={item.title}>
      <Menu>
        <Tooltip>
          <TooltipTrigger
            render={(props) => (
              <MenuTrigger
                {...props}
                render={(props) => (
                  <SidebarMenuButton
                    {...props}
                    isActive={isActive}
                    className="group/menu-trigger"
                  >
                    {item.icon && <item.icon className="size-4 shrink-0" />}
                    <span className="sr-only">{item.title}</span>
                  </SidebarMenuButton>
                )}
              ></MenuTrigger>
            )}
          />
          <TooltipContent side="right" hidden={state !== "collapsed"}>
            {item.title}
          </TooltipContent>
        </Tooltip>
        <MenuPanel side="right" align="start" sideOffset={4}>
          <MenuGroup>
            <MenuGroupLabel className="text-muted-foreground select-none">
              {item.title}
            </MenuGroupLabel>
            {item.items.map((subItem: any) => (
              <MenuItem
                key={subItem.title}
                onClick={() => {
                  setOpenMobile(false);
                  if (subItem.url !== location.pathname) {
                    navigate(subItem.url);
                  }
                }}
                className="w-full cursor-pointer flex items-center"
              >
                {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                <span>{subItem.title}</span>
              </MenuItem>
            ))}
          </MenuGroup>
        </MenuPanel>
      </Menu>
    </SidebarMenuItem>
  );

  return (
    <SidebarContent className="overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
      {navList.map((group) => (
        <SidebarGroup key={group.title} className="px-2 md:px-0 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 px-3 py-1.5 select-none">
            {group.title}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1 md:gap-0.5">
            {group.items.map((item) => {
              const isActive =
                item.url === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.url);

              if (item.items && item.items.length > 0) {
                if (state === "collapsed" && !isMobile) {
                  return renderCollapsedItem(item, isActive);
                }

                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={isActive}
                    className="group/collapsible"
                    render={(props) => (
                      <SidebarMenuItem {...props}>
                        <CollapsibleTrigger
                          render={(props) => (
                            <SidebarMenuButton
                              {...props}
                              isActive={isActive}
                              tooltip={item.title}
                              className={cn(
                                "group/collapsible-trigger h-11 md:h-8 text-sm font-medium rounded-xl md:rounded-lg px-3 transition-colors",
                                isActive && "bg-sidebar-accent/70 text-sidebar-accent-foreground font-semibold"
                              )}
                            >
                              {item.icon && <item.icon className="size-5 md:size-4 shrink-0" />}
                              <span className="select-none flex-1 text-left truncate">{item.title}</span>
                              <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-open/collapsible:rotate-90 text-muted-foreground" />
                            </SidebarMenuButton>
                          )}
                        />
                        <CollapsiblePanel>
                          <SidebarMenuSub className="border-l-2 border-sidebar-border/60 mx-4 pl-3 my-1 gap-1">
                            {item.items.map((subItem) => {
                              const isSubActive =
                                location.pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    isActive={isSubActive}
                                    onClick={() => {
                                      setOpenMobile(false);
                                      if (subItem.url !== location.pathname) {
                                        navigate(subItem.url);
                                      }
                                    }}
                                    className={cn(
                                      "cursor-pointer select-none h-10 md:h-7 text-sm md:text-xs rounded-lg px-3 transition-all",
                                      isSubActive
                                        ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                    )}
                                  >
                                    {subItem.icon && <subItem.icon className="size-4 shrink-0 mr-2" />}
                                    <span className="truncate">{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsiblePanel>
                      </SidebarMenuItem>
                    )}
                  ></Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <Tooltip>
                    <TooltipTrigger
                      render={(props) => (
                        <SidebarMenuButton
                          {...props}
                          isActive={isActive}
                          onClick={() => {
                            setOpenMobile(false);
                            if (item.url !== location.pathname) {
                              navigate(item.url);
                            }
                          }}
                          className={cn(
                            "cursor-pointer h-11 md:h-8 text-sm font-medium rounded-xl md:rounded-lg px-3 transition-colors",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          )}
                        >
                          {item.icon && <item.icon className="size-5 md:size-4 shrink-0" />}
                          <span className="truncate">{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    />
                    <TooltipContent side="right" hidden={state !== "collapsed"}>
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
