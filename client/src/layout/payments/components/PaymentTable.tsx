import type { PaymentDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { copyToClipboard, sendRefreshEvent } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PaymentApi } from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import HKS_Table from "@/layout/shared/table/HKS_Table";
import { Badge } from "@/components/ui/badge";
import PaymentDialog from "@/layout/shared/dialog/PaymentDialog";
import { useDialog } from "@/contexts/DialogContext";

type Props = {
    data: PaymentDto[];
}

export default function PaymentTable(props: Props) {
    const { data } = props;

    const { openDialog } = useDialog();

    const handleDelete = (id: string) => {
        const promise = PaymentApi.Delete(id);
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
                <PaymentDialog payment={payment} />
            ),
            showCloseButton: true,
        });
    }

    const PaymentTableColumns: ColumnDef<PaymentDto>[] = [
        {
            id: "index",
            header: "#",
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: "customer_name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Müşteri
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <p
                    className="select-none hover:cursor-copy"
                    onClick={() => copyToClipboard(row.getValue("customer_name"))}
                >
                    {row.getValue("customer_name")}
                </p>
            )
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ödeme Miktarı
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const value = parseFloat(row.getValue("amount"));
                const formatted = value.toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY"
                });
                return <p
                    className="select-none hover:cursor-copy"
                    onClick={() => copyToClipboard(formatted)}
                >
                    {formatted}
                </p>
            }
        },
        {
            accessorKey: "payment_method",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ödeme Yöntemi
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                switch (row.getValue("payment_method")) {
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
                }
            }
        },
        {
            accessorKey: "payment_date",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ödeme Tarihi
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("payment_date"));
                const formatted = date.toLocaleDateString("tr-TR");
                return <p
                    className="select-none hover:cursor-copy"
                    onClick={() => copyToClipboard(formatted)}
                >
                    {formatted}
                </p>
            }
        },
        {
            accessorKey: "invoice_no",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Fatura No
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <p
                    className="select-none hover:cursor-copy"
                    onClick={() => copyToClipboard(row.getValue("invoice_no") || "-")}
                >
                    {row.getValue("invoice_no") || "-"}
                </p>
            )
        },
        {
            accessorKey: "description",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Açıklama
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <p
                    className="select-none hover:cursor-copy"
                    onClick={() => copyToClipboard(row.getValue("description") || "-")}
                >
                    {row.getValue("description") || "-"}
                </p>
            )
        },
        {
            id: "actions",
            header: "İşlemler",
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
        <HKS_Table data={data} columns={PaymentTableColumns} searchColumn="customer_name" />
    )
}