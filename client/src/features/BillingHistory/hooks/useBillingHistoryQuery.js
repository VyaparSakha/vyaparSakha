import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchBillHistory } from '../services/billingHistoryService';

/**
 * Self-contained Query Key Factory for Billing History
 * Guarantees zero Turbopack HMR / circular import synchronization issues
 */
export const billingHistoryKeys = {
  all: (storeId) => ['stores', storeId, 'billing'],
  history: (storeId, filters = {}, page = 1, limit = 100) => [
    'stores',
    storeId,
    'billing',
    'history',
    {
      date: filters?.date || '',
      month: filters?.month || '',
      year: filters?.year || '',
      page: Number(page) || 1,
      limit: Number(limit) || 100,
    },
  ],
};

/**
 * Custom TanStack Query Hook to Fetch and Cache Billing History
 */
export const useBillingHistoryQuery = ({
  storeId,
  filters = {},
  page = 1,
  limit = 100,
  enabled = true,
}) => {
  const query = useQuery({
    queryKey: billingHistoryKeys.history(storeId, filters, page, limit),
    queryFn: async () => {
      const data = await fetchBillHistory(storeId, limit, page, filters);
      return {
        bills: Array.isArray(data?.bills) ? data.bills : (Array.isArray(data) ? data : []),
        pagination: data?.data?.pagination || data?.pagination || {
          page,
          limit,
          total: (data?.bills || []).length,
          totalPages: Math.ceil(((data?.bills || []).length) / limit) || 1,
        },
      };
    },
    enabled: Boolean(storeId) && Boolean(enabled),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  return {
    bills: query.data?.bills || [],
    pagination: query.data?.pagination || { page: 1, limit: 100, total: 0, totalPages: 0 },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook to easily invalidate and refresh billing history queries
 */
export const useInvalidateBillingHistory = () => {
  const queryClient = useQueryClient();

  return (storeId) => {
    if (storeId) {
      return queryClient.invalidateQueries({
        queryKey: billingHistoryKeys.all(storeId),
      });
    }
    return queryClient.invalidateQueries({
      queryKey: ['stores'],
    });
  };
};

export default useBillingHistoryQuery;
