import { useTranslation } from "react-i18next";
import UserSettings from "./components/UserSettings";
import CompanySettings from "./components/CompanySettings";
import PageSettings from "./components/PageSettings";
import { User, Building2, Palette, ChevronLeft } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");
    if (tab === "sirket" || tab === "gorunum") return tab;
    return "hesap";
  }, [searchParams]);

  const onTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="h-full flex bg-sidebar overflow-hidden">
      {/* Settings Navigation (Sidebar) */}
      <nav className="hidden md:flex w-72 flex-col border-r bg-muted/30">
        <header className="p-6">
          <h1 className="text-xl font-bold tracking-tight">
            {t("sidebar.footer.account.settings")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("settings.description")}
          </p>
        </header>

        <div className="flex-1 px-4 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {t("commandPalette.group.settings")}
            </p>
            <button
              onClick={() => onTabChange("hesap")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === "hesap"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
            >
              <User className="size-4" />
              {t("settings.tabs.account")}
            </button>
            <button
              onClick={() => onTabChange("sirket")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === "sirket"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
            >
              <Building2 className="size-4" />
              {t("settings.tabs.company")}
            </button>
            <button
              onClick={() => onTabChange("gorunum")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === "gorunum"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
            >
              <Palette className="size-4" />
              {t("settings.tabs.appearance")}
            </button>
          </div>
        </div>

        <footer className="p-4 border-t">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            {t("dashboard.customerStatement.back")}
          </button>
        </footer>
      </nav>

      {/* Settings Content */}
      <main className="flex-1 bg-background md:m-2 md:ml-0 md:rounded-xl md:shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 p-8 lg:p-12 lg:px-24">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Mobile Header & Back Button */}
            <div className="md:hidden mb-8 flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 -ml-2 rounded-full hover:bg-muted"
              >
                <ChevronLeft className="size-6" />
              </button>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("sidebar.footer.account.settings")}
              </h1>
            </div>

            {activeTab === "hesap" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {t("settings.tabs.account")}
                  </h2>
                  <p className="text-lg text-muted-foreground mt-1">
                    {t("settings.account.description")}
                  </p>
                </div>
                <UserSettings />
              </div>
            )}

            {activeTab === "sirket" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {t("settings.tabs.company")}
                  </h2>
                  <p className="text-lg text-muted-foreground mt-1">
                    {t("settings.company.description")}
                  </p>
                </div>
                <CompanySettings />
              </div>
            )}

            {activeTab === "gorunum" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {t("settings.tabs.appearance")}
                  </h2>
                  <p className="text-lg text-muted-foreground mt-1">
                    {t("settings.appearance.description")}
                  </p>
                </div>
                <PageSettings />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

