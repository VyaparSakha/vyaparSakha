/**
 * TanStack Query Key Factory
 * Centralized, type-safe query keys to prevent typos and ensure clean invalidation.
 * 
 * Rules:
 * 1. Always use arrays for query keys.
 * 2. Structure from most generic to most specific:
 *    ['stores'] -> ['stores', storeId] -> ['stores', storeId, 'inventory'] -> ['stores', storeId, 'inventory', productId]
 * 3. Calling queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(storeId) })
 *    will automatically invalidate ALL inventory queries (lists, details, stats) for that store!
 */

export const queryKeys = {
  // Store details
  stores: {
    all: ['stores'],
    list: () => ['stores', 'list'],
    detail: (storeId) => ['stores', storeId],
    stats: (storeId) => ['stores', storeId, 'stats'],
  },

  // Inventory & Products
  inventory: {
    all: (storeId) => ['stores', storeId, 'inventory'],
    list: (storeId, filters) => ['stores', storeId, 'inventory', 'list', filters || {}],
    detail: (storeId, productId) => ['stores', storeId, 'inventory', 'detail', productId],
    stats: (storeId) => ['stores', storeId, 'inventory', 'stats'],
    categories: (storeId) => ['stores', storeId, 'inventory', 'categories'],
  },

  // Billing & Invoices
  billing: {
    all: (storeId) => ['stores', storeId, 'billing'],
    invoices: (storeId, filter) => ['stores', storeId, 'billing', 'invoices', filter || {}],
    detail: (storeId, billId) => ['stores', storeId, 'billing', 'detail', billId],
  },

  // Customers & Buyers
  buyers: {
    all: (storeId) => ['stores', storeId, 'buyers'],
    list: (storeId) => ['stores', storeId, 'buyers', 'list'],
    detail: (storeId, buyerId) => ['stores', storeId, 'buyers', 'detail', buyerId],
  },

  // Vendors & Sellers
  sellers: {
    all: (storeId) => ['stores', storeId, 'sellers'],
    list: (storeId) => ['stores', storeId, 'sellers', 'list'],
    detail: (storeId, sellerId) => ['stores', storeId, 'sellers', 'detail', sellerId],
  },

  // User Profile & Permissions
  auth: {
    user: ['auth', 'user'],
    permissions: (storeId) => ['auth', 'permissions', storeId],
  },
};

