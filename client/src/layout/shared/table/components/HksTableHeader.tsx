import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sendRefreshEvent } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Columns3Cog,
  DollarSign,
  Euro,
  FilterX,
  RefreshCw,
  Rows3,
  TurkishLira,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import HksTablePagination from "./HksTablePagination";
import type { AvailableCurrency } from "@/lib/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  table: Table<any>;
  searchColumn: string;
  currency?: {
    state: AvailableCurrency | "";
    onChange: (value: AvailableCurrency | "") => void;
  };
};

export default function HksTableHeader(props: Props) {
  const { table, searchColumn, currency } = props;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        e.ctrlKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onFilterReset = useCallback(() => {
    table.resetColumnFilters();
    toast.success("Filtreler temizlendi!");
  }, [table]);

  const onSortReset = useCallback(() => {
    table.resetSorting();
    toast.success("Sıralama sıfırlandı!");
  }, [table]);

  const onRefresh = useCallback(() => {
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
        error: "Tablo yenileme başarısız oldu.",
      },
    );
  }, []);

  return (
    <div className="flex items-center gap-2">
      <InputGroup className="max-w-2xs bg-background min-w-48">
        <InputGroupInput
          ref={searchInputRef}
          placeholder="İsim ile Müşteri Ara..."
          value={
            (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              searchInputRef.current?.blur();
            }
          }}
          className="select-none"
        />
        <InputGroupAddon align="inline-end" className="gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">Ctrl</span>
          </kbd>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">/</span>
          </kbd>
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
          <TooltipContent>Tüm filtreleri kaldır</TooltipContent>
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
          <TooltipContent>Tüm sıralamaları kaldır</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="select-none">
                  <Columns3Cog />
                  <span>Sütunları Göster/Gizle</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              İstenilen sütunları gizle veya göster
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
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
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="select-none">
                  <Rows3 />
                  <span>Satır Sayısı</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Satır sayısını seç</TooltipContent>
          </Tooltip>
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
      {currency && (
        <ToggleGroup
          type="single"
          variant="outline"
          size="default"
          value={currency.state as string}
          onValueChange={(value) =>
            currency.onChange(value ? (value as AvailableCurrency) : "")
          }
          className="shadow-xs"
        >
          <ToggleGroupItem value="TRY" className="!p-0">
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <span className="flex items-center justify-center w-full h-full !p-3">
                  <TurkishLira />
                </span>
              </TooltipTrigger>
              <TooltipContent>Türk Lirası</TooltipContent>
            </Tooltip>
          </ToggleGroupItem>
          <ToggleGroupItem value="USD" className="!p-0">
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <span className="flex items-center justify-center w-full h-full !p-3">
                  <DollarSign />
                </span>
              </TooltipTrigger>
              <TooltipContent>Amerikan Doları</TooltipContent>
            </Tooltip>
          </ToggleGroupItem>
          <ToggleGroupItem value="EUR" className="!p-0">
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <span className="flex items-center justify-center w-full h-full !p-3">
                  <Euro />
                </span>
              </TooltipTrigger>
              <TooltipContent>Euro</TooltipContent>
            </Tooltip>
          </ToggleGroupItem>
        </ToggleGroup>
        // <ButtonGroup>
        //   <Tooltip disableHoverableContent>
        //     <TooltipTrigger asChild>
        //       <Button
        //         variant="outline"
        //         onClick={() => onCurrencyChange("TRY")}
        //         className={
        //           currency.state === "TRY"
        //             ? "bg-accent text-accent-foreground dark:bg-accent-dark dark:text-accent-foreground-dark"
        //             : ""
        //         }
        //       >
        //         <TurkishLira />
        //       </Button>
        //     </TooltipTrigger>
        //     <TooltipContent>Türk Lirası</TooltipContent>
        //   </Tooltip>
        //   <Tooltip disableHoverableContent>
        //     <TooltipTrigger asChild>
        //       <Button
        //         variant="outline"
        //         onClick={() => onCurrencyChange("USD")}
        //         className={
        //           currency.state === "USD"
        //             ? "bg-accent text-accent-foreground dark:bg-accent-dark dark:text-accent-foreground-dark"
        //             : ""
        //         }
        //       >
        //         <DollarSign />
        //       </Button>
        //     </TooltipTrigger>
        //     <TooltipContent>Amerikan Doları</TooltipContent>
        //   </Tooltip>
        //   <Tooltip disableHoverableContent>
        //     <TooltipTrigger asChild>
        //       <Button
        //         variant="outline"
        //         onClick={() => onCurrencyChange("EUR")}
        //         className={
        //           currency.state === "EUR"
        //             ? "bg-accent text-accent-foreground dark:bg-accent-dark dark:text-accent-foreground-dark"
        //             : ""
        //         }
        //       >
        //         <Euro />
        //       </Button>
        //     </TooltipTrigger>
        //     <TooltipContent>Euro</TooltipContent>
        //   </Tooltip>
        // </ButtonGroup>
      )}
      <div className="flex gap-4 ml-auto ">
        <HksTablePagination table={table} />
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              className="select-none"
              disabled={isRefreshing}
              onClick={onRefresh}
            >
              <RefreshCw
                className={`${isRefreshing ? "animate-spin" : ""} shadow-xs`}
              />
              {isRefreshing ? "Yenileniyor..." : "Yenile"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tabloyu yenile</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
