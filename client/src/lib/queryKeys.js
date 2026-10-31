/**
 * TanStack Query Key Factory
 * Centralized, type-safe query keys to prevent typos and ensure clean invalidation.
 */

export const storeQueryKeys = {
  all: ['stores'],
  list: () => ['stores', 'list'],
  detail: (storeId) => ['stores', storeId],
  stats: (storeId) => ['stores', storeId, 'stats'],
};

export const inventoryQueryKeys = {
  all: (storeId) => ['stores', storeId, 'inventory'],
  list: (storeId, filters) => ['stores', storeId, 'inventory', 'list', filters || {}],
  detail: (storeId, productId) => ['stores', storeId, 'inventory', 'detail', productId],
  stats: (storeId) => ['stores', storeId, 'inventory', 'stats'],
  categories: (storeId) => ['stores', storeId, 'inventory', 'categories'],
};

export const billingQueryKeys = {
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
  invoices: (storeId, filter = {}) => ['stores', storeId, 'billing', 'invoices', filter],
  detail: (storeId, billId) => ['stores', storeId, 'billing', 'detail', billId],
};

export const buyerQueryKeys = {
  all: (storeId) => ['stores', storeId, 'buyers'],
  list: (storeId) => ['stores', storeId, 'buyers', 'list'],
  detail: (storeId, buyerId) => ['stores', storeId, 'buyers', 'detail', buyerId],
};

export const sellerQueryKeys = {
  all: (storeId) => ['stores', storeId, 'sellers'],
  list: (storeId) => ['stores', storeId, 'sellers', 'list'],
  detail: (storeId, sellerId) => ['stores', storeId, 'sellers', 'detail', sellerId],
};

export const authQueryKeys = {
  user: ['auth', 'user'],
  permissions: (storeId) => ['auth', 'permissions', storeId],
};

export const queryKeys = {
  stores: storeQueryKeys,
  inventory: inventoryQueryKeys,
  billing: billingQueryKeys,
  buyers: buyerQueryKeys,
  sellers: sellerQueryKeys,
  auth: authQueryKeys,
};

export default queryKeys;
