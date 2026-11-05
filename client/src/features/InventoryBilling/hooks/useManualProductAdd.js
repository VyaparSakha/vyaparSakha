import { useState, useCallback, useEffect, useRef } from "react";
import { useBillingContext } from "../context/billingContext";
import { searchProductInStore } from "../services/billingService";
import { isOnline } from "../utils/db";

const productMatchesQuery = (product, query) =>
  [product.name, product.barcode, product.sku].some((value) =>
    String(value || "").toLowerCase().includes(query),
  );

/**
 * Custom hook for managing manual product addition
 */
export const useManualProductAdd = () => {
  const {
    storeProducts,
    storeId,
    addProductManually,
    manualProductOpen,
    setManualProductOpen,
  } = useBillingContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const requestId = useRef(0);
  const searchCache = useRef(new Map());
  const cacheStoreId = useRef(storeId);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const query = searchTerm.trim();
    const normalizedQuery = query.toLowerCase();
    const currentRequest = ++requestId.current;

    if (cacheStoreId.current !== storeId) {
      searchCache.current.clear();
      cacheStoreId.current = storeId;
    }

    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return undefined;
    }

    if (!isOnline()) {
      const results = storeProducts.filter((product) =>
        productMatchesQuery(product, normalizedQuery),
      );
      setSearchResults(results);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const cleanStore = typeof storeId === "object" ? storeId?._id : storeId;
        const products = await searchProductInStore(query, cleanStore);
        if (currentRequest === requestId.current) {
          const results = Array.isArray(products) ? products : [];
          setSearchResults(results);
        }
      } catch (error) {
        if (currentRequest === requestId.current) {
          setSearchResults([]);
        }
        console.error("PRODUCT_SEARCH_ERROR:", error);
      } finally {
        if (currentRequest === requestId.current) {
          setIsSearching(false);
        }
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, storeId, storeProducts]);

  const handleAddProduct = useCallback(() => {
    if (!selectedProduct) return;

    const success = addProductManually(selectedProduct, quantity);

    if (success) {
      setSelectedProduct(null);
      setQuantity(1);
      setSearchTerm("");
      setManualProductOpen(false);
    }
  }, [selectedProduct, quantity, addProductManually, setManualProductOpen]);

  const addProduct = useCallback(
    (product, batch = null) => {
      if (addProductManually(product, 1, batch)) {
        setSearchTerm("");
        setSelectedProduct(null);
      }
    },
    [addProductManually],
  );

  return {
    searchTerm,
    setSearchTerm,
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    isModalOpen: manualProductOpen,
    setIsModalOpen: setManualProductOpen,
    filteredProducts: searchResults,
    searchResults,
    isSearching,
    addProduct,
    handleAddProduct,
  };
};
