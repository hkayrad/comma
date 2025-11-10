import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { sendRefreshEvent } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import { ArrowUpDown, Columns3Cog, DollarSign, Euro, FilterX, RefreshCw, Rows3, Search, TurkishLira } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import HksTablePagination from "./HksTablePagination";
import type { AvailableCurrency } from "@/lib/types";

type Props = {
    table: Table<any>;
    searchColumn: string;
    currency?: {
        state: AvailableCurrency;
        onChange: (value: AvailableCurrency) => void;
    };
}

export default function HksTableHeader(props: Props) {
    const { table, searchColumn, currency } = props;

    const [isRefreshing, setIsRefreshing] = useState(false);

    const onFilterReset = () => {
        table.resetColumnFilters();
        toast.success("Filtreler temizlendi!");
    }

    const onSortReset = () => {
        table.resetSorting();
        toast.success("Sıralama sıfırlandı!");
    }

    const onRefresh = () => {
        setIsRefreshing(true);
        sendRefreshEvent();
        toast.promise(
            new Promise<void>((resolve) => {
                setTimeout(() => {
                    setIsRefreshing(false);
                    resolve();
                }, 500);
            }),
            {
                loading: "Tablo yenileniyor...",
                success: "Tablo başarıyla yenilendi!",
                error: "Tablo yenileme başarısız oldu."
            }
        );
    }

    const onCurrencyChange = (value: AvailableCurrency) => {
        if (currency) {
            currency.onChange(value);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <InputGroup className="max-w-2xs bg-background min-w-48">
                <InputGroupInput
                    placeholder="İsim ile Müşteri Ara..."
                    value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                    }
                    className="select-none"
                />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
            </InputGroup>
            <ButtonGroup>
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Columns3Cog />
                            <span>Sütunları Göster/Gizle</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter(
                                (column) => column.getCanHide()
                            )
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Rows3 />
                            <span>Satır Sayısı</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem
                            checked={table.getState().pagination.pageSize === 5}
                            onCheckedChange={() => table.setPageSize(5)}
                        >
                            5 Satır
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={table.getState().pagination.pageSize === 10}
                            onCheckedChange={() => table.setPageSize(10)}
                        >
                            10 Satır
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={table.getState().pagination.pageSize === 20}
                            onCheckedChange={() => table.setPageSize(20)}
                        >
                            20 Satır
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={table.getState().pagination.pageSize === 50}
                            onCheckedChange={() => table.setPageSize(50)}
                        >
                            50 Satır
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={table.getState().pagination.pageSize === 100}
                            onCheckedChange={() => table.setPageSize(100)}
                        >
                            100 Satır
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </ButtonGroup>
            {
                currency && (
                    <ButtonGroup>
                        <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                                <Button variant="outline" onClick={() => onCurrencyChange("TRY")} className={currency.state === "TRY" ? "bg-accent text-accent-foreground dark:bg-accent-dark dark:text-accent-foreground-dark" : ""}>
                                    <TurkishLira />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Türk Lirası
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                                <Button variant="outline" onClick={() => onCurrencyChange("EUR")} className={currency.state === "EUR" ? "bg-accent text-accent-foreground dark:bg-accent-dark dark:text-accent-foreground-dark" : ""}>
                                    <Euro />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Euro
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                                <Button variant="outline" onClick={() => onCurrencyChange("USD")} className={currency.state === "USD" ? "bg-accent text-accent-foreground dark:bg-accent-dark dark:text-accent-foreground-dark" : ""}>
                                    <DollarSign />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Amerikan Doları
                            </TooltipContent>
                        </Tooltip>
                    </ButtonGroup>
                )
            }
            <div className="flex gap-4 ml-auto">
                <HksTablePagination table={table} />
                <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                        <Button className="select-none" disabled={isRefreshing} onClick={onRefresh}>
                            <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
                            {isRefreshing ? "Yenileniyor..." : "Yenile"}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        Tabloyu yenile
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    )
}