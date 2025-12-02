import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import HksTableHeader from "./components/HksTableHeader";
import type { AvailableCurrency } from "@/lib/types";

type Props = {
  data: any[];
  columns: ColumnDef<any>[];
  searchColumn: string;
  tags?: {
    column: string;
    value: string;
  }[];
  currency?: {
    state: AvailableCurrency | "";
    onChange: (value: AvailableCurrency | "") => void;
  };
};

export default function HksTable(props: Props) {
  const { data, columns, searchColumn, tags, currency } = props;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    "Mersis No": false,
  });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <>
      <div className="sticky -top-4 z-20 pt-2 pb-4 bg-background">
        <HksTableHeader
          table={table}
          searchColumn={searchColumn}
          tags={tags}
          currency={currency}
        />
      </div>
      <div className="rounded-md border overflow-clip">
        <div className="overflow-auto max-h-[calc(100vh-21rem)] scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
          <Table>
            <TableHeader className="select-none z-10 bg-background sticky top-0 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:!bg-background">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={`
                          ${header.id === "Müşteri" && "w-36"}
                          ${header.id === "Vergi Dairesi" && "w-36"}
                          ${header.id === "İşlemler" && "w-fit"}
                          ${(header.id === "Borç Durumu" || header.id === "Tür") && "w-32"}
                          `}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="font-light"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`
                          py-1.5 select-none
                          ${cell.column.id === "Müşteri" && "w-36 overflow-hidden"}
                          ${cell.column.id === "Vergi Dairesi" && "w-36 overflow-hidden"}
                          `}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center select-none"
                  >
                    Veri Bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
