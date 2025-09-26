import type { CustomerDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Info, Paperclip, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { copyToClipboard, notImplemented, sendRefreshEvent } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CustomerApi } from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import HKS_Table from "@/layout/shared/table/HKS_Table";

type Props = {
    data: CustomerDto[];
}

export default function CustomerTable(props: Props) {
    const { data } = props;

    const handleDelete = (id: string) => {
        const promise = CustomerApi.Delete(id);
        toast.promise(promise, {
            loading: "Müşteri siliniyor...",
            success: () => {
                sendRefreshEvent();
                return "Müşteri başarıyla silindi"
            },
            error: "Müşteri silinirken hata oluştu"
        });
    }

    const CustomerTableColumns: ColumnDef<CustomerDto>[] = [
        {
            id: "index",
            header: "#",
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    İsim
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <p
                    className="select-none hover:cursor-copy"
                    onClick={() => copyToClipboard(row.getValue("name"))}
                >
                    {row.getValue("name")}
                </p>
            )
        },
        {
            accessorKey: "tax_number",
            header: "Vergi No",
            cell: ({ row }) => (
                <p
                    className="select-none hover:cursor-copy"
                    onClick={() => copyToClipboard(row.getValue("tax_number") || "-")}
                >
                    {row.getValue("tax_number") || "-"}
                </p>
            )
        },
        {
            accessorKey: "total_debt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Toplam Borç
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const value = parseFloat(row.getValue("total_debt"));
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
            accessorKey: "total_payments",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ödenen
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const value = parseFloat(row.getValue("total_payments"));
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
            accessorKey: "remaining_debt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Kalan Borç
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const value = parseFloat(row.getValue("remaining_debt"));
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
            id: "has_debt",
            header: "Borç Durumu",
            cell: ({ row }) => {
                const remaining_debt = parseFloat(row.getValue("remaining_debt"));
                if (remaining_debt > 0)
                    return <Badge
                        className="bg-red-100 text-red-800 select-none hover:cursor-copy"
                        onClick={() => copyToClipboard("Borçlu")}
                    >Borçlu</Badge>
                else if (remaining_debt < 0)
                    return <Badge className="bg-blue-100 text-blue-800 select-none hover:cursor-copy"
                        onClick={() => copyToClipboard("Alacaklı")}
                    >Alacaklı</Badge>
                else
                    return <Badge className="bg-green-100 text-green-800 select-none hover:cursor-copy"
                        onClick={() => copyToClipboard("Borcu Yok")}
                    >Borcu Yok</Badge>
            }
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
                                <Paperclip />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Borç dökümünü görüntüle
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip disableHoverableContent>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={notImplemented}
                            >
                                <Info />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Müşteri detaylarını görüntüle
                        </TooltipContent>
                    </Tooltip>
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
                            Müşteri bilgilerini düzenle
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
                                Müşteriyi sil
                            </TooltipContent>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Emin misiniz?</DialogTitle>
                                    <DialogDescription>
                                        Bu işlem geri alınamaz. Bu, müşteri kaydını kalıcı olarak silecektir. Eğer müşteri ile ilgili borçlar veya ödemeler varsa, bu işlemi gerçekleştiremezsiniz.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">İptal</Button>
                                    </DialogClose>
                                    <Button variant="destructive" onClick={() => handleDelete(row.original.id!)}>Müşteriyi Sil</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <HKS_Table data={data} columns={CustomerTableColumns} searchColumn="name" />
    )
}