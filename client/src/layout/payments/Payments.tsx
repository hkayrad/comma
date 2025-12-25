import { useEffect, useState } from "react";
import type { PaymentDto } from "@/lib/types";
import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api/payment";
import OverviewCards from "@/layout/shared/OverviewCards";
import PaymentTable from "./components/PaymentTable";
import { useLocation } from "react-router";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { useTableState } from "@/hooks/use-table-state";

export default function Payments() {
  const location = useLocation();
  const type: "payable" | "receivable" =
    location.pathname.split("/")[1] === "alacaklar" ? "receivable" : "payable";
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [rowCount, setRowCount] = useState(0);

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

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue,
  ) => {
    setColumnFilters(updaterOrValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const fetchPayments = async () => {
      const API = type === "payable" ? PayablePaymentApi : ReceivablePaymentApi;
      const response = await API.GetAll(
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
        columnFilters,
      );
      if (response) {
        setPayments(response.rows);
        setRowCount(response.count);
      }
    };

    const handleRefresh = () => {
      fetchPayments();
    };

    handleRefresh();
    window.addEventListener("global:refresh", handleRefresh);
    return () => {
      window.removeEventListener("global:refresh", handleRefresh);
    };
  }, [type, pagination, sorting, columnFilters]);

  return (
    <div className="px-3 py-3 h-[calc(100vh-3.5rem)] overflow-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 flex flex-col gap-2">
      <OverviewCards type={type} />
      <div>
        <PaymentTable
          data={payments}
          type={type}
          rowCount={rowCount}
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
