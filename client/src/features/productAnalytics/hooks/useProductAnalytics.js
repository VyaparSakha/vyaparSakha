'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchStoreById } from '@/features/storeDashboard/services/storeDashboardService';
import { RANGE_OPTIONS } from '../constants';
import { createDateRange } from '../utils';
import { fetchProductAnalytics } from '../services/productAnalyticsService';
import { productAnalyticsQueryKeys, storeQueryKeys } from '@/lib/queryKeys';

const getErrorMessage = (error) =>
  error?.message || 'Unable to load product analytics right now.';

/**
 * Custom hook for managing individual product analytics with TanStack Query caching
 */
export const useProductAnalytics = (storeId, productId) => {
  const queryClient = useQueryClient();
  const [rangeDays, setRangeDays] = useState(30);
  const [page, setPage] = useState(1);

  const rangeQuery = useMemo(() => createDateRange(rangeDays), [rangeDays]);

  // 1. Store Details Query
  const storeQuery = useQuery({
    queryKey: storeQueryKeys.detail(storeId),
    queryFn: async () => {
      const res = await fetchStoreById(storeId);
      return res?.data || null;
    },
    enabled: Boolean(storeId),
    staleTime: 60 * 1000,
  });

  // 2. Product Analytics Overview Query with smooth pagination
  const overviewQuery = useQuery({
    queryKey: productAnalyticsQueryKeys.overview(storeId, productId, rangeDays, page),
    queryFn: async () => {
      const res = await fetchProductAnalytics(storeId, productId, {
        ...rangeQuery,
        page,
        limit: 8,
      });
      return res?.data || null;
    },
    enabled: Boolean(storeId && productId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData, // Keeps previous transaction page visible while fetching next
  });

  const changeRange = (value) => {
    setRangeDays(value);
    setPage(1);
  };

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: productAnalyticsQueryKeys.all(storeId, productId),
    });
    queryClient.invalidateQueries({
      queryKey: storeQueryKeys.detail(storeId),
    });
  }, [queryClient, storeId, productId]);

  const loading = storeQuery.isLoading || overviewQuery.isLoading;
  const error = overviewQuery.error
    ? getErrorMessage(overviewQuery.error)
    : storeQuery.error
    ? getErrorMessage(storeQuery.error)
    : '';

  return {
    rangeDays,
    rangeOptions: RANGE_OPTIONS,
    setRangeDays: changeRange,
    page,
    setPage,
    store: storeQuery.data || null,
    overview: overviewQuery.data || null,
    loading,
    error,
    refresh,
  };
};

export default useProductAnalytics;
