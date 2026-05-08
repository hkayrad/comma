import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import UserSettings from "./components/UserSettings";
import CompanySettings from "./components/CompanySettings";
import PageSettings from "./components/PageSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, Palette } from "lucide-react";
import { useSearchParams } from "react-router";
import { useMemo } from "react";

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
    <div className="container mx-auto py-10 px-4 md:px-10 lg:px-16 h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("sidebar.footer.account.settings")}
          </h1>
          <p className="text-muted-foreground">
            {t("settings.description", {
              defaultValue:
                "Hesap, şirket ve uygulama ayarlarınızı buradan yönetebilirsiniz.",
            })}
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          orientation="vertical"
          className="flex flex-col md:flex-row gap-10"
        >
          <TabsList className="flex flex-col w-full md:w-64 h-fit bg-transparent p-0 gap-1 items-stretch">
            <TabsTrigger
              value="hesap"
              className="flex items-center gap-3 px-4 py-3 justify-start rounded-lg transition-colors hover:bg-muted data-active:bg-muted data-active:text-foreground text-muted-foreground"
            >
              <User className="h-4 w-4" />
              <span className="font-medium">
                {t("settings.tabs.account", { defaultValue: "Hesap" })}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="sirket"
              className="flex items-center gap-3 px-4 py-3 justify-start rounded-lg transition-colors hover:bg-muted data-active:bg-muted data-active:text-foreground text-muted-foreground"
            >
              <Building2 className="h-4 w-4" />
              <span className="font-medium">
                {t("settings.tabs.company", { defaultValue: "Şirket" })}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="gorunum"
              className="flex items-center gap-3 px-4 py-3 justify-start rounded-lg transition-colors hover:bg-muted data-active:bg-muted data-active:text-foreground text-muted-foreground"
            >
              <Palette className="h-4 w-4" />
              <span className="font-medium">
                {t("settings.tabs.appearance", { defaultValue: "Görünüm" })}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="hesap">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>
                    {t("settings.tabs.account", {
                      defaultValue: "Hesap Ayarları",
                    })}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.account.description", {
                      defaultValue:
                        "Kullanıcı adı, şifre ve iki faktörlü doğrulama ayarlarınızı güncelleyin.",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <UserSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sirket">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>
                    {t("settings.tabs.company", {
                      defaultValue: "Şirket Ayarları",
                    })}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.company.description", {
                      defaultValue:
                        "Şirket bilgilerini ve logolarını buradan düzenleyebilirsiniz.",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <CompanySettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gorunum">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>
                    {t("settings.tabs.appearance", {
                      defaultValue: "Görünüm Ayarları",
                    })}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.appearance.description", {
                      defaultValue:
                        "Uygulama arayüzü ve tablo görüntüleme tercihlerini kişiselleştirin.",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <PageSettings />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
