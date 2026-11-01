"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ScanBarcode, Camera, Plus, Zap } from "lucide-react";
import { useBarcodeScanner } from "../hooks";
import { useBillingContext } from "../context/billingContext";

// Dynamically import BarcodeScanner — html5-qrcode accesses browser APIs
const BarcodeScanner = dynamic(
  () => import("@/features/inventory/components/BarcodeScanner"),
  { ssr: false },
);

export const BarcodeInput = () => {
  const {
    scannedBarcode,
    setScannedBarcode,
    handleBarcodeInput,
    handleKeyPress,
    isScanning,
  } = useBarcodeScanner();
  const { loading, isMobile } = useBillingContext();
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScanComplete = async (barcode) => {
    setScannerOpen(false);
    setScannedBarcode(barcode);
    await handleBarcodeInput(barcode);
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
                onKeyPress={handleKeyPress}
                placeholder="Scan or type barcode..."
                className="w-full px-4 py-3.5 text-base font-mono border-2 border-slate-200 focus:border-indigo-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-center tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-sans"
                disabled={loading || isScanning}
                autoFocus
              />
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
                onClick={() => handleBarcodeInput(scannedBarcode)}
                disabled={loading || isScanning || !scannedBarcode}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 font-bold text-sm disabled:opacity-40"
              >
                {isScanning ? (
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
    <div className="h-full bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 p-5 md:p-6 transition-all flex flex-col justify-between">
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

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={scannedBarcode}
              onChange={(e) => setScannedBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scan barcode or type code..."
              className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-mono tracking-wider transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 text-slate-900"
              disabled={loading || isScanning}
              autoFocus
            />
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
              onClick={() => handleBarcodeInput(scannedBarcode)}
              disabled={loading || isScanning || !scannedBarcode}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xs transition-all font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isScanning ? (
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
