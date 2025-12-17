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
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/primitives/radix/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
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
} from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

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
        import.meta.env.DEV
          ? {
              title: "Geliştirme",
              items: devItems,
            }
          : null,
      ].filter((item) => item !== null),
    [financialItems, devItems, t],
  );

  const { state } = useSidebar();

  const renderCollapsedItem = (item: any, isActive: boolean) => (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton isActive={isActive}>
                {item.icon && <item.icon />}
                <span className="select-none">{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" hidden={state !== "collapsed"}>
            {item.title}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel className="text-muted-foreground select-none">
            {item.title}
          </DropdownMenuLabel>
          {item.items.map((subItem: any) => (
            <DropdownMenuItem
              key={subItem.title}
              onClick={() => {
                if (subItem.url !== location.pathname) {
                  navigate(subItem.url);
                }
              }}
              className="w-full cursor-pointer flex items-center"
            >
              {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
              <span>{subItem.title}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
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
                if (state === "collapsed") {
                  return renderCollapsedItem(item, isActive);
                }

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
                                  isActive={isSubActive}
                                  onClick={() => {
                                    if (subItem.url !== location.pathname) {
                                      navigate(subItem.url);
                                    }
                                  }}
                                  className="cursor-pointer"
                                >
                                  {subItem.icon && <subItem.icon />}
                                  <span>{subItem.title}</span>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => {
                          if (item.url !== location.pathname) {
                            navigate(item.url);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
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
