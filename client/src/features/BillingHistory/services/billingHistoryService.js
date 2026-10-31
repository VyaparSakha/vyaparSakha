import { apiGet } from '@/servies/api';

/**
 * Fetch bill history from server
 * @param {string} storeId - ID of the store
 * @param {number} limit - Number of records per batch
 * @param {number} page - Page number
 * @param {Object} filters - Filter criteria { date, month, year }
 */
export const fetchBillHistory = async (storeId, limit = 100, page = 1, filters = {}) => {
  if (!storeId) {
    return { bills: [], pagination: { total: 0, page: 1, limit: 100 } };
  }

  const { date, month, year } = filters || {};
  let url = `/cart/store/${storeId}/history?limit=${limit}&page=${page}`;

  if (date) url += `&date=${encodeURIComponent(date)}`;
  if (month) url += `&month=${encodeURIComponent(month)}`;
  if (year) url += `&year=${encodeURIComponent(year)}`;

  const response = await apiGet(url);
  return response?.data || { bills: [], pagination: { total: 0, page: 1, limit } };
};

export default {
  fetchBillHistory,
};

