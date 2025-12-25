import type { DebtDto } from "@/lib/types";
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
import { toast } from "sonner";
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api/debt";
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
import DebtDialog from "@/layout/debts/components/DebtDialog";
import { useDialog } from "@/contexts/dialog";
import FormattedCurrency from "@/layout/shared/table/components/FormattedCurrency";
import FormattedDate from "@/layout/shared/table/components/FormattedDate";
import SortableColumnHeader from "@/layout/shared/table/components/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { formattedNumber } from "@/lib/utils/table/formattedNumberSorting";
import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

type Props = {
    data: DebtDto[];
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

export default function DebtTable(props: Props) {
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
            const API = type === "payable" ? PayableDebtApi : ReceivableDebtApi;
            const promise = API.Delete(id);
            toast.promise(promise, {
                loading: t("notification.debt.delete.pending"),
                success: () => {
                    sendRefreshEvent();
                    return t("notification.debt.delete.success");
                },
                error: t("notification.debt.delete.error"),
            });
        },
        [type, t],
    );

    const onEdit = useCallback(
        (debtId: string) => {
            const debt = data.find((d) => d.id === debtId);

            if (!debt) {
                toast.error(t("notification.debt.couldNotFind"));
                return;
            }

            openDialog({
                title: t("dialog.debt.edit.title"),
                description: t("dialog.debt.edit.description"),
                size: "3xl",
                content: <DebtDialog debt={debt} type={type} />,
                showCloseButton: true,
            });
        },
        [data, type, openDialog, t],
    );

    const DebtTableColumns: ColumnDef<DebtDto>[] = useMemo(
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
                        title={t("debt.table.column.customer_name")}
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
                        title={t("debt.table.column.amount")}
                    />
                ),
                cell: ({
                    row,
                    column,
                }: {
                    row: Row<any>;
                    column: Column<any>;
                }) => (
                    <FormattedCurrency
                        row={row}
                        column={column}
                        currency={row.getValue("currency")}
                    />
                ),
                sortingFn: formattedNumber,
            },
            {
                accessorKey: "vat",
                header: ({ column }: { column: Column<any> }) => (
                    <SortableColumnHeader
                        column={column}
                        title={t("debt.table.column.vat")}
                    />
                ),
                cell: ({
                    row,
                    column,
                }: {
                    row: Row<any>;
                    column: Column<any>;
                }) => (
                    <FormattedCurrency
                        row={row}
                        column={column}
                        currency={row.getValue("currency")}
                    />
                ),
                sortingFn: formattedNumber,
            },
            {
                accessorKey: "discount",
                header: ({ column }: { column: Column<any> }) => (
                    <SortableColumnHeader
                        column={column}
                        title={t("debt.table.column.discount")}
                    />
                ),
                cell: ({
                    row,
                    column,
                }: {
                    row: Row<any>;
                    column: Column<any>;
                }) =>
                    row.getValue("discount") === 0 ? (
                        "-"
                    ) : (
                        <FormattedCurrency
                            row={row}
                            column={column}
                            currency={row.getValue("currency")}
                            negative
                        />
                    ),
            },
            {
                accessorKey: "total",
                header: ({ column }: { column: Column<any> }) => (
                    <SortableColumnHeader
                        column={column}
                        title={t("debt.table.column.total")}
                    />
                ),
                cell: ({
                    row,
                    column,
                }: {
                    row: Row<any>;
                    column: Column<any>;
                }) => (
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
                        title={t("debt.table.column.currency")}
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
                        title={t("debt.table.column.exchange_rate")}
                    />
                ),
                cell: ({ row, column }) => (
                    <ClickToCopyText
                        value={
                            row.getValue(column.id) == 1
                                ? "-"
                                : row.getValue(column.id)
                        }
                        column={column}
                    />
                ),
            },
            {
                accessorKey: "total_in_try",
                header: ({ column }: { column: Column<any> }) => (
                    <SortableColumnHeader
                        column={column}
                        title={t("debt.table.column.total_in_try")}
                    />
                ),
                cell: ({
                    row,
                    column,
                }: {
                    row: Row<any>;
                    column: Column<any>;
                }) => (
                    <FormattedCurrency
                        row={row}
                        column={column}
                        currency="TRY"
                    />
                ),
                sortingFn: formattedNumber,
            },
            {
                accessorKey: "issue_date",
                header: ({ column }) => (
                    <SortableColumnHeader
                        column={column}
                        title={t("debt.table.column.issue_date")}
                    />
                ),
                cell: ({ row, column }) => (
                    <FormattedDate row={row} column={column} />
                ),
            },
            {
                accessorKey: "invoice_no",
                header: ({ column }) => (
                    <SortableColumnHeader
                        column={column}
                        title={t("debt.table.column.invoice_no")}
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
                accessorKey: "description",
                header: ({ column }) => (
                    <SortableColumnHeader
                        column={column}
                        title={t("debt.table.column.description")}
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
                id: "actions",
                header: t("debt.table.column.actions"),
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
                            ></TooltipTrigger>
                            <TooltipContent>
                                {t("debt.table.column.actions.edit")}
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
                                    {t("debt.table.column.actions.delete")}
                                </TooltipContent>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {t(
                                                "debt.table.column.actions.delete.title",
                                            )}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {t(
                                                "debt.table.column.actions.delete.description",
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose
                                            render={(props) => (
                                                <Button
                                                    {...props}
                                                    nativeButton
                                                    variant="outline"
                                                >
                                                    {t("vars.cancel")}
                                                </Button>
                                            )}
                                        ></DialogClose>
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                handleDelete(row.original.id!)
                                            }
                                        >
                                            {t(
                                                "debt.table.column.actions.delete.confirm",
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </Tooltip>
                    </div>
                ),
            },
        ],
        [onEdit, handleDelete, t],
    );

    const tags = useMemo(
        () => [
            {
                column: "currency",
                column_label: t("debt.table.column.currency"),
                value: "TRY",
                color: "red",
            },
            {
                column: "currency",
                column_label: t("debt.table.column.currency"),
                value: "USD",
                color: "green",
            },
            {
                column: "currency",
                column_label: t("debt.table.column.currency"),
                value: "EUR",
                color: "purple",
            },
        ],
        [t],
    );

    return (
        <HksTable
            data={data}
            columns={DebtTableColumns}
            tags={tags}
            searchColumn="customer_name"
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
