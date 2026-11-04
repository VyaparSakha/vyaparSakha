"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageLoader from "@/components/PageLoader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  fetchWallet,
  fetchUsageHistory,
  fetchPackages,
  updateBillingSettings,
  createTopUpOrder,
  verifyTopUpPayment,
} from "@/features/settings/services/aiBillingService";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
  CreditCard,
  Sliders,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsAiPlanPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [usageHistory, setUsageHistory] = useState({ records: [], pagination: {} });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [savingLimit, setSavingLimit] = useState(false);
  const [purchasingPkg, setPurchasingPkg] = useState(null);
  const [newMonthlyLimit, setNewMonthlyLimit] = useState("");
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  // Load live wallet and recent usage history
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [walletData, usageData, pkgsData] = await Promise.all([
        fetchWallet(),
        fetchUsageHistory({ page, limit: 10 }),
        fetchPackages().catch(() => []),
      ]);

      if (walletData) {
        setWallet(walletData);
        setNewMonthlyLimit(String(walletData.monthlyLimit || 5000));
      }
      if (usageData) {
        setUsageHistory(usageData);
      }
      if (Array.isArray(pkgsData) && pkgsData.length > 0) {
        setPackages(pkgsData);
      }
    } catch (err) {
      console.warn("Failed to load AI billing details:", err);
      toast.error(err.message || "Failed to load AI credit details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Monthly Usage Limit Update
  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    const limitNum = parseInt(newMonthlyLimit, 10);
    if (isNaN(limitNum) || limitNum < 100 || limitNum > 100000) {
      toast.error("Monthly limit must be between 100 and 100,000 credits");
      return;
    }

    try {
      setSavingLimit(true);
      const updated = await updateBillingSettings({ monthlyLimit: limitNum });
      if (updated) {
        setWallet(updated);
        toast.success(`Monthly AI limit updated to ${limitNum.toLocaleString()} credits`);
        setShowAdminControls(false);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update monthly limit");
    } finally {
      setSavingLimit(false);
    }
  };

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Top-Up Credit Booster Purchase Flow
  const handlePurchase = async (pkg) => {
    try {
      setPurchasingPkg(pkg.id);
      const order = await createTopUpOrder(pkg.id);
      if (!order) throw new Error("Failed to create order");

      const hasScript = await loadRazorpayScript();

      // If Razorpay SDK is available and not in pure mock mode
      if (hasScript && window.Razorpay && order.keyId && !order.keyId.includes("mock")) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Vyapar Sathi",
          description: order.description,
          order_id: order.orderId,
          handler: async (response) => {
            try {
              toast.loading("Verifying payment...", { id: "topup" });
              await verifyTopUpPayment({
                orderId: order.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                packageId: pkg.id,
              });
              toast.success(`Success! Added ${pkg.credits.toLocaleString()} AI credits to your wallet.`, { id: "topup" });
              loadData(true);
            } catch (err) {
              toast.error(err.message || "Payment verification failed", { id: "topup" });
            }
          },
          prefill: {
            name: user?.name || "Store Owner",
            email: user?.email || "",
          },
          theme: { color: "#2563eb" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Development Sandbox / Direct Verification Mode
        toast.loading("Processing test booster order...", { id: "topup" });
        const mockPaymentId = `pay_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await verifyTopUpPayment({
          orderId: order.orderId,
          paymentId: mockPaymentId,
          signature: "simulated_dev_signature",
          packageId: pkg.id,
        });
        toast.success(`Booster activated! +${pkg.credits.toLocaleString()} AI credits added to your wallet.`, { id: "topup" });
        loadData(true);
      }
    } catch (err) {
      toast.error(err.message || "Failed to start credit purchase", { id: "topup" });
    } finally {
      setPurchasingPkg(null);
    }
  };

  if (loading) {
    return <PageLoader message="Loading AI credit wallet and usage ledger..." />;
  }

  const {
    balance = 0,
    reservedBalance = 0,
    availableBalance = 0,
    monthlyLimit = 5000,
    monthlyUsed = 0,
    periodEnd,
    status = "active",
    isSharedStoreWallet = false,
  } = wallet || {};

  const remainingMonthlyAllowance = Math.max(0, monthlyLimit - monthlyUsed);
  const percentageUsed = Math.min(100, Math.round((monthlyUsed / (monthlyLimit || 1)) * 100));
  const isExhausted = availableBalance <= 0 || monthlyUsed >= monthlyLimit || status !== "active";

  const formattedPeriodEnd = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Next month";

  // Friendly human readable label for AI features
  const getFeatureLabel = (feature) => {
    switch (feature?.toLowerCase()) {
      case "copilot":
        return "AI Copilot";
      case "voice":
        return "Voice Assistant";
      case "report":
      case "document_generation":
        return "AI Business Document";
      case "forecast":
        return "Demand Forecast";
      case "restock":
        return "Smart Restock";
      default:
        return feature ? feature.charAt(0).toUpperCase() + feature.slice(1) : "AI Operation";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Account-Level AI Billing</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            AI Credits &amp; Usage Limits
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your AI credit balance, monthly limits, and per-execution store usage logs.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Wallet"}</span>
        </button>
      </div>

      {/* ── Section 3.1: Live Credit Overview Meter Card ── */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black uppercase text-slate-900 tracking-tight">
                AI Credit Balance
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  isExhausted
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {isExhausted ? (
                  <>
                    <AlertTriangle className="h-3 w-3" /> Limit Exhausted
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Active &amp; Ready
                  </>
                )}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Billing cycle auto-resets on <span className="font-semibold text-slate-700">{formattedPeriodEnd}</span>
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available</div>
              <div className="text-2xl font-black text-blue-600">{availableBalance.toLocaleString()}</div>
            </div>
            <div className="border-l border-slate-200 pl-4 sm:pl-6">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Wallet</div>
              <div className="text-2xl font-black text-slate-800">{balance.toLocaleString()}</div>
            </div>
            <div className="border-l border-slate-200 pl-4 sm:pl-6">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reserved</div>
              <div className="text-2xl font-black text-amber-600">{reservedBalance.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar for Monthly Usage Limit */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Monthly Usage Limit: {monthlyUsed.toLocaleString()} / {monthlyLimit.toLocaleString()} credits used</span>
            <span className="text-slate-500">{remainingMonthlyAllowance.toLocaleString()} remaining allowance</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${
                percentageUsed >= 90
                  ? "bg-rose-500"
                  : percentageUsed >= 70
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              }`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span>{percentageUsed}% consumed</span>
            {!isSharedStoreWallet && (
              <button
                onClick={() => setShowAdminControls(!showAdminControls)}
                className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>{showAdminControls ? "Hide Admin Controls" : "Edit Usage Limit"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 3.6: Administrative Control Dropdown for Monthly Limit */}
        {showAdminControls && !isSharedStoreWallet && (
          <form onSubmit={handleUpdateLimit} className="mt-5 p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Set Monthly AI Credit Cap</h4>
                <p className="text-[11px] text-slate-500">
                  Protect your budget by setting an upper monthly ceiling across all stores (100 - 100,000 credits).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="100"
                  max="100000"
                  step="100"
                  value={newMonthlyLimit}
                  onChange={(e) => setNewMonthlyLimit(e.target.value)}
                  className="w-32 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={savingLimit}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {savingLimit ? "Saving..." : "Save Limit"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Shared Organization Notice */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex gap-3">
            <Users className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <div className="text-xs text-slate-600">
              <p className="font-bold text-blue-950">
                {isSharedStoreWallet ? "Shared Store Pool" : "Single Account Pool Shared Across All Your Stores"}
              </p>
              <p className="mt-1 leading-relaxed text-slate-600">
                Credits are maintained once on the store owner account. When cashiers, inventory managers, or partners interact with AI Copilot or Voice in any store, charges are transparently deducted from this pool.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3.7: Top-up Credit Booster Packages ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Add AI Credits (Booster Packs)</h2>
            <p className="text-xs text-slate-500">Instant credit top-ups verified via Razorpay that never expire.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Booster */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Starter Booster</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">1,000 Credits</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">₹199</span>
                <span className="text-xs text-slate-500">one-time</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Ideal for quick top-ups when running out of monthly allowance.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>~300 Copilot queries or 1,000s voice</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Credits carry forward permanently</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePurchase({ id: "starter", credits: 1000 })}
              disabled={purchasingPkg === "starter"}
              className="mt-6 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-bold transition-colors disabled:opacity-60 shadow-xs"
            >
              {purchasingPkg === "starter" ? "Processing..." : "Purchase 1,000 Credits"}
            </button>
          </div>

          {/* Growth Booster */}
          <div className="rounded-3xl border-2 border-blue-600 bg-white p-6 shadow-sm flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs">
              Most Popular
            </span>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Growth Booster</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">5,000 Credits</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">₹799</span>
                <span className="text-xs text-slate-500">one-time</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Best value for multi-outlet retail operations with active store employees.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>5,000 full AI credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Deep Inventory &amp; Restock Analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Supplier Invoice OCR scanning</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePurchase({ id: "growth", credits: 5000 })}
              disabled={purchasingPkg === "growth"}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 text-xs font-bold transition-all shadow-xs disabled:opacity-60"
            >
              {purchasingPkg === "growth" ? "Processing..." : "Purchase 5,000 Credits"}
            </button>
          </div>

          {/* Pro Enterprise Booster */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Pro Enterprise</span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">10,000 Credits</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">₹1,299</span>
                <span className="text-xs text-slate-500">one-time</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Heavy AI usage, bulk invoice scanning, and unlimited automated scheduled operations.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>10,000 total credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>High-speed multimodal voice</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Dedicated priority throughput</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePurchase({ id: "pro", credits: 10000 })}
              disabled={purchasingPkg === "pro"}
              className="mt-6 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-bold transition-colors disabled:opacity-60 shadow-xs"
            >
              {purchasingPkg === "pro" ? "Processing..." : "Purchase 10,000 Credits"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 3.2: Recent AI Usage History ── */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-black text-slate-900">Recent AI Usage History</h2>
            <p className="text-xs text-slate-500">
              Audit trail showing exact credits charged per operation without exposing raw token calculations.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Total records: {usageHistory.total ?? usageHistory.pagination?.total ?? usageHistory.records?.length ?? 0}
          </span>
        </div>

        {usageHistory.records && usageHistory.records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Date &amp; Time</th>
                  <th className="py-3 px-3">AI Feature</th>
                  <th className="py-3 px-3">Store</th>
                  <th className="py-3 px-3 text-right">Credits Billed</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {usageHistory.records.map((rec) => {
                  const recId = rec._id || rec.id;
                  const isExpanded = expandedRecordId === recId;
                  const rawDate = rec.settledAt || rec.createdAt || rec.date;
                  const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now";

                  return (
                    <React.Fragment key={recId}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-medium text-slate-600 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {getFeatureLabel(rec.feature)}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                          {rec.store?.name || (rec.storeId ? String(rec.storeId).slice(-6) : "Account")}
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-slate-900">
                          {(rec.creditsCharged ?? rec.creditsConsumed ?? 0) > 0 ? `⚡ ${rec.creditsCharged ?? rec.creditsConsumed}` : "0"}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              rec.executionStatus === "completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : rec.executionStatus === "interrupted"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {rec.executionStatus || rec.status || "completed"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setExpandedRecordId(isExpanded ? null : recId)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                          >
                            {isExpanded ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>
                      {/* Optional technical breakdown accordion */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={6} className="p-4 text-xs text-slate-600">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-white rounded-xl border border-slate-200 text-[11px]">
                              <div>
                                <span className="text-slate-400 block font-semibold">Execution ID</span>
                                <span className="font-mono text-slate-700 truncate block">{rec.executionId}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold">Provider / Model</span>
                                <span className="font-medium text-slate-700">{rec.provider || "default"} / {rec.model || "standard"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold">Tokens Consumed</span>
                                <span className="font-medium text-slate-700">
                                  {rec.inputTokens || 0} in / {rec.outputTokens || 0} out ({rec.totalTokens || 0} tot)
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold">Audio Metered</span>
                                <span className="font-medium text-slate-700">
                                  {rec.audioInputUnits || 0}s in / {rec.audioOutputUnits || 0}s out
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {usageHistory.pagination?.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <span className="text-xs text-slate-500">
                  Page {usageHistory.pagination.page} of {usageHistory.pagination.pages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(usageHistory.pagination.pages, p + 1))}
                    disabled={page >= usageHistory.pagination.pages}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
            <Clock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-500">No AI usage recorded in this billing cycle yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
