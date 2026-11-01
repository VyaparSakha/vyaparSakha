"use client";

import { useParams } from "next/navigation";
import {
  BillingProvider,
  useBillingContext,
} from "@/features/InventoryBilling/context/billingContext";
import {
  BarcodeInput,
  BilledProductsList,
  BillingTotal,
  ManualProductModal,
  BillPreviewModal,
  BillingHeader,
  BillingSyncIndicator,
  BillingProcessingModal,
} from "@/features/InventoryBilling/components";

/**
 * Billing Page Content - Standardized Premium POS Interface
 * Synchronized symmetrical grid:
 * - Upper row: Barcode Scanner (left) & Quick Search (right) matched in dimensions
 * - Lower row: Billed Items (left) & Payment Summary (right) matched in dimensions
 * - Left column width (7 cols) aligns upper & lower; Right column width (5 cols) aligns upper & lower.
 */
const BillingContent = () => {
  const params = useParams();
  const storeId = params.storeId;
  const { currentStore, loading, isBillingProcessing, error, isMobile } = useBillingContext();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-3 sm:p-4 md:p-6 lg:p-7 text-slate-900 overflow-x-hidden">
      {/* Soft Ambient Colorful Background Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-indigo-300/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-200/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1520px] mx-auto space-y-4 md:space-y-5">
        {/* Header Section */}
        {!isMobile && (
          <BillingHeader
            storeId={storeId}
            storeName={currentStore?.name}
            currentStore={currentStore}
            isMobile={isMobile}
          />
        )}

        {/* Real-Time Sync Indicator */}
        {!isMobile && (
          <div className="flex items-center justify-between px-1">
            <BillingSyncIndicator />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50/90 border border-red-200/90 text-red-700 px-4 py-3 rounded-2xl shadow-xs flex items-center gap-2">
            <span className="font-bold text-sm">Error:</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Upper Row: Left Input Box (7 cols) & Right Search Box (5 cols) matching lower layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <BarcodeInput />
          </div>
          {!isMobile && (
            <div className="lg:col-span-5 flex flex-col">
              <ManualProductModal inline />
            </div>
          )}
        </div>

        {/* Lower Row: Left Billed Items (7 cols) & Right Payment Summary (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column (7 cols): Billed Items List */}
          {!isMobile && (
            <div className="lg:col-span-7 flex flex-col">
              <BilledProductsList />
            </div>
          )}

          {/* Right Column (5 cols): Checkout & Total Summary */}
          {!isMobile && (
            <div className="lg:col-span-5 flex flex-col">
              <BillingTotal />
            </div>
          )}
        </div>

        {/* Modals */}
        <ManualProductModal />
        <BillPreviewModal />

        {/* Dedicated Billing-in-Process Modal with Charcoal Printer Animation */}
        <BillingProcessingModal
          isOpen={isBillingProcessing}
          storeName={currentStore?.name || "Vyapar Sakha Store"}
        />

        {/* Loading Overlay for barcode scans / item adds (non-billing) */}
        {loading && !isBillingProcessing && !isMobile && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-40 transition-all">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-slate-100 flex items-center gap-3.5">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
              <p className="text-slate-800 font-semibold text-sm">Updating cart...</p>
            </div>
          </div>
        )}

        {/* Light loading indicator for mobile scanning */}
        {loading && !isBillingProcessing && isMobile && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2.5">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm font-semibold tracking-wide">Adding product...</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main Billing Page Component with Provider
 */
export default function BillingPage() {
  return (
    <BillingProvider>
      <BillingContent />
    </BillingProvider>
  );
}
