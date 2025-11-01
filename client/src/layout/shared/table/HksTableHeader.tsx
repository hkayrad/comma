import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { sendRefreshEvent } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import { ArrowUpDown, FilterX, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

type Props = {
    table: Table<any>;
    searchColumn: string;
}

export default function HksTableHeader(props: Props) {
    const { table, searchColumn } = props;

    const onFilterReset = () => {
        table.resetColumnFilters();
        toast.success("Filtreler temizlendi!");
    }

    const onSortReset = () => {
        table.resetSorting();
        toast.success("Sıralama sıfırlandı!");
    }

    const onRefresh = () => {
        sendRefreshEvent();
        toast.info("Tablo yenileniyor...");
    }

    return (
        <div className="flex items-center py-4 gap-2">
            <Input
                placeholder="İsim ile Müşteri Ara..."
                value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                }
                className="max-w-2xs select-none"
            />
            <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        className="select-none"
                        onClick={onFilterReset}
                    >
                        <FilterX />
                        Filtreleri Temizle
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Tüm filtreleri kaldır
                </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        className="select-none"
                        onClick={onSortReset}
                    >
                        <ArrowUpDown />
                        Sıralamayı Sıfırla
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Tüm sıralamaları kaldır
                </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                    <Button className="ml-auto select-none" onClick={onRefresh}>
                        <RefreshCcw />
                        Yenile
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    Tabloyu yenile
                </TooltipContent>
            </Tooltip>
        </div>
    )
}