import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { CalendarIcon, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonthPicker } from "@/components/ui/monthpicker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { StatsApi, type MonthlyStatsData } from "@/lib/api/stats";
import { Logger } from "@/lib/utils/logger";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const { t, i18n } = useTranslation();

  if (!active || !payload || !payload.length) {
    return null;
  }

  // Format month label (2025-01 -> Jan 2025)
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
    return date.toLocaleDateString(locale, { month: "short", year: "numeric" });
  };

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium mb-1">{formatMonth(label || "")}</p>
      {payload.map((entry, index) => (
        <p key={index} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.dataKey === "receivable"
              ? t("dashboard.charts.receivable")
              : t("dashboard.charts.payable")}
            :
          </span>
          <span className="font-medium">
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: "TRY",
              maximumFractionDigits: 0,
            }).format(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardCharts() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<MonthlyStatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(12);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const stats = await StatsApi.GetMonthlyStats(startDate, months);
      setData(stats);
    } catch (error) {
      Logger.error("Failed to fetch monthly stats", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, months]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format month for axis (2025-01 -> Jan)
  const formatAxisMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
    return date.toLocaleDateString(locale, { month: "short" });
  };

  if (loading) {
    return (
      <Card className="mt-2">
        <CardHeader>
          <CardTitle>{t("dashboard.charts.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-50 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = data.some((d) => d.receivable > 0 || d.payable > 0);

  // if (!hasData) {
  //   return (
  //     <Card className="mt-2">
  //       <CardHeader>
  //         <CardTitle>{t("dashboard.charts.title")}</CardTitle>
  //       </CardHeader>
  //       <CardContent className="flex items-center justify-center h-50">
  //         <p className="text-muted-foreground">
  //           {t("dashboard.charts.noData")}
  //         </p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{t("dashboard.charts.title")}</CardTitle>
        <div className="flex space-x-2 gap-2 items-center">
          {(startDate || months !== 12) && (
            <Button
              variant="ghost"
              size="default"
              onClick={() => {
                setStartDate(undefined);
                setMonths(12);
              }}
              className="text-muted-foreground hover:text-foreground"
              title={t("dashboard.charts.reset")}
            >
              <RotateCcw className="h-4 w-4" />
              {t("dashboard.charts.reset")}
            </Button>
          )}
          <div className="flex flex-row gap-1.5">
            <Label className="text-xs text-muted-foreground font-normal">
              {t("dashboard.charts.startDate")}:
            </Label>
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <Popover>
                    <PopoverTrigger
                      {...props}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-40! pr-3 text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                      {startDate ? (
                        (() => {
                          const date = new Date(startDate);
                          const locale =
                            i18n.language === "tr" ? "tr-TR" : "en-US";
                          return (
                            <span className="mr-auto">
                              {date.toLocaleDateString(locale, {
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="mr-auto">
                          {t("dashboard.charts.latest")}
                        </span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <MonthPicker
                        onMonthSelect={(date) => {
                          const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
                          setStartDate(value);
                        }}
                        selectedMonth={
                          startDate ? new Date(startDate) : undefined
                        }
                        maxDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <TooltipContent>
                {t("dashboard.charts.startDate.tooltip")}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-row gap-1.5">
            <Label className="text-xs text-muted-foreground font-normal">
              {t("dashboard.charts.duration")}:
            </Label>
            <Select
              value={String(months)}
              onValueChange={(value) => setMonths(Number(value))}
            >
              <Tooltip>
                <TooltipTrigger
                  render={(props) => (
                    <SelectTrigger {...props}>
                      {t("dashboard.charts.months", { count: months })}
                    </SelectTrigger>
                  )}
                />
                <TooltipContent>
                  {t("dashboard.charts.duration.tooltip")}
                </TooltipContent>
              </Tooltip>
              <SelectContent className="p-1" align="end">
                <SelectItem value="3">
                  {t("dashboard.charts.months", { count: 3 })}
                </SelectItem>
                <SelectItem value="6">
                  {t("dashboard.charts.months", { count: 6 })}
                </SelectItem>
                <SelectItem value="12">
                  {t("dashboard.charts.months", { count: 12 })}
                </SelectItem>
                <SelectItem value="24">
                  {t("dashboard.charts.months", { count: 24 })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      {!hasData ? (
        <CardContent className="flex items-center justify-center h-50">
          <p className="text-muted-foreground">
            {t("dashboard.charts.noData")}
          </p>
        </CardContent>
      ) : (
        <CardContent>
          <ResponsiveContainer width="100%" height={200} debounce={100}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border"
              />
              <XAxis
                dataKey="month"
                tickFormatter={formatAxisMonth}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat(undefined, {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <RechartsTooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(128, 128, 128, 0.15)" }}
              />
              <Legend
                formatter={(value) =>
                  value === "receivable"
                    ? t("dashboard.charts.receivable")
                    : t("dashboard.charts.payable")
                }
              />
              <Bar
                dataKey="receivable"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="payable"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      )}
    </Card>
  );
}
