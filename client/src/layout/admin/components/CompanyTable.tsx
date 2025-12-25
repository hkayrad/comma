import type { CompanyDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sendRefreshEvent } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AdminCompanyApi } from "@/lib/api/admin";
import type {
  ColumnDef,
  PaginationState,
  OnChangeFn,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import HksTable from "@/layout/shared/table/HksTable";
import CompanyDialog from "./CompanyDialog";
import { useDialog } from "@/contexts/dialog";
import SortableColumnHeader from "@/layout/shared/table/components/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

type Props = {
  data: CompanyDto[];
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  onManageUsers?: (company: CompanyDto) => void;
};

export default function CompanyTable(props: Props) {
  const {
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
    onManageUsers,
  } = props;

  const { openDialog } = useDialog();
  const { t } = useTranslation();

  const handleDelete = useCallback(
    (id: string) => {
      const promise = AdminCompanyApi.Delete(id);
      toast.promise(promise, {
        loading: t("notification.customer.delete.pending"),
        success: () => {
          sendRefreshEvent();
          return t("notification.customer.delete.succes");
        },
        error: t("notification.customer.delete.error"),
      });
    },
    [t],
  );

  const getCompanyBadge = useCallback(
    (isCompany: number) => {
      switch (isCompany) {
        case 2:
          return (
            <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 select-none">
              {t("user.role.admin")}
            </Badge>
          );
        case 1:
          return (
            <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 select-none">
              {t("vars.is_company.true")}
            </Badge>
          );
        default:
          return (
            <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 select-none">
              {t("vars.is_company.false")}
            </Badge>
          );
      }
    },
    [t],
  );

  const onEdit = useCallback(
    (company: CompanyDto) => {
      openDialog({
        title: t("dialog.customer.edit.title"),
        description: t("dialog.customer.edit.description"),
        size: "3xl",
        content: <CompanyDialog company={company} />,
        showCloseButton: true,
      });
    },
    [openDialog, t],
  );

  const CompanyTableColumns: ColumnDef<CompanyDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.name")}
          />
        ),
        cell: ({ row }) => (
          <ClickToCopyText
            value={row.getValue("name")}
            className="font-medium"
          />
        ),
      },
      {
        accessorKey: "is_company",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.is_company")}
          />
        ),
        cell: ({ row }) => getCompanyBadge(row.getValue("is_company")),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={t("vars.email")} />
        ),
        cell: ({ row }) => (
          <ClickToCopyText value={row.getValue("email") || "-"} />
        ),
      },
      {
        accessorKey: "phone",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={t("vars.phone")} />
        ),
        cell: ({ row }) => (
          <ClickToCopyText value={row.getValue("phone") || "-"} />
        ),
      },
      {
        accessorKey: "tax_number",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={t("vars.tax_number")} />
        ),
        cell: ({ row }) => (
          <ClickToCopyText value={row.getValue("tax_number") || "-"} />
        ),
      },
      {
        accessorKey: "tax_office",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.tax_office")}
          />
        ),
        cell: ({ row }) => row.getValue("tax_office") || "-",
      },
      {
        accessorKey: "address",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={t("vars.address")} />
        ),
        cell: ({ row }) => {
          const address = row.getValue("address") as string;
          if (!address) return "-";
          return (
            <Tooltip>
              <TooltipTrigger className="max-w-48 truncate">
                {address}
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-64">{address}</p>
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        id: "actions",
        header: t("dashboard.table.column.actions"),
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() => onManageUsers?.(row.original)}
                  >
                    <Users />
                  </Button>
                )}
              />
              <TooltipContent>{t("user.role.manager")}</TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(row.original)}
                  >
                    <Pencil />
                  </Button>
                )}
              />
              <TooltipContent>
                {t("dashboard.table.column.actions.edit_details")}
              </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <Dialog>
                <DialogTrigger
                  render={(props) => (
                    <TooltipTrigger
                      {...props}
                      render={(props) => (
                        <Button
                          {...props}
                          nativeButton
                          variant="ghost"
                          size="icon"
                          className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300"
                        >
                          <Trash2 />
                        </Button>
                      )}
                    />
                  )}
                />
                <TooltipContent className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 fill-red-100 dark:fill-red-950">
                  {t("vars.delete")}
                </TooltipContent>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("dashboard.table.column.actions.delete.title")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("dashboard.table.column.actions.delete.description", {
                        name: row.original.name,
                      })}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose
                      render={(props) => (
                        <Button {...props} nativeButton variant="outline">
                          {t("vars.cancel")}
                        </Button>
                      )}
                    />
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(row.original.id!)}
                    >
                      {t("dashboard.table.column.actions.delete.confirm")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Tooltip>
          </div>
        ),
      },
    ],
    [t, onEdit, handleDelete, onManageUsers, getCompanyBadge],
  );

  const tags = useMemo(
    () => [
      {
        column: "is_company",
        column_label: t("dashboard.table.column.is_company"),
        value: "2",
        label: t("user.role.admin"),
        color: "red",
      },
      {
        column: "is_company",
        column_label: t("dashboard.table.column.is_company"),
        value: "1",
        label: t("vars.is_company.true"),
        color: "blue",
      },
      {
        column: "is_company",
        column_label: t("dashboard.table.column.is_company"),
        value: "0",
        label: t("vars.is_company.false"),
        color: "green",
      },
    ],
    [t],
  );

  return (
    <HksTable
      data={data}
      columns={CompanyTableColumns}
      searchColumn="name"
      tags={tags}
      rowCount={rowCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
    />
  );
}
