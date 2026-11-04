"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useBillingContext } from "../context/billingContext";
import { Package, X, Check, Calendar, Tag } from "lucide-react";

export const BatchSelectModal = () => {
  const { pendingBatchProduct, setPendingBatchProduct, addProductManually } =
    useBillingContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !pendingBatchProduct) return null;

  const batches = Array.isArray(pendingBatchProduct.batches)
    ? pendingBatchProduct.batches.filter((b) => !b.isArchived && Number(b.quantity || 0) > 0)
    : [];

  const handleSelectBatch = (batch) => {
    addProductManually(pendingBatchProduct, 1, batch);
    setPendingBatchProduct(null);
  };

  const getExpiryMeta = (dateStr) => {
    if (!dateStr) return { color: "text-slate-400 bg-slate-100", dot: "bg-slate-400", label: "No Expiry" };
    const exp = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const formatted = exp.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    if (diffDays <= 0) {
      return { color: "text-red-700 bg-red-50 border-red-200", dot: "bg-red-500", label: `Expired (${formatted})` };
    }
    if (diffDays <= 90) {
      return { color: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500", label: `Exp: ${formatted}` };
    }
    return { color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", label: `Exp: ${formatted}` };
  };

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-violet-50/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Select Batch to Bill
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Multiple batches available. Choose the batch to add.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPendingBatchProduct(null)}
            className="p-2 hover:bg-white/80 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={19} />
          </button>
        </div>

        {/* Product Summary */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm truncate">
              {pendingBatchProduct.name}
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Barcode: {pendingBatchProduct.barcode || "N/A"}
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
            {batches.length} Batches
          </span>
        </div>

        {/* Batch Options List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {batches.map((batch) => {
            const expMeta = getExpiryMeta(batch.expiryDate);
            const price = Number(batch.sellingPrice ?? pendingBatchProduct.sellingPrice ?? 0);
            const stock = Number(batch.quantity || 0);

            return (
              <div
                key={batch._id}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-3 bg-white"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                      Batch: {batch.batchNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${expMeta.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${expMeta.dot}`} />
                      <span>{expMeta.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      Stock: {stock} units
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectBatch(batch)}
                  disabled={stock <= 0}
                  className="shrink-0 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Select</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={() => setPendingBatchProduct(null)}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default BatchSelectModal;

