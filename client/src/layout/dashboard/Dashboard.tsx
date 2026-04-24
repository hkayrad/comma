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
    <div className="px-3 py-3 h-[calc(100vh-3.5rem)] overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
      <Tabs
        value={tabValue}
        onValueChange={handleTabChange}
        className="w-full gap-4"
      >
        <TabsList className="fixed top-4 z-20 left-0 right-0 mx-auto select-none">
          <TabsTrigger
            value="receivable"
            className="data-active:text-green-600 data-active:bg-green-50 h-7.5!"
          >
            {t("vars.receivables")}
          </TabsTrigger>
          <TabsTrigger
            value="payable"
            className="data-active:text-red-600 data-active:bg-red-50 h-7.5!"
          >
            {t("vars.payables")}
          </TabsTrigger>
        </TabsList>
        {showOverviewCards && (
          <div className="flex items-center gap-4">
            <OverviewCards type="receivable" align="stretch" />
            <Separator orientation="vertical" className="h-12! w-full" />
            <OverviewCards type="payable" align="stretch" />
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
