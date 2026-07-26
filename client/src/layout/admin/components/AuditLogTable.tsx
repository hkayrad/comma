import type { AuditLogDto } from "@comma/common";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  ColumnDef,
  PaginationState,
  OnChangeFn,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import CommaTable from "@/layout/shared/table/CommaTable";
import FormattedDate from "@/layout/shared/table/components/FormattedDate";
import SortableColumnHeader from "@/layout/shared/table/components/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { useDialog } from "@/contexts/dialog";
import AuditLogDetailsDialog from "./AuditLogDetailsDialog";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  data: AuditLogDto[];
  rowCount?: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
}

export default function AuditLogTable({
  data,
  rowCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
}: Props) {
  const openDialog = useDialog((s) => s.openDialog);
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<AuditLogDto>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("audit.table.column.date", { defaultValue: "Tarih" })}
          />
        ),
        cell: ({ row, column }) => <FormattedDate row={row} column={column} />,
      },
      {
        accessorKey: "action",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("audit.table.column.action", { defaultValue: "İşlem" })}
          />
        ),
        cell: ({ row }) => {
          const action = row.getValue<string>("action");
          switch (action) {
            case "CREATE":
              return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">CREATE</Badge>;
            case "UPDATE":
              return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30">UPDATE</Badge>;
            case "DELETE":
              return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30">DELETE</Badge>;
            case "RESTORE":
              return <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30">RESTORE</Badge>;
            default:
              return <Badge variant="outline">{action}</Badge>;
          }
        },
      },
      {
        accessorKey: "entity_type",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("audit.table.column.entityType", { defaultValue: "Varlık Türü" })}
          />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.getValue("entity_type")}
          </Badge>
        ),
      },
      {
        accessorKey: "entity_id",
        header: t("audit.table.column.entityId", { defaultValue: "Varlık ID" }),
        cell: ({ row, column }) => (
          <ClickToCopyText value={row.getValue("entity_id") || "-"} column={column} />
        ),
      },
      {
        accessorKey: "ip_address",
        header: t("audit.table.column.ip", { defaultValue: "IP Adresi" }),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.getValue("ip_address") || "-"}
          </span>
        ),
      },
      {
        id: "actions",
        header: t("audit.table.column.actions", { defaultValue: "Detay" }),
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1"
            onClick={() =>
              openDialog({
                title: t("audit.dialog.title", { defaultValue: "Denetim Kaydı Detayı" }),
                size: "2xl",
                content: <AuditLogDetailsDialog log={row.original} />,
                showCloseButton: true,
              })
            }
          >
            <Eye className="h-4 w-4" />
            <span>{t("audit.action.view", { defaultValue: "İncele" })}</span>
          </Button>
        ),
      },
    ],
    [openDialog, t]
  );

  return (
    <CommaTable
      data={data}
      columns={columns}
      searchColumn="entity_type"
      rowCount={rowCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      enableRowSelection={false}
    />
  );
}
