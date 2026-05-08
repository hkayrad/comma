import { useTranslation } from "react-i18next";
import UserSettings from "./components/UserSettings";
import CompanySettings from "./components/CompanySettings";
import PageSettings from "./components/PageSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Building2, Palette } from "lucide-react";
import { useSearchParams } from "react-router";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/animate-ui/components/radix/sidebar";

export default function Settings() {
  const { t } = useTranslation();
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
    <div className="h-full flex flex-col bg-background">
      <SidebarProvider defaultOpen={true} className="flex-1 min-h-0">
        <div className="flex flex-1 min-h-0 w-full overflow-hidden">
          <Sidebar
            collapsible="none"
            className="hidden md:flex w-72 border-r bg-muted/30 h-full"
            animateOnHover={false}
          >
            <SidebarContent className="py-6 px-3">
              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <div className="px-4 mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                      {t("sidebar.footer.account.settings")}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("settings.description")}
                    </p>
                  </div>
                  <SidebarMenu className="gap-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "hesap"}
                        onClick={() => onTabChange("hesap")}
                        className="py-6 px-4 text-base"
                      >
                        <User className="size-5" />
                        <span className="font-medium">
                          {t("settings.tabs.account")}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "sirket"}
                        onClick={() => onTabChange("sirket")}
                        className="py-6 px-4 text-base"
                      >
                        <Building2 className="size-5" />
                        <span className="font-medium">
                          {t("settings.tabs.company")}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "gorunum"}
                        onClick={() => onTabChange("gorunum")}
                        className="py-6 px-4 text-base"
                      >
                        <Palette className="size-5" />
                        <span className="font-medium">
                          {t("settings.tabs.appearance")}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 p-8 lg:p-12 lg:px-24">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="md:hidden mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                  {t("sidebar.footer.account.settings")}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t("settings.description")}
                </p>
              </div>

              {activeTab === "hesap" && (
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-3xl font-bold">
                      {t("settings.tabs.account")}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {t("settings.account.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 py-8">
                    <UserSettings />
                  </CardContent>
                </Card>
              )}

              {activeTab === "sirket" && (
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-3xl font-bold">
                      {t("settings.tabs.company")}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {t("settings.company.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 py-8">
                    <CompanySettings />
                  </CardContent>
                </Card>
              )}

              {activeTab === "gorunum" && (
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-3xl font-bold">
                      {t("settings.tabs.appearance")}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {t("settings.appearance.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 py-8">
                    <PageSettings />
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
