import type { CustomerDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Info, Paperclip, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { copyToClipboard, sendRefreshEvent } from "@/lib/utils";
import { useNavigate } from "react-router";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CustomerApi } from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import HksTable from "@/layout/shared/table/HksTable";
import { useDialog } from "@/contexts/DialogContext";
import CustomerDialog from "@/layout/shared/dialog/CustomerDialog";
import CustomerDetails from "./CustomerDetails";
import FormattedCurrency from "@/layout/shared/table/utils/FormattedCurrency";
import SortableColumnHeader from "@/layout/shared/table/utils/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";

type Props = {
    data: CustomerDto[];
}

export default function CustomerTable(props: Props) {
    const { data } = props;

    const { openDialog } = useDialog();
    const navigate = useNavigate();

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

    const onEdit = (customerId: string) => {
        const customer = data.find(c => c.id === customerId);

        if (!customer) {
            toast.error("Müşteri bulunamadı");
            return;
        }

        openDialog({
            title: "Müşteri Düzenle",
            description: "Müşteri bilgilerini düzenleyin",
            size: "3xl",
            content: (
                <CustomerDialog customer={customer} />
            ),
            showCloseButton: true,
        });
    }

    const onDetails = (customerId: string) => {
        const customer = data.find(c => c.id === customerId);

        if (!customer) {
            toast.error("Müşteri bulunamadı");
            return;
        }

        openDialog({
            title: `Müşteri Bilgileri`,
            description: `${customer.is_company ? "Vergi No" : "TC Kimlik No"}: ${customer.tax_number || "-"} | Vergi Dairesi: ${customer.tax_office || "-"}`,
            size: "3xl",
            content: (
                <CustomerDetails customer={customer} />
            ),
            showCloseButton: true,
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
            header: ({ column }) => <SortableColumnHeader column={column} title="Müşteri" />,
            cell: ({ row, column }) => (
                <Tooltip disableHoverableContent>
                    <TooltipTrigger className="text-left">
                        <ClickToCopyText value={row.getValue(column.id) || "-"} column={column} />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {row.getValue(column.id) || "-"}
                    </TooltipContent>
                </Tooltip>
            ),
        },
        {
            accessorKey: "is_company",
            header: "Tür",
            cell: ({ row }) => {
                const isCompany = row.getValue("is_company");
                return isCompany ?
                    <Badge className="bg-violet-100 text-violet-800 select-none hover:cursor-copy"
                        onClick={() => copyToClipboard("Şirket")}
                    >Şirket</Badge> :
                    <Badge className="bg-orange-100 text-orange-800 select-none hover:cursor-copy"
                        onClick={() => copyToClipboard("Birey")}
                    >Birey</Badge>
            }
        },
        {
            accessorKey: "tax_office",
            header: "Vergi Dairesi",
            cell: ({ row, column }) => <ClickToCopyText value={row.getValue(column.id) || "-"} />,
        },
        {
            accessorKey: "tax_number",
            header: "Vergi No",
            cell: ({ row, column }) => <ClickToCopyText value={row.getValue(column.id) || "-"} />,
        },
        {
            accessorKey: "total_debt",
            header: ({ column }) => <SortableColumnHeader column={column} title="Toplam Borç" />,
            cell: ({ row, column }) => <FormattedCurrency row={row} column={column} />,
        },
        {
            accessorKey: "total_payments",
            header: ({ column }) => <SortableColumnHeader column={column} title="Toplam Ödeme" />,
            cell: ({ row, column }) => <FormattedCurrency row={row} column={column} />,
        },
        {
            accessorKey: "remaining_debt",
            header: ({ column }) => <SortableColumnHeader column={column} title="Kalan Borç" />,
            cell: ({ row, column }) => <FormattedCurrency row={row} column={column} />,
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
                                onClick={() => navigate(`/borc_dokumu/${row.original.id}`)}
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
                                onClick={() => onDetails(row.original.id!)}
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
                                onClick={() => onEdit(row.original.id!)}
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
        <HksTable data={data} columns={CustomerTableColumns} searchColumn="name" />
    )
}