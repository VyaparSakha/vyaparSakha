import { apiGet, apiPost, apiPut } from "@/servies/api";

/**
 * Fetch the business owner's AI credit wallet details.
 * (If called by an employee with a storeId, returns the shared store wallet quota).
 */
export const fetchWallet = async (storeId = null) => {
  const params = storeId ? { storeId } : {};
  const res = await apiGet("/ai-billing/wallet", { params });
  return res?.data?.data || res?.data;
};

/**
 * Fetch paginated AI usage records.
 */
export const fetchUsageHistory = async ({ storeId = null, page = 1, limit = 10 } = {}) => {
  const params = { page, limit };
  if (storeId) params.storeId = storeId;
  const res = await apiGet("/ai-billing/usage", { params });
  return res?.data?.data || res?.data;
};

/**
 * Fetch immutable credit transactions ledger (Owner only).
 */
export const fetchTransactions = async ({ page = 1, limit = 10 } = {}) => {
  const res = await apiGet("/ai-billing/transactions", { params: { page, limit } });
  return res?.data?.data || res?.data;
};

/**
 * Fetch active pricing model and rate configuration.
 */
export const fetchPricing = async () => {
  const res = await apiGet("/ai-billing/pricing");
  return res?.data?.data || res?.data;
};

/**
 * Fetch available credit booster packages.
 */
export const fetchPackages = async () => {
  const res = await apiGet("/ai-billing/packages");
  return res?.data?.data || res?.data;
};

/**
 * Update administrative wallet settings (monthly limits) - Owner only.
 */
export const updateBillingSettings = async ({ monthlyLimit }) => {
  const res = await apiPut("/ai-billing/settings", { monthlyLimit });
  return res?.data?.data || res?.data;
};

/**
 * Create a Razorpay top-up order for purchasing additional AI credits.
 */
export const createTopUpOrder = async (packageId) => {
  const res = await apiPost("/ai-billing/top-up/create-order", { packageId });
  return res?.data?.data || res?.data;
};

/**
 * Verify Razorpay payment signature and credit the wallet.
 */
export const verifyTopUpPayment = async ({ orderId, paymentId, signature, packageId }) => {
  const res = await apiPost("/ai-billing/top-up/verify", {
    orderId,
    paymentId,
    signature,
    packageId,
  });
  return res?.data?.data || res?.data;
};
