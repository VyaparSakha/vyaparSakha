"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  RotateCw,
  PlusCircle,
  Store as StoreIcon,
  Sparkles,
} from "lucide-react";
import AnimatedPurchasesButton from "./AnimatedPurchasesButton";
import AnimatedInventoryButton from "./AnimatedInventoryButton";
import AnimatedBillingButton from "./AnimatedBillingButton";

/**
 * OverviewHeader - Clean, modular header section for Store Overview
 * Includes store branding, contextual badges, and high-priority action buttons.
 */
export const OverviewHeader = ({
  storeId,
  storeName = "Store",
  onRefresh,
  isRefreshing = false,
}) => {
  const router = useRouter();
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="mb-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm">
        {/* Left Side: Store title, greeting, and status */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
              <StoreIcon className="w-3.5 h-3.5 text-blue-600" />
              Store Dashboard
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {currentDate}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{storeName} Overview</span>
            <Sparkles className="w-4 h-4 text-amber-500 hidden sm:inline" />
          </h1>
          <p className="text-xs text-gray-600">
            Real-time sales performance, stock health, and procurement snapshot.
          </p>
        </div>

        {/* Right Side: Header Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Refresh Data Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh overview metrics"
              aria-label="Refresh overview"
              className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RotateCw
                className={`w-4 h-4 text-gray-600 ${
                  isRefreshing ? "animate-spin text-blue-600" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          )}

          {/* Quick Action: Celebratory Animated Purchases Button */}
          <AnimatedPurchasesButton
            onClick={() => router.push(`/storeDashboard/${storeId}/purchases`)}
          />

          {/* Quick Action: Celebratory Animated Inventory Button */}
          <AnimatedInventoryButton
            onClick={() => router.push(`/storeDashboard/${storeId}/inventory`)}
          />

          {/* Primary Action Button: Celebratory Animated Billing / New Bill */}
          <AnimatedBillingButton
            onClick={() => router.push(`/storeDashboard/${storeId}/billing`)}
          />
        </div>
      </div>
    </header>
  );
};

export default OverviewHeader;
