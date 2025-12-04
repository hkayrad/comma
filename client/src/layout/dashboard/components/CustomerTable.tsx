import type { CustomerDto, OverviewViewType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Info, Paperclip, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard, sendRefreshEvent } from "@/lib/utils";
import { useNavigate } from "react-router";
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
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api";
import type { Column, ColumnDef, Row } from "@tanstack/react-table";
import HksTable from "@/layout/shared/table/HksTable";
import { useDialog } from "@/contexts/dialog";
import CustomerDialog from "@/layout/shared/dialog/CustomerDialog";
import CustomerDetails from "./CustomerDetails";
import FormattedCurrency from "@/layout/shared/table/utils/FormattedCurrency";
import SortableColumnHeader from "@/layout/shared/table/utils/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { formattedNumber } from "@/lib/utils/table";
import { useCallback, useMemo } from "react";

type Props = {
  data: CustomerDto[];
  type?: OverviewViewType;
};

export default function CustomerTable(props: Props) {
  const { data, type = "receivable" } = props;

  const API = type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const { openDialog } = useDialog();
  const navigate = useNavigate();

  const handleDelete = useCallback(
    (id: string) => {
      const promise = API.Delete(id);
      toast.promise(promise, {
        loading: "Müşteri siliniyor...",
        success: () => {
          sendRefreshEvent();
          return "Müşteri başarıyla silindi";
        },
        error: "Müşteri silinirken hata oluştu",
      });
    },
    [API],
  );

  const onEdit = useCallback(
    (customerId: string) => {
      const customer = data.find((c) => c.id === customerId);

      if (!customer) {
        toast.error("Müşteri bulunamadı");
        return;
      }

      openDialog({
        title: "Müşteri Düzenle",
        description: "Müşteri bilgilerini düzenleyin",
        size: "3xl",
        content: <CustomerDialog customer={customer} type={type} />,
        showCloseButton: true,
      });
    },
    [data, openDialog, type],
  );

  const onDetails = useCallback(
    (customerId: string) => {
      const customer = data.find((c) => c.id === customerId);

      if (!customer) {
        toast.error("Müşteri bulunamadı");
        return;
      }

      openDialog({
        title: `Müşteri Bilgileri`,
        description: `${customer.is_company ? "Vergi No" : "TC Kimlik No"}: ${customer.tax_number || "-"} | Vergi Dairesi: ${customer.tax_office || "-"}`,
        size: "3xl",
        content: <CustomerDetails customer={customer} type={type} />,
        showCloseButton: true,
      });
    },
    [data, type, openDialog],
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
      {
        accessorKey: "is_company",
        id: "Tür",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }) => {
          const isCompany = row.getValue(column.id);
          return isCompany ? (
            <Badge
              className="bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-100 select-none hover:cursor-copy"
              onClick={() => copyToClipboard("Şirket")}
            >
              Şirket
            </Badge>
          ) : (
            <Badge
              className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 select-none hover:cursor-copy"
              onClick={() => copyToClipboard("Birey")}
            >
              Birey
            </Badge>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0)
            return true;
          const cellValue = row.getValue(columnId) ? "Şirket" : "Birey";
          return filterValue.includes(cellValue);
        },
      },
      {
        accessorKey: "tax_office",
        id: "Vergi Dairesi",
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
      {
        accessorKey: "tax_number",
        id: "Vergi No",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }) => (
          <ClickToCopyText value={row.getValue(column.id) || "-"} />
        ),
      },
      {
        accessorKey: "mersis_no",
        id: "Mersis No",
        header: ({ column }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }) => (
          <ClickToCopyText value={row.getValue(column.id) || "-"} />
        ),
      },
      {
        accessorKey: `total_debt`,
        id: `Toplam`,
        header: ({ column }: { column: Column<any> }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }: { row: any; column: any }) => (
          <FormattedCurrency row={row} column={column} currency={"TRY"} />
        ),
        sortingFn: formattedNumber,
      },
      {
        accessorKey: `total_payments`,
        id: `Ödenmiş`,
        header: ({ column }: { column: Column<any> }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }: { row: any; column: any }) => (
          <FormattedCurrency row={row} column={column} currency={"TRY"} />
        ),
        sortingFn: formattedNumber,
      },
      {
        accessorKey: `remaining_debt`,
        id: `Kalan`,
        header: ({ column }: { column: Column<any> }) => (
          <SortableColumnHeader column={column} title={column.id} />
        ),
        cell: ({ row, column }: { row: Row<any>; column: Column<any> }) => (
          <FormattedCurrency row={row} column={column} currency={"TRY"} />
        ),
        sortingFn: formattedNumber,
      },
      {
        id: `Borç Durumu`,
        header: ({ column }: { column: Column<any> }) => column.id,
        cell: ({ row }: { row: Row<any> }) => {
          const remaining_debt = parseFloat(row.getValue(`Kalan`));
          if (remaining_debt > 0)
            return (
              <Badge
                className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 select-none hover:cursor-copy"
                onClick={() =>
                  copyToClipboard(
                    type === "receivable" ? "Alacağınız Var" : "Borcunuz Var",
                  )
                }
              >
                {type === "receivable" ? "Alacağınız Var" : "Borcunuz Var"}
              </Badge>
            );
          else if (remaining_debt < 0)
            return (
              <Badge
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 select-none hover:cursor-copy"
                onClick={() =>
                  copyToClipboard(
                    type === "receivable" ? "Borcunuz Var" : "Alacağınız Var",
                  )
                }
              >
                {type === "receivable" ? "Borcunuz Var" : "Alacağınız Var"}
              </Badge>
            );
          else
            return (
              <Badge
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 select-none hover:cursor-copy"
                onClick={() =>
                  copyToClipboard(
                    type === "receivable" ? "Alacağınız Yok" : "Borcunuz Yok",
                  )
                }
              >
                {type === "receivable" ? "Alacağınız Yok" : "Borcunuz Yok"}
              </Badge>
            );
        },
        filterFn: (row, _columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0)
            return true;
          const remaining_debt = parseFloat(row.getValue(`Kalan`));
          let status = "";
          if (remaining_debt > 0) {
            status = type === "receivable" ? "Alacağınız Var" : "Borcunuz Var";
          } else if (remaining_debt < 0) {
            status = type === "receivable" ? "Borcunuz Var" : "Alacağınız Var";
          } else {
            status = type === "receivable" ? "Alacağınız Yok" : "Borcunuz Yok";
          }
          return filterValue.includes(status);
        },
      },
      {
        id: "İşlemler",
        header: ({ column }) => column.id,
        cell: ({ row }: { row: Row<CustomerDto> }) => (
          <div className="flex gap-2">
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
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
              </TooltipTrigger>
              <TooltipContent>Borç dökümünü görüntüle</TooltipContent>
            </Tooltip>
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDetails(row.original.id!)}
                >
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Müşteri detaylarını görüntüle</TooltipContent>
            </Tooltip>
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
              <TooltipContent>Müşteri bilgilerini düzenle</TooltipContent>
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
                  Müşteriyi sil
                </TooltipContent>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Emin misiniz?</DialogTitle>
                    <DialogDescription>
                      Bu işlem müşteri kaydını silecektir. Onaylıyor musunuz?
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
                      Müşteriyi Sil
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Tooltip>
          </div>
        ),
      },
    ],
    [handleDelete, navigate, onDetails, onEdit, type],
  );

  const tags = useMemo(
    () =>
      type === "receivable"
        ? [
            { column: "Tür", value: "Şirket", color: "violet" },
            { column: "Tür", value: "Birey", color: "orange" },
            { column: "Borç Durumu", value: "Alacağınız Var", color: "red" },
            { column: "Borç Durumu", value: "Alacağınız Yok", color: "green" },
            { column: "Borç Durumu", value: "Borcunuz Var", color: "blue" },
          ]
        : [
            { column: "Tür", value: "Şirket", color: "violet" },
            { column: "Tür", value: "Birey", color: "orange" },
            { column: "Borç Durumu", value: "Alacağınız Var", color: "blue" },
            { column: "Borç Durumu", value: "Borcunuz Yok", color: "green" },
            { column: "Borç Durumu", value: "Borcunuz Var", color: "red" },
          ],
    [type],
  );

  return (
    <HksTable
      data={data}
      columns={CustomerTableColumns}
      searchColumn="Müşteri"
      tags={tags}
    />
  );
}
