import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useUpcomingDueDates, type DueDateItemType } from "@/hooks/use-upcoming-due-dates";

export default function UpcomingDueDates() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);

    const getNavigationPath = (type: DueDateItemType): string => {
        switch (type) {
            case "receivable": return "/alacaklar";
            case "payable": return "/borclar";
            case "receivableCheck": return "/alacaklar/odemeler";
            case "payableCheck": return "/borclar/odemeler";
        }
    };

    const { data: dueDates = [], isLoading } = useUpcomingDueDates();

    const getDaysRemainingLabel = (days: number) => {
        if (days < 0) return t("dashboard.upcomingDueDates.overdue");
        if (days === 0) return t("dashboard.upcomingDueDates.today");
        return t("dashboard.upcomingDueDates.daysRemaining", { count: days });
    };

    const getDaysRemainingColor = (days: number) => {
        if (days < 0) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        if (days <= 3) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    };

    if (isLoading) {
        return (
            <Card className="animate-pulse">
                <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        {t("dashboard.upcomingDueDates.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                    <div className="h-20 bg-muted rounded" />
                </CardContent>
            </Card>
        );
    }

    if (dueDates.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        {t("dashboard.upcomingDueDates.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {t("dashboard.upcomingDueDates.noData")}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const displayedDueDates = showAll ? dueDates : dueDates.slice(0, 5);
    const hasMore = dueDates.length > 5;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    {t("dashboard.upcomingDueDates.title")}
                    <Badge variant="secondary" className="ml-auto">
                        {dueDates.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-2!">
                <div className={showAll ? "max-h-100 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent" : "space-y-2"}>
                    {displayedDueDates.map((item) => (
                        <div
                            key={`${item.type}-${item.id}`}
                            onClick={() => navigate(getNavigationPath(item.type))}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                {item.days_remaining <= 0 && (
                                    <AlertTriangle size={16} className="text-red-500 shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{item.customer_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(Number(item.total), item.currency)}
                                        <span className="mx-1">•</span>
                                        <span
                                            className={
                                                item.type === "receivable" || item.type === "receivableCheck"
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                            }
                                        >
                                            {t(`dashboard.upcomingDueDates.${item.type}`)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={getDaysRemainingColor(item.days_remaining)}
                            >
                                {getDaysRemainingLabel(item.days_remaining)}
                            </Badge>
                        </div>
                    ))}
                </div>
                {hasMore && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? (
                            <>
                                <ChevronUp size={14} />
                            </>
                        ) : (
                            <>
                                <ChevronDown size={14} />
                                +{dueDates.length - 5}
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
