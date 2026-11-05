"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ScanBarcode, Camera, Plus, Zap, Check, Package, X } from "lucide-react";
import { useBarcodeScanner } from "../hooks";
import { useBillingContext } from "../context/billingContext";
import * as billingService from "../services/billingService";

// Dynamically import BarcodeScanner — html5-qrcode accesses browser APIs
const BarcodeScanner = dynamic(
  () => import("@/features/inventory/components/BarcodeScanner"),
  { ssr: false },
);

const getSingleExpiryMeta = (expDate) => {
  if (!expDate) {
    return { status: "none", dot: "bg-slate-300", label: "No Expiry", daysLeft: Infinity, text: "No Expiry" };
  }

  const expiry = new Date(expDate);
  if (Number.isNaN(expiry.getTime())) {
    return { status: "none", dot: "bg-slate-300", label: "No Expiry", daysLeft: Infinity, text: "No Expiry" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msDiff = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

  const formattedDate = expiry.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (daysLeft < 0) {
    return {
      status: "red",
      dot: "bg-red-500 shadow-xs shadow-red-500/50",
      label: formattedDate,
      daysLeft,
      text: `Expired (${formattedDate})`,
    };
  }

  if (daysLeft <= 30) {
    return {
      status: "yellow",
      dot: "bg-amber-400 animate-pulse shadow-xs shadow-amber-400/50",
      label: formattedDate,
      daysLeft,
      text: `Exp: ${formattedDate} (${daysLeft}d left)`,
    };
  }

  return {
    status: "green",
    dot: "bg-emerald-500 shadow-xs shadow-emerald-500/50",
    label: formattedDate,
    daysLeft,
    text: `Exp: ${formattedDate}`,
  };
};

export const BarcodeInput = () => {
  const {
    scannedBarcode,
    setScannedBarcode,
    handleBarcodeInput,
    handleKeyPress: scannerHandleKeyPress,
    isScanning,
  } = useBarcodeScanner();
  const { loading, isMobile, storeId, addProductManually } = useBillingContext();
  const [scannerOpen, setScannerOpen] = useState(false);

  // Live lookup states for multi-batch dropdown
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced barcode lookup to fetch product and its batches
  useEffect(() => {
    const query = scannedBarcode?.trim();
    if (!query || query.length < 2) {
      setMatchedProduct(null);
      setDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingLookup(true);
        const cleanStore = typeof storeId === "object" ? storeId?._id : storeId;
        const product = await billingService.getProductByBarcode(query, cleanStore);
        if (product && (product.barcode === query || product._id)) {
          setMatchedProduct(product);
          setDropdownOpen(true);
        } else {
          setMatchedProduct(null);
          setDropdownOpen(false);
        }
      } catch {
        setMatchedProduct(null);
        setDropdownOpen(false);
      } finally {
        setLoadingLookup(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [scannedBarcode, storeId]);

  // Click outside listener to dismiss batch dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectBatch = useCallback(
    (batch) => {
      if (!matchedProduct) return;
      addProductManually(matchedProduct, 1, batch);
      setScannedBarcode("");
      setMatchedProduct(null);
      setDropdownOpen(false);
    },
    [matchedProduct, addProductManually, setScannedBarcode],
  );

  const handleCustomKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const batches = Array.isArray(matchedProduct?.batches) ? matchedProduct.batches : [];
        const activeBatches = batches.filter((b) => !b.isArchived && Number(b.quantity) > 0);
        if (matchedProduct && activeBatches.length > 0) {
          handleSelectBatch(activeBatches[0]);
        } else if (matchedProduct && batches.length > 0) {
          handleSelectBatch(batches[0]);
        } else {
          handleBarcodeInput(scannedBarcode);
        }
      }
    },
    [matchedProduct, handleSelectBatch, handleBarcodeInput, scannedBarcode],
  );

  const handleScanComplete = async (barcode) => {
    setScannerOpen(false);
    setScannedBarcode(barcode);
    // Directly lookup and add if single batch, or show batches
    try {
      const cleanStore = typeof storeId === "object" ? storeId?._id : storeId;
      const product = await billingService.getProductByBarcode(barcode, cleanStore);
      if (product) {
        setMatchedProduct(product);
        setDropdownOpen(true);
        const batches = Array.isArray(product.batches) ? product.batches : [];
        const activeBatches = batches.filter((b) => !b.isArchived && Number(b.quantity) > 0);
        if (activeBatches.length === 1) {
          handleSelectBatch(activeBatches[0]);
        }
      } else {
        await handleBarcodeInput(barcode);
      }
    } catch {
      await handleBarcodeInput(barcode);
    }
  };

  const renderBatchesDropdown = () => {
    if (!dropdownOpen || !matchedProduct) return null;

    const batches = (Array.isArray(matchedProduct.batches) ? matchedProduct.batches : [])
      .filter((b) => !b.isArchived && Number(b.quantity || 0) > 0);
    const totalStock = batches.reduce(
      (acc, b) => acc + (b.isArchived ? 0 : Number(b.quantity || 0)),
      0,
    );

    return (
      <div
        ref={dropdownRef}
        className="absolute left-0 right-0 top-full mt-2 z-[999] bg-white rounded-2xl shadow-2xl border border-slate-200 ring-1 ring-black/10 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150 max-h-[380px] flex flex-col"
      >
        {/* Product Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-violet-50/60 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm truncate">
                {matchedProduct.name}
              </span>
              {matchedProduct.category && (
                <span className="text-[10px] font-semibold text-slate-500 bg-white/90 border border-slate-200/70 px-1.5 py-0.5 rounded">
                  {matchedProduct.category}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Barcode: {matchedProduct.barcode}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full">
              {batches.length} {batches.length === 1 ? "Batch" : "Batches"}
            </span>
            <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
              Total Stock: {totalStock}
            </span>
          </div>
        </div>

        {/* Batches List - Scrollable */}
        <div className="p-2 space-y-1.5 overflow-y-auto flex-1 divide-y divide-slate-100/60">
          {batches.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 font-medium">
              No batches found for this product.
            </div>
          ) : (
            batches.map((batch) => {
              const expMeta = getSingleExpiryMeta(batch.expiryDate);
              const price = Number(batch.sellingPrice ?? matchedProduct.sellingPrice ?? 0);
              const qty = Number(batch.quantity || 0);

              return (
                <div
                  key={batch._id}
                  onClick={() => handleSelectBatch(batch)}
                  className="p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-200/80 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  {/* Batch Details: Batch #, Expiry Date with dot, Quantity */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md group-hover:bg-indigo-100 transition-colors">
                        Batch: {batch.batchNumber}
                      </span>
                      {/* Expiry Dot & Date */}
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full">
                        <span className={`w-2 h-2 rounded-full ${expMeta.dot}`} />
                        <span>{expMeta.text || expMeta.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        Qty: {qty} in stock
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        Unit: {matchedProduct.unit || "Pcs"}
                      </span>
                    </div>
                  </div>

                  {/* Price & Add Action */}
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Price</span>
                      <span className="font-black text-slate-900 text-sm sm:text-base">
                        ₹{price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectBatch(batch);
                      }}
                      disabled={qty <= 0}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 group-hover:shadow-sm"
                    >
                      <Plus size={13} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Click any batch to add to bill</span>
          <button
            type="button"
            onClick={() => setDropdownOpen(false)}
            className="text-slate-500 hover:text-slate-800 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Mobile Scanning Mode - Clean Centered Design
  if (isMobile) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-3 py-6">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 rounded-3xl mb-3 shadow-xl shadow-indigo-500/25">
              <ScanBarcode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Scan Barcode
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Use a physical scanner or your phone camera to add products
            </p>
          </div>

          {/* Input Card */}
          <div className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={scannedBarcode}
                onChange={(e) => setScannedBarcode(e.target.value)}
                onKeyPress={handleCustomKeyPress}
                placeholder="Scan or type barcode..."
                className="w-full px-4 py-3.5 text-base font-mono border-2 border-slate-200 focus:border-indigo-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-center tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-sans"
                disabled={loading || isScanning}
                autoFocus
              />

              {/* Batches Dropdown */}
              {renderBatchesDropdown()}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setScannerOpen(true)}
                disabled={loading || isScanning}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50"
                title="Open Camera Scanner"
              >
                <Camera size={18} />
                <span>Camera</span>
              </button>

              <button
                onClick={() => {
                  if (matchedProduct) {
                    const b = (matchedProduct.batches || []).find((x) => !x.isArchived) || matchedProduct.batches?.[0];
                    if (b) handleSelectBatch(b);
                  } else {
                    handleBarcodeInput(scannedBarcode);
                  }
                }}
                disabled={loading || isScanning || !scannedBarcode}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 font-bold text-sm disabled:opacity-40"
              >
                {isScanning || loadingLookup ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Plus size={18} />
                    <span>Add Item</span>
                  </span>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 font-medium">
                Tip: Hardware barcode guns submit automatically via Enter key
              </p>
            </div>
          </div>

          {/* Camera Scanner Modal */}
          {scannerOpen && (
            <BarcodeScanner
              onScan={handleScanComplete}
              onClose={() => setScannerOpen(false)}
            />
          )}
        </div>
      </div>
    );
  }

  // Desktop/Laptop Mode - Matched Height Container with Soft Shadow
  return (
    <div className="h-full bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 p-5 md:p-6 transition-all flex flex-col justify-between relative z-40">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ScanBarcode size={17} />
            </div>
            <span>Barcode Scanner</span>
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            <Zap size={11} className="text-amber-500 fill-amber-500" />
            Scanner Ready
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 relative z-40">
          <div className="relative flex-1">
            <input
              type="text"
              value={scannedBarcode}
              onChange={(e) => setScannedBarcode(e.target.value)}
              onKeyPress={handleCustomKeyPress}
              placeholder="Scan barcode or type code..."
              className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-mono tracking-wider transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 text-slate-900"
              disabled={loading || isScanning}
              autoFocus
            />

            {/* Live Batches Dropdown below barcode input */}
            {renderBatchesDropdown()}
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setScannerOpen(true)}
              disabled={loading || isScanning}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 disabled:opacity-40"
              title="Open Camera Scanner"
            >
              <Camera size={16} className="text-slate-600" />
              <span className="hidden sm:inline">Camera</span>
            </button>

            <button
              onClick={() => {
                if (matchedProduct) {
                  const b = (matchedProduct.batches || []).find((x) => !x.isArchived) || matchedProduct.batches?.[0];
                  if (b) handleSelectBatch(b);
                } else {
                  handleBarcodeInput(scannedBarcode);
                }
              }}
              disabled={loading || isScanning || !scannedBarcode}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xs transition-all font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isScanning || loadingLookup ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-2.5 font-medium">
        Ready for laser / USB barcode readers or direct SKU entry
      </p>

      {/* Camera Scanner Modal */}
      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScanComplete}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
};

export default BarcodeInput;

