import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/animate-ui/components/radix/sidebar";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Calculator,
  Clock,
  LayoutDashboard,
  Menu,
  Receipt,
  Scroll,
  ScrollText,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MobileNavSubmenu, { type SubMenuItem } from "./MobileNavSubmenu";

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openMobile, setOpenMobile, toggleSidebar } = useSidebar();

  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);
  const currentPath = location.pathname;

  // Close submenu on route changes
  useEffect(() => {
    setActiveSubmenuId(null);
  }, [currentPath]);

  const items: {
    id: string;
    label: string;
    path: string;
    icon: any;
    isActive: boolean;
    subItems?: SubMenuItem[];
    onClick?: () => void;
  }[] = [
    {
      id: "overview",
      label: t("sidebar.nonSysAdmin.finance.overview", { defaultValue: "Genel Bakış" }).trim(),
      path: "/",
      icon: LayoutDashboard,
      isActive: currentPath === "/" && !openMobile,
    },
    {
      id: "receivables",
      label: t("vars.receivables", { defaultValue: "Alacaklar" }),
      path: "/alacaklar",
      icon: BanknoteArrowDown,
      isActive: currentPath.startsWith("/alacaklar") && !openMobile,
      subItems: [
        {
          label: t("sidebar.nonSysAdmin.finance.receivableInfo.receivables", { defaultValue: "Alacaklar" }),
          path: "/alacaklar",
          icon: ScrollText,
        },
        {
          label: t("sidebar.nonSysAdmin.finance.receivableInfo.incomingPayments", { defaultValue: "Alınan Ödemeler" }),
          path: "/alacaklar/odemeler",
          icon: BanknoteArrowDown,
        },
      ],
    },
    {
      id: "payables",
      label: t("vars.payables", { defaultValue: "Borçlar" }),
      path: "/borclar",
      icon: BanknoteArrowUp,
      isActive: currentPath.startsWith("/borclar") && !openMobile,
      subItems: [
        {
          label: t("sidebar.nonSysAdmin.finance.payableInfo.payables", { defaultValue: "Borçlar" }),
          path: "/borclar",
          icon: Scroll,
        },
        {
          label: t("sidebar.nonSysAdmin.finance.payableInfo.outgoingPayments", { defaultValue: "Yapılan Ödemeler" }),
          path: "/borclar/odemeler",
          icon: BanknoteArrowUp,
        },
      ],
    },
    {
      id: "employees",
      label: t("sidebar.nonSysAdmin.employees", { defaultValue: "Çalışanlar" }),
      path: "/calisanlar",
      icon: Users,
      isActive: currentPath.startsWith("/calisanlar") && !openMobile,
      subItems: [
        {
          label: t("sidebar.nonSysAdmin.employees.list", { defaultValue: "Çalışan Listesi" }),
          path: "/calisanlar",
          icon: Users,
        },
        {
          label: t("sidebar.nonSysAdmin.employees.pdks", { defaultValue: "PDKS" }),
          path: "/calisanlar/pdks",
          icon: Clock,
        },
        {
          label: t("sidebar.nonSysAdmin.employees.advancesAndGarnishments", { defaultValue: "Avans & İcra" }),
          path: "/calisanlar/avans-icra",
          icon: Receipt,
        },
        {
          label: t("sidebar.nonSysAdmin.employees.payroll", { defaultValue: "Bordro" }),
          path: "/calisanlar/bordro",
          icon: Calculator,
        },
      ],
    },
    {
      id: "menu",
      label: t("sidebar.footer.menu", { defaultValue: "Menü" }),
      path: "#menu",
      icon: Menu,
      isActive: openMobile,
      onClick: () => {
        setActiveSubmenuId(null);
        toggleSidebar();
      },
    },
  ];

  const currentActiveItem = items.find((item) => item.id === activeSubmenuId);

  const handleItemClick = (item: (typeof items)[number]) => {
    if (item.onClick) {
      item.onClick();
      return;
    }

    if (openMobile) {
      setOpenMobile(false);
    }

    // If user is already on a page in this category and clicks the same button again, toggle submenu
    if (item.isActive && item.subItems && item.subItems.length > 0) {
      setActiveSubmenuId((prev) => (prev === item.id ? null : item.id));
      return;
    }

    // If tapping a different tab or no sub-items
    setActiveSubmenuId(null);
    navigate(item.path);
  };

  return (
    <>
      {/* Category Submenu Floating Sheet */}
      {currentActiveItem && currentActiveItem.subItems && (
        <MobileNavSubmenu
          isOpen={Boolean(activeSubmenuId)}
          categoryTitle={currentActiveItem.label}
          categoryIcon={currentActiveItem.icon}
          items={currentActiveItem.subItems}
          currentPath={currentPath}
          onSelect={(path) => {
            setActiveSubmenuId(null);
            navigate(path);
          }}
          onClose={() => setActiveSubmenuId(null)}
        />
      )}

      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-card/95 dark:bg-card/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] select-none shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.35)] no-print transition-colors"
      >
        <div className="grid grid-cols-5 h-20 items-center justify-items-center px-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isSubmenuOpen = activeSubmenuId === item.id;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleItemClick(item)}
                className="flex flex-col items-center justify-center w-full h-full py-1.5 focus:outline-none group active:scale-95 transition-transform duration-150 relative"
              >
                {/* M3 Active Indicator Pill */}
                <div
                  className={cn(
                    "relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 ease-out",
                    item.isActive || isSubmenuOpen
                      ? "bg-primary/15 dark:bg-primary/25 text-primary scale-100"
                      : "bg-transparent text-muted-foreground hover:bg-muted/40 group-hover:text-foreground scale-95"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      item.isActive || isSubmenuOpen
                        ? "text-primary stroke-[2.25] scale-105"
                        : "text-muted-foreground group-hover:text-foreground stroke-[1.75]"
                    )}
                  />
                  {/* Subtle indicator dot when sub-items exist on active tab */}
                  {item.isActive && item.subItems && item.subItems.length > 0 && (
                    <span
                      className={cn(
                        "absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full transition-all duration-200",
                        isSubmenuOpen
                          ? "bg-primary scale-125 ring-2 ring-background"
                          : "bg-primary/70"
                      )}
                    />
                  )}
                </div>

                {/* M3 Label */}
                <span
                  className={cn(
                    "text-[11px] mt-1 transition-colors duration-200 tracking-tight truncate max-w-[64px] text-center leading-none",
                    item.isActive || isSubmenuOpen
                      ? "font-bold text-foreground"
                      : "font-medium text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
