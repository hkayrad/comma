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
import { sendRefreshEvent } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Columns3Cog,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  FilterX,
  RefreshCw,
  Rows3,
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
import HksTablePagination from "./HksTablePagination";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import AddButton from "./AddButton";
import { CompanyApi } from "@/lib/api/company";
import type { CompanyDto } from "@comma/common";
import { exportTablePDF } from "@/lib/pdf-table-export";
import { Logger } from "@/lib/utils/logger";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

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
};

export default function HksTableHeader(props: Props) {
  const { table, searchColumn, tags, addButton } = props;
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
    <div className="flex items-center gap-2">
      <ButtonGroup>
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
        <HksTablePagination table={table} />
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
        {addButton || <AddButton />}
      </div>
    </div>
  );
}
