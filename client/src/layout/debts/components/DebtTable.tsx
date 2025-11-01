import type { DebtDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { sendRefreshEvent } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DebtApi } from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import HksTable from "@/layout/shared/table/HksTable";
import DebtDialog from "@/layout/shared/dialog/DebtDialog";
import { useDialog } from "@/contexts/DialogContext";
import FormattedCurrency from "@/layout/shared/table/utils/FormattedCurrency";
import FormattedDate from "@/layout/shared/table/utils/FormattedDate";
import SortableColumnHeader from "@/layout/shared/table/utils/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";

type Props = {
    data: DebtDto[];
}

export default function DebtTable(props: Props) {
    const { data } = props;

    const { openDialog } = useDialog();

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

    const onEdit = (debtId: string) => {
        const debt = data.find(d => d.id === debtId);

        if (!debt) {
            toast.error("Borç bulunamadı");
            return;
        }

        openDialog({
            title: "Borç Düzenle",
            description: "Borç bilgilerini düzenleyin",
            size: "3xl",
            content: (
                <DebtDialog debt={debt} />
            ),
            showCloseButton: true,
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
            accessorKey: "amount",
            header: ({ column }) => <SortableColumnHeader column={column} title="Tutar" />,
            cell: ({ row, column }) => <FormattedCurrency row={row} column={column} />,
        },
        {
            accessorKey: "vat",
            header: ({ column }) => <SortableColumnHeader column={column} title="KDV" />,
            cell: ({ row, column }) => <FormattedCurrency row={row} column={column} />,
        },
        {
            accessorKey: "issue_date",
            header: ({ column }) => <SortableColumnHeader column={column} title="Düzenlenme Tarihi" />,
            cell: ({ row, column }) => <FormattedDate row={row} column={column} />,
        },
        {
            accessorKey: "total_amount",
            header: ({ column }) => <SortableColumnHeader column={column} title="Toplam" />,
            cell: ({ row, column }) => <FormattedCurrency row={row} column={column} />,
        },
        {
            accessorKey: "invoice_no",
            header: ({ column }) => <SortableColumnHeader column={column} title="Fatura No" />,
            cell: ({ row, column }) => <ClickToCopyText value={row.getValue(column.id) || "-"} />,
        },
        {
            accessorKey: "description",
            header: ({ column }) => <SortableColumnHeader column={column} title="Açıklama" />,
            cell: ({ row, column }) => <ClickToCopyText value={row.getValue(column.id) || "-"} />,
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
        <HksTable data={data} columns={DebtTableColumns} searchColumn="customer_name" />
    )
}