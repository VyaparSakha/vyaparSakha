"use client";

import React, { useState, useEffect } from "react";
import { Lottie } from "lottie-react";
import printerAnimation from "@/assets/animations/billing_anim/Charcoal printer — six-second bill printing (1).json";
import { ShieldCheck, Sparkles, Printer } from "lucide-react";

/**
 * BillingProcessingModal
 * ======================
 * High-fidelity animated POS receipt printer overlay shown while billing is in process.
 * Displays the official charcoal printer animation with emerald LED and real-time energy progress.
 */
export const BillingProcessingModal = ({ isOpen, storeName = "Store" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
      {/* Elevated Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8 flex flex-col items-center">
        {/* Ambient emerald backlight glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-52 h-52 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Printer className="w-3.5 h-3.5 text-emerald-600" />
          <span>Billing in Process</span>
        </div>

        {/* Charcoal Printer Lottie Animation */}
        <div className="relative w-64 h-48 sm:w-72 sm:h-52 flex items-center justify-center overflow-visible my-1">
          {mounted ? (
            <Lottie
              src={printerAnimation}
              loop
              autoplay
              className="w-full h-full object-contain pointer-events-none select-none scale-110"
            />
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center animate-pulse">
              <Printer className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Title & Informative Status Message */}
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-1.5 justify-center">
          <span>Printing & Finalizing Bill...</span>
          <Sparkles className="w-4 h-4 text-emerald-500" />
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xs mt-1.5 leading-relaxed">
          Recording transaction details, updating live store inventory, and generating official tax invoice.
        </p>

        {/* Bottom subtle progress hint */}
        <div className="mt-5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full animate-pulse w-3/4" />
        </div>

        <p className="text-[11px] text-slate-400 font-semibold mt-2.5 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Securing digital receipt for {storeName}</span>
        </p>
      </div>
    </div>
  );
};

export default BillingProcessingModal;

