'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchAllStores, deleteStore as deleteStoreService } from '../services/storeDashboardService';
import { filterStores, sortStores } from '../utils/helpers';
import { showSuccess, showError } from '@/utils/toast';

const initialFilters = {
  search: '',
  businessType: 'all',
  sortBy: 'created-desc',
};

/**
 * Custom hook for managing store dashboard with TanStack Query caching
 * 
 * Features:
 * - Automatically caches store list under queryKeys.stores.list()
 * - Deduplicates requests and handles background revalidation
 * - Provides optimistic store deletion
 * - Supports instant cache invalidation on mutations (create, edit, delete)
 */
export const useStoreDashboard = () => {
  const queryClient = useQueryClient();

  // Local UI Filter State
  const [filters, setFilters] = useState(initialFilters);

  // 1. Fetch & Cache all stores using TanStack useQuery
  const {
    data: allStores = [],
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.stores.list(),
    queryFn: async () => {
      const response = await fetchAllStores();
      // Normalize response from ApiResponse { data: [...] } or direct array
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response)) return response;
      return [];
    },
    staleTime: 60 * 1000, // 1 minute fresh time
    gcTime: 10 * 60 * 1000, // 10 minutes cache retention
  });

  // 2. Compute filtered and sorted stores reactively
  const filteredStores = useMemo(() => {
    let result = filterStores(allStores, filters);
    return sortStores(result, filters.sortBy);
  }, [allStores, filters]);

  // 3. Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // 4. Reset filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // 5. Invalidate and refresh stores
  const refreshStores = useCallback(async () => {
    return await queryClient.invalidateQueries({
      queryKey: queryKeys.stores.list(),
    });
  }, [queryClient]);

  const fetchStores = useCallback(async () => {
    return await refetch();
  }, [refetch]);

  // 6. Delete Store Mutation with Optimistic UI Update
  const deleteStoreMutation = useMutation({
    mutationFn: (storeId) => deleteStoreService(storeId),

    // Optimistically remove the store immediately from cache
    onMutate: async (storeId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.stores.list() });
      const previousStores = queryClient.getQueryData(queryKeys.stores.list());

      queryClient.setQueryData(queryKeys.stores.list(), (old = []) =>
        old.filter((s) => s._id !== storeId && s.id !== storeId)
      );

      return { previousStores };
    },

    // Rollback if deletion fails on server
    onError: (err, storeId, context) => {
      if (context?.previousStores) {
        queryClient.setQueryData(queryKeys.stores.list(), context.previousStores);
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete store';
      showError(msg);
    },

    // Invalidate queries to ensure 100% server accuracy
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    },

    onSuccess: () => {
      showSuccess('Store deleted successfully');
    },
  });

  return {
    stores: filteredStores,
    allStores,
    loading: isLoading,
    isFetching,
    error: queryError ? (queryError.message || 'Failed to fetch stores') : null,
    filters,
    updateFilters,
    resetFilters,
    refreshStores,
    fetchStores,
    deleteStore: deleteStoreMutation.mutateAsync,
    isDeleting: deleteStoreMutation.isPending,
  };
};

export default useStoreDashboard;
