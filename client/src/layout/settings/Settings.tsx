import { useTranslation } from "react-i18next";
import UserSettings from "./components/UserSettings";
import CompanySettings from "./components/CompanySettings";
import PageSettings from "./components/PageSettings";
import { User, Building2, Palette, ChevronLeft } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/animate-ui/components/radix/sidebar";

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
    <div className="h-full flex flex-col bg-sidebar">
      <SidebarProvider defaultOpen={true} className="flex-1 min-h-0">
        <div className="flex flex-1 min-h-0 w-full overflow-hidden">
          <Sidebar
            collapsible="none"
            variant="inset"
            className="hidden md:flex w-72 h-full"
            animateOnHover={false}
          >
            <SidebarHeader className="p-4 pt-6">
              <h1 className="text-xl font-bold tracking-tight px-2">
                {t("sidebar.footer.account.settings")}
              </h1>
              <p className="text-xs text-muted-foreground px-2 mt-1">
                {t("settings.description")}
              </p>
            </SidebarHeader>

            <SidebarContent className="px-3">
              <SidebarGroup>
                <SidebarGroupLabel className="px-2">
                  {t("commandPalette.group.settings")}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "hesap"}
                        onClick={() => onTabChange("hesap")}
                        className="h-11 px-3"
                      >
                        <User className="size-4" />
                        <span className="font-medium">
                          {t("settings.tabs.account")}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "sirket"}
                        onClick={() => onTabChange("sirket")}
                        className="h-11 px-3"
                      >
                        <Building2 className="size-4" />
                        <span className="font-medium">
                          {t("settings.tabs.company")}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "gorunum"}
                        onClick={() => onTabChange("gorunum")}
                        className="h-11 px-3"
                      >
                        <Palette className="size-4" />
                        <span className="font-medium">
                          {t("settings.tabs.appearance")}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3">
              <SidebarSeparator className="mb-2" />
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/")}
                    className="h-11 px-3 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="size-4" />
                    <span>{t("dashboard.customerStatement.back")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 bg-background md:m-2 md:ml-0 md:rounded-xl md:shadow-sm overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 p-8 lg:p-12 lg:px-24">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="md:hidden mb-8 flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="p-2 -ml-2 rounded-full hover:bg-muted"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {t("sidebar.footer.account.settings")}
                  </h1>
                </div>
              </div>

              {activeTab === "hesap" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {t("settings.tabs.account")}
                    </h2>
                    <p className="text-lg text-muted-foreground mt-1">
                      {t("settings.account.description")}
                    </p>
                  </div>
                  <div className="py-4">
                    <UserSettings />
                  </div>
                </div>
              )}

              {activeTab === "sirket" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {t("settings.tabs.company")}
                    </h2>
                    <p className="text-lg text-muted-foreground mt-1">
                      {t("settings.company.description")}
                    </p>
                  </div>
                  <div className="py-4">
                    <CompanySettings />
                  </div>
                </div>
              )}

              {activeTab === "gorunum" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {t("settings.tabs.appearance")}
                    </h2>
                    <p className="text-lg text-muted-foreground mt-1">
                      {t("settings.appearance.description")}
                    </p>
                  </div>
                  <div className="py-4">
                    <PageSettings />
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

