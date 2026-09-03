import { useMemo } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState, ColumnFiltersState } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";

export interface UseResponsiveTableQueryOptions<T> {
  queryKey: any[];
  fetchFn: (pageIndex: number, pageSize: number) => Promise<{ rows: T[]; count: number } | null>;
  pagination: PaginationState;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  enabled?: boolean;
  staleTime?: number;
  mobilePageSize?: number;
}

export function useResponsiveTableQuery<T>({
  queryKey,
  fetchFn,
  pagination,
  sorting,
  columnFilters,
  enabled = true,
  staleTime = 30000,
  mobilePageSize = 20,
}: UseResponsiveTableQueryOptions<T>) {
  const isMobile = useIsMobile();

  // Mobile infinite query: loads page by page and accumulates rows
  const infiniteQuery = useInfiniteQuery({
    queryKey: [...queryKey, "infinite", sorting, columnFilters],
    queryFn: async ({ pageParam = 0 }) => {
      return await fetchFn(pageParam as number, mobilePageSize);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, p) => acc + (p?.rows?.length || 0), 0);
      const totalCount = lastPage?.count || 0;
      if (totalLoaded < totalCount) {
        return allPages.length;
      }
      return undefined;
    },
    enabled: enabled && isMobile,
    staleTime,
  });

  // Desktop standard page query: loads single page for pagination
  const pageQuery = useQuery({
    queryKey: [...queryKey, pagination, sorting, columnFilters],
    queryFn: async () => {
      return await fetchFn(pagination.pageIndex, pagination.pageSize);
    },
    enabled: enabled && !isMobile,
    staleTime,
  });

  // Accumulate rows on mobile
  const mobileRows = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page?.rows || []);
  }, [infiniteQuery.data?.pages]);

  const rows = isMobile ? mobileRows : (pageQuery.data?.rows || []);
  const count = isMobile
    ? (infiniteQuery.data?.pages[0]?.count || 0)
    : (pageQuery.data?.count || 0);

  const hasMore = isMobile ? Boolean(infiniteQuery.hasNextPage) : false;
  const onLoadMore = isMobile
    ? () => {
        if (!infiniteQuery.isFetchingNextPage && infiniteQuery.hasNextPage) {
          infiniteQuery.fetchNextPage();
        }
      }
    : undefined;
  const isLoadingMore = isMobile ? infiniteQuery.isFetchingNextPage : false;
  const isLoading = isMobile ? infiniteQuery.isLoading : pageQuery.isLoading;

  return {
    rows,
    count,
    hasMore,
    onLoadMore,
    isLoadingMore,
    isLoading,
    isMobile,
    refetch: isMobile ? infiniteQuery.refetch : pageQuery.refetch,
  };
}
