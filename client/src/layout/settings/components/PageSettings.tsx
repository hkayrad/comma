import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { useTranslation } from "react-i18next";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useDialog } from "@/contexts/dialog";
import PwaInstallDialog from "@/components/pwa/PwaInstallDialog";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Smartphone } from "lucide-react";

export default function PageSettings() {
    const { t } = useTranslation();
    const { isInstalled } = usePwaInstall();
    const { openDialog } = useDialog();
  const showOverviewCards = useDashboardSettings((s) => s.showOverviewCards);
  const showStatisticsChart = useDashboardSettings((s) => s.showStatisticsChart);
  const useContextMenuForActions = useDashboardSettings(
    (s) => s.useContextMenuForActions,
  );
  const setShowOverviewCards = useDashboardSettings(
    (s) => s.setShowOverviewCards,
  );
  const setShowStatisticsChart = useDashboardSettings(
    (s) => s.setShowStatisticsChart,
  );
  const setUseContextMenuForActions = useDashboardSettings(
    (s) => s.setUseContextMenuForActions,
  );

    return (
        <div className="flex flex-col gap-12 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b pb-2">{t("sidebar.pageSettings.generalTab", { defaultValue: "General" })}</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <Label htmlFor="overview-cards" className="flex-1 text-sm cursor-pointer select-none">
                                {t("sidebar.pageSettings.overviewCards")}
                            </Label>
                            <Switch
                                id="overview-cards"
                                checked={showOverviewCards}
                                onCheckedChange={setShowOverviewCards}
                            />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <Label htmlFor="statistics-chart" className="flex-1 text-sm cursor-pointer select-none">
                                {t("sidebar.pageSettings.statisticsChart")}
                            </Label>
                            <Switch
                                id="statistics-chart"
                                checked={showStatisticsChart}
                                onCheckedChange={setShowStatisticsChart}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b pb-2">{t("sidebar.pageSettings.tablesTab", { defaultValue: "Tables" })}</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <Label htmlFor="context-menu-actions" className="flex-1 text-sm cursor-pointer select-none">
                                {t("sidebar.pageSettings.contextMenuActions", { defaultValue: "Show table actions in right-click menu" })}
                            </Label>
                            <Switch
                                id="context-menu-actions"
                                checked={useContextMenuForActions}
                                onCheckedChange={setUseContextMenuForActions}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
                        <Smartphone className="size-5 text-primary" />
                        {t("pwa.settings.title", { defaultValue: "Uygulama & PWA" })}
                    </h3>
                    <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t("pwa.settings.status", { defaultValue: "Çalışma Modu" })}</span>
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-muted text-foreground border">
                                {isInstalled
                                    ? t("pwa.settings.modePwa", { defaultValue: "Bağımsız Uygulama (PWA)" })
                                    : t("pwa.settings.modeBrowser", { defaultValue: "Web Tarayıcısı" })}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {t("pwa.settings.description", { defaultValue: "Comma'yı masaüstü veya mobil ana ekranınıza ekleyerek çevrimdışı önbellek ve tam ekran uygulama deneyimi elde edin." })}
                        </p>
                        <Button
                            variant={isInstalled ? "outline" : "default"}
                            size="sm"
                            onClick={() => {
                                openDialog({
                                    title: t("pwa.dialog.title", { defaultValue: "Uygulamayı Yükle" }),
                                    description: t("pwa.dialog.subtitle", { defaultValue: "Comma Progressive Web App (PWA)" }),
                                    size: "md",
                                    content: <PwaInstallDialog />,
                                    showCloseButton: true,
                                });
                            }}
                            className="w-full gap-2 mt-2"
                        >
                            {isInstalled ? (
                                <>
                                    <CheckCircle2 className="size-4 text-emerald-500" />
                                    {t("pwa.settings.installedButton", { defaultValue: "Uygulama Bilgileri & Durum" })}
                                </>
                            ) : (
                                <>
                                    <Download className="size-4" />
                                    {t("pwa.settings.installButton", { defaultValue: "Uygulamayı Yükle" })}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
