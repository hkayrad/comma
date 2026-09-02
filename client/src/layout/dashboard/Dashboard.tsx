import { useCallback, useState } from "react";
import { ReceivableCustomerApi, PayableCustomerApi } from "@/lib/api/customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import OverviewCards from "@/layout/shared/OverviewCards";
import DashboardCharts from "./components/DashboardCharts";
import CustomerTable from "./components/CustomerTable";
import { useTranslation } from "react-i18next";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { useTableState } from "@/hooks/use-table-state";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [tabValue, setTabValue] = useState<"receivable" | "payable">("receivable");

  const {
    pagination: receivablePagination,
    setPagination: setReceivablePagination,
    sorting: receivableSorting,
    setSorting: setReceivableSorting,
    columnFilters: receivableFilters,
    setColumnFilters: setReceivableFilters,
    columnVisibility: receivableVisibility,
    setColumnVisibility: setReceivableVisibility,
  } = useTableState({ key: "dashboard-receivable" });

  const {
    pagination: payablePagination,
    setPagination: setPayablePagination,
    sorting: payableSorting,
    setSorting: setPayableSorting,
    columnFilters: payableFilters,
    setColumnFilters: setPayableFilters,
    columnVisibility: payableVisibility,
    setColumnVisibility: setPayableVisibility,
  } = useTableState({ key: "dashboard-payable" });

  const { data: receivableData } = useQuery({
    queryKey: ["customers", "receivable", receivablePagination, receivableSorting, receivableFilters],
    queryFn: async () => {
      return await ReceivableCustomerApi.GetAll(
        receivablePagination.pageIndex,
        receivablePagination.pageSize,
        receivableSorting,
        receivableFilters,
      );
    },
    staleTime: 30000,
  });

  const { data: payableData } = useQuery({
    queryKey: ["customers", "payable", payablePagination, payableSorting, payableFilters],
    queryFn: async () => {
      return await PayableCustomerApi.GetAll(
        payablePagination.pageIndex,
        payablePagination.pageSize,
        payableSorting,
        payableFilters,
      );
    },
    staleTime: 30000,
  });

  const onReceivableFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue,
  ) => {
    setReceivableFilters(updaterOrValue);
    setReceivablePagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const onPayableFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue,
  ) => {
    setPayableFilters(updaterOrValue);
    setPayablePagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const { t } = useTranslation();
  const showOverviewCards = useDashboardSettings((s) => s.showOverviewCards);
  const showStatisticsChart = useDashboardSettings((s) => s.showStatisticsChart);

  const handleTabChange = useCallback((value: string) => {
    setTabValue(value as "receivable" | "payable");
  }, []);

  return (
    <div className="px-3 py-3 min-h-full flex-1 flex flex-col gap-4 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
      <Tabs
        value={tabValue}
        onValueChange={handleTabChange}
        className="w-full gap-4"
      >
        <TabsList className="relative flex w-full justify-center md:fixed md:top-4 md:z-30 md:left-0 md:right-0 md:mx-auto md:w-auto select-none mb-1 md:mb-0">
          <TabsTrigger
            value="receivable"
            className="data-active:text-green-600 data-active:bg-green-50 h-7.5! flex-1 md:flex-initial"
          >
            {t("vars.receivables")}
          </TabsTrigger>
          <TabsTrigger
            value="payable"
            className="data-active:text-red-600 data-active:bg-red-50 h-7.5! flex-1 md:flex-initial"
          >
            {t("vars.payables")}
          </TabsTrigger>
        </TabsList>
        {showOverviewCards && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className={tabValue === "receivable" ? "block w-full md:w-1/2" : "hidden md:block md:w-1/2"}>
              <OverviewCards type="receivable" align="stretch" />
            </div>
            <Separator orientation="vertical" className="hidden md:block h-12! shrink-0" />
            <div className={tabValue === "payable" ? "block w-full md:w-1/2" : "hidden md:block md:w-1/2"}>
              <OverviewCards type="payable" align="stretch" />
            </div>
          </div>
        )}
        {showStatisticsChart && <DashboardCharts />}
        <TabsContent value="receivable">
          <CustomerTable
            type="receivable"
            data={receivableData?.rows || []}
            rowCount={receivableData?.count || 0}
            pagination={receivablePagination}
            onPaginationChange={setReceivablePagination}
            sorting={receivableSorting}
            onSortingChange={setReceivableSorting}
            columnFilters={receivableFilters}
            onColumnFiltersChange={onReceivableFiltersChange}
            columnVisibility={receivableVisibility}
            onColumnVisibilityChange={setReceivableVisibility}
          />
        </TabsContent>
        <TabsContent value="payable">
          <CustomerTable
            type="payable"
            data={payableData?.rows || []}
            rowCount={payableData?.count || 0}
            pagination={payablePagination}
            onPaginationChange={setPayablePagination}
            sorting={payableSorting}
            onSortingChange={setPayableSorting}
            columnFilters={payableFilters}
            onColumnFiltersChange={onPayableFiltersChange}
            columnVisibility={payableVisibility}
            onColumnVisibilityChange={setPayableVisibility}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
