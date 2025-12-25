import { useState, useEffect } from "react";
import type {
  PaginationState,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";

interface UseTableStateOptions {
  key: string;
  initialPagination?: PaginationState;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialColumnVisibility?: VisibilityState;
}

interface StoredTableState {
  pagination?: PaginationState;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
}

export function useTableState({
  key,
  initialPagination = { pageIndex: 0, pageSize: 20 },
  initialSorting = [],
  initialColumnFilters = [],
  initialColumnVisibility = {},
}: UseTableStateOptions) {
  // Load the initial state from local storage once on mount
  const [loadedState] = useState<StoredTableState>(() => {
    if (typeof window === "undefined") return {};
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error(`Error loading table state for key "${key}":`, error);
      return {};
    }
  });

  // Initialize individual states, preferring stored values over defaults
  const [pagination, setPagination] = useState<PaginationState>(
    loadedState.pagination ?? initialPagination,
  );
  const [sorting, setSorting] = useState<SortingState>(
    loadedState.sorting ?? initialSorting,
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    loadedState.columnFilters ?? initialColumnFilters,
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    loadedState.columnVisibility ?? initialColumnVisibility,
  );

  // Sync state changes to localStorage
  useEffect(() => {
    // Skip the first run if we want to rely purely on lazy init,
    // but here we want to ensure consistency.
    // However, saving immediately on mount might overwrite if another tab updated it
    // in the microsecond between read and write (unlikely).
    // We mainly want to save when *these* states change.

    if (typeof window !== "undefined") {
      const stateToSave: StoredTableState = {
        pagination,
        sorting,
        columnFilters,
        columnVisibility,
      };
      localStorage.setItem(key, JSON.stringify(stateToSave));
    }
  }, [key, pagination, sorting, columnFilters, columnVisibility]);

  return {
    pagination,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
  };
}
