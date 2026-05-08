import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { useTranslation } from "react-i18next";

export default function PageSettings() {
    const { t } = useTranslation();
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
        <div className="flex flex-col gap-6 mt-4">
            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">{t("sidebar.pageSettings.generalTab", { defaultValue: "Ana Sayfa" })}</h3>
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

            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">{t("sidebar.pageSettings.tablesTab", { defaultValue: "Tablolar" })}</h3>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Label htmlFor="context-menu-actions" className="flex-1 text-sm cursor-pointer select-none">
                        {t("sidebar.pageSettings.contextMenuActions", { defaultValue: "Tablo aksiyonlarını sağ tık menüsünde göster" })}
                    </Label>
                    <Switch
                        id="context-menu-actions"
                        checked={useContextMenuForActions}
                        onCheckedChange={setUseContextMenuForActions}
                    />
                </div>
            </div>
        </div>
    );
}
