"use client";

import { useState, useEffect } from "react";
import { Lottie } from "lottie-react";
import emptyCartAnimation from "@/assets/animations/billing_anim/NexaStore — Empty Billing Cart · 4.5s (1).json";
import { useBillingContext } from "../context/billingContext";
import { Trash2, Plus, Minus, Package } from "lucide-react";

export const BilledProductsList = () => {
  const { billedProducts, removeProduct, updateProductQuantity } =
    useBillingContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 overflow-hidden transition-all flex flex-col h-full min-h-[580px]">
      {/* Table Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Billed Items</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-700">
            {billedProducts.length}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-400 hidden sm:inline">
          Double-check quantity & stock limits
        </span>
      </div>

      {/* Content Area - Fills equal height with internal scroll or empty state */}
      {billedProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none relative overflow-hidden">
          {/* Subtle ambient colorful glow behind animation */}
          <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

          {mounted ? (
            <div
              className="relative w-full max-w-[520px] sm:max-w-[580px] md:max-w-[640px] aspect-[1672/941] flex items-center justify-center"
              style={{
                maskImage:
                  "radial-gradient(ellipse 92% 88% at 50% 50%, black 58%, rgba(0, 0, 0, 0.4) 85%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 92% 88% at 50% 50%, black 58%, rgba(0, 0, 0, 0.4) 85%, transparent 100%)",
              }}
            >
              <Lottie
                src={emptyCartAnimation}
                loop
                autoplay
                className="w-full h-full object-contain pointer-events-none select-none scale-105"
              />
              {/* Soft feathered inner blur edges to blend seamlessly into background */}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_35px_15px_rgba(255,255,255,0.95),inset_0_0_60px_30px_rgba(255,255,255,0.8)]" />
            </div>
          ) : (
            <div className="w-full max-w-[520px] sm:max-w-[580px] md:max-w-[640px] aspect-[1672/941]" />
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
          {billedProducts.map((product) => {
            const price = product.price || product.sellingPrice || 0;
            const quantity = product.billedQuantity || 1;
            const total = price * quantity;
            const availableQty = product.quantity || product.qty || 0;

            return (
              <div
                key={product._id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                {/* Product Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Package size={18} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Batch Number line at the top */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span>
                          Batch: {product.batchNumber || (product.batches && product.batches.length > 0 ? product.batches.map(b => b.batchNumber).join(", ") : "BATCH-001")}
                        </span>
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                      {product.barcode && (
                        <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {product.barcode}
                        </span>
                      )}
                      {product.category && (
                        <span className="text-[11px] text-slate-500">
                          {product.category}
                        </span>
                      )}
                      <span className="text-[11px] text-emerald-600 font-medium">
                        In Stock: {availableQty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls, Pricing & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/60">
                    <button
                      onClick={() =>
                        updateProductQuantity(product._id, quantity - 1)
                      }
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-white shadow-xs"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} className="stroke-[2.5]" />
                    </button>

                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const newQty = Number.parseInt(e.target.value, 10) || 1;
                        updateProductQuantity(product._id, newQty);
                      }}
                      className="w-11 sm:w-12 text-center bg-transparent font-bold text-slate-900 text-sm focus:outline-none"
                      min="1"
                      max={availableQty}
                    />

                    <button
                      onClick={() =>
                        updateProductQuantity(product._id, quantity + 1)
                      }
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-white shadow-xs"
                      disabled={quantity >= availableQty}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Price Display */}
                  <div className="text-right min-w-[80px]">
                    <p className="text-[11px] text-slate-400 font-medium">
                      ₹{price.toFixed(2)} × {quantity}
                    </p>
                    <p className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                      ₹{total.toFixed(2)}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeProduct(product._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove from bill"
                    aria-label="Remove item"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
