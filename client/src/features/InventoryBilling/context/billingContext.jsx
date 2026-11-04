"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import * as billingService from "../services/billingService";
import { fetchStoreById } from "@/features/storeDashboard/services/storeDashboardService";
import { showSuccess, showError } from "@/utils/toast";
import {
  subscribeToBillingSession,
  syncBillingSession,
  syncBarcodeValue,
  isMobileMode,
  getSessionIdFromURL,
  generateMobileScanURL,
} from "../services/billingSyncService";
import { useOfflineBilling } from "../hooks/useOfflineBilling";
import { 
  isOnline, 
  saveOfflineProducts, 
  getOfflineProductByBarcode,
  saveSyncMetadata,
  getOfflineProducts 
} from "../utils/db";
import { createBuyer } from "@/features/buyer/services/buyerService";
import { emitAgentRefresh } from "@/servies/agentEventBus";

export const BillingContext = createContext(null);

const getActiveBatchInfo = (product) => {
  const batches = Array.isArray(product?.batches) ? product.batches : [];
  // Prioritize active non-archived batch with positive quantity, sorted by expiryDate ascending
  const activeBatches = batches.filter((b) => !b.isArchived && Number(b.quantity) > 0);
  const selected =
    activeBatches.length > 0
      ? activeBatches[0]
      : batches.find((b) => !b.isArchived) || batches[0] || null;

  if (selected) {
    return {
      selectedBatchId: selected._id,
      selectedBatchNumber: selected.batchNumber,
      price: Number(selected.sellingPrice ?? product.sellingPrice ?? product.price ?? 0),
      batchStock: Number(selected.quantity || 0),
      batchExpiryDate: selected.expiryDate || null,
    };
  }

  return {
    selectedBatchId: null,
    selectedBatchNumber: product?.batchNumber || "BATCH-001",
    price: Number(product?.sellingPrice ?? product?.price ?? 0),
    batchStock: Number(product?.quantity ?? product?.qty ?? 0),
    batchExpiryDate: product?.expDate || null,
  };
};

const getLineId = (productId, batchId) => `${productId}_${batchId || "default"}`;

