import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Filter,
  FilterX,
  RefreshCw,
  Rows3,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import HksTablePagination from "./HksTablePagination";
import { Badge } from "@/components/ui/badge";

type Props = {
  table: Table<any>;
  searchColumn: string;
  tags?: {
    column: string;
    value: string;
    color: string;
  }[];
};

export default function HksTableHeader(props: Props) {
  const { table, searchColumn, tags } = props;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    new Set(),
  );

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
    table.setPageIndex(0);
    setSelectedFilters(new Set());
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

  const handleFilterToggle = useCallback(
    (tag: { column: string; value: string }) => {
      const filterKey = `${tag.column}:${tag.value}`;

      setSelectedFilters((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(filterKey)) {
          newSet.delete(filterKey);
        } else {
          newSet.add(filterKey);
        }
        return newSet;
      });
    },
    [],
  );

  // Apply filters to table when selectedFilters changes
  useEffect(() => {
    if (!tags) return;

    // Group filters by column
    const filtersByColumn = new Map<string, string[]>();

    selectedFilters.forEach((filterKey) => {
      const [column, value] = filterKey.split(":");
      if (!filtersByColumn.has(column)) {
        filtersByColumn.set(column, []);
      }
      filtersByColumn.get(column)!.push(value);
    });

    // Get unique columns from tags
    const uniqueColumns = new Set(tags.map((tag) => tag.column));

    // Apply filters to each column
    uniqueColumns.forEach((columnId) => {
      const column = table.getColumn(columnId);
      if (!column) return;

      const values = filtersByColumn.get(columnId);
      if (values && values.length > 0) {
        // Set filter value as array - Tanstack Table will use arrIncludesSome by default
        column.setFilterValue(values);
      } else {
        // Clear filter for this column if no values selected
        column.setFilterValue(undefined);
      }
    });
  }, [selectedFilters, tags, table]);

  const activeFilterCount = useMemo(
    () => selectedFilters.size,
    [selectedFilters],
  );

  const rowCounts = useMemo(() => [5, 10, 20, 50, 100], []);

  // Group tags by column
  const groupedTags = useMemo(() => {
    if (!tags)
      return new Map<
        string,
        Array<{ column: string; value: string; color: string }>
      >();

    const groups = new Map<
      string,
      Array<{ column: string; value: string; color: string }>
    >();
    tags.forEach((tag) => {
      if (!groups.has(tag.column)) {
        groups.set(tag.column, []);
      }
      groups.get(tag.column)!.push(tag);
    });
    return groups;
  }, [tags]);

  return (
    <div className="flex items-center gap-2">
      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>İsim ile müşteri ara</TooltipContent>
        </Tooltip>
        {tags && (
          <DropdownMenu>
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="select-none relative">
                    <Filter />
                    <span>Filtreler</span>
                    {activeFilterCount > 0 && (
                      <Badge variant="default">{activeFilterCount}</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Filtreleme seçeneklerini göster</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="max-w-xs">
              {Array.from(groupedTags.entries()).map(
                ([columnName, columnTags], groupIndex) => (
                  <DropdownMenuGroup key={columnName}>
                    <DropdownMenuLabel className="text-muted-foreground">
                      {columnName}
                    </DropdownMenuLabel>
                    {columnTags.map((tag) => {
                      const filterKey = `${tag.column}:${tag.value}`;
                      return (
                        <DropdownMenuCheckboxItem
                          key={filterKey}
                          checked={selectedFilters.has(filterKey)}
                          onCheckedChange={() => handleFilterToggle(tag)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Badge
                            className={`bg-${tag.color}-100 dark:bg-${tag.color}-950/30 text-${tag.color}-800 dark:text-${tag.color}-300 select-none`}
                          >
                            {tag.value}
                          </Badge>
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                    {groupIndex < groupedTags.size - 1 && (
                      <DropdownMenuSeparator />
                    )}
                  </DropdownMenuGroup>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
                    onSelect={(e) => e.preventDefault()}
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
            {rowCounts.map((rowCount) => (
              <DropdownMenuCheckboxItem
                checked={table.getState().pagination.pageSize === rowCount}
                onCheckedChange={() => table.setPageSize(rowCount)}
              >
                {rowCount} Satır
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
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
      </ButtonGroup>
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
              Yenile
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tabloyu yenile</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
