import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/animate-ui/components/radix/sidebar";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  LayoutDashboard,
  Menu,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openMobile, setOpenMobile, toggleSidebar } = useSidebar();

  const currentPath = location.pathname;

  const items = [
    {
      label: t("sidebar.nonSysAdmin.finance.overview", { defaultValue: "Genel Bakış" }).trim(),
      path: "/",
      icon: LayoutDashboard,
      isActive: currentPath === "/" && !openMobile,
    },
    {
      label: t("vars.receivables", { defaultValue: "Alacaklar" }),
      path: "/alacaklar",
      icon: BanknoteArrowDown,
      isActive: currentPath.startsWith("/alacaklar") && !openMobile,
    },
    {
      label: t("vars.payables", { defaultValue: "Borçlar" }),
      path: "/borclar",
      icon: BanknoteArrowUp,
      isActive: currentPath.startsWith("/borclar") && !openMobile,
    },
    {
      label: t("sidebar.nonSysAdmin.employees", { defaultValue: "Çalışanlar" }),
      path: "/calisanlar",
      icon: Users,
      isActive: currentPath.startsWith("/calisanlar") && !openMobile,
    },
    {
      label: t("sidebar.footer.menu", { defaultValue: "Menü" }),
      path: "#menu",
      icon: Menu,
      isActive: openMobile,
      onClick: () => {
        toggleSidebar();
      },
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-card/95 dark:bg-card/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] select-none shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.35)] no-print transition-colors"
    >
      <div className="grid grid-cols-5 h-20 items-center justify-items-center px-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  if (openMobile) setOpenMobile(false);
                  navigate(item.path);
                }
              }}
              className="flex flex-col items-center justify-center w-full h-full py-1.5 focus:outline-none group active:scale-95 transition-transform duration-150"
            >
              {/* M3 Active Indicator Pill (80dp height, 32dp pill height, 56-64dp pill width) */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 ease-out",
                  item.isActive
                    ? "bg-primary/15 dark:bg-primary/25 text-primary scale-100"
                    : "bg-transparent text-muted-foreground hover:bg-muted/40 group-hover:text-foreground scale-95"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    item.isActive
                      ? "text-primary stroke-[2.25] scale-105"
                      : "text-muted-foreground group-hover:text-foreground stroke-[1.75]"
                  )}
                />
              </div>

              {/* M3 Label */}
              <span
                className={cn(
                  "text-[11px] mt-1 transition-colors duration-200 tracking-tight truncate max-w-[64px] text-center leading-none",
                  item.isActive
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
  );
}
