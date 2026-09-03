import { useLocation } from "react-router";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { useTableState } from "@/hooks/use-table-state";
import { useResponsiveTableQuery } from "@/hooks/use-responsive-table-query";
import OverviewCards from "@/layout/shared/OverviewCards";
import type { ComponentType } from "react";

interface AccountingTablePageProps<T> {
  entityKey: "debts" | "payments";
  getApi: (type: "payable" | "receivable") => {
    GetAll: (pageIndex: number, pageSize: number, sorting: any, filters: any) => Promise<{ rows: T[]; count: number } | null>;
  };
  TableComponent: ComponentType<any>;
}

export default function AccountingTablePage<T>({
  entityKey,
  getApi,
  TableComponent,
}: AccountingTablePageProps<T>) {
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
  } = useTableState({ key: `${entityKey}-${type}` });

  const {
    rows,
    count,
    hasMore,
    onLoadMore,
    isLoadingMore,
  } = useResponsiveTableQuery({
    queryKey: [entityKey, type],
    fetchFn: (pageIndex, pageSize) => {
      const API = getApi(type);
      return API.GetAll(pageIndex, pageSize, sorting, columnFilters);
    },
    pagination,
    sorting,
    columnFilters,
  });

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue,
  ) => {
    setColumnFilters(updaterOrValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="px-3 py-3 min-h-full flex-1 w-full max-w-full min-w-0 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 flex flex-col gap-4">
      <OverviewCards type={type} />
      <div className="w-full max-w-full min-w-0">
        <TableComponent
          data={rows}
          type={type}
          rowCount={count}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingMore}
        />
      </div>
    </div>
  );
}
