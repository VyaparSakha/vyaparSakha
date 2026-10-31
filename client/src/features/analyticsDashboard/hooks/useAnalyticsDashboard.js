'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStoreById } from '@/features/storeDashboard/services/storeDashboardService';
import {
  fetchStoreAnalyticsSummary,
  fetchStoreAnalyticsTrend,
  fetchStoreCategoryAnalytics,
  fetchTopProductsAnalytics,
  fetchSlowMovingProductsAnalytics,
  fetchProductAnalyticsOverview,
} from '../services/analyticsDashboardService';
import { analyticsQueryKeys, storeQueryKeys } from '@/lib/queryKeys';

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createRange = (rangeDays) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (Number(rangeDays) - 1));

  return {
    startDate: formatLocalDate(startDate),
    endDate: formatLocalDate(endDate),
  };
};

const unwrapMessage = (error, fallback) => error?.message || error?.error || fallback;

/**
 * Custom hook for managing the store analytics dashboard with TanStack Query caching
 */
export const useAnalyticsDashboard = (storeId) => {
  const queryClient = useQueryClient();
  const [rangeDays, setRangeDays] = useState('30');
  const [selectedProductId, setSelectedProductId] = useState('');

  const rangeQuery = useMemo(() => createRange(rangeDays), [rangeDays]);

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

  // 2. Summary Metrics Query
  const summaryQuery = useQuery({
    queryKey: analyticsQueryKeys.summary(storeId, rangeDays),
    queryFn: async () => {
      const res = await fetchStoreAnalyticsSummary(storeId, rangeQuery);
      return res?.data || null;
    },
    enabled: Boolean(storeId),
    staleTime: 2 * 60 * 1000,
  });

  // 3. Trends Query
  const trendQuery = useQuery({
    queryKey: analyticsQueryKeys.trend(storeId, rangeDays),
    queryFn: async () => {
      const res = await fetchStoreAnalyticsTrend(storeId, rangeQuery);
      return res?.data || null;
    },
    enabled: Boolean(storeId),
    staleTime: 2 * 60 * 1000,
  });

  // 4. Categories Query
  const categoriesQuery = useQuery({
    queryKey: analyticsQueryKeys.categories(storeId, rangeDays),
    queryFn: async () => {
      const res = await fetchStoreCategoryAnalytics(storeId, rangeQuery);
      return res?.data || null;
    },
    enabled: Boolean(storeId),
    staleTime: 2 * 60 * 1000,
  });

  // 5. Top Products Query
  const topProductsQuery = useQuery({
    queryKey: analyticsQueryKeys.topProducts(storeId, rangeDays),
    queryFn: async () => {
      const res = await fetchTopProductsAnalytics(storeId, {
        ...rangeQuery,
        limit: 8,
        sortBy: 'revenue',
      });
      return res?.data?.rows || [];
    },
    enabled: Boolean(storeId),
    staleTime: 2 * 60 * 1000,
  });

  // 6. Slow-Moving Products Query
  const slowMovingQuery = useQuery({
    queryKey: analyticsQueryKeys.slowMoving(storeId, rangeDays),
    queryFn: async () => {
      const inactivityDays = Number(rangeDays) >= 90 ? 45 : 30;
      const res = await fetchSlowMovingProductsAnalytics(storeId, {
        inactivityDays,
        limit: 8,
      });
      return res?.data?.rows || [];
    },
    enabled: Boolean(storeId),
    staleTime: 2 * 60 * 1000,
  });

  const topProducts = topProductsQuery.data || [];

  // Automatically select the first product when top products load if none selected
  useEffect(() => {
    if (!selectedProductId && topProducts.length > 0) {
      const firstId = topProducts[0]?._id || topProducts[0]?.productId || '';
      if (firstId) setSelectedProductId(firstId);
    }
  }, [selectedProductId, topProducts]);

  // 7. Product Overview Query (selected product)
  const productOverviewQuery = useQuery({
    queryKey: analyticsQueryKeys.productOverview(storeId, selectedProductId, rangeDays),
    queryFn: async () => {
      const res = await fetchProductAnalyticsOverview(storeId, selectedProductId, rangeQuery);
      return res?.data || null;
    },
    enabled: Boolean(storeId && selectedProductId),
    staleTime: 2 * 60 * 1000,
  });

  // Manual refresh that invalidates all analytics queries for this store
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: analyticsQueryKeys.all(storeId),
    });
    queryClient.invalidateQueries({
      queryKey: storeQueryKeys.detail(storeId),
    });
  }, [queryClient, storeId]);

  const selectedProduct = useMemo(() => {
    return topProducts.find((item) => String(item._id || item.productId) === String(selectedProductId)) || null;
  }, [selectedProductId, topProducts]);

  const loading = {
    store: storeQuery.isLoading,
    summary: summaryQuery.isLoading,
    trend: trendQuery.isLoading,
    categories: categoriesQuery.isLoading,
    topProducts: topProductsQuery.isLoading,
    slowMoving: slowMovingQuery.isLoading,
    productOverview: Boolean(selectedProductId) && productOverviewQuery.isLoading,
  };

  const error = {
    store: storeQuery.error ? unwrapMessage(storeQuery.error, 'Failed to load store details') : '',
    summary: summaryQuery.error ? unwrapMessage(summaryQuery.error, 'Failed to load summary') : '',
    trend: trendQuery.error ? unwrapMessage(trendQuery.error, 'Failed to load trend data') : '',
    categories: categoriesQuery.error ? unwrapMessage(categoriesQuery.error, 'Failed to load categories') : '',
    topProducts: topProductsQuery.error ? unwrapMessage(topProductsQuery.error, 'Failed to load top products') : '',
    slowMoving: slowMovingQuery.error ? unwrapMessage(slowMovingQuery.error, 'Failed to load slow-moving products') : '',
    productOverview: productOverviewQuery.error ? unwrapMessage(productOverviewQuery.error, 'Failed to load product overview') : '',
  };

  return {
    store: storeQuery.data || null,
    rangeDays,
    setRangeDays,
    selectedProductId,
    setSelectedProductId,
    selectedProduct,
    summary: summaryQuery.data || null,
    trend: trendQuery.data || null,
    categories: categoriesQuery.data || null,
    topProducts,
    slowMoving: slowMovingQuery.data || [],
    productOverview: productOverviewQuery.data || null,
    loading,
    error,
    refresh,
  };
};

export default useAnalyticsDashboard;
