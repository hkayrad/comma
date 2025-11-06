import type { PaymentDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { copyToClipboard, sendRefreshEvent } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import HksTable from "@/layout/shared/table/HksTable";
import { Badge } from "@/components/ui/badge";
import PaymentDialog from "@/layout/shared/dialog/PaymentDialog";
import { useDialog } from "@/contexts/DialogContext";
import FormattedCurrency from "@/layout/shared/table/utils/FormattedCurrency";
import FormattedDate from "@/layout/shared/table/utils/FormattedDate";
import SortableColumnHeader from "@/layout/shared/table/utils/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { formattedNumber } from "@/lib/utils/table";

type Props = {
    data: PaymentDto[];
    type: 'receivable' | 'payable';
}

export default function PaymentTable(props: Props) {
    const { data, type } = props;

    const { openDialog } = useDialog();

    const handleDelete = (id: string) => {
        const API = type === 'payable' ? PayablePaymentApi : ReceivablePaymentApi;
        const promise = API.Delete(id);
        toast.promise(promise, {
            loading: "Ödeme siliniyor...",
            success: () => {
                sendRefreshEvent();
                return "Ödeme başarıyla silindi"
            },
            error: "Ödeme silinirken hata oluştu"
        });
    }

    const onEdit = (paymentId: string) => {
        const payment = data.find(p => p.id === paymentId);

        if (!payment) {
            toast.error("Ödeme bulunamadı");
            return;
        }

        openDialog({
            title: "Ödeme Düzenle",
            description: "Ödeme bilgilerini düzenleyin",
            size: "3xl",
            content: (
                <PaymentDialog payment={payment} type={type} />
            ),
            showCloseButton: true,
        });
    }

    const PaymentTableColumns: ColumnDef<PaymentDto>[] = [
        {
            id: "#",
            header: ({ column }) => column.id,
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: "customer_name",
            id: "Müşteri",
            header: ({ column }) => <SortableColumnHeader column={column} title={column.id} />,
            cell: ({ row, column }) => (
                <Tooltip disableHoverableContent>
                    <TooltipTrigger className="text-left flex">
                        <ClickToCopyText value={row.getValue(column.id) || "-"} column={column} />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {row.getValue(column.id) || "-"}
                    </TooltipContent>
                </Tooltip>
            ),
        },
        {
            accessorKey: "amount",
            id: "Ödeme Miktarı",
            header: ({ column }) => <SortableColumnHeader column={column} title={column.id} />,
            cell: ({ row, column }) => <FormattedCurrency row={row} column={column} />,
            sortingFn: formattedNumber,
        },
        {
            accessorKey: "payment_method",
            id: "Ödeme Yöntemi",
            header: ({ column }) => <SortableColumnHeader column={column} title={column.id} />,
            cell: ({ row, column }) => {
                switch (row.getValue(column.id)) {
                    case "cash":
                        return <Badge
                            className="bg-green-100 text-green-800 select-none hover:cursor-copy"
                            onClick={() => copyToClipboard("Nakit")}
                        >Nakit</Badge>;
                    case "bank_transfer":
                        return <Badge className="bg-blue-100 text-blue-800 select-none hover:cursor-copy"
                            onClick={() => copyToClipboard("Havale")}
                        >Havale</Badge>;
                    case "check":
                        return <Badge className="bg-yellow-100 text-yellow-800 select-none hover:cursor-copy"
                            onClick={() => copyToClipboard("Çek")}
                        >Çek</Badge>;
                    case "card":
                        return <Badge className="bg-purple-100 text-purple-800 select-none hover:cursor-copy"
                            onClick={() => copyToClipboard("Kart")}
                        >Kart</Badge>;
                }
            }
        },
        {
            accessorKey: "payment_date",
            id: "Ödeme Tarihi",
            header: ({ column }) => <SortableColumnHeader column={column} title={column.id} />,
            cell: ({ row, column }) => <FormattedDate row={row} column={column} />,
        },
        {
            accessorKey: "invoice_no",
            id: "Fatura No",
            header: ({ column }) => <SortableColumnHeader column={column} title={column.id} />,
            cell: ({ row, column }) => <ClickToCopyText value={row.getValue(column.id) || "-"} />,
        },
        {
            accessorKey: "description",
            id: "Açıklama",
            header: ({ column }) => <SortableColumnHeader column={column} title={column.id} />,
            cell: ({ row, column }) => <ClickToCopyText value={row.getValue(column.id) || "-"} />,
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
                        <TooltipContent>
                            Ödeme bilgilerini düzenle
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip disableHoverableContent>
                        <Dialog>
                            <DialogTrigger asChild>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:bg-red-100 hover:text-red-600"
                                    >
                                        <Trash2 />
                                    </Button>
                                </TooltipTrigger>
                            </DialogTrigger>
                            <TooltipContent>
                                Ödemeyi sil
                            </TooltipContent>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Emin misiniz?</DialogTitle>
                                    <DialogDescription>
                                        Bu işlem geri alınamaz. Bu, ödeme kaydını kalıcı olarak silecektir.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">İptal</Button>
                                    </DialogClose>
                                    <Button variant="destructive" onClick={() => handleDelete(row.original.id!)}>Ödemeyi Sil</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <HksTable data={data} columns={PaymentTableColumns} searchColumn="Müşteri" />
    )
}