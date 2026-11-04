"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  getProductBatches,
  getNextBatchNumber,
} from "../services/inventoryService";
import { useInventoryContext } from "../context/inventoryContext";

const ExistingProductModal = ({
  isOpen,
  onClose,
  product,
  initialBatches = [],
  storeId,
  onSuccess,
}) => {
  const { addStockToBatch, createBatch } = useInventoryContext();
  const [mounted, setMounted] = useState(false);
  const [batches, setBatches] = useState(initialBatches);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [activeTab, setActiveTab] = useState("add_stock"); // "add_stock" | "new_batch"
  const [submitting, setSubmitting] = useState(false);

  // Action 1: Add Stock state
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [additionalQty, setAdditionalQty] = useState("");

  // Action 2: New Batch state
  const [newBatchData, setNewBatchData] = useState({
    batchNumber: "",
    expiryDate: "",
    manufacturingDate: "",
    quantity: "",
    buyingPrice: "",
    sellingPrice: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync / fetch batches ONLY when modal is explicitly opened for a product
  useEffect(() => {
    if (!isOpen || !product?._id) return;

    const initial = Array.isArray(initialBatches) ? initialBatches : [];
    setBatches(initial);
    if (initial.length > 0) {
      setSelectedBatchId(initial[0]._id);
      setActiveTab("add_stock");
    } else {
      setActiveTab("new_batch");
    }
    // Fetch fresh batches from backend
    fetchFreshBatches();
    // Reset form states
    setAdditionalQty("");
    setNewBatchData({
      batchNumber: "",
      expiryDate: "",
      manufacturingDate: "",
      quantity: "",
      buyingPrice: product.buyingPrice ? String(product.buyingPrice) : "",
      sellingPrice: product.sellingPrice ? String(product.sellingPrice) : "",
    });
  }, [isOpen, product?._id]);

  const fetchFreshBatches = async () => {
    if (!product?._id) return [];
    try {
      setLoadingBatches(true);
      const effectiveStore = (storeId && storeId !== "undefined" && storeId !== "null") ? storeId : product.store;
      const data = await getProductBatches(product._id, effectiveStore, true);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setBatches(list);
      if (list.length > 0) {
        const firstActive = list.find((b) => !b.isArchived) || list[0];
        setSelectedBatchId((prev) => prev && list.some(b => b._id === prev) ? prev : firstActive._id);
      } else {
        // Automatically switch to create new batch when product has 0 batches
        setActiveTab("new_batch");
      }
      return list;
    } catch (err) {
      console.warn("Failed to fetch batches:", err);
      return [];
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchNextBatchNumber = async () => {
    if (!product?._id) return;
    try {
      const bn = await getNextBatchNumber(product._id);
      setNewBatchData((prev) => ({
        ...prev,
        batchNumber: prev.batchNumber || bn,
      }));
    } catch {
      // ignore
    }
  };

  // Submit Action 1: Add Stock to Existing Batch
  const handleAddStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId) return;
    const qty = Number(additionalQty);
    if (isNaN(qty) || qty <= 0) return;

    setSubmitting(true);
    try {
      const effectiveStore = (storeId && storeId !== "undefined" && storeId !== "null") ? storeId : product.store;
      const res = await addStockToBatch(selectedBatchId, qty, effectiveStore);
      if (res?.success) {
        setAdditionalQty("");
        const updatedList = await fetchFreshBatches();
        if (onSuccess) onSuccess(updatedList);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Action 2: Create New Batch
  const handleNewBatchSubmit = async (e) => {
    e.preventDefault();
    if (!product?._id) return;

    setSubmitting(true);
    try {
      const effectiveStore = (storeId && storeId !== "undefined" && storeId !== "null") ? storeId : product.store;
      const payload = {
        productId: product._id,
        storeId: effectiveStore,
        batchNumber: newBatchData.batchNumber.trim(),
        expiryDate: newBatchData.expiryDate || null,
        manufacturingDate: newBatchData.manufacturingDate || null,
        quantity: Number(newBatchData.quantity) || 0,
        buyingPrice: Number(newBatchData.buyingPrice) || 0,
        sellingPrice: Number(newBatchData.sellingPrice) || 0,
      };

      const res = await createBatch(payload);
      if (res?.success) {
        setNewBatchData({
          batchNumber: "",
          expiryDate: "",
          manufacturingDate: "",
          quantity: "",
          buyingPrice: product.buyingPrice ? String(product.buyingPrice) : "",
          sellingPrice: product.sellingPrice ? String(product.sellingPrice) : "",
        });
        const updatedList = await fetchFreshBatches();
        if (onSuccess) onSuccess(updatedList);
        setActiveTab("add_stock");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !isOpen || !product) return null;

  const totalStock = batches.reduce(
    (acc, b) => acc + (b.isArchived ? 0 : Number(b.quantity || 0)),
    0
  );

  return ReactDOM.createPortal(
    <div className="fixed top-0 inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-amber-600 flex-shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Product Already Exists
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Barcode already registered. Manage batches or add stock below.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 scrollbar-hide">
          {/* Product Overview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-white p-1"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl">
                {product.name?.[0]?.toUpperCase() || "P"}
              </div>
            )}
            <div className="flex-1 min-w-[200px]">
              {/* Batch Number top line indicator */}
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span>
                    Batch: {batches.find(b => !b.isArchived)?.batchNumber || batches[0]?.batchNumber || product.batchNumber || "No Batches"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {product.category || "General"}
                </span>
                {product.brand && (
                  <span className="text-xs font-semibold text-slate-500">
                    • {product.brand}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {product.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Barcode: <span className="font-bold text-slate-700">{product.barcode || "-"}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">
                Total Available Stock
              </span>
              <span className="text-xl font-black text-slate-900">
                {totalStock}{" "}
                <span className="text-xs font-semibold text-slate-500">
                  {product.unit || "Pieces"}
                </span>
              </span>
            </div>
          </div>

          {/* Batches Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Available Batches ({batches.length})
              </h4>
              {loadingBatches && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Refreshing...
                </span>
              )}
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Batch #</th>
                      <th className="py-2.5 px-3">Expiry Date</th>
                      <th className="py-2.5 px-3 text-right">Available Qty</th>
                      <th className="py-2.5 px-3 text-right">Buying Price</th>
                      <th className="py-2.5 px-3 text-right">Selling Price</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-slate-400 font-medium"
                        >
                          No batches found for this product. Create the first batch below.
                        </td>
                      </tr>
                    ) : (
                      batches.map((batch) => {
                        const isExpired =
                          batch.expiryDate &&
                          new Date(batch.expiryDate) < new Date();
                        const isOut = batch.quantity === 0 || batch.isArchived;

                        return (
                          <tr
                            key={batch._id}
                            className={`hover:bg-slate-50/70 transition-colors ${
                              selectedBatchId === batch._id && activeTab === "add_stock"
                                ? "bg-blue-50/60 font-semibold"
                                : ""
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                              {batch.batchNumber}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {batch.expiryDate
                                ? new Date(batch.expiryDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "No expiry"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {batch.quantity}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">
                              ₹{Number(batch.buyingPrice || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                              ₹{Number(batch.sellingPrice || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {batch.isArchived ? (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                  Archived
                                </span>
                              ) : isExpired ? (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  Expired
                                </span>
                              ) : isOut ? (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Active
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <div className="flex border-b border-slate-200 mb-4">
              <button
                type="button"
                onClick={() => batches.length > 0 && setActiveTab("add_stock")}
                disabled={batches.length === 0}
                title={batches.length === 0 ? "No existing batches to add stock to. Create a batch first." : "Add stock to an existing batch"}
                className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center ${
                  batches.length === 0
                    ? "border-transparent text-slate-300 cursor-not-allowed"
                    : activeTab === "add_stock"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                1. Add Stock to Existing Batch {batches.length > 0 ? `(${batches.length})` : "(0)"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("new_batch")}
                className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center ${
                  activeTab === "new_batch"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {batches.length === 0 ? "2. Create First Batch" : "2. Create New Batch"}
              </button>
            </div>

            {/* Tab 1: Add Stock to Existing Batch */}
            {activeTab === "add_stock" && (
              <form onSubmit={handleAddStockSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Select Batch
                    </label>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {batches.length === 0 ? (
                        <option value="">No batches available</option>
                      ) : (
                        batches.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.batchNumber} — {b.quantity} in stock
                            {b.expiryDate
                              ? ` (Exp: ${new Date(b.expiryDate).toLocaleDateString()})`
                              : ""}
                            {b.isArchived ? " [Archived]" : ""}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Additional Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 50"
                      value={additionalQty}
                      onChange={(e) => setAdditionalQty(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  ℹ️ Adding stock will increase the batch quantity without modifying its expiry date or prices unintentionally.
                </p>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !selectedBatchId || !additionalQty}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
                  >
                    {submitting && (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    <span>{submitting ? "Adding Stock..." : "Add Stock"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Create New Batch */}
            {activeTab === "new_batch" && (
              <form onSubmit={handleNewBatchSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: BATCH-001, LOT-2026A"
                      value={newBatchData.batchNumber}
                      onChange={(e) =>
                        setNewBatchData((prev) => ({
                          ...prev,
                          batchNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={newBatchData.expiryDate}
                      onChange={(e) =>
                        setNewBatchData((prev) => ({
                          ...prev,
                          expiryDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 100"
                      value={newBatchData.quantity}
                      onChange={(e) =>
                        setNewBatchData((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Buying Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={newBatchData.buyingPrice}
                      onChange={(e) =>
                        setNewBatchData((prev) => ({
                          ...prev,
                          buyingPrice: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={newBatchData.sellingPrice}
                      onChange={(e) =>
                        setNewBatchData((prev) => ({
                          ...prev,
                          sellingPrice: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !newBatchData.batchNumber ||
                      !newBatchData.quantity ||
                      !newBatchData.sellingPrice
                    }
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
                  >
                    {submitting && (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    <span>
                      {submitting
                        ? "Creating Batch..."
                        : batches.length === 0
                        ? "Create First Batch"
                        : "Create New Batch"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExistingProductModal;

