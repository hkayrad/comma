import type { AvailableCurrency, DebtDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api";
import type { Column, ColumnDef, Row } from "@tanstack/react-table";
import HksTable from "@/layout/shared/table/HksTable";
import DebtDialog from "@/layout/shared/dialog/DebtDialog";
import { useDialog } from "@/contexts/dialog";
import FormattedCurrency from "@/layout/shared/table/utils/FormattedCurrency";
import FormattedDate from "@/layout/shared/table/utils/FormattedDate";
import SortableColumnHeader from "@/layout/shared/table/utils/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { formattedNumber } from "@/lib/utils/table";
import { useCallback, useMemo } from "react";
import { CurrencyIcons } from "@/lib/enums";

type Props = {
  data: DebtDto[];
  type: "receivable" | "payable";
  currency?: {
    state: AvailableCurrency;
    onChange: (value: AvailableCurrency) => void;
  };
};

export default function DebtTable(props: Props) {
  const { data, type, currency } = props;

  const { openDialog } = useDialog();

  const handleDelete = useCallback(
    (id: string) => {
      const API = type === "payable" ? PayableDebtApi : ReceivableDebtApi;
      const promise = API.Delete(id);
      toast.promise(promise, {
        loading: "Borç siliniyor...",
        success: () => {
          sendRefreshEvent();
          return "Borç başarıyla silindi";
        },
        error: "Borç silinirken hata oluştu",
      });
    },
    [type],
  );

  const onEdit = useCallback(
    (debtId: string) => {
      const debt = data.find((d) => d.id === debtId);

      if (!debt) {
        toast.error("Borç bulunamadı");
        return;
      }

      openDialog({
        title: "Borç Düzenle",
        description: "Borç bilgilerini düzenleyin",
        size: "3xl",
        content: <DebtDialog debt={debt} type={type} />,
        showCloseButton: true,
      });
    },
    [data, type, openDialog],
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
        id: "Müşteri",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }) => (
          <Tooltip disableHoverableContent>
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
      ...(["TRY", "USD", "EUR"] as AvailableCurrency[]).flatMap((curr) => [
        {
          accessorKey: "amount",
            id: `Tutar (${CurrencyIcons[curr]})`,
          header: ({ column }: { column: Column<any> }) => (
            <SortableColumnHeader column={column} title={column.id} />
          ),
          cell: ({ row, column }: { row: Row<any>; column: Column<any> }) => (
            <FormattedCurrency
              row={row}
              column={column}
              currency={curr as AvailableCurrency}
            />
          ),
          sortingFn: formattedNumber,
        },
        {
          accessorKey: "vat",
          id: `KDV (${CurrencyIcons[curr]})`,
          header: ({ column }: { column: Column<any> }) => (
            <SortableColumnHeader column={column} title={column.id} />
          ),
          cell: ({ row, column }: { row: Row<any>; column: Column<any> }) => (
            <FormattedCurrency
              row={row}
              column={column}
              currency={curr as AvailableCurrency}
            />
          ),
          sortingFn: formattedNumber,
        },
        {
          accessorKey: "total_amount",
          id: `Toplam (${CurrencyIcons[curr]})`,
          header: ({ column }: { column: Column<any> }) => (
            <SortableColumnHeader column={column} title={column.id} />
          ),
          cell: ({ row, column }: { row: Row<any>; column: Column<any> }) => (
            <FormattedCurrency
              row={row}
              column={column}
              currency={curr as AvailableCurrency}
            />
          ),
          sortingFn: formattedNumber,
        },
      ]),
      {
        accessorKey: "issue_date",
        id: "Düzenlenme Tarihi",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }) => <FormattedDate row={row} column={column} />,
      },
      {
        accessorKey: "invoice_no",
        id: "Fatura No",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }) => (
          <ClickToCopyText value={row.getValue(column.id) || "-"} />
        ),
      },
      {
        accessorKey: "description",
        id: "Açıklama",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }) => (
          <ClickToCopyText value={row.getValue(column.id) || "-"} />
        ),
      },
      {
        id: "İşlemler",
        header: ({ column }) => column.id,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(row.original.id!)}
                >
                  <Pencil />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Borç bilgilerini düzenle</TooltipContent>
            </Tooltip>
            <Tooltip disableHoverableContent>
              <Dialog>
                <DialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 fill-red-100 dark:fill-red-950">
                  Borcu sil
                </TooltipContent>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Emin misiniz?</DialogTitle>
                    <DialogDescription>
                      Bu işlem geri alınamaz. Bu, borç kaydını kalıcı olarak
                      silecektir.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">İptal</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(row.original.id!)}
                    >
                      Borcu Sil
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Tooltip>
          </div>
        ),
      },
    ],
    [onEdit, handleDelete],
  );

  const FilteredDebtTableColumns = useMemo(() => {
    return DebtTableColumns.filter(
      (col) =>
        (!col.id?.startsWith("Toplam") &&
          !col.id?.startsWith("Tutar") &&
          !col.id?.startsWith("KDV")) ||
        (currency ? col.id?.endsWith(`(${CurrencyIcons[currency.state]})`) : true),
    );
  }, [DebtTableColumns, currency]);

  return (
    <HksTable
      data={data.filter((d) => d.currency === currency?.state)}
      columns={FilteredDebtTableColumns}
      searchColumn="Müşteri"
      currency={currency}
    />
  );
}
