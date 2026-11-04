'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/features/auth/context/AuthContext';
import * as inventoryService from '../services/inventoryService';
import { fetchStoreById } from '@/features/storeDashboard/services/storeDashboardService';
import { showSuccess, showError } from '@/utils/toast';
import { onAgentRefresh } from '@/servies/agentEventBus';
import { queryKeys } from '@/lib/queryKeys';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const { user } = useAuthContext();
  const params = useParams();
  const storeId = params.storeId;
  const queryClient = useQueryClient();

  const [currentStore, setCurrentStore] = useState(null);
  const [userContext, setUserContext] = useState({ role: null, permissions: [] });
  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  // Fetch store details
  const fetchStoreDetails = useCallback(async () => {
    if (!storeId) return;
    try {
      const response = await fetchStoreById(storeId);
      const { userContext: context, ...storeData } = response.data;
      setCurrentStore(storeData);
      setUserContext(context || { role: null, permissions: [] });
    } catch (err) {
      console.error('STORE_FETCH_ERROR:', err);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStoreDetails();
  }, [fetchStoreDetails]);

  // TanStack Query: Fetch and Cache Products with automatic deduping and background revalidation
  const {
    data: rawProducts = [],
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    error: queryError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: queryKeys.inventory.all(storeId),
    queryFn: async () => {
      if (!storeId) return [];
      const res = await inventoryService.getStoreProducts(storeId);
      // Normalize array response across possible backend payload envelopes
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.products)) return res.products;
      return [];
    },
    enabled: !!storeId,
    staleTime: 60 * 1000, // 1 minute fresh cache
  });

  const products = useMemo(() => rawProducts, [rawProducts]);

  // Auto-refresh when the AI agent mutates products or inventory
  useEffect(() => {
    const unsub = onAgentRefresh(({ section }) => {
      if (section === 'products' || section === 'inventory' || section === '*') {
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(storeId) });
      }
    });
    return unsub;
  }, [queryClient, storeId]);

  // CREATE: Add a new product with reliable cache invalidation
  const addProduct = async (productData) => {
    try {
      setMutationLoading(true);
      setMutationError(null);

      const payload = {
        ...productData,
        store: storeId,
        createdBy: user?.uid,
      };

      const newProduct = await inventoryService.addProduct(payload);

      // Invalidate and refetch queries immediately - guarantees UI updates across the entire app
      await queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.all(storeId),
      });

      // Also invalidate store details for updated counts and total values
      await queryClient.invalidateQueries({
        queryKey: queryKeys.stores.detail(storeId),
      });

      // Synchronize currentStore local stats
      if (currentStore) {
        const priceNum = Number(productData?.sellingPrice ?? productData?.price ?? productData?.salesPrice ?? 0);
        const qtyNum = Number(productData?.quantity ?? productData?.qty ?? 0);
        const productValue = (isNaN(priceNum) ? 0 : priceNum) * (isNaN(qtyNum) ? 0 : qtyNum);
        setCurrentStore(prev => ({
          ...prev,
          totalProducts: (prev.totalProducts || 0) + 1,
          totalInventoryValue: (prev.totalInventoryValue || 0) + productValue,
        }));
      }

      showSuccess(`Product "${productData.name}" added successfully!`);
      return { success: true, data: newProduct };
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to add product';
      setMutationError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setMutationLoading(false);
    }
  };

  // UPDATE: Edit/Update a product with instant query cache sync
  const updateProduct = async (productId, updateData) => {
    try {
      setMutationLoading(true);
      setMutationError(null);

      await inventoryService.updateProduct(productId, updateData);

      // Invalidate products query to refetch fresh server state immediately
      await queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.all(storeId),
      });

      showSuccess('Product updated successfully!');
      return { success: true };
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update product';
      setMutationError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setMutationLoading(false);
    }
  };

  // DELETE: Delete a product with immediate cache invalidation
  const deleteProduct = async (productId) => {
    try {
      setMutationLoading(true);
      setMutationError(null);

      const productToDelete = products.find(p => p._id === productId || p.id === productId);
      const delPriceNum = Number(productToDelete?.sellingPrice ?? productToDelete?.price ?? productToDelete?.salesPrice ?? 0);
      const delQtyNum = Number(productToDelete?.quantity ?? productToDelete?.qty ?? 0);
      const productValue = (isNaN(delPriceNum) ? 0 : delPriceNum) * (isNaN(delQtyNum) ? 0 : delQtyNum);

      await inventoryService.deleteProduct(productId);

      // Invalidate to guarantee cache synchronization
      await queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.all(storeId),
      });

      // Synchronize currentStore local stats
      if (currentStore) {
        setCurrentStore(prev => ({
          ...prev,
          totalProducts: Math.max(0, (prev.totalProducts || 1) - 1),
          totalInventoryValue: Math.max(0, (prev.totalInventoryValue || productValue) - productValue),
        }));
      }

      showSuccess('Product deleted successfully!');
      return { success: true };
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete product';
      setMutationError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setMutationLoading(false);
    }
  };

  // BATCH: Add stock to existing batch
  const addStockToBatch = async (batchId, additionalQty, targetStoreId) => {
    const effectiveStoreId = targetStoreId || storeId;
    try {
      setMutationLoading(true);
      setMutationError(null);
      const res = await inventoryService.addStockToBatch(batchId, additionalQty, effectiveStoreId);
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      if (effectiveStoreId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(effectiveStoreId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(effectiveStoreId) });
      }
      showSuccess(`Added ${additionalQty} units to batch successfully!`);
      return { success: true, data: res };
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add stock to batch';
      setMutationError(msg);
      showError(msg);
      return { success: false, error: msg };
    } finally {
      setMutationLoading(false);
    }
  };

  // BATCH: Create new batch for existing product
  const createBatch = async (batchData) => {
    try {
      setMutationLoading(true);
      setMutationError(null);
      const effectiveStoreId = batchData.storeId || storeId;
      const res = await inventoryService.createBatch({ ...batchData, storeId: effectiveStoreId });
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      if (effectiveStoreId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(effectiveStoreId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(effectiveStoreId) });
      }
      showSuccess(`Batch ${batchData.batchNumber || ''} created successfully!`);
      return { success: true, data: res };
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create batch';
      setMutationError(msg);
      showError(msg);
      return { success: false, error: msg };
    } finally {
      setMutationLoading(false);
    }
  };

  // Check if current user has a specific permission
  const hasPermission = useCallback((permissionKey) => {
    if (!userContext?.role) return false;
    if (userContext.role === 'Owner') return true;
    return userContext.permissions.includes(permissionKey);
  }, [userContext]);

  const loading = isProductsLoading || mutationLoading;
  const error = mutationError || (queryError ? (queryError.message || 'Failed to load products') : null);

  const value = {
    products,
    currentStore,
    userContext,
    hasPermission,
    setCurrentStore,
    loading,
    isFetching: isProductsFetching,
    error,
    storeId,
    fetchProducts: refetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryContext must be used within an InventoryProvider');
  }
  return context;
};
