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
    UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import HksTablePagination from "./HksTablePagination";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

type Props = {
    table: Table<any>;
    searchColumn: string;
    tags?: {
        column: string;
        column_label: string;
        value: string;
        color: string;
    }[];
};

export default function HksTableHeader(props: Props) {
    const { table, searchColumn, tags } = props;

    const { t } = useTranslation();
    const location = useLocation();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
        new Set(),
    );

    const [searchValue, setSearchValue] = useState(
        (table.getColumn(searchColumn)?.getFilterValue() as string) ?? "",
    );

    // Sync local search value with table filter value (useful for resets)
    const tableSearchValue = table
        .getColumn(searchColumn)
        ?.getFilterValue() as string;
    useEffect(() => {
        setSearchValue(tableSearchValue ?? "");
    }, [tableSearchValue]);

    // Debounce search input
    useEffect(() => {
        const timeout = setTimeout(() => {
            table.getColumn(searchColumn)?.setFilterValue(searchValue);
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchValue, searchColumn, table]);

    const translationPrefix = useMemo(() => {
        const path = location.pathname;
        if (path.includes("odemeler")) {
            return "payment";
        }
        if (path.includes("alacaklar") || path.includes("borclar")) {
            return "debt";
        }
        return "dashboard";
    }, [location.pathname]);

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
        const uniqueColumns = new Set(
            tags.map((tag) => ({
                column: tag.column,
                column_label: tag.column_label,
            })),
        );

        // Apply filters to each column
        uniqueColumns.forEach((columnId) => {
            const column = table.getColumn(columnId.column);
            if (!column) return;

            const values = filtersByColumn.get(columnId.column);
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
                Array<{
                    column: string;
                    column_label: string;
                    value: string;
                    color: string;
                }>
            >();

        const groups = new Map<
            string,
            Array<{
                column: string;
                column_label: string;
                value: string;
                color: string;
            }>
        >();
        tags.forEach((tag) => {
            if (!groups.has(tag.column_label)) {
                groups.set(tag.column_label, []);
            }
            groups.get(tag.column_label)!.push(tag);
        });
        return groups;
    }, [tags]);

    return (
        <div className="flex items-center gap-2">
            <ButtonGroup>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <InputGroup className="bg-background min-w-76">
                            <InputGroupAddon>
                                <UserRound
                                    className={
                                        searchInputRef.current?.value === ""
                                            ? "text-muted-foreground"
                                            : "text-primary"
                                    }
                                />
                            </InputGroupAddon>
                            <InputGroupInput
                                ref={searchInputRef}
                                placeholder={t("table.header.search")}
                                value={searchValue}
                                onChange={(event) =>
                                    setSearchValue(event.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        searchInputRef.current?.blur();
                                    }
                                }}
                                className="select-none"
                            />
                            <InputGroupAddon
                                align="inline-end"
                                className="gap-1"
                            >
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">Ctrl</span>
                                </kbd>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">/</span>
                                </kbd>
                            </InputGroupAddon>
                        </InputGroup>
                    </TooltipTrigger>
                    <TooltipContent>
                        {t("table.header.search.hover")}
                    </TooltipContent>
                </Tooltip>
                {tags && (
                    <DropdownMenu>
                        <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="select-none relative"
                                    >
                                        <Filter />
                                        <span>{t("table.header.filters")}</span>
                                        {activeFilterCount > 0 && (
                                            <Badge variant="default">
                                                {activeFilterCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                {t("table.header.filters.hover")}
                            </TooltipContent>
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
                                                    checked={selectedFilters.has(
                                                        filterKey,
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleFilterToggle(tag)
                                                    }
                                                    onSelect={(e) =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    <Badge
                                                        className={`bg-${tag.color}-100 dark:bg-${tag.color}-900 text-${tag.color}-800 dark:text-${tag.color}-100 select-none`}
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
                                <Button
                                    variant="outline"
                                    className="select-none"
                                >
                                    <Columns3Cog />
                                    <span>
                                        {t("table.header.showHideCols")}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            {t("table.header.showHideCols.hover")}
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
                                        {column.id === "#"
                                            ? "#"
                                            : t(
                                                  `${translationPrefix}.table.column.${column.id}`,
                                                  { defaultValue: column.id },
                                              )}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <Tooltip disableHoverableContent>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="select-none"
                                >
                                    <Rows3 />
                                    <span>{t("table.header.rowCount")}</span>
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            {t("table.header.rowCount.hover")}
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end">
                        {rowCounts.map((rowCount) => (
                            <DropdownMenuCheckboxItem
                                key={`row-count-${rowCount}`}
                                checked={
                                    table.getState().pagination.pageSize ===
                                    rowCount
                                }
                                onCheckedChange={() =>
                                    table.setPageSize(rowCount)
                                }
                            >
                                {t("table.header.rowCount.row", {
                                    rowCount: rowCount,
                                })}
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
                            {t("table.header.filters.clear")}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {t("table.header.filters.clear.hover")}
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
                            {t("table.header.sorting.clear")}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {t("table.header.sorting.clear.hover")}
                    </TooltipContent>
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
                            {t("table.header.refresh")}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {t("table.header.refresh.hover")}
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
