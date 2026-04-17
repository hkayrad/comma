import type { PaymentDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard, sendRefreshEvent } from "@/lib/utils";
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
import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { toast } from "sonner";
import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api/payment";
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
import HksTable from "@/layout/shared/table/HksTable";
import { Badge } from "@/components/ui/badge";
import PaymentDialog from "@/layout/payments/components/PaymentDialog";
import { useDialog } from "@/contexts/dialog";
import FormattedCurrency from "@/layout/shared/table/components/FormattedCurrency";
import FormattedDate from "@/layout/shared/table/components/FormattedDate";
import SortableColumnHeader from "@/layout/shared/table/components/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { formattedNumber } from "@/lib/utils/table/formattedNumberSorting";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CancelButton from "@/layout/shared/CancelButton";

type Props = {
  data: PaymentDto[];
  type: "receivable" | "payable";
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

export default function PaymentTable(props: Props) {
  const {
    data,
    type,
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

  const { openDialog } = useDialog();
  const { t } = useTranslation();

  const handleDelete = useCallback(
    (id: string) => {
      const API = type === "payable" ? PayablePaymentApi : ReceivablePaymentApi;
      const promise = API.Delete(id);
      toast.promise(promise, {
        loading: t("notification.payment.delete.pending"),
        success: () => {
          sendRefreshEvent();
          return t("notification.payment.delete.success");
        },
        error: t("notification.payment.delete.error"),
      });
    },
    [type, t],
  );

  const onEdit = useCallback(
    (paymentId: string) => {
      const payment = data.find((p) => p.id === paymentId);

      if (!payment) {
        toast.error(t("notification.payment.couldNotFind"));
        return;
      }

      openDialog({
        title: t("dialog.payment.edit.title"),
        description: t("dialog.payment.edit.description"),
        size: "3xl",
        content: <PaymentDialog payment={payment} type={type} />,
        showCloseButton: true,
      });
    },
    [data, openDialog, type, t],
  );

  const PaymentTableColumns: ColumnDef<PaymentDto>[] = useMemo(
    () => [
      {
        id: "#",
        header: ({ column }) => column.id,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "customer_name",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.customer_name")}
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
        accessorKey: "amount",
        header: ({ column }: { column: Column<any> }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.amount")}
          />
        ),
        cell: ({ row, column }: { row: Row<any>; column: Column<any> }) => (
          <FormattedCurrency
            row={row}
            column={column}
            currency={row.getValue("currency")}
          />
        ),
        sortingFn: formattedNumber,
      },
      {
        accessorKey: "currency",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.currency")}
          />
        ),
        cell: ({ row, column }) => {
          switch (row.getValue(column.id)) {
            case "TRY":
              return (
                <Badge
                  className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard("TRY", t)}
                >
                  TRY
                </Badge>
              );
            case "USD":
              return (
                <Badge
                  className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard("USD", t)}
                >
                  USD
                </Badge>
              );
            case "EUR":
              return (
                <Badge
                  className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard("EUR", t)}
                >
                  EUR
                </Badge>
              );
          }
        },
        filterFn: (row, columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0)
            return true;
          const rawValue = row.getValue(columnId);
          return filterValue.includes(rawValue);
        },
      },
      {
        accessorKey: "exchange_rate",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.exchange_rate")}
          />
        ),
        cell: ({ row, column }) => (
          <ClickToCopyText
            value={row.getValue(column.id) == 1 ? "-" : row.getValue(column.id)}
            column={column}
          />
        ),
      },
      {
        accessorKey: "amount_in_try",
        header: ({ column }: { column: Column<any> }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.amount_in_try")}
          />
        ),
        cell: ({ row, column }: { row: Row<any>; column: Column<any> }) => (
          <FormattedCurrency row={row} column={column} currency="TRY" />
        ),
        sortingFn: formattedNumber,
      },
      {
        accessorKey: "payment_method",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.payment_method")}
          />
        ),
        cell: ({ row, column }) => {
          switch (row.getValue(column.id)) {
            case "cash":
              return (
                <Badge
                  className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard(t("vars.cash"), t)}
                >
                  {t("vars.cash")}
                </Badge>
              );
            case "bank_transfer":
              return (
                <Badge
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard(t("vars.bank_transfer"), t)}
                >
                  {t("vars.bank_transfer")}
                </Badge>
              );
            case "check":
              return (
                <Badge
                  className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard(t("vars.check"), t)}
                >
                  {t("vars.check")}
                </Badge>
              );
            case "card":
              return (
                <Badge
                  className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard(t("vars.card"), t)}
                >
                  {t("vars.card")}
                </Badge>
              );
          }
        },
        filterFn: (row, columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0)
            return true;
          const rawValue = row.getValue(columnId);
          let displayValue = "";
          switch (rawValue) {
            case "cash":
              displayValue = t("vars.cash");
              break;
            case "bank_transfer":
              displayValue = t("vars.bank_transfer");
              break;
            case "check":
              displayValue = t("vars.check");
              break;
            case "card":
              displayValue = t("vars.card");
              break;
          }
          return filterValue.includes(displayValue);
        },
      },
      {
        accessorKey: "payment_date",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.payment_date")}
          />
        ),
        cell: ({ row, column }) => <FormattedDate row={row} column={column} />,
      },
      {
        accessorKey: "due_date",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.due_date")}
          />
        ),
        cell: ({ row, column }) =>
          row.getValue(column.id) ? (
            <FormattedDate row={row} column={column} />
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        accessorKey: "invoice_no",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.invoice_no")}
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
            <TooltipContent side="right" hidden={!row.getValue(column.id)}>
              {row.getValue(column.id) || "-"}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("payment.table.column.description")}
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
            <TooltipContent side="right" hidden={!row.getValue(column.id)}>
              {row.getValue(column.id) || "-"}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        header: t("payment.table.column.actions"),
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
                    onClick={() => onEdit(row.original.id!)}
                  >
                    <Pencil />
                  </Button>
                )}
              />
              <TooltipContent>
                {t("payment.table.column.actions.edit")}
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
                  {t("payment.table.column.actions.delete")}
                </TooltipContent>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("payment.table.column.actions.delete.title")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("payment.table.column.actions.delete.description")}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose
                      render={(props) => <CancelButton {...props} />}
                    ></DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(row.original.id!)}
                    >
                      {t("payment.table.column.actions.delete.confirm")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Tooltip>
          </div>
        ),
      },
    ],
    [handleDelete, onEdit, t],
  );

  const tags = useMemo(
    () => [
      {
        column: "payment_method",
        column_label: t("payment.table.column.payment_method"),
        value: t("vars.cash"),
        color: "green",
      },
      {
        column: "payment_method",
        column_label: t("payment.table.column.payment_method"),
        value: t("vars.bank_transfer"),
        color: "blue",
      },
      {
        column: "payment_method",
        column_label: t("payment.table.column.payment_method"),
        value: t("vars.check"),
        color: "yellow",
      },
      {
        column: "payment_method",
        column_label: t("payment.table.column.payment_method"),
        value: t("vars.card"),
        color: "purple",
      },
      {
        column: "currency",
        column_label: t("payment.table.column.currency"),
        value: "TRY",
        color: "red",
      },
      {
        column: "currency",
        column_label: t("payment.table.column.currency"),
        value: "USD",
        color: "green",
      },
      {
        column: "currency",
        column_label: t("payment.table.column.currency"),
        value: "EUR",
        color: "purple",
      },
    ],
    [t],
  );

  return (
    <HksTable
      data={data}
      columns={PaymentTableColumns}
      searchColumn="customer_name"
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
          <ContextMenuItem onClick={() => onEdit(c.id!)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("payment.table.column.actions.edit")}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => handleDelete(c.id!)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("payment.table.column.actions.delete")}
          </ContextMenuItem>
        </>
      )}
    />
  );
}
