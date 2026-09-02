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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] select-none shadow-lg no-print"
    >
      <div className="grid grid-cols-5 h-14 items-center justify-items-center px-1">
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
              className={cn(
                "flex flex-col items-center justify-center w-full h-full py-1 gap-1 text-[10px] font-medium transition-colors active:scale-95",
                item.isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-6 rounded-full transition-colors",
                  item.isActive && "bg-primary/10"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5", item.isActive ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className="truncate max-w-[60px] leading-tight text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
