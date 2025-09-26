import type { DebtDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { copyToClipboard, notImplemented, sendRefreshEvent } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DebtApi } from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import HKS_Table from "@/layout/shared/table/HKS_Table";

type Props = {
    data: DebtDto[];
}

export default function DebtTable(props: Props) {
    const { data } = props;

    const handleDelete = (id: string) => {
        const promise = DebtApi.Delete(id);
        toast.promise(promise, {
            loading: "Borç siliniyor...",
            success: () => {
                sendRefreshEvent();
                return "Borç başarıyla silindi"
            },
            error: "Borç silinirken hata oluştu"
        });
    }

    const DebtTableColumns: ColumnDef<DebtDto>[] = [
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
                    Tutar
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
            accessorKey: "vat",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    KDV
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const value = parseFloat(row.getValue("vat"));
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
            accessorKey: "issue_date",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Düzenlenme Tarihi
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("issue_date"));
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
            accessorKey: "total_amount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Toplam
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const value = parseFloat(row.getValue("total_amount"));
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
            id: "actions",
            header: "İşlemler",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Tooltip disableHoverableContent>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={notImplemented}
                            >
                                <Pencil />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Borç bilgilerini düzenle
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
                                Borcu sil
                            </TooltipContent>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Emin misiniz?</DialogTitle>
                                    <DialogDescription>
                                        Bu işlem geri alınamaz. Bu, borç kaydını kalıcı olarak silecektir.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">İptal</Button>
                                    </DialogClose>
                                    <Button variant="destructive" onClick={() => handleDelete(row.original.id!)}>Borcu Sil</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <HKS_Table data={data} columns={DebtTableColumns} searchColumn="customer_name" />
    )
}