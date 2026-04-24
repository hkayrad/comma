import type { PaymentDto } from "@comma/common";
import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api/payment";
import OverviewCards from "@/layout/shared/OverviewCards";
import PaymentTable from "./components/PaymentTable";
import { useLocation } from "react-router";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { useTableState } from "@/hooks/use-table-state";
import { useQuery } from "@tanstack/react-query";

export default function Payments() {
  const location = useLocation();
  const type: "payable" | "receivable" =
    location.pathname.split("/")[1] === "alacaklar" ? "receivable" : "payable";

  const {
    pagination,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
  } = useTableState({ key: `payments-${type}` });

  const { data, isLoading } = useQuery({
    queryKey: ["payments", type, pagination, sorting, columnFilters],
    queryFn: async () => {
      const API = type === "payable" ? PayablePaymentApi : ReceivablePaymentApi;
      return await API.GetAll(
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
        columnFilters,
      );
    },
    staleTime: 30000,
  });

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue,
  ) => {
    setColumnFilters(updaterOrValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="px-3 py-3 h-[calc(100vh-3.5rem)] overflow-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 flex flex-col gap-4">
      <OverviewCards type={type} />
      <div>
        <PaymentTable
          data={data?.rows || []}
          type={type}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
      </div>
    </div>
  );
}
