import { apiPost, apiGet, apiPatch } from "@/servies/api";

/**
 * Billing Service - Handles billing and transaction related API calls
 * Uses Cart API endpoints for billing operations
 */

// Fetch product by barcode
export const getProductByBarcode = async (barcode, storeId) => {
  const response = await apiGet(
    `/product/barcode/${barcode}?storeId=${storeId}`,
  );
  return response.data;
};

// Fetch product by manual search (name/ID)
export const searchProductInStore = async (searchTerm, storeId) => {
  const response = await apiGet(
    `/product/search?query=${encodeURIComponent(searchTerm)}&storeId=${encodeURIComponent(storeId)}`,
  );
  return response.data;
};

// Get store products for manual selection
export const getStoreProducts = async (storeId) => {
  const response = await apiGet(`/product/all?storeId=${storeId}`);
  return response.data;
};

// Create a new billing session (cart)
export const createBillingSession = async (storeId) => {
  const response = await apiPost("/cart/create", { storeId });
  return response.data;
};

// Start scanning mode
export const startScanning = async (cartId) => {
  const response = await apiPatch(`/cart/${cartId}/start-scan`, {});
  return response.data;
};

// Add item to billing session
export const addItemToBill = async (cartId, productId, quantity) => {
  const response = await apiPost(`/cart/${cartId}/items`, {
    productId,
    quantity,
  });
  return response.data;
};

// Process payment (generates bill)
export const processPayment = async (cartId, paymentMethod, subtotal, discount, totalPrice, customerDetails = {}) => {
  const response = await apiPost(`/cart/${cartId}/payment`, {
    paymentId: `${paymentMethod}-${Date.now()}`,
    subtotal,
    discount,
    totalPrice,
    buyer: customerDetails.buyerId || null,
    customerName: customerDetails.name || customerDetails.customerName || "Walk-in Customer",
    customerPhone: customerDetails.phone || customerDetails.customerPhone || "",
    customerEmail: customerDetails.email || customerDetails.customerEmail || "",
  });
  return response.data;
};

// Confirm payment and update inventory
export const confirmPayment = async (cartId) => {
  const response = await apiPatch(`/cart/${cartId}/confirm-payment`, {});
  return response.data;
};

// Complete billing flow with Fast Single-Trip Checkout & Fallback
export const generateBill = async (billData) => {
  const { storeId, products, paymentMethod, subtotal, discount, totalAmount, customerName, customerPhone, customerEmail, buyerId } = billData;

  // FAST PATH: Try optimized single-trip quick checkout
  try {
    const quickResponse = await apiPost("/cart/quick-checkout", {
      storeId,
      products,
      paymentMethod,
      subtotal,
      discount,
      totalAmount,
      buyerId,
      customerName,
      customerPhone,
      customerEmail,
    });

    if (quickResponse?.data) {
      return {
        ...(quickResponse.data?.data || quickResponse.data),
        ...billData,
        storeInfo: billData.storeInfo,
      };
    }
  } catch (quickErr) {
    console.warn("Quick checkout failed or not supported, falling back to multi-step checkout:", quickErr?.message);
    // If it's a 400 validation error (e.g. Insufficient stock), do NOT fallback, throw immediately
    if (quickErr?.response?.status === 400 || quickErr?.response?.data?.statusCode === 400) {
      throw quickErr;
    }
  }

  // FALLBACK PATH: Standard multi-step session
  const cart = await createBillingSession(storeId);
  await startScanning(cart._id);

  // Add products to cart
  for (const item of products) {
    await addItemToBill(
      cart._id,
      item._id || item.productId,
      item.billedQuantity || item.quantity,
    );
  }

  // Process payment
  await processPayment(cart._id, paymentMethod, subtotal, discount, totalAmount, {
    buyerId,
    customerName,
    customerPhone,
    customerEmail,
  });

  // Confirm payment
  const finalCart = await confirmPayment(cart._id);

  return {
    ...(finalCart?.data || finalCart || {}),
    ...billData,
    storeInfo: billData.storeInfo,
  };
};

// Get bill history for a store
export const getBillHistory = async (storeId, limit = 50, page = 1, filters = {}) => {
  const { date, month, year } = filters;
  let url = `/cart/store/${storeId}/history?limit=${limit}&page=${page}`;
  
  if (date) url += `&date=${date}`;
  if (month) url += `&month=${month}`;
  if (year) url += `&year=${year}`;

  const response = await apiGet(url);
  return response.data;
};
