import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { useTranslation } from "react-i18next";

export default function PageSettingsDialog() {
    const { t } = useTranslation();
    const {
        showOverviewCards,
        showStatisticsChart,
        setShowOverviewCards,
        setShowStatisticsChart,
    } = useDashboardSettings();

    return (
        <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="overview-cards" className="text-sm cursor-pointer select-none">
                    {t("sidebar.pageSettings.overviewCards")}
                </Label>
                <Switch
                    id="overview-cards"
                    checked={showOverviewCards}
                    onCheckedChange={setShowOverviewCards}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="statistics-chart" className="text-sm cursor-pointer select-none">
                    {t("sidebar.pageSettings.statisticsChart")}
                </Label>
                <Switch
                    id="statistics-chart"
                    checked={showStatisticsChart}
                    onCheckedChange={setShowStatisticsChart}
                />
            </div>
        </div>
    );
}
