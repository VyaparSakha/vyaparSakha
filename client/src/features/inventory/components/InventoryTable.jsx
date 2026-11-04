"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import ProductActionMenu from "./ProductActionMenu";
import { sendInstantStockAlertMail } from "../services/inventoryService";

// Lazy-load Manage Batches modal on demand only when user clicks "Batch"
const ExistingProductModal = dynamic(() => import("./ExistingProductModal"), {
  ssr: false,
  loading: () => null,
});

const getSingleExpiryMeta = (expDate) => {
  if (!expDate) {
    return { status: "none", dot: "bg-slate-300", label: "-", daysLeft: Infinity, text: "No Expiry" };
  }

  const expiry = new Date(expDate);
  if (Number.isNaN(expiry.getTime())) {
    return { status: "none", dot: "bg-slate-300", label: "-", daysLeft: Infinity, text: "No Expiry" };
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
      dot: "bg-red-500 shadow-sm shadow-red-500/50",
      label: formattedDate,
      daysLeft,
      text: `Expired (${Math.abs(daysLeft)}d ago)`,
    };
  }

  if (daysLeft <= 30) {
    return {
      status: "yellow",
      dot: "bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50",
      label: formattedDate,
      daysLeft,
      text: `Expiring soon (${daysLeft}d left)`,
    };
  }

  return {
    status: "green",
    dot: "bg-emerald-500 shadow-sm shadow-emerald-500/50",
    label: formattedDate,
    daysLeft,
    text: `Good (${daysLeft}d left)`,
  };
};

const getProductExpiryMeta = (item) => {
  const activeBatches = (item.batches || []).filter((b) => !b.isArchived);
  const batchList = activeBatches.length > 0 ? activeBatches : (item.batches || []);

  let listWithMeta = [];
  if (batchList.length > 0) {
    listWithMeta = batchList.map((b) => ({
      ...b,
      meta: getSingleExpiryMeta(b.expiryDate),
    }));
  } else if (item.expDate) {
    listWithMeta = [
      {
        _id: item._id || "single",
        batchNumber: item.batchNumber || "BATCH-001",
        quantity: item.quantity ?? 0,
        expiryDate: item.expDate,
        meta: getSingleExpiryMeta(item.expDate),
      },
    ];
  }

  // If any is red -> Red
  // Else if any is yellow -> Yellow
  // Else if any is green -> Green
  const hasRed = listWithMeta.some((b) => b.meta.status === "red");
  const hasYellow = listWithMeta.some((b) => b.meta.status === "yellow");
  const hasGreen = listWithMeta.some((b) => b.meta.status === "green");

  let primaryDot = "bg-slate-300";
  let primaryStatus = "none";

  if (hasRed) {
    primaryDot = "bg-red-500 shadow-sm shadow-red-500/50";
    primaryStatus = "red";
  } else if (hasYellow) {
    primaryDot = "bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50";
    primaryStatus = "yellow";
  } else if (hasGreen) {
    primaryDot = "bg-emerald-500 shadow-sm shadow-emerald-500/50";
    primaryStatus = "green";
  }

  return {
    primaryStatus,
    primaryDot,
    hasDropdown: listWithMeta.length > 0,
    batches: listWithMeta,
    singleLabel: listWithMeta[0]?.meta?.label || "-",
  };
};

