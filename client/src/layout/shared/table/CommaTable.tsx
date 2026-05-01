import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, type ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
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
  type PaginationState,
  type OnChangeFn,
} from "@tanstack/react-table";
import CommaTableHeader from "./components/CommaTableHeader";

type Props = {
  data: any[];
  columns: ColumnDef<any>[];
  searchColumn: string;
  tags?: {
    column: string;
    column_label: string;
    value: string;
    label?: string;
    color: string;
  }[];
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  addButton?: ReactNode;
  contextMenuItems?: (row: any) => ReactNode;
  readOnly?: boolean;
};

export default function CommaTable(props: Props) {
  const {
    data,
    columns,
    searchColumn,
    tags,
    rowCount,
    pagination: controlledPagination,
    onPaginationChange,
    sorting: controlledSorting,
    onSortingChange,
    columnFilters: controlledColumnFilters,
    onColumnFiltersChange,
    columnVisibility: controlledColumnVisibility,
    onColumnVisibilityChange,
    addButton,
    contextMenuItems,
    readOnly,
  } = props;

  const useContextMenuForActions = useDashboardSettings(
    (s) => s.useContextMenuForActions,
  );

  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>({
      "Mersis No": false,
    });
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: 20,
    },
  );

  const isServerSide = !!rowCount || !!controlledPagination;

  const table = useReactTable({
    data,
    columns,
    rowCount,
    onSortingChange:
      isServerSide && onSortingChange ? onSortingChange : setInternalSorting,
    onColumnFiltersChange:
      isServerSide && onColumnFiltersChange
        ? onColumnFiltersChange
        : setInternalColumnFilters,
    onColumnVisibilityChange:
      onColumnVisibilityChange ?? setInternalColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: isServerSide
      ? onPaginationChange
      : setInternalPagination,
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    manualFiltering: isServerSide,
    state: {
      pagination: isServerSide ? controlledPagination : internalPagination,
      sorting:
        isServerSide && controlledSorting ? controlledSorting : internalSorting,
      columnFilters:
        isServerSide && controlledColumnFilters
          ? controlledColumnFilters
          : internalColumnFilters,
      columnVisibility: { ...(controlledColumnVisibility ?? internalColumnVisibility), actions: !useContextMenuForActions },
    },
  });

  return (
    <>
      <div className="sticky -top-4 z-20 pb-2 bg-background">
        <CommaTableHeader
          table={table}
          searchColumn={searchColumn}
          tags={tags}
          addButton={addButton}
          readOnly={readOnly}
        />
      </div>
      <div className="rounded-md border overflow-clip" data-table-export>
        <div className="overflow-auto max-h-[calc(100vh-15.25rem)] scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="select-none z-10 bg-background sticky top-0 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-background!">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={`
                          ${header.id === "name" && "w-36"}
                          ${header.id === "desciption " && "w-36"}
                          ${header.id === "tax_office" && "w-36"}
                          ${header.id === "actions" && "w-1"}
                          ${header.id === "debt_status" && "w-32"}
                          ${header.id === "invoice_no" && "w-36"}
                          ${header.id === "is_company" && "w-16"}
                          ${header.id === "currency" && "w-16"}
                          ${header.id === "payment_method" && "w-16"}
                          ${header.id === "payment_date" && "w-16"}
                          ${header.id === "due_date" && "w-16"}
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
                table.getRowModel().rows.map((row) => {
                  const isSelected = row.getIsSelected();

                  const rowContent = row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`
                        py-1 px-1 select-none
                        ${cell.column.id === "#" && "px-2"}
                        ${cell.column.id === "is_company" && "w-16 text-center"}
                        ${cell.column.id === "name" && "w-36 overflow-hidden"}
                        ${cell.column.id === "desciption" && "w-36 overflow-hidden"}
                        ${cell.column.id === "tax_office" && "w-36 overflow-hidden"}
                        ${cell.column.id === "invoice_no" && "w-36 overflow-hidden"}
                        ${cell.column.id === "debt_status" && "w-fit text-center"}
                        ${cell.column.id === "actions" && "w-fit"}
                        ${cell.column.id === "currency" && "w-fit text-center"}
                        ${cell.column.id === "payment_method" && "w-fit text-center"}
                        ${cell.column.id === "payment_date" && "w-fit text-center"}
                        ${cell.column.id === "due_date" && "w-fit text-center"}
                      `}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ));

                  if (useContextMenuForActions && contextMenuItems && !readOnly) {
                    const rowClasses = "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted font-light h-[45px]";

                    return (
                      <ContextMenu key={row.id}>
                        <ContextMenuTrigger
                          render={(props) => (
                            <tr
                              {...props}
                              className={rowClasses}
                              data-state={isSelected && "selected"}
                            >
                              {rowContent}
                            </tr>
                          )}
                        />
                        <ContextMenuContent className="w-48">
                          {contextMenuItems(row.original)}
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  }

                  return (
                    <TableRow
                      key={row.id}
                      data-state={isSelected && "selected"}
                      className="font-light"
                    >
                      {rowContent}
                    </TableRow>
                  );
                })
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
          </table>
        </div>
      </div>
    </>
  );
}
