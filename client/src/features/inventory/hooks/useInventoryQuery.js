import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as inventoryService from '../services/inventoryService';
import { showSuccess, showError } from '@/utils/toast';

/**
 * Hook to Fetch and Cache Store Products
 * 
 * Benefits:
 * - Automatically cached by storeId
 * - Background refetch on tab focus (keeps stock count fresh)
 * - Returns isLoading, isError, data, refetch, isFetching
 */
export const useStoreProductsQuery = (storeId) => {
  return useQuery({
    queryKey: queryKeys.inventory.all(storeId),
    queryFn: async () => {
      if (!storeId) return [];
      const data = await inventoryService.getStoreProducts(storeId);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!storeId, // Only fetch when storeId is available
    staleTime: 1000 * 60 * 2, // 2 minutes fresh time
  });
};

/**
 * Hook to Add Product (CREATE)
 * 
 * Solves: "action is performed but reaction is not shown"
 * When the product is created on the server:
 * 1. queryClient.invalidateQueries immediately marks the product list as stale.
 * 2. It triggers a background re-fetch so all tables, cards, and stat counters
 *    instantly react and display the new item!
 */
export const useAddProductMutation = (storeId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProductData) => inventoryService.addProduct(newProductData),

    onSuccess: (createdProduct) => {
      // 1. Invalidate store inventory queries to trigger auto-fetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.all(storeId),
      });

      // 2. Also invalidate store stats (total product count, inventory value)
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.detail(storeId),
      });

      showSuccess('Product added successfully!');
    },

    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add product';
      showError(msg);
      console.error('ADD_PRODUCT_ERROR:', err);
    },
  });
};

/**
 * Hook to Update Product (EDIT / UPDATE)
 * 
 * Uses OPTIMISTIC UPDATES:
 * - Updates the UI IMMEDIATELY (0ms lag) before waiting for server response.
 * - If the server request fails, it rolls back to the previous snapshot.
 * - On settlement, it invalidates cache to ensure 100% server accuracy.
 */
export const useUpdateProductMutation = (storeId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, updateData }) =>
      inventoryService.updateProduct(productId, updateData),

    // Step 1: Called right before mutationFn runs
    onMutate: async ({ productId, updateData }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.inventory.all(storeId),
      });

      // Snapshot the previous products array for rollback
      const previousProducts = queryClient.getQueryData(queryKeys.inventory.all(storeId));

      // Optimistically update the UI cache
      queryClient.setQueryData(queryKeys.inventory.all(storeId), (oldProducts = []) => {
        return oldProducts.map((item) =>
          (item._id === productId || item.id === productId)
            ? { ...item, ...updateData }
            : item
        );
      });

      // Return context with rollback snapshot
      return { previousProducts };
    },

    // Step 2: If the mutation fails, restore previous state
    onError: (err, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          queryKeys.inventory.all(storeId),
          context.previousProducts
        );
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to update product';
      showError(msg);
      console.error('UPDATE_PRODUCT_ERROR:', err);
    },

    // Step 3: Always run on error or success to guarantee sync with server
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.all(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.detail(storeId),
      });
    },

    onSuccess: () => {
      showSuccess('Product updated successfully!');
    },
  });
};

/**
 * Hook to Delete Product (DELETE)
 * 
 * Uses Optimistic UI Removal:
 * - Instantly removes item from screen.
 * - Rolls back if API responds with error.
 * - Invalidates queries on completion.
 */
export const useDeleteProductMutation = (storeId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => inventoryService.deleteProduct(productId),

    // Optimistically remove from UI
    onMutate: async (productId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.inventory.all(storeId),
      });

      const previousProducts = queryClient.getQueryData(queryKeys.inventory.all(storeId));

      queryClient.setQueryData(queryKeys.inventory.all(storeId), (oldProducts = []) => {
        return oldProducts.filter(
          (item) => item._id !== productId && item.id !== productId
        );
      });

      return { previousProducts };
    },

    onError: (err, productId, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          queryKeys.inventory.all(storeId),
          context.previousProducts
        );
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete product';
      showError(msg);
      console.error('DELETE_PRODUCT_ERROR:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.all(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.detail(storeId),
      });
    },

    onSuccess: () => {
      showSuccess('Product deleted successfully!');
    },
  });
};

