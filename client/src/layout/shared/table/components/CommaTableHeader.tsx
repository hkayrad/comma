import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Menu,
  MenuCheckboxItem,
  MenuPanel,
  MenuGroup,
  MenuItem,
  MenuGroupLabel,
  MenuSeparator,
  MenuTrigger,
} from "@/components/animate-ui/components/base/menu";
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
import type { Table } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Columns3Cog,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  FilterX,
  LayoutGrid,
  MoreVertical,
  RefreshCw,
  Rows3,
  TableProperties,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import CommaTablePagination from "./CommaTablePagination";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import AddButton from "./AddButton";
import { CompanyApi } from "@/lib/api/company";
import type { CompanyDto } from "@comma/common";
import { exportTablePDF } from "@/lib/pdf-table-export";
import { Logger } from "@/lib/utils/logger";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type Props = {
  table: Table<any>;
  searchColumn: string;
  tags?: {
    column: string;
    column_label: string;
    value: string;
    label?: string;
    color: string;
  }[];
  addButton?: ReactNode;
  readOnly?: boolean;
  isPortal?: boolean;
  translationPrefix?: "dashboard" | "debt" | "payment";
  viewMode?: "cards" | "table";
  onViewModeChange?: (mode: "cards" | "table") => void;
};

export default function CommaTableHeader(props: Props) {
  const {
    table,
    searchColumn,
    tags,
    addButton,
    readOnly,
    isPortal,
    translationPrefix: propTranslationPrefix,
    viewMode,
    onViewModeChange,
  } = props;
  const queryClient = useQueryClient();
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
  const tableSearchValue = (table
    .getColumn(searchColumn)
    ?.getFilterValue() as string) ?? "";

  const [prevTableSearchValue, setPrevTableSearchValue] = useState(tableSearchValue);
  if (tableSearchValue !== prevTableSearchValue) {
    setSearchValue(tableSearchValue);
    setPrevTableSearchValue(tableSearchValue);
  }

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      table.getColumn(searchColumn)?.setFilterValue(searchValue);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchValue, searchColumn, table]);

  const translationPrefix = useMemo(() => {
    if (propTranslationPrefix) return propTranslationPrefix;

    const path = location.pathname;
    if (path.includes("odemeler")) {
      return "payment";
    }
    if (path.includes("alacaklar") || path.includes("borclar")) {
      return "debt";
    }
    return "dashboard";
  }, [location.pathname, propTranslationPrefix]);

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
    toast.success(t("table.header.filters.clear.success"));
  }, [table, t]);

  const onSortReset = useCallback(() => {
    table.resetSorting();
    toast.success(t("table.header.sorting.success"));
  }, [table, t]);

  const onExportCSV = useCallback(() => {
    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() &&
          col.id !== "actions" &&
          col.id !== "#" &&
          col.id !== "debt_status" &&
          col.id !== "is_company",
      );

    const headers = visibleColumns.map((col) => col.id);

    const rows = table.getRowModel().rows.map((row) => {
      return visibleColumns.map((col) => {
        const value = row.getValue(col.id);
        if (value === null || value === undefined || value === "") return "-";
        const strValue = String(value).trim();
        if (strValue === "") return "-";
        if (
          strValue.includes(",") ||
          strValue.includes('"') ||
          strValue.includes("\n")
        ) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t("table.header.export.csv.success"));
  }, [table, t]);

  const onExportPDF = useCallback(async () => {
    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() &&
          col.id !== "actions" &&
          col.id !== "#" &&
          col.id !== "debt_status" &&
          col.id !== "is_company",
      );

    const headers = visibleColumns.map((col) =>
      t(`${translationPrefix}.table.column.${col.id}`, {
        defaultValue: col.id,
      }),
    );

    const rows = table.getRowModel().rows.map((row) => {
      return visibleColumns.map((col) => {
        const value = row.getValue(col.id);
        if (value === null || value === undefined || value === "") return "-";
        const strValue = String(value).trim();
        return strValue === "" ? "-" : strValue;
      });
    });

    try {
      // Fetch company data for the PDF header
      let company: CompanyDto | null = null;
      try {
        const response = await CompanyApi.GetCompanyById();
        if (response.success) {
          company = response.data;
        }
      } catch (error) {
        Logger.warn("Could not fetch company data for PDF export:", error);
      }

      // Generate title based on current page
      const titleMap: Record<string, string> = {
        dashboard: t("dashboard.title"),
        debt: t("debt.title"),
        payment: t("payment.title"),
      };
      const title =
        titleMap[translationPrefix] || t("table.header.export.pdf.title");

      await exportTablePDF(
        { headers, rows, title },
        company,
        `${new Date().toISOString().split("T")[0]}`,
        "landscape",
      );

      toast.success(t("table.header.export.pdf.success"));
    } catch {
      toast.error(t("table.header.export.pdf.error"));
    }
  }, [table, t, translationPrefix]);

  const onRefresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    queryClient.invalidateQueries();
    toast.promise(
      new Promise<void>((resolve) => {
        setTimeout(() => {
          setIsRefreshing(false);
          resolve();
        }, 500);
      }),
      {
        loading: t("table.header.refresh.loading"),
        success: t("table.header.refresh.success"),
        error: t("table.header.refresh.error"),
      },
    );
  }, [queryClient, t, isRefreshing]);

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
          label?: string;
          color: string;
        }>
      >();

    const groups = new Map<
      string,
      Array<{
        column: string;
        column_label: string;
        value: string;
        label?: string;
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
    <>
      {/* Mobile Toolbar (< md) */}
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-center gap-2">
          {!isPortal && (
            <InputGroup className="bg-background flex-1 min-w-0">
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
                onChange={(event) => setSearchValue(event.target.value)}
                className="select-none text-sm"
              />
            </InputGroup>
          )}

          {tags && (
            <Menu>
              <MenuTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="outline"
                    size="icon"
                    className="select-none relative shrink-0"
                  >
                    <Filter className="w-4 h-4" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                )}
              />
              <MenuPanel align="end" className="max-w-xs">
                {Array.from(groupedTags.entries()).map(
                  ([columnName, columnTags]) => (
                    <MenuGroup key={columnName}>
                      <MenuGroupLabel className="relative text-muted-foreground z-10">
                        {columnName}
                      </MenuGroupLabel>
                      {columnTags.map((tag) => {
                        const isSelected = selectedFilters.has(
                          `${tag.column}:${tag.value}`,
                        );
                        return (
                          <MenuCheckboxItem
                            key={tag.value}
                            checked={isSelected}
                            onCheckedChange={() => handleFilterToggle(tag)}
                          >
                            <Badge
                              variant="outline"
                              style={{ backgroundColor: tag.color }}
                              className="mr-2"
                            />
                            {tag.label || tag.value}
                          </MenuCheckboxItem>
                        );
                      })}
                    </MenuGroup>
                  ),
                )}
                {activeFilterCount > 0 && (
                  <>
                    <MenuSeparator />
                    <MenuItem onClick={onFilterReset}>
                      <FilterX className="mr-2 h-4 w-4" />
                      {t("table.header.filters.clear")}
                    </MenuItem>
                  </>
                )}
              </MenuPanel>
            </Menu>
          )}

          {/* Mobile Actions Menu */}
          <Menu>
            <MenuTrigger
              render={(props) => (
                <Button
                  {...props}
                  nativeButton
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              )}
            />
            <MenuPanel align="end">
              <MenuItem onClick={onRefresh} disabled={isRefreshing}>
                <RefreshCw
                  className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")}
                />
                {t("table.header.refresh")}
              </MenuItem>
              <MenuItem onClick={onExportCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {t("table.header.export.csv")}
              </MenuItem>
              <MenuItem onClick={onExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                {t("table.header.export.pdf")}
              </MenuItem>
              <MenuSeparator />
              <MenuItem onClick={onFilterReset}>
                <FilterX className="w-4 h-4 mr-2" />
                {t("table.header.filters.clear")}
              </MenuItem>
              <MenuItem onClick={onSortReset}>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {t("table.header.sorting.clear")}
              </MenuItem>
            </MenuPanel>
          </Menu>

          {/* View mode toggle button */}
          {onViewModeChange && (
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() =>
                onViewModeChange(viewMode === "cards" ? "table" : "cards")
              }
            >
              {viewMode === "cards" ? (
                <TableProperties className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* Add button */}
          {!readOnly && (
            <div className="shrink-0">
              {addButton || <AddButton />}
            </div>
          )}
        </div>

        {/* Mobile Pagination */}
        <div className="flex items-center justify-between pt-1">
          <CommaTablePagination table={table} />
        </div>
      </div>

      {/* Desktop Toolbar (>= md) */}
      <div className="hidden md:flex items-center gap-2">
        <ButtonGroup>
          {!isPortal && (
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <InputGroup {...props} className="bg-background min-w-48">
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
                    onChange={(event) => setSearchValue(event.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        searchInputRef.current?.blur();
                      }
                    }}
                    className="select-none"
                  />
                  <InputGroupAddon align="inline-end" className="gap-1">
                    <KbdGroup>
                      <Kbd>Ctrl</Kbd>
                      <Kbd>/</Kbd>
                    </KbdGroup>
                  </InputGroupAddon>
                </InputGroup>
              )}
            ></TooltipTrigger>
            <TooltipContent>{t("table.header.search.hover")}</TooltipContent>
          </Tooltip>
        )}
        {tags && (
          <Menu>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <MenuTrigger
                    {...props}
                    render={(props) => (
                      <Button
                        {...props}
                        nativeButton
                        variant="outline"
                        className="select-none relative"
                      >
                        <Filter />
                        <span>{t("table.header.filters")}</span>
                        {activeFilterCount > 0 && (
                          <Badge variant="default">{activeFilterCount}</Badge>
                        )}
                      </Button>
                    )}
                  />
                )}
              />
              <TooltipContent>{t("table.header.filters.hover")}</TooltipContent>
            </Tooltip>
            <MenuPanel align="end" className="max-w-xs">
              {Array.from(groupedTags.entries()).map(
                ([columnName, columnTags], groupIndex) => (
                  <MenuGroup key={columnName}>
                    <MenuGroupLabel className="relative text-muted-foreground z-10">
                      {columnName}
                    </MenuGroupLabel>
                    {columnTags.map((tag) => {
                      const filterKey = `${tag.column}:${tag.value}`;
                      return (
                        <MenuCheckboxItem
                          key={filterKey}
                          checked={selectedFilters.has(filterKey)}
                          onCheckedChange={() => handleFilterToggle(tag)}
                          onSelect={(e) => e.preventDefault()}

                        >
                          <Badge
                            className={`bg-${tag.color}-100 dark:bg-${tag.color}-900 text-${tag.color}-800 dark:text-${tag.color}-100 select-none`}
                          >
                            {tag.label ?? tag.value}
                          </Badge>
                        </MenuCheckboxItem>
                      );
                    })}
                    {groupIndex < groupedTags.size - 1 && (
                      <MenuSeparator />
                    )}
                  </MenuGroup>
                ),
              )}
            </MenuPanel>
          </Menu>
        )}
        <Menu>
          <Tooltip disableHoverablePopup>
            <TooltipTrigger
              render={(props) => (
                <MenuTrigger
                  {...props}
                  render={(props) => (
                    <Button
                      {...props}
                      nativeButton
                      variant="outline"
                      className="select-none"
                    >
                      <Columns3Cog />
                      <span>{t("table.header.showHideCols")}</span>
                    </Button>
                  )}
                />
              )}
            ></TooltipTrigger>
            <TooltipContent>
              {t("table.header.showHideCols.hover")}
            </TooltipContent>
          </Tooltip>
          <MenuPanel align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <MenuCheckboxItem
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
                      : t(`${translationPrefix}.table.column.${column.id}`, {
                          defaultValue: column.id,
                        })}
                  </MenuCheckboxItem>
                );
              })}
          </MenuPanel>
        </Menu>
        <Menu>
          <Tooltip disableHoverablePopup>
            <TooltipTrigger
              render={(props) => (
                <MenuTrigger
                  {...props}
                  render={(props) => (
                    <Button
                      {...props}
                      nativeButton
                      variant="outline"
                      className="select-none"
                    >
                      <Rows3 />
                      <span>{t("table.header.rowCount")}</span>
                    </Button>
                  )}
                />
              )}
            ></TooltipTrigger>
            <TooltipContent>{t("table.header.rowCount.hover")}</TooltipContent>
          </Tooltip>
          <MenuPanel align="end">
            {rowCounts.map((rowCount) => (
              <MenuCheckboxItem
                key={`row-count-${rowCount}`}
                checked={table.getState().pagination.pageSize === rowCount}
                onCheckedChange={() => table.setPageSize(rowCount)}
              >
                {t("table.header.rowCount.row", {
                  rowCount: rowCount,
                })}
              </MenuCheckboxItem>
            ))}
          </MenuPanel>
        </Menu>
      </ButtonGroup>
      <ButtonGroup>
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={(props) => (
              <Button
                {...props}
                nativeButton
                variant="outline"
                className="select-none"
                onClick={onFilterReset}
              >
                <FilterX />
                {t("table.header.filters.clear")}
              </Button>
            )}
          />
          <TooltipContent>
            {t("table.header.filters.clear.hover")}
          </TooltipContent>
        </Tooltip>
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={(props) => (
              <Button
                {...props}
                nativeButton
                variant="outline"
                className="select-none"
                onClick={onSortReset}
              >
                <ArrowUpDown />
                {t("table.header.sorting.clear")}
              </Button>
            )}
          />
          <TooltipContent>
            {t("table.header.sorting.clear.hover")}
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
      <div className="flex gap-2 ml-auto ">
        <CommaTablePagination table={table} />
        <Menu>
          <Tooltip disableHoverablePopup>
            <TooltipTrigger
              render={(props) => (
                <MenuTrigger
                  {...props}
                  render={(props) => (
                    <Button
                      {...props}
                      nativeButton
                      variant="outline"
                      className="select-none"
                    >
                      <Download />
                      <span>{t("table.header.export")}</span>
                    </Button>
                  )}
                />
              )}
            />
            <TooltipContent>{t("table.header.export.hover")}</TooltipContent>
          </Tooltip>
          <MenuPanel align="end" className="w-fit">
            <MenuItem onClick={onExportCSV}>
              <FileSpreadsheet className="text-foreground" />
              {t("table.header.export.csv")}
            </MenuItem>
            <MenuItem onClick={onExportPDF}>
              <FileText className="text-foreground" />
              {t("table.header.export.pdf")}
            </MenuItem>
          </MenuPanel>
        </Menu>
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={(props) => (
              <Button
                {...props}
                nativeButton
                className="select-none"
                disabled={isRefreshing}
                variant="outline"
                onClick={onRefresh}
              >
                <RefreshCw
                  className={`${isRefreshing ? "animate-spin" : ""} shadow-xs`}
                />
                {t("table.header.refresh")}
              </Button>
            )}
          />
          <TooltipContent>{t("table.header.refresh.hover")}</TooltipContent>
        </Tooltip>
        {!readOnly && (addButton || <AddButton />)}
      </div>
    </div>
    </>
  );
}
