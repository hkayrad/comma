import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ExchangeRates from "./components/ExchangeRates";
import { Button } from "@/components/ui/button";
import { SidebarClose, SidebarOpen } from "lucide-react";
import { useSidebar } from "@/components/animate-ui/components/radix/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router";
import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useBreadcrumb } from "@/contexts/breadcrumb/useBreadcrumb";

export default function Header() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const labels = useBreadcrumb((s) => s.labels);
  const { t } = useTranslation();

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const PATH_MAP: Record<string, string> = {
    alacaklar: t("header.breadcrumb.finance.receivables"),
    borclar: t("header.breadcrumbs.finance.payables"),
    odemeler: t("header.breadcrumbs.finance.payments"),
    ayarlar: t("sidebar.footer.account.settings"),
    borc_dokumu: t("header.breadcrumbs.finance.customerStatement"),
    calisanlar: t("header.breadcrumbs.employees.title"),
    pdks: t("header.breadcrumbs.employees.pdks"),
    "avans-icra": t("header.breadcrumbs.employees.advancesAndGarnishments"),
    bordro: t("header.breadcrumbs.employees.payroll"),
  };


  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const isUUID =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        segment,
      );

    let name: React.ReactNode = labels[segment] || PATH_MAP[segment] || segment;

    if (isUUID && !labels[segment]) {
      name = <Skeleton className="h-4 w-24" />;
    }

    const isLast = index === pathSegments.length - 1;

    return {
      name,
      path,
      isLast,
    };
  });

  // If we are at root, show "Genel Bakış"
  if (breadcrumbItems.length === 0) {
    breadcrumbItems.push({
      name: t("sidebar.nonSysAdmin.finance.overview"),
      path: "/",
      isLast: true,
    });
  }

  const currentTitle = breadcrumbItems[breadcrumbItems.length - 1]?.name;

  return (
    <header className="border-b p-2.5 md:p-3 bg-background sticky top-0 z-10">
      <div className="flex w-full items-center gap-2">
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={(props) => (
              <Button
                {...props}
                nativeButton
                onClick={toggleSidebar}
                size="icon"
                variant="ghost"
                className="size-8 shrink-0"
              >
                {state === "collapsed" ? <SidebarOpen className="w-4 h-4" /> : <SidebarClose className="w-4 h-4" />}
              </Button>
            )}
          ></TooltipTrigger>
          <TooltipContent side="right">
            {t("sidebar.toggle", {
              action:
                state === "collapsed"
                  ? t("sidebar.toggle.open")
                  : t("sidebar.toggle.close"),
            })}
          </TooltipContent>
        </Tooltip>

        {/* Mobile Page Title */}
        <div className="flex md:hidden items-center min-w-0 flex-1">
          <h1 className="text-sm font-semibold truncate text-foreground">
            {currentTitle}
          </h1>
        </div>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center min-w-0">
          <Separator orientation="vertical" className="w-px mr-4 ml-2 h-4!" />

          <Breadcrumb>
            <BreadcrumbList className="select-none">
              {breadcrumbItems.map((item) => (
                <React.Fragment key={item.path}>
                  <BreadcrumbItem>
                    {item.isLast ? (
                      <BreadcrumbPage>{item.name}</BreadcrumbPage>
                    ) : item.name ===
                      t("header.breadcrumbs.finance.customerStatement") ? (
                      <BreadcrumbPage className="text-muted-foreground cursor-default">
                        {item.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={(props) => (
                          <Link {...props} to={item.path}>
                            {item.name}
                          </Link>
                        )}
                      />
                    )}
                  </BreadcrumbItem>
                  {!item.isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="ml-auto shrink-0">
          <ExchangeRates />
        </div>
      </div>
    </header>
  );
}
