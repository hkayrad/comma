import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useMemo, type ReactNode } from "react";
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
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Menu,
  MenuCheckboxItem,
  MenuPanel,
  MenuTrigger,
} from "@/components/animate-ui/components/base/menu";
import { Rows3, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CommaTableHeader from "./components/CommaTableHeader";
import CommaTablePagination from "./components/CommaTablePagination";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

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
  isPortal?: boolean;
  translationPrefix?: "dashboard" | "debt" | "payment";
  hideHeader?: boolean;
  onBulkDelete?: (selectedRows: any[]) => void;
  enableRowSelection?: boolean;
};

export default function CommaTable(props: Props) {
  const {
    data: rawData = [],
    columns: rawColumns = [],
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
    isPortal,
    translationPrefix,
    hideHeader,
  } = props;

  const data = useMemo(() => (Array.isArray(rawData) ? rawData : []), [rawData]);
  const columns = useMemo(() => (Array.isArray(rawColumns) ? rawColumns : []), [rawColumns]);

  const { t } = useTranslation();
  const rowCounts = [5, 10, 20, 50, 100];

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
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const showSelection = !readOnly && (props.enableRowSelection ?? true);

  const tableColumns = useMemo(() => {
    const validCols = Array.isArray(columns) ? columns : [];
    if (!showSelection) return validCols;

    const selectColumn: ColumnDef<any> = {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectColumn, ...validCols];
  }, [columns, showSelection]);

  const isServerSide = !!rowCount || !!controlledPagination;

  const table = useReactTable({
    data,
    columns: tableColumns,
    rowCount,
    enableRowSelection: showSelection,
    onRowSelectionChange: setRowSelection,
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
      rowSelection,
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

  const selectedRows = table.getSelectedRowModel()?.rows || [];

  return (
    <>
      {!hideHeader && (
        <div className="sticky -top-4 z-20 pb-2 bg-background">
          <CommaTableHeader
            table={table}
            searchColumn={searchColumn}
            tags={tags}
            addButton={addButton}
            readOnly={readOnly}
            isPortal={isPortal}
            translationPrefix={translationPrefix}
          />
        </div>
      )}
      {showSelection && selectedRows.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-xl border border-border bg-secondary/95 text-secondary-foreground p-3 px-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className="font-semibold select-none bg-background">
              {selectedRows.length} {t("table.bulk.selectedCount", { defaultValue: "öğe seçildi" })}
            </Badge>
            {selectedRows.reduce((acc, row) => {
              const val = row.original?.amount_in_try ?? row.original?.amountInTry ?? row.original?.total_in_try ?? row.original?.amount ?? row.original?.total ?? 0;
              return acc + (typeof val === "number" ? val : parseFloat(val) || 0);
            }, 0) > 0 && (
              <span className="font-medium text-foreground select-none flex items-center gap-1">
                {t("table.bulk.totalAmount", { defaultValue: "Toplam:" })}{" "}
                <span className="font-bold text-primary inline-flex items-center gap-0.5">
                  ₺{new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                    selectedRows.reduce((acc, row) => {
                      const val = row.original?.amount_in_try ?? row.original?.amountInTry ?? row.original?.total_in_try ?? row.original?.amount ?? row.original?.total ?? 0;
                      return acc + (typeof val === "number" ? val : parseFloat(val) || 0);
                    }, 0)
                  )}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {props.onBulkDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="h-8 gap-1.5 select-none"
                onClick={() => props.onBulkDelete?.(selectedRows.map((r) => r.original))}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t("table.bulk.delete", { defaultValue: "Seçilenleri Sil" })}</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 select-none dark:bg-black dark:text-white dark:hover:bg-black/80 dark:border-black"
              onClick={() => setRowSelection({})}
            >
              <X className="h-3.5 w-3.5" />
              <span>{t("table.bulk.clear", { defaultValue: "Seçimi Temizle" })}</span>
            </Button>
          </div>
        </div>
      )}
      <div className="rounded-md border overflow-clip" data-table-export>
        <div className="overflow-auto max-h-[calc(100vh-15.25rem)] scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
          <table className="w-full caption-bottom text-sm border-collapse">
            <TableHeader className="select-none z-10 bg-background sticky top-0 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-background!">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          isPortal ? "py-2! px-6" : "",
                          header.id === "select" && "w-10 px-3 text-center",
                          header.id === "name" && "w-36",
                          header.id === "tax_office" && "w-36",
                          header.id === "actions" && "w-1",
                          header.id === "debt_status" && "w-32",
                          header.id === "invoice_no" && "w-36",
                          header.id === "is_company" && "w-16",
                          header.id === "currency" && "w-16",
                          header.id === "payment_method" && "w-16",
                          header.id === "payment_date" && "w-16",
                          header.id === "due_date" && "w-16"
                        )}
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
                      className={cn(
                        "select-none",
                        isPortal ? "py-3! px-8!" : "py-1 px-1",
                        cell.column.id === "select" && "w-10 px-3 text-center",
                        cell.column.id === "#" && "px-2",
                        cell.column.id === "is_company" && "w-16 text-center",
                        cell.column.id === "name" && "w-36 overflow-hidden",
                        cell.column.id === "tax_office" && "w-36 overflow-hidden",
                        cell.column.id === "invoice_no" && "w-36 overflow-hidden",
                        cell.column.id === "debt_status" && "w-fit text-center",
                        cell.column.id === "actions" && "w-fit",
                        cell.column.id === "currency" && "w-fit text-center",
                        cell.column.id === "payment_method" && "w-fit text-center",
                        cell.column.id === "payment_date" && "w-fit text-center",
                        cell.column.id === "due_date" && "w-fit text-center",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ));

                  if (useContextMenuForActions && contextMenuItems && !readOnly) {
                    return (
                      <ContextMenu key={row.id}>
                        <ContextMenuTrigger
                          render={(props) => (
                            <tr
                              {...props}
                              className={cn(
                                "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted font-light",
                                isPortal ? "h-2!" : "h-11.25"
                              )}
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
                      className={cn(
                        "font-light border-b",
                        isPortal && "h-8!"
                      )}
                    >
                      {rowContent}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns?.length || columns?.length || 1}
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
      {hideHeader && table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2 mt-2">
          <Menu>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <MenuTrigger
                    {...props}
                    render={(props) => (
                      <Button
                        {...props}
                        nativeButton
                        variant="outline"
                        size="sm"
                        className="select-none h-9"
                      >
                        <Rows3 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">
                          {t("table.header.rowCount")}
                        </span>
                      </Button>
                    )}
                  />
                )}
              ></TooltipTrigger>
              <TooltipContent>
                {t("table.header.rowCount.hover")}
              </TooltipContent>
            </Tooltip>
            <MenuPanel align="end">
              {rowCounts.map((rowCount) => (
                <MenuCheckboxItem
                  key={`row-count-${rowCount}`}
                  checked={table.getState().pagination.pageSize === rowCount}
                  onCheckedChange={() => table.setPageSize(rowCount)}
                >
                  {t("table.header.rowCount.row", {
                    rowCount: rowCount,
                  })}
                </MenuCheckboxItem>
              ))}
            </MenuPanel>
          </Menu>
          <CommaTablePagination table={table} />
        </div>
      )}
    </>
  );
}
