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
        <div className="flex flex-col gap-12 mt-4">
            <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b pb-2">{t("sidebar.pageSettings.generalTab", { defaultValue: "General" })}</h3>
                <div className="space-y-2 max-w-2xl">
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
                <div className="space-y-2 max-w-2xl">
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
        </div>
    );
}
