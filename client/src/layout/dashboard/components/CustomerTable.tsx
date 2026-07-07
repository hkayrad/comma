import type { CustomerDto, OverviewViewType } from "@comma/common";
import { Button } from "@/components/ui/button";
import { Info, Paperclip, Pencil, Trash2, CirclePlus, Wallet, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/utils";
import { useNavigate } from "react-router";
import {
  DialogClose,
} from "@/components/ui/dialog";
import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { toast } from "sonner";
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api/customer";
import type {
  Column,
  ColumnDef,
  Row,
  PaginationState,
  OnChangeFn,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import CommaTable from "@/layout/shared/table/CommaTable";
import { useDialog } from "@/contexts/dialog";
import { useEntityDialogs } from "@/hooks/use-entity-dialogs";
import CustomerDialog from "@/layout/shared/dialog/CustomerDialog";
import DebtDialog from "@/layout/debts/components/DebtDialog";
import PaymentDialog from "@/layout/payments/components/PaymentDialog";
import CustomerDetails from "./CustomerDetails";
import FormattedCurrency from "@/layout/shared/table/components/FormattedCurrency";
import SortableColumnHeader from "@/layout/shared/table/components/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { formattedNumber } from "@/lib/utils/table/formattedNumberSorting";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CancelButton from "@/layout/shared/CancelButton";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  data: CustomerDto[];
  type?: OverviewViewType;
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
};

export default function CustomerTable(props: Props) {
  const {
    data,
    type = "receivable",
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
    columnVisibility,
    onColumnVisibilityChange,
  } = props;

  const API = type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const queryClient = useQueryClient();
  const openDialog = useDialog((s) => s.openDialog);
  const closeDialog = useDialog((s) => s.closeDialog);
  const { openCustomerDialog, openDebtDialog, openPaymentDialog } = useEntityDialogs();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await API.Delete(id);
        queryClient.invalidateQueries({ queryKey: ["totals"] });
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        toast.success(t("notification.customer.delete.success"), {
          action: {
            label: t("vars.undo"),
            onClick: async () => {
              try {
                await API.Restore(id);
                queryClient.invalidateQueries({ queryKey: ["totals"] });
                queryClient.invalidateQueries({ queryKey: ["customers"] });
                toast.success(t("notification.customer.restore.success"));
              } catch {
                toast.error(t("notification.customer.restore.error"));
              }
            },
          },
        });
      } catch {
        toast.error(t("notification.customer.delete.error"));
      }
    },
    [API, t, queryClient],
  );

  const confirmDelete = useCallback(
    (id: string) => {
      openDialog({
        title: t("dashboard.table.column.actions.delete.title"),
        description: t("dashboard.table.column.actions.delete.description"),
        content: null,
        footer: (
          <>
            <DialogClose render={(props) => <CancelButton {...props} />} />
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete(id);
                closeDialog();
              }}
            >
              {t("dashboard.table.column.actions.delete.confirm")}
            </Button>
          </>
        ),
      });
    },
    [handleDelete, openDialog, closeDialog, t],
  );

  const onEdit = useCallback(
    (customerId: string) => {
      const customer = data.find((c) => c.id === customerId);

      if (!customer) {
        toast.error(t("dialog.customer.couldNotFind"));
        return;
      }

      openCustomerDialog({
        title: t("dialog.customer.edit.title"),
        description: t("dialog.customer.edit.description"),
        size: "3xl",
        content: <CustomerDialog customer={customer} type={type} />,
        showCloseButton: true,
      });
    },
    [data, openCustomerDialog, type, t],
  );

  const onDetails = useCallback(
    (customerId: string) => {
      const customer = data.find((c) => c.id === customerId);

      if (!customer) {
        toast.error(t("dialog.customer.couldNotFind"));
        return;
      }

      openDialog({
        title: t("dialog.customer.details.title"),
        description: t("dialog.customer.details.description", {
          tax_no_label: customer.is_company
            ? t("vars.tax_number")
            : t("vars.tckn"),
          tax_no: customer.tax_number,
          tax_office: customer.tax_office,
        }),
        size: "3xl",
        content: <CustomerDetails customer={customer} type={type} />,
        showCloseButton: true,
      });
    },
    [data, type, openDialog, t],
  );

  const onAddDebt = useCallback(
    (customerId: string) => {
      openDebtDialog({
        title: t("dialog.debt.add"),
        description:
          type === "receivable"
            ? t("dialog.receivable.add.description")
            : t("dialog.payable.add.description"),
        size: "3xl",
        content: <DebtDialog customerId={customerId} type={type} />,
        showCloseButton: true,
      });
    },
    [openDebtDialog, type, t],
  );

  const onAddPayment = useCallback(
    (customerId: string) => {
      openPaymentDialog({
        title: t("dialog.payment.add"),
        description:
          type === "receivable"
            ? t("dialog.receivablePayment.add.description")
            : t("dialog.payablePayment.add.description"),
        size: "3xl",
        content: <PaymentDialog customerId={customerId} type={type} />,
        showCloseButton: true,
      });
    },
    [openPaymentDialog, type, t],
  );

  const CustomerTableColumns: ColumnDef<CustomerDto>[] = useMemo(
    () => [
      {
        id: "#",
        header: ({ column }) => column.id,
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
        cell: ({ row, column }) => (
          <Tooltip disableHoverablePopup>
            <TooltipTrigger className="text-left flex">
              <ClickToCopyText
                value={row.getValue(column.id) || "-"}
                column={column}
              />
            </TooltipTrigger>
            <TooltipContent side="right">
              {row.getValue(column.id) || "-"}
            </TooltipContent>
          </Tooltip>
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
        cell: ({ row, column }) => {
          const isCompany = row.getValue(column.id);
          return isCompany ? (
            <Badge
              className="bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-100 select-none hover:cursor-copy self-center"
              onClick={() => copyToClipboard(t("vars.is_company.true"), t)}
            >
              {t("vars.is_company.true")}
            </Badge>
          ) : (
            <Badge
              className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 select-none hover:cursor-copy"
              onClick={() => copyToClipboard(t("vars.is_company.false"), t)}
            >
              {t("vars.is_company.false")}
            </Badge>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0)
            return true;
          const cellValue = row.getValue(columnId)
            ? t("vars.is_company.true")
            : t("vars.is_company.false");
          return filterValue.includes(cellValue);
        },
      },
      {
        accessorKey: "tax_office",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.tax_office")}
          />
        ),
        cell: ({ row, column }) => (
          <Tooltip disableHoverablePopup>
            <TooltipTrigger className="text-left flex">
              <ClickToCopyText
                value={row.getValue(column.id) || "-"}
                column={column}
              />
            </TooltipTrigger>
            <TooltipContent side="right">
              {row.getValue(column.id) || "-"}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "tax_number",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.tax_number")}
          />
        ),
        cell: ({ row, column }) => (
          <ClickToCopyText value={row.getValue(column.id) || "-"} />
        ),
      },
      {
        accessorKey: "mersis_no",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.mersis_no")}
          />
        ),
        cell: ({ row, column }) => (
          <ClickToCopyText value={row.getValue(column.id) || "-"} />
        ),
      },
      {
        accessorKey: `total_debt`,
        header: ({ column }: { column: Column<CustomerDto> }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.total_debt")}
          />
        ),
        cell: ({ row, column }: { row: Row<CustomerDto>; column: Column<CustomerDto> }) => (
          <FormattedCurrency row={row} column={column} currency={"TRY"} />
        ),
        sortingFn: formattedNumber,
      },
      {
        accessorKey: `total_payments`,
        header: ({ column }: { column: Column<CustomerDto> }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.total_payments")}
          />
        ),
        cell: ({ row, column }: { row: Row<CustomerDto>; column: Column<CustomerDto> }) => (
          <FormattedCurrency row={row} column={column} currency={"TRY"} />
        ),
        sortingFn: formattedNumber,
      },
      {
        accessorKey: `remaining_debt`,
        header: ({ column }: { column: Column<CustomerDto> }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.remaining_debt")}
          />
        ),
        cell: ({ row, column }: { row: Row<CustomerDto>; column: Column<CustomerDto> }) => (
          <FormattedCurrency row={row} column={column} currency={"TRY"} />
        ),
        sortingFn: formattedNumber,
      },
      {
        id: "debt_status",
        header: t("dashboard.table.column.debt_status"),
        cell: ({ row }: { row: Row<CustomerDto> }) => {
          const remaining_debt = parseFloat(row.getValue(`remaining_debt`));
          if (remaining_debt > 0.005)
            return (
              <Badge
                className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 select-none hover:cursor-copy"
                onClick={() =>
                  copyToClipboard(
                    type === "receivable"
                      ? t("vars.debt_status.has_debt")
                      : t("vars.debt_status.has_receivable"),
                    t,
                  )
                }
              >
                {type === "receivable"
                  ? t("vars.debt_status.has_debt")
                  : t("vars.debt_status.has_receivable")}
              </Badge>
            );
          else if (remaining_debt < -0.005)
            return (
              <Badge
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 select-none hover:cursor-copy"
                onClick={() =>
                  copyToClipboard(
                    type === "receivable"
                      ? t("vars.debt_status.has_receivable")
                      : t("vars.debt_status.has_debt"),
                    t,
                  )
                }
              >
                {type === "receivable"
                  ? t("vars.debt_status.has_receivable")
                  : t("vars.debt_status.has_debt")}
              </Badge>
            );
          else
            return (
              <Badge
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 select-none hover:cursor-copy"
                onClick={() =>
                  copyToClipboard(
                    type === "receivable"
                      ? t("vars.debt_status.has_no_debt")
                      : t("vars.debt_status.has_no_receivable"),
                    t,
                  )
                }
              >
                {type === "receivable"
                  ? t("vars.debt_status.has_no_debt")
                  : t("vars.debt_status.has_no_receivable")}
              </Badge>
            );
        },
        filterFn: (row, _columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0)
            return true;
          const remaining_debt = parseFloat(row.getValue(`remaining_debt`));
          let status = "";
          if (remaining_debt > 0.005) {
            status =
              type === "receivable"
                ? t("vars.debt_status.has_debt")
                : t("vars.debt_status.has_receivable");
          } else if (remaining_debt < -0.005) {
            status =
              type === "receivable"
                ? t("vars.debt_status.has_receivable")
                : t("vars.debt_status.has_debt");
          } else {
            status =
              type === "receivable"
                ? t("vars.debt_status.has_no_debt")
                : t("vars.debt_status.has_no_receivable");
          }
          return filterValue.includes(status);
        },
      },
      {
        id: "actions",
        header: t("dashboard.table.column.actions"),
        cell: ({ row }: { row: Row<CustomerDto> }) => (
          <div className="flex gap-2">
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() => onAddDebt(row.original.id!)}
                  >
                    <CirclePlus />
                  </Button>
                )}
              />
              <TooltipContent>
                {t(
                  type === "receivable"
                    ? "dashboard.addButton.actions.receivable.addReceivable"
                    : "dashboard.addButton.actions.payable.addPayable",
                )}
              </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() => onAddPayment(row.original.id!)}
                  >
                    <Wallet />
                  </Button>
                )}
              />
              <TooltipContent>
                {t(
                  type === "receivable"
                    ? "dashboard.addButton.actions.receivable.addPayment"
                    : "dashboard.addButton.actions.payable.addPayment",
                )}
              </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate(
                        `${type === "receivable" ? "/alacaklar" : "/borclar"}/borc_dokumu/${row.original.id}`,
                      )
                    }
                  >
                    <Paperclip />
                  </Button>
                )}
              ></TooltipTrigger>
              <TooltipContent>
                {t("dashboard.table.column.actions.show_statement")}
              </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() => onDetails(row.original.id!)}
                  >
                    <Info />
                  </Button>
                )}
              />
              <TooltipContent>
                {t("dashboard.table.column.actions.show_details")}
              </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const portalUrl = `${window.location.origin}/p/${row.original.company_id}`;
                      copyToClipboard(portalUrl, t);
                    }}
                  >
                    <Share2 />
                  </Button>
                )}
              />
              <TooltipContent>
                {t("dashboard.table.column.actions.share_portal")}
              </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(row.original.id!)}
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
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300"
                    onClick={() => confirmDelete(row.original.id!)}
                  >
                    <Trash2 />
                  </Button>
                )}
              />
              <TooltipContent className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 fill-red-100 dark:fill-red-950">
                {t("dashboard.table.column.actions.delete")}
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [confirmDelete, navigate, onDetails, onEdit, onAddDebt, onAddPayment, type, t],
  );

  const tags = useMemo(
    () =>
      type === "receivable"
        ? [
            {
              column: "is_company",
              column_label: t("dashboard.table.column.is_company"),
              value: "true",
              label: t("vars.is_company.true"),
              color: "violet",
            },
            {
              column: "is_company",
              column_label: t("dashboard.table.column.is_company"),
              value: "false",
              label: t("vars.is_company.false"),
              color: "orange",
            },
            {
              column: "debt_status",
              column_label: t("dashboard.table.column.debt_status"),
              value: "HAS_DEBT",
              label: t("vars.debt_status.has_debt"),
              color: "red",
            },
            {
              column: "debt_status",
              column_label: t("dashboard.table.column.debt_status"),
              value: "HAS_NO_DEBT",
              label: t("vars.debt_status.has_no_debt"),
              color: "green",
            },
            {
              column: "debt_status",
              column_label: t("dashboard.table.column.debt_status"),
              value: "HAS_RECEIVABLE",
              label: t("vars.debt_status.has_receivable"),
              color: "blue",
            },
          ]
        : [
            {
              column: "is_company",
              column_label: t("dashboard.table.column.is_company"),
              value: "true",
              label: t("vars.is_company.true"),
              color: "violet",
            },
            {
              column: "is_company",
              column_label: t("dashboard.table.column.is_company"),
              value: "false",
              label: t("vars.is_company.false"),
              color: "orange",
            },
            {
              column: "debt_status",
              column_label: t("dashboard.table.column.debt_status"),
              value: "HAS_DEBT",
              label: t("vars.debt_status.has_receivable"),
              color: "red",
            },
            {
              column: "debt_status",
              column_label: t("dashboard.table.column.debt_status"),
              value: "HAS_NO_RECEIVABLE",
              label: t("vars.debt_status.has_no_receivable"),
              color: "green",
            },
            {
              column: "debt_status",
              column_label: t("dashboard.table.column.debt_status"),
              value: "HAS_RECEIVABLE",
              label: t("vars.debt_status.has_debt"),
              color: "blue",
            },
          ],
    [type, t],
  );

  return (
    <CommaTable
      data={data}
      columns={CustomerTableColumns}
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
      contextMenuItems={(c) => (
        <>
          <ContextMenuItem onClick={() => onAddDebt(c.id!)}>
            <CirclePlus className="mr-2 h-4 w-4" />
            {t(
              type === "receivable"
                ? "dashboard.addButton.actions.receivable.addReceivable"
                : "dashboard.addButton.actions.payable.addPayable",
            )}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAddPayment(c.id!)}>
            <Wallet className="mr-2 h-4 w-4" />
            {t(
              type === "receivable"
                ? "dashboard.addButton.actions.receivable.addPayment"
                : "dashboard.addButton.actions.payable.addPayment",
            )}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() =>
              navigate(
                `${type === "receivable" ? "/alacaklar" : "/borclar"}/borc_dokumu/${c.id}`,
              )
            }
          >
            <Paperclip className="mr-2 h-4 w-4" />
            {t("dashboard.table.column.actions.show_statement")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDetails(c.id!)}>
            <Info className="mr-2 h-4 w-4" />
            {t("dashboard.table.column.actions.show_details")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onEdit(c.id!)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("dashboard.table.column.actions.edit_details")}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              const portalUrl = `${window.location.origin}/p/${c.company_id}`;
              copyToClipboard(portalUrl, t);
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t("dashboard.table.column.actions.share_portal")}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => confirmDelete(c.id!)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("dashboard.table.column.actions.delete")}
          </ContextMenuItem>
        </>
      )}
    />
  );
}
