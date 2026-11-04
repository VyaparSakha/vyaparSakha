"use client";

import React, { useState, useEffect, useRef } from "react";
import { useManualProductAdd } from "../hooks";
import { Package, Search, X, Plus } from "lucide-react";

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

export const ManualProductModal = ({ inline = false }) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    isModalOpen,
    setIsModalOpen,
    filteredProducts,
    isSearching,
    addProduct,
    handleAddProduct,
  } = useManualProductAdd();

  const [dropdownOpen, setDropdownOpen] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim()) {
      setDropdownOpen(true);
    }
  }, [searchTerm]);

  // Click outside listener for inline dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBatchSelect = (product, batch) => {
    addProduct(product, batch);
    setSearchTerm("");
    setDropdownOpen(false);
  };

  const renderProductRows = (compact = false) => (
    <div className="space-y-3 p-1">
      {filteredProducts.map((product) => {
        const rawBatches = (
          Array.isArray(product.batches) && product.batches.length > 0
            ? product.batches
            : [
                {
                  _id: product._id,
                  productId: product._id,
                  batchNumber: product.batchNumber || "BATCH-001",
                  expiryDate: product.expDate || product.expiryDate || null,
                  quantity: Number(product.quantity || product.qty || 0),
                  sellingPrice: Number(product.sellingPrice ?? product.price ?? 0),
                  isArchived: false,
                },
              ]
        ).filter((b) => !b.isArchived && Number(b.quantity || 0) > 0);

        const totalStock = rawBatches.reduce(
          (acc, b) => acc + (b.isArchived ? 0 : Number(b.quantity || 0)),
          0,
        );

        return (
          <div
            key={product._id}
            className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all hover:border-indigo-200"
          >
            {/* Product Header */}
            <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-blue-50/40 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Package size={18} className="text-indigo-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {product.name}
                    </span>
                    {product.category && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-white/90 border border-slate-200/80 px-1.5 py-0.5 rounded">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                    {product.barcode
                      ? `Barcode: ${product.barcode}`
                      : product.sku
                      ? `SKU: ${product.sku}`
                      : "No barcode"}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                  {rawBatches.length} {rawBatches.length === 1 ? "Batch" : "Batches"}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
                  Total Stock: {totalStock}
                </span>
              </div>
            </div>

            {/* Batches List for Product */}
            <div className="p-2 space-y-1.5 divide-y divide-slate-100/60 bg-white">
              {rawBatches.map((batch) => {
                const expMeta = getSingleExpiryMeta(batch.expiryDate);
                const price = Number(batch.sellingPrice ?? product.sellingPrice ?? product.price ?? 0);
                const qty = Number(batch.quantity || 0);

                return (
                  <div
                    key={batch._id}
                    onClick={() => {
                      if (qty > 0) handleBatchSelect(product, batch);
                    }}
                    className={`pt-1.5 first:pt-0 p-2 rounded-xl transition-all flex items-center justify-between gap-3 ${
                      qty > 0
                        ? "hover:bg-indigo-50/70 border border-transparent hover:border-indigo-200/70 cursor-pointer group"
                        : "opacity-60 bg-slate-50/40 cursor-not-allowed border border-transparent"
                    }`}
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
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            qty > 0
                              ? "text-emerald-700 bg-emerald-50"
                              : "text-red-600 bg-red-50"
                          }`}
                        >
                          Qty: {qty} in stock
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          Unit: {product.unit || "Pcs"}
                        </span>
                      </div>
                    </div>

                    {/* Price & Add Action */}
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Price
                        </span>
                        <span className="font-black text-slate-900 text-sm sm:text-base">
                          ₹{price.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (qty > 0) handleBatchSelect(product, batch);
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
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (inline) {
    return (
      <div className="h-full relative z-30 bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 p-5 md:p-6 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <Search size={17} />
              </div>
              <span>Quick Product Search</span>
            </h2>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
              Catalog Lookup
            </span>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => {
                if (searchTerm.trim()) setDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setDropdownOpen(false);
              }}
              placeholder="Type name, barcode, or SKU to search..."
              className="w-full bg-slate-50/80 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              aria-label="Search products"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-2.5 font-medium">
          Instant search across entire inventory catalog
        </p>

        {searchTerm.trim() && dropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-2 z-[999] max-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/10 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Results Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-violet-50/60 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 shrink-0">
              <span className="flex items-center gap-1.5">
                <Search size={14} className="text-indigo-600" />
                <span>Search Results for &quot;{searchTerm}&quot;</span>
              </span>
              <span className="text-[11px] text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full font-bold">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
              </span>
            </div>

            {/* Scrollable List */}
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {isSearching ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Searching catalog...</span>
                </div>
              ) : filteredProducts.length > 0 ? (
                renderProductRows(true)
              ) : (
                <div className="p-8 text-center">
                  <Package className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-xs font-semibold text-slate-600">
                    No products found matching &quot;{searchTerm}&quot;
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Try checking spelling or search with barcode
                  </p>
                </div>
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium shrink-0">
              <span>Click any batch to add to bill</span>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                }}
                className="text-slate-500 hover:text-slate-800 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Product Manually</h2>
              <p className="text-xs text-slate-500">Pick from store catalog or add a custom item</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsModalOpen(false);
              setSearchTerm("");
              setSelectedProduct(null);
              setQuantity(1);
            }}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-5 border-b border-slate-100">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product name, barcode or SKU..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-5">
          {isSearching ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Searching catalog...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            renderProductRows(false)
          ) : (
            <div className="py-12 text-center">
              <Package className="mx-auto text-slate-300 mb-2" size={36} />
              <p className="text-sm font-semibold text-slate-600">No matching products</p>
              <p className="text-xs text-slate-400 mt-1">Try another search keyword or barcode</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