const InventoryTable = ({
  inventory,
  loading,
  onEdit,
  onDelete,
  onProductClick,
  lowStockThreshold = 10,
  currencySymbol = "₹",
  currentPage = 1,
  totalPages = 1,
  pageStart = 0,
  pageEnd = 0,
  totalFilteredCount = 0,
  onPageChange,
}) => {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.storeId;
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [expandedProductIds, setExpandedProductIds] = useState({});
  const [selectedProductForBatch, setSelectedProductForBatch] = useState(null);
  const [openExpiryDropdownId, setOpenExpiryDropdownId] = useState(null);
  const [openPriceDropdownId, setOpenPriceDropdownId] = useState(null);

  React.useEffect(() => {
    if (!openExpiryDropdownId && !openPriceDropdownId) return;
    const handleOutside = (e) => {
      if (openExpiryDropdownId && !e.target.closest(".expiry-dropdown-container")) {
        setOpenExpiryDropdownId(null);
      }
      if (openPriceDropdownId && !e.target.closest(".price-dropdown-container")) {
        setOpenPriceDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openExpiryDropdownId, openPriceDropdownId]);

  const toggleExpandBatches = (id) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSendInstantMail = async () => {
    if (!storeId) {
      toast.error("Store ID not found");
      return;
    }
    if (isSendingMail) return;

    try {
      setIsSendingMail(true);
      const res = await sendInstantStockAlertMail(storeId);
      if (res?.status === "low_stock") {
        toast.success(`⚠️ Low stock alert email sent for ${res.lowStockCount} product(s)!`);
      } else {
        toast.success("✅ All products healthy! Inventory status email sent.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to send alert email");
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleNavigateToDetails = (item) => {
    const prodId = item?._id || item?.id;
    if (storeId && prodId) {
      router.push(`/storeDashboard/${storeId}/${prodId}/analytics`);
    } else {
      onProductClick?.(item);
    }
  };
  if (loading && inventory.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 p-6 sm:p-12 flex flex-col items-center justify-center animate-pulse shadow-lg">
        <div className="h-12 w-12 bg-slate-200 rounded-2xl mb-4" />
        <div className="h-4 w-40 bg-slate-200 rounded-lg mb-2" />
        <div className="h-3 w-32 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  if (!loading && inventory.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 p-6 sm:p-12 flex flex-col items-center justify-center text-center shadow-lg">
        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-50/80 text-slate-300 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-slate-100">
          <svg
            className="h-8 w-8 sm:h-10 sm:w-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900">No Matching Products</h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 font-semibold">
          Try changing filters or search terms to find products.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in-up [animation-delay:300ms]">
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-600">
          Showing {pageStart}-{pageEnd} of {totalFilteredCount}
        </p>
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={handleSendInstantMail}
            disabled={isSendingMail}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-sm ${
              isSendingMail
                ? "bg-amber-100 text-amber-600 cursor-wait animate-pulse"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white hover:shadow-amber-500/25 hover:shadow-md"
            }`}
            title="Instant Stock Alert: Send inventory status / low stock alert email now"
          >
            <svg
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isSendingMail ? "animate-spin" : ""}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="font-extrabold tracking-wide">
              {isSendingMail ? "Sending..." : "Instant Alert"}
            </span>
          </button>

          <p className="text-[10px] sm:text-xs font-semibold text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
              <th className="px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600">
                Product
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600">
                Category
              </th>
              <th className="md:hidden px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600 text-center">
                Actions
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600">
                Stock
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600">
                Price
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600">
                Exp. Date
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600">
                Barcode
              </th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {inventory.map((item) => {
              const qty = Number(item.quantity ?? item.qty ?? 0);
              const category = item.category || "General";
              const barcode = item.barcode || "-";
              const expiryMeta = getProductExpiryMeta(item);
              const isExpiryDropdownOpen = openExpiryDropdownId === (item._id || item.id);
              const isPriceDropdownOpen = openPriceDropdownId === (item._id || item.id);

              const activeBatches = (item.batches || []).filter((b) => !b.isArchived);
              const batchList = activeBatches.length > 0 ? activeBatches : (item.batches || []);
              const priceBatches = batchList.length > 0 ? batchList : [
                {
                  _id: item._id || "single",
                  batchNumber: item.batchNumber || "BATCH-001",
                  quantity: qty,
                  sellingPrice: item.sellingPrice,
                  buyingPrice: item.buyingPrice,
                },
              ];

              return (
                <tr
                  key={item._id || item.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td
                    className="px-3 sm:px-6 py-2 sm:py-4 cursor-pointer"
                    onClick={() => onProductClick?.(item)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover border border-slate-200 group-hover:border-blue-300 transition-colors"
                        />
                      ) : (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[8px] sm:text-xs flex-shrink-0 border border-slate-200 group-hover:border-blue-300 transition-colors">
                          IMG
                        </div>
                      )}
                      <div className="min-w-0">
                        {/* Batch Number line at the top */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                            <span>
                              Batch: {item.batches && item.batches.length > 0 
                                ? item.batches.map(b => b.batchNumber).join(", ") 
                                : item.batchNumber || "BATCH-001"}
                            </span>
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
                          {item.name}
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                          View Details
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <span className="px-2 sm:px-3 py-1 bg-slate-100/80 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
                      {category}
                    </span>
                  </td>

                  <td className="md:hidden px-3 sm:px-6 py-2 sm:py-4">
                    <ProductActionMenu
                      onDetails={() => handleNavigateToDetails(item)}
                      onBatches={() => setSelectedProductForBatch(item)}
                      onEdit={() => onEdit?.(item)}
                      onDelete={() => onDelete?.(item)}
                    />
                  </td>

                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-xs sm:text-lg">{qty}</span>
                      <span
                        className={`text-[8px] sm:text-[10px] font-bold uppercase italic mt-0.5 ${qty > lowStockThreshold
                            ? "text-emerald-600"
                            : qty > 0
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                      >
                        {qty > lowStockThreshold ? "In" : qty > 0 ? "Low" : "Out"}{" "}
                        <span className="hidden sm:inline">({item.unit || "pcs"})</span>
                      </span>
                    </div>
                  </td>

                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="relative inline-block price-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenPriceDropdownId(isPriceDropdownOpen ? null : (item._id || item.id));
                        }}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200/80 bg-white/60 shadow-2xs group"
                        title="Click to view batch prices"
                      >
                        <span className="text-xs font-black text-slate-700">{currencySymbol}</span>
                        <svg
                          className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform ${
                            isPriceDropdownOpen ? "rotate-180 text-blue-600" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown List of Batch Prices */}
                      {isPriceDropdownOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-0 mt-1.5 z-[100] w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 animate-scale-up text-left"
                        >
                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Batch Prices ({priceBatches.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => setOpenPriceDropdownId(null)}
                              className="text-slate-400 hover:text-slate-600 text-xs p-0.5 rounded"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {priceBatches.map((b) => (
                              <div
                                key={b._id || b.batchNumber}
                                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                              >
                                <div>
                                  <p className="text-xs font-mono font-bold text-slate-800">
                                    {b.batchNumber}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    Stock: {b.quantity ?? 0} {item.unit || "pcs"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-900">
                                    {currencySymbol}{Number(b.sellingPrice ?? item.sellingPrice ?? 0).toFixed(2)}
                                  </p>
                                  {b.buyingPrice !== undefined && Number(b.buyingPrice) > 0 && (
                                    <p className="text-[9px] text-slate-400 font-medium">
                                      Cost: {currencySymbol}{Number(b.buyingPrice).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="relative inline-block expiry-dropdown-container">
                      {expiryMeta.hasDropdown ? (
                        <div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenExpiryDropdownId(isExpiryDropdownOpen ? null : (item._id || item.id));
                            }}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200/80 bg-white/60 shadow-2xs group"
                            title="Click to view batch expiry details"
                          >
                            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${expiryMeta.primaryDot}`} />
                            <svg
                              className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform ${
                                isExpiryDropdownOpen ? "rotate-180 text-blue-600" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Dropdown List of Expiry Dates */}
                          {isExpiryDropdownOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 mt-1.5 z-[100] w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 animate-scale-up text-left"
                            >
                              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Batch Expiry ({expiryMeta.batches.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setOpenExpiryDropdownId(null)}
                                  className="text-slate-400 hover:text-slate-600 text-xs p-0.5 rounded"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {expiryMeta.batches.map((b) => (
                                  <div
                                    key={b._id || b.batchNumber}
                                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${b.meta.dot}`} />
                                      <div>
                                        <p className="text-xs font-mono font-bold text-slate-800">
                                          {b.batchNumber}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                          Stock: {b.quantity}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-semibold text-slate-700">
                                        {b.meta.label}
                                      </p>
                                      <p
                                        className={`text-[9px] font-bold ${
                                          b.meta.status === "red"
                                            ? "text-red-600"
                                            : b.meta.status === "yellow"
                                            ? "text-amber-600"
                                            : b.meta.status === "green"
                                            ? "text-emerald-600"
                                            : "text-slate-400"
                                        }`}
                                      >
                                        {b.meta.text}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-center p-1"
                          title="No Expiry Date"
                        >
                          <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${expiryMeta.primaryDot}`} />
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <code className="text-[8px] sm:text-[11px] font-bold bg-slate-50 px-2 py-1 rounded-md text-slate-700 border border-slate-200 break-all sm:break-normal">
                      {barcode}
                    </code>
                  </td>

                  <td className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4 text-right">
                    <ProductActionMenu
                      onDetails={() => handleNavigateToDetails(item)}
                      onBatches={() => setSelectedProductForBatch(item)}
                      onEdit={() => onEdit?.(item)}
                      onDelete={() => onDelete?.(item)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inventory.length > 0 && totalPages > 1 && (
        <div className="px-3 sm:px-6 py-2 sm:py-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <p className="text-[8px] sm:text-[10px] text-slate-600 font-black uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-300 rounded-xl text-[8px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-300 rounded-xl text-[8px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {/* Existing Product & Batch Manager Modal */}
      {selectedProductForBatch && (
        <ExistingProductModal
          isOpen={!!selectedProductForBatch}
          onClose={() => setSelectedProductForBatch(null)}
          product={selectedProductForBatch}
          initialBatches={selectedProductForBatch.batches || []}
          storeId={storeId}
          onSuccess={(freshBatches) => {
            if (freshBatches) {
              const updatedTotalStock = freshBatches.reduce(
                (acc, b) => acc + (b.isArchived ? 0 : Number(b.quantity || 0)),
                0
              );
              setSelectedProductForBatch((prev) =>
                prev
                  ? {
                      ...prev,
                      quantity: updatedTotalStock,
                      batches: freshBatches,
                    }
                  : null
              );
            }
          }}
        />
      )}
    </section>
  );
};

export default InventoryTable;