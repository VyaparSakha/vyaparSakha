"use client";

import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { X, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";

/**
 * UpiQrModal
 * Generates a DYNAMIC UPI QR code per bill so the customer's UPI app
 * auto-fills the merchant + exact amount when scanned.
 * Rendered via createPortal to document.body to ensure it appears above all sticky cards.
 */
const UpiQrModal = ({ isOpen, onClose, totalAmount, upiId, upiName, storeName }) => {
  const overlayRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Build UPI deep link — amount is fixed to 2 decimal places as required by UPI spec
  const buildUpiUrl = () => {
    if (!upiId) return null;
    const params = new URLSearchParams({
      pa: upiId,
      pn: upiName || storeName || "Merchant",
      am: totalAmount.toFixed(2),
      cu: "INR",
      tn: `Bill Payment - ${storeName || "Store"}`,
    });
    return `upi://pay?${params.toString()}`;
  };

  const upiUrl = buildUpiUrl();

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100"
        style={{ animation: "upiIn 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* ── Header gradient ── */}
        <div
          className="relative px-6 pt-6 pb-6 text-center"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
            aria-label="Close UPI Modal"
          >
            <X size={20} />
          </button>

          {/* Icon + title */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-white/20 rounded-2xl p-2 backdrop-blur-xs">
              <Smartphone size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">Pay via UPI QR</h2>
          </div>

          {/* Amount pill */}
          <div className="inline-block bg-white rounded-2xl px-8 py-3 shadow-xl">
            <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase mb-0.5">
              Total Amount
            </p>
            <p className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">
              ₹{totalAmount?.toFixed(2) ?? "0.00"}
            </p>
          </div>

          {/* UPI ID badge */}
          {upiId && (
            <p className="text-white/80 text-xs mt-3 font-mono font-medium">
              📲 {upiId}
            </p>
          )}
        </div>

        {/* ── QR / Content ── */}
        <div className="px-6 py-5 flex flex-col items-center gap-4">
          {upiUrl ? (
            <>
              {/* Dynamic QR code */}
              <div className="p-3.5 rounded-2xl border-2 border-indigo-100 shadow-md bg-white">
                <QRCode
                  value={upiUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#1e1b4b"
                  level="M"
                />
              </div>

              {/* Accepted apps */}
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">
                  Scan with any UPI application
                </p>
                <div className="flex items-center justify-center gap-2.5 text-[11px] text-slate-400 font-medium">
                  <span>GPay</span>
                  <span>·</span>
                  <span>PhonePe</span>
                  <span>·</span>
                  <span>Paytm</span>
                  <span>·</span>
                  <span>BHIM</span>
                </div>
              </div>

              {/* Auto-fill note */}
              <div className="w-full flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs">
                <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-emerald-800 font-medium text-[11px] leading-relaxed">
                  Amount <strong>₹{totalAmount?.toFixed(2)}</strong> is automatically
                  pre-filled on customer's screen.
                </p>
              </div>
            </>
          ) : (
            /* No UPI ID configured */
            <div className="flex flex-col items-center gap-2.5 py-6 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-100">
                <AlertCircle size={32} className="text-amber-500" />
              </div>
              <p className="text-slate-800 text-sm font-bold">
                UPI ID not configured
              </p>
              <p className="text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Ask the store owner to add their UPI ID in{" "}
                <strong>Store Settings</strong> to enable instant QR payments.
              </p>
            </div>
          )}

          {/* Done button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-600/20 active:scale-95 transition-all mt-1"
          >
            ✓ Payment Done
          </button>
        </div>
      </div>

      <style>{`
        @keyframes upiIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default UpiQrModal;