export const BillingProvider = ({ children }) => {
  const { user } = useAuthContext();
  const params = useParams();
  const storeId = params.storeId;

  const [loading, setLoading] = useState(false);
  const [isBillingProcessing, setIsBillingProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [storeProducts, setStoreProducts] = useState([]);
  const [lastBillData, setLastBillData] = useState(null);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [pendingBatchProduct, setPendingBatchProduct] = useState(null);

  const closeBillPreview = useCallback(() => {
    setShowBillPreview(false);
    setGeneratedBill(null);
    setLastBillData(null);
  }, []);
  const [manualProductOpen, setManualProductOpen] = useState(false);

  // Real-time sync states
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [syncStatus, setSyncStatus] = useState("disconnected"); // disconnected, connected, syncing
  const unsubscribeRef = useRef(null);
  const lastProcessedProductRef = useRef(null);

  // Check if in mobile mode on mount
  useEffect(() => {
    const mobileMode = isMobileMode();
    const urlSessionId = getSessionIdFromURL();

    setIsMobile(mobileMode);
    if (urlSessionId) {
      setSessionId(urlSessionId);
      setSyncEnabled(true);
    }
  }, []);

  // Reset all state on page refresh/mount
  useEffect(() => {
    // Clear all billing data on fresh page load
    setBilledProducts([]);
    setScannedBarcode("");
    setError(null);
    setLastBillData(null);
    setShowBillPreview(false);
    setGeneratedBill(null);

    console.log("🔄 Billing page reset - all data cleared");

    // Cleanup sync on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }, []);

  // Ref to store the latest callback handlers to avoid stale closures
  const handlersRef = useRef({
    addProductByBarcode: null,
    addProductManually: null,
    setScannedBarcode: null,
  });

  // Start real-time sync
  const startSync = useCallback(async () => {
    if (!storeId) return;

    const newSessionId = sessionId || generateSessionId();
    setSessionId(newSessionId);
    setSyncEnabled(true);
    setSyncStatus("connecting");

    console.log("🚀 Starting real-time sync with session:", newSessionId);
    console.log(
      "🔧 Sync mode:",
      isMobile ? "MOBILE (sending only)" : "DESKTOP (receiving)",
    );

    // Create initial session document in Firestore
    try {
      await syncBillingSession(storeId, newSessionId, []);
      console.log("✅ Session document created in Firestore");
    } catch (error) {
      console.error("❌ Failed to create session document:", error);
    }

    // Subscribe to changes
    const unsubscribe = subscribeToBillingSession(
      storeId,
      newSessionId,
      (scannedProduct) => {
        // Handle full product sync (legacy)
        const productKey = `${scannedProduct._id}_${scannedProduct.scannedAt}`;
        if (lastProcessedProductRef.current === productKey) {
          console.log("Skipping duplicate product:", productKey);
          return;
        }

        lastProcessedProductRef.current = productKey;
        setSyncStatus("syncing");

        // Add product to bill using latest handlers from ref
        if (scannedProduct.barcode) {
          handlersRef.current.addProductByBarcode?.(scannedProduct.barcode);
        } else {
          handlersRef.current.addProductManually?.(scannedProduct, 1);
        }

        // Reset status after a delay
        setTimeout(() => setSyncStatus("connected"), 1000);
      },
      (barcode) => {
        // Handle barcode-only sync (mobile sends barcode → laptop receives)
        console.log("💻 Laptop received barcode, auto-filling input:", barcode);
        setSyncStatus("syncing");

        // Auto-fill the barcode input field
        handlersRef.current.setScannedBarcode?.(barcode);

        // Auto-trigger product search
        setTimeout(() => {
          console.log("🔍 Auto-triggering product search for:", barcode);
          handlersRef.current.addProductByBarcode?.(barcode);
        }, 100);

        // Reset status after a delay
        setTimeout(() => setSyncStatus("connected"), 1000);
      },
    );

    unsubscribeRef.current = unsubscribe;
    setSyncStatus("connected");

    showSuccess("Real-time sync enabled! Scan on any device.");
    return newSessionId;
  }, [storeId, sessionId, generateSessionId, isMobile]);

  // Stop real-time sync
  const stopSync = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setSyncEnabled(false);
    setSyncStatus("disconnected");
    showSuccess("Real-time sync disabled");
  }, []);

  // Generate QR code/link for mobile scanning
  const getMobileScanURL = useCallback(() => {
    if (!sessionId || !storeId) return null;
    return generateMobileScanURL(storeId, sessionId);
  }, [storeId, sessionId]);

  // Final state declarations (consolidated)
  const [currentStore, setCurrentStore] = useState(null);
  const [userContext, setUserContext] = useState({ role: null, permissions: [] });
  const [billedProducts, setBilledProducts] = useState([]);
  const [discount, setDiscount] = useState({ type: "fixed", value: 0 }); // { type: 'percent' | 'fixed', value: number }
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Offline billing - use ref for processBill to avoid circular dependency
  const processBillRef = useRef(null);

  const {
    saveBillOffline,
    clearSession,
    syncPendingBills,
    processSyncQueue,
  } = useOfflineBilling({
    storeId,
    sessionId,
    syncEnabled,
    isMobile,
    billedProducts,
    discount,
    currentStore,
    setBilledProducts,
    setDiscount,
    setScannedBarcode,
    processBill: (...args) => processBillRef.current?.(...args),
  });

  // Check if current user has a specific permission
  const hasPermission = useCallback((permissionKey) => {
    if (!userContext?.role) return false;
    if (userContext.role === 'Owner') return true; 
    return userContext.permissions.includes(permissionKey);
  }, [userContext]);

  // Fetch store details
  const fetchStoreDetails = useCallback(async () => {
    if (!storeId) return;
    try {
      const response = await fetchStoreById(storeId);
      const { userContext: context, ...storeData } = response.data;
      setCurrentStore(storeData);
      setUserContext(context || { role: null, permissions: [] });
    } catch (err) {
      console.error("STORE_FETCH_ERROR:", err);
      showError("Failed to fetch store details");
    }
  }, [storeId]);

  // Fetch all store products for manual selection
  const fetchStoreProducts = useCallback(async () => {
    if (!storeId) return;
    try {
      if (isOnline()) {
        const data = await billingService.getStoreProducts(storeId);
        setStoreProducts(data || []);
        if (data && data.length > 0) {
          // Save to Dexie for offline use
          await saveOfflineProducts(storeId, data);
          await saveSyncMetadata(storeId, 'products');
          console.log("📦 Products synced for offline use");
        }
      } else {
        // Load from Dexie if offline
        const offlineData = await getOfflineProducts(storeId);
        setStoreProducts(offlineData || []);
        console.log("📴 Loaded products from offline cache");
      }
    } catch (err) {
      console.error("PRODUCTS_FETCH_ERROR:", err);
    }
  }, [storeId]);

  // Initial fetch
  useEffect(() => {
    fetchStoreDetails();
    fetchStoreProducts();
  }, [fetchStoreDetails, fetchStoreProducts]);

  // Add product by barcode (with multi-batch resolution)
  const addProductByBarcode = useCallback(
    async (barcode, specificBatch = null) => {
      try {
        setLoading(true);
        setError(null);

        // If in mobile mode with sync enabled, just send barcode to laptop
        if (isMobile && syncEnabled && sessionId) {
          try {
            await syncBarcodeValue(storeId, sessionId, barcode);
            console.log("📱 Barcode sent to laptop:", barcode);
            showSuccess(`Barcode sent: ${barcode}`);
            setLoading(false);
            return true;
          } catch (syncError) {
            console.error("Failed to sync barcode:", syncError);
            showError("Failed to send barcode to laptop");
            setLoading(false);
            return false;
          }
        }

        // Normal mode (laptop) - fetch product and add to cart
        let product = null;
        if (isOnline()) {
          product = await billingService.getProductByBarcode(barcode, storeId);
        } else {
          console.log("📴 Offline mode: searching barcode locally...");
          product = await getOfflineProductByBarcode(storeId, barcode);
        }

        if (!product) {
          showError("Product not found with this barcode");
          setLoading(false);
          return false;
        }

        // If specific batch is not supplied, check if there are multiple active batches with stock
        const batches = Array.isArray(product.batches) ? product.batches : [];
        const activeBatchesWithStock = batches.filter((b) => !b.isArchived && Number(b.quantity) > 0);

        if (!specificBatch && activeBatchesWithStock.length > 1) {
          // Open batch selection modal so cashier explicitly chooses the batch
          setPendingBatchProduct(product);
          setLoading(false);
          return true;
        }

        // Determine target batch (use specificBatch, earliest active batch, or fallback)
        const targetBatch =
          specificBatch ||
          activeBatchesWithStock[0] ||
          batches.find((b) => !b.isArchived) ||
          batches[0] ||
          null;

        const batchId = targetBatch?._id || null;
        const batchNumber = targetBatch?.batchNumber || product.batchNumber || "BATCH-001";
        const price = Number(targetBatch?.sellingPrice ?? product.sellingPrice ?? product.price ?? 0);
        const batchStock = targetBatch
          ? Number(targetBatch.quantity || 0)
          : Number(product.quantity || product.qty || 0);
        const lineId = getLineId(product._id, batchId);

        // Check if this exact product batch already exists in bill
        const existingIndex = billedProducts.findIndex(
          (p) => (p.lineId || getLineId(p._id, p.selectedBatchId)) === lineId,
        );

        if (existingIndex >= 0) {
          const updatedProducts = [...billedProducts];
          const currentItem = updatedProducts[existingIndex];
          const currentQty = currentItem.billedQuantity || 1;

          if (currentQty >= batchStock) {
            showError(`Stock limit reached for batch "${batchNumber}" (${batchStock} available).`);
            setLoading(false);
            return false;
          }

          updatedProducts[existingIndex] = {
            ...currentItem,
            billedQuantity: currentQty + 1,
          };
          setBilledProducts(updatedProducts);
        } else {
          setBilledProducts((prev) => [
            ...prev,
            {
              ...product,
              lineId,
              selectedBatchId: batchId,
              selectedBatchNumber: batchNumber,
              price,
              batchStock,
              batchExpiryDate: targetBatch?.expiryDate || product.expDate || null,
              billedQuantity: 1,
            },
          ]);
        }

        showSuccess(`Added "${product.name}" (${batchNumber}) to bill`);
        return true;
      } catch (err) {
        const msg = err?.message || err?.error || "Failed to fetch product";
        setError(msg);
        showError(msg);
        console.error("BARCODE_SCAN_ERROR:", err);
        return false;
      } finally {
        setLoading(false);
        setIsBillingProcessing(false);
      }
    },
    [storeId, billedProducts, isMobile, syncEnabled, sessionId],
  );

  // Add product manually (with multi-batch resolution)
  const addProductManually = useCallback(
    (product, quantity = 1, specificBatch = null) => {
      const batches = Array.isArray(product.batches) ? product.batches : [];
      const activeBatchesWithStock = batches.filter((b) => !b.isArchived && Number(b.quantity) > 0);

      const targetBatch =
        specificBatch ||
        activeBatchesWithStock[0] ||
        batches.find((b) => !b.isArchived) ||
        batches[0] ||
        null;

      const batchId = targetBatch?._id || null;
      const batchNumber = targetBatch?.batchNumber || product.batchNumber || "BATCH-001";
      const price = Number(targetBatch?.sellingPrice ?? product.sellingPrice ?? product.price ?? 0);
      const batchStock = targetBatch
        ? Number(targetBatch.quantity || 0)
        : Number(product.quantity || product.qty || 0);
      const lineId = getLineId(product._id, batchId);

      const existingIndex = billedProducts.findIndex(
        (p) => (p.lineId || getLineId(p._id, p.selectedBatchId)) === lineId,
      );

      if (existingIndex >= 0) {
        const updatedProducts = [...billedProducts];
        const currentItem = updatedProducts[existingIndex];
        const currentQty = currentItem.billedQuantity || 1;

        if (currentQty + quantity > batchStock) {
          showError(`Stock limit reached for batch "${batchNumber}" (${batchStock} available).`);
          return false;
        }

        updatedProducts[existingIndex] = {
          ...currentItem,
          billedQuantity: currentQty + quantity,
        };
        setBilledProducts(updatedProducts);
      } else {
        setBilledProducts((prev) => [
          ...prev,
          {
            ...product,
            lineId,
            selectedBatchId: batchId,
            selectedBatchNumber: batchNumber,
            price,
            batchStock,
            batchExpiryDate: targetBatch?.expiryDate || product.expDate || null,
            billedQuantity: quantity,
          },
        ]);
      }

      showSuccess(`Added "${product.name}" (${batchNumber}) to bill`);
      return true;
    },
    [billedProducts],
  );

  // Update handlers ref to avoid stale closures in real-time sync
  useEffect(() => {
    handlersRef.current = {
      addProductByBarcode,
      addProductManually,
      setScannedBarcode,
    };
  }, [addProductByBarcode, addProductManually, setScannedBarcode]);

  // Handle agent voice billing commands
  useEffect(() => {
    const handleAgentAdd = (e) => {
      const { barcode, quantity } = e.detail;
      if (barcode) {
        // We add by barcode, which handles adding 1 quantity.
        // If they requested more, we might need a small delay or loop, but let's just do it manually if possible.
        // Since addProductByBarcode just adds 1, let's just call it. For multiple, we could call it multiple times.
        const addMultiple = async () => {
           for (let i = 0; i < (quantity || 1); i++) {
              await addProductByBarcode(barcode);
           }
        };
        addMultiple();
      }
    };

    const handleAgentGenerate = (e) => {
      const { paymentMethod } = e.detail || {};
      processBillRef.current?.(paymentMethod || "cash");
    };

    window.addEventListener("agent:billing:add", handleAgentAdd);
    window.addEventListener("agent:billing:generate", handleAgentGenerate);

    return () => {
      window.removeEventListener("agent:billing:add", handleAgentAdd);
      window.removeEventListener("agent:billing:generate", handleAgentGenerate);
    };
  }, [addProductByBarcode]);


  // Remove product from bill by lineId (or productId)
  const removeProduct = useCallback((lineId) => {
    setBilledProducts((prev) =>
      prev.filter((p) => (p.lineId || p._id) !== lineId && p._id !== lineId),
    );
    showSuccess("Product removed from bill");
  }, []);

  // Update quantity of a product by lineId
  const updateProductQuantity = useCallback(
    (lineId, newQuantity) => {
      if (newQuantity <= 0) {
        removeProduct(lineId);
        return;
      }

      setBilledProducts((prev) =>
        prev.map((p) => {
          if ((p.lineId || p._id) === lineId) {
            const availableQty =
              p.batchStock !== undefined ? p.batchStock : p.quantity || p.qty || 0;
            if (newQuantity > availableQty) {
              showError(`Quantity exceeds available stock (${availableQty} available)`);
              return p;
            }
            return { ...p, billedQuantity: newQuantity };
          }
          return p;
        }),
      );
    },
    [removeProduct],
  );

  // Switch batch for a billed product line (updates batch ID, batch number, selling price, and stock ceiling)
  const updateProductBatch = useCallback((lineId, newBatchId) => {
    setBilledProducts((prev) => {
      const targetItem = prev.find((item) => (item.lineId || item._id) === lineId);
      if (!targetItem) return prev;

      const batches = Array.isArray(targetItem.batches) ? targetItem.batches : [];
      const newBatch = batches.find((b) => String(b._id) === String(newBatchId));
      if (!newBatch) return prev;

      const newLineId = getLineId(targetItem._id, newBatch._id);
      const batchStock = Number(newBatch.quantity || 0);
      const newPrice = Number(newBatch.sellingPrice ?? targetItem.sellingPrice ?? targetItem.price ?? 0);

      // If another line item already has this batch, merge into it and remove the old line
      const existingMatch = prev.find(
        (item) => (item.lineId || item._id) === newLineId && (item.lineId || item._id) !== lineId,
      );

      if (existingMatch) {
        const mergedQty = Math.min(
          (existingMatch.billedQuantity || 1) + (targetItem.billedQuantity || 1),
          batchStock > 0 ? batchStock : 1,
        );
        return prev
          .filter((item) => (item.lineId || item._id) !== lineId)
          .map((item) =>
            (item.lineId || item._id) === newLineId
              ? { ...item, billedQuantity: mergedQty }
              : item,
          );
      }

      const currentQty = targetItem.billedQuantity || 1;
      const newQty = batchStock > 0 ? Math.min(currentQty, batchStock) : 1;

      return prev.map((item) => {
        if ((item.lineId || item._id) !== lineId) return item;
        return {
          ...item,
          lineId: newLineId,
          selectedBatchId: newBatch._id,
          selectedBatchNumber: newBatch.batchNumber,
          price: newPrice,
          batchStock,
          batchExpiryDate: newBatch.expiryDate || null,
          billedQuantity: newQty,
        };
      });
    });
  }, []);

  // Calculate total
  const calculateTotal = useCallback(() => {
    const subtotal = billedProducts.reduce((total, product) => {
      const price = product.price || product.sellingPrice || 0;
      const quantity = product.billedQuantity || 1;
      return total + price * quantity;
    }, 0);

    let discountAmount = 0;
    if (discount.type === "percent") {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    return Math.max(0, subtotal - discountAmount);
  }, [billedProducts, discount]);

  // Generate bill and update inventory
  const processBill = useCallback(
    async (paymentMethod = "cash") => {
      if (billedProducts.length === 0) {
        showError("No products in the bill");
        return null;
      }

      try {
        setLoading(true);
        setIsBillingProcessing(true);
        const startTime = Date.now();
        setError(null);

        let buyerId = null;

        // Auto-register/update buyer in DB if customer info provided
        if ((customerDetails.name && customerDetails.name.trim() !== "Walk-in Customer") || (customerDetails.phone && customerDetails.phone.trim())) {
          try {
            const savedBuyer = await createBuyer(storeId, {
              name: customerDetails.name?.trim() || "Walk-in Customer",
              phone: customerDetails.phone?.trim() || "N/A",
              email: customerDetails.email?.trim() || "",
              totalSales: calculateTotal(),
              totalPaid: calculateTotal(),
              totalDue: 0,
            });
            buyerId = savedBuyer?._id || savedBuyer?.data?._id || null;
            emitAgentRefresh("buyers");
          } catch (buyerErr) {
            console.warn("Auto buyer creation info:", buyerErr?.message);
          }
        }

        const billData = {
          storeId,
          buyerId,
          storeInfo: {
            name: currentStore?.name || currentStore?.storeName || "Vyapar Sakha Store",
            address: currentStore?.address || currentStore?.location || "",
            phone: currentStore?.phone || currentStore?.mobile || currentStore?.contact || currentStore?.owner?.phone || user?.phone || "",
            email: currentStore?.email || currentStore?.owner?.email || user?.email || "",
            gstin: currentStore?.gstin || currentStore?.gstNumber || "",
          },
          customerName: customerDetails.name || "Walk-in Customer",
          customerPhone: customerDetails.phone || "",
          customerEmail: customerDetails.email || "",
          customer: {
            name: customerDetails.name || "Walk-in Customer",
            phone: customerDetails.phone || "",
            email: customerDetails.email || "",
          },
          user: {
            id: user?.uid || user?._id || "",
            name: user?.displayName || user?.name || "Staff",
            email: user?.email || "",
          },
          products: billedProducts.map((p) => {
            const unitPrice = Number(p.price || p.sellingPrice || 0);
            return {
              productId: p._id,
              name: p.name,
              barcode: p.barcode,
              quantity: p.billedQuantity,
              price: unitPrice,
              total: unitPrice * p.billedQuantity,
              batchId: p.selectedBatchId || null,
              batchNumber: p.selectedBatchNumber || p.batchNumber || null,
            };
          }),
          subtotal: billedProducts.reduce((sum, p) => sum + (p.price || p.sellingPrice || 0) * p.billedQuantity, 0),
          discount: {
            type: discount.type,
            value: discount.value,
            amount:
              discount.type === "percent"
                ? (billedProducts.reduce((sum, p) => sum + (p.price || p.sellingPrice || 0) * p.billedQuantity, 0) * discount.value) / 100
                : discount.value,
          },
          totalAmount: calculateTotal(),
          paymentMethod,
          billedBy: user?.uid,
          billedAt: new Date().toISOString(),
        };

        // Try online first if online, otherwise fallback to offline storage
        let bill = null;
        if (isOnline()) {
          try {
            bill = await billingService.generateBill(billData);
            console.log("Bill generated successfully on server:", bill);
            await clearSession();
            showSuccess("Bill generated and inventory updated successfully!");
          } catch (serverError) {
            console.error("Online bill generation failed:", serverError);
            const errorMsg = serverError?.message || (typeof serverError === "string" ? serverError : null);
            
            // Check if this is a genuine network failure vs a business validation error (e.g., stock/permission)
            const isNetworkError = !isOnline() || 
              serverError?.name === "AxiosError" ||
              serverError?.code === "ERR_NETWORK" ||
              errorMsg?.toLowerCase()?.includes("network") ||
              errorMsg?.toLowerCase()?.includes("failed to fetch") ||
              errorMsg?.toLowerCase()?.includes("timeout");

            if (isNetworkError) {
              console.warn("Network unavailable, saving offline for sync");
              await saveBillOffline(billData);
              showSuccess("Server unavailable. Bill saved offline! Will sync when connected.");
            } else {
              // Real server error (e.g. Insufficient stock, Unauthorized, etc.)
              showError(errorMsg || "Server rejected bill creation. Please check stock or permissions.");
              return null;
            }
          }
        } else {
          // Completely offline
          await saveBillOffline(billData);
          console.log("📴 Offline mode: Bill saved locally, will sync when online");
          showSuccess("Bill saved offline! Will sync when internet is available.");
        }

        // Save bill data for PDF download / preview
        // Merge server response (has _id, billNumber) with local billData (has full details)
        const elapsed = Date.now() - startTime;
        const minPrintDuration = 600; // Optimized snappy visual feedback (reduced from 2500ms)
        if (elapsed < minPrintDuration) {
          await new Promise((resolve) => setTimeout(resolve, minPrintDuration - elapsed));
        }

        const savedBill = bill ? { ...billData, ...bill } : { ...billData, offline: true };
        setLastBillData(savedBill);
        setGeneratedBill(savedBill);
        setShowBillPreview(true);

        // Clear the bill
        setBilledProducts([]);
        setDiscount({ type: "fixed", value: 0 });
        setCustomerDetails({ name: "", phone: "", email: "" });

        return savedBill;
      } catch (err) {
        const msg = err?.message || err?.error || "Failed to process bill";
        setError(msg);
        showError(msg);
        console.error("BILL_PROCESS_ERROR:", err);
        return null;
      } finally {
        setLoading(false);
        setIsBillingProcessing(false);
      }
    },
    [billedProducts, storeId, user?.uid, calculateTotal, saveBillOffline, clearSession, customerDetails],
  );

  // Set ref for offline billing hook
  useEffect(() => {
    processBillRef.current = processBill;
  }, [processBill]);

  // Clear current bill
  const clearBill = useCallback(async () => {
    setBilledProducts([]);
    setScannedBarcode("");
    setDiscount({ type: "fixed", value: 0 });
    setCustomerDetails({ name: "", phone: "", email: "" });
    await clearSession();
    showSuccess("Bill cleared");
  }, [clearSession]);

  const value = useMemo(
    () => ({
      currentStore,
      storeId,
      userContext,
      hasPermission,
      billedProducts,
      loading,
      error,
      scannedBarcode,
      storeProducts,
      lastBillData,
      isBillingProcessing,
      setIsBillingProcessing,
      showBillPreview,
      setShowBillPreview,
      generatedBill,
      setGeneratedBill,
      pendingBatchProduct,
      setPendingBatchProduct,
      closeBillPreview,
      manualProductOpen,
      setManualProductOpen,
      customerDetails,
      setCustomerDetails,
      // Real-time sync
      syncEnabled,
      syncStatus,
      sessionId,
      isMobile,
      setScannedBarcode,
      addProductByBarcode,
      addProductManually,
      removeProduct,
      updateProductQuantity,
      updateProductBatch,
      discount,
      setDiscount,
      calculateTotal,
      processBill,
      clearBill,
      fetchStoreProducts,
      // Sync functions
      startSync,
      stopSync,
      getMobileScanURL,
    }),
    [
      currentStore,
      storeId,
      billedProducts,
      loading,
      error,
      scannedBarcode,
      storeProducts,
      lastBillData,
      isBillingProcessing,
      showBillPreview,
      setShowBillPreview,
      generatedBill,
      setGeneratedBill,
      pendingBatchProduct,
      setPendingBatchProduct,
      closeBillPreview,
      manualProductOpen,
      customerDetails,
      syncEnabled,
      syncStatus,
      sessionId,
      isMobile,
      addProductByBarcode,
      addProductManually,
      removeProduct,
      updateProductQuantity,
      updateProductBatch,
      calculateTotal,
      discount,
      processBill,
      clearBill,
      fetchStoreProducts,
      startSync,
      stopSync,
      getMobileScanURL,
      userContext,
      hasPermission
    ],
  );

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
};

export const useBillingContext = () => {
  const context = useContext(BillingContext);
  return context || {};
};
