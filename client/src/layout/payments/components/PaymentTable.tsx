import type { AvailableCurrency, PaymentDto } from "@/lib/types";
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
import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api";
import type { Column, ColumnDef, Row } from "@tanstack/react-table";
import HksTable from "@/layout/shared/table/HksTable";
import { Badge } from "@/components/ui/badge";
import PaymentDialog from "@/layout/shared/dialog/PaymentDialog";
import { useDialog } from "@/contexts/dialog";
import FormattedCurrency from "@/layout/shared/table/utils/FormattedCurrency";
import FormattedDate from "@/layout/shared/table/utils/FormattedDate";
import SortableColumnHeader from "@/layout/shared/table/utils/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { formattedNumber } from "@/lib/utils/table";
import { useCallback, useEffect, useMemo } from "react";
import { CurrencyIcons } from "@/lib/enums";

type Props = {
  data: PaymentDto[];
  type: "receivable" | "payable";
  currency?: {
    state: AvailableCurrency;
    onChange: (value: AvailableCurrency) => void;
  };
};

export default function PaymentTable(props: Props) {
  const { data, type, currency } = props;

  const { openDialog } = useDialog();

  const handleDelete = useCallback(
    (id: string) => {
      const API = type === "payable" ? PayablePaymentApi : ReceivablePaymentApi;
      const promise = API.Delete(id);
      toast.promise(promise, {
        loading: "Ödeme siliniyor...",
        success: () => {
          sendRefreshEvent();
          return "Ödeme başarıyla silindi";
        },
        error: "Ödeme silinirken hata oluştu",
      });
    },
    [type],
  );

  const onEdit = useCallback(
    (paymentId: string) => {
      const payment = data.find((p) => p.id === paymentId);

      if (!payment) {
        toast.error("Ödeme bulunamadı");
        return;
      }

      openDialog({
        title: "Ödeme Düzenle",
        description: "Ödeme bilgilerini düzenleyin",
        size: "3xl",
        content: <PaymentDialog payment={payment} type={type} />,
        showCloseButton: true,
      });
    },
    [data, openDialog, type],
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
          id: `Ödeme Miktarı (${CurrencyIcons[curr]})`,
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
        accessorKey: "payment_method",
        id: "Ödeme Yöntemi",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }) => {
          switch (row.getValue(column.id)) {
            case "cash":
              return (
                <Badge
                  className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard("Nakit")}
                >
                  Nakit
                </Badge>
              );
            case "bank_transfer":
              return (
                <Badge
                  className="bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard("Havale")}
                >
                  Havale
                </Badge>
              );
            case "check":
              return (
                <Badge
                  className="bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard("Çek")}
                >
                  Çek
                </Badge>
              );
            case "card":
              return (
                <Badge
                  className="bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 select-none hover:cursor-copy"
                  onClick={() => copyToClipboard("Kart")}
                >
                  Kart
                </Badge>
              );
          }
        },
      },
      {
        accessorKey: "payment_date",
        id: "Ödeme Tarihi",
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
              <TooltipContent>Ödeme bilgilerini düzenle</TooltipContent>
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
                  Ödemeyi sil
                </TooltipContent>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Emin misiniz?</DialogTitle>
                    <DialogDescription>
                      Bu işlem geri alınamaz. Bu, ödeme kaydını kalıcı olarak
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
                      Ödemeyi Sil
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Tooltip>
          </div>
        ),
      },
    ],
    [handleDelete, onEdit],
  );

  const FilteredPaymentTableColumns = useMemo(() => {
    return PaymentTableColumns.filter(
      (col) =>
        !col.id?.startsWith("Ödeme Miktarı") ||
        (currency
          ? col.id?.endsWith(`(${CurrencyIcons[currency.state]})`)
          : true),
    );
  }, [PaymentTableColumns, currency]);

  useEffect(() => {
    console.log(data);
  }, [data, currency]);

  return (
    <HksTable
      data={data.filter((d) => d.currency === currency?.state)}
      columns={FilteredPaymentTableColumns}
      searchColumn="Müşteri"
      currency={currency}
    />
  );
}
