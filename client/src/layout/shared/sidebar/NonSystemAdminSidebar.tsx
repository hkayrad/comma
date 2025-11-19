import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Component,
  Scroll,
  ScrollText,
  TestTubeDiagonal,
} from "lucide-react";
import HksSidebarItem from "./components/HksSidebarItem";
import { useMemo } from "react";

export default function NonSystemAdminSidebarContent() {
  const { state } = useSidebar();

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
            icon: TestTubeDiagonal,
          },
        ],
      },
    }),
    [],
  );

  return (
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
  );
}
