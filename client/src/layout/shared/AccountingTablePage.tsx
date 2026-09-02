import { useLocation } from "react-router";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { useTableState } from "@/hooks/use-table-state";
import { useQuery } from "@tanstack/react-query";
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

  const { data } = useQuery({
    queryKey: [entityKey, type, pagination, sorting, columnFilters],
    queryFn: async () => {
      const API = getApi(type);
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
        <TableComponent
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
