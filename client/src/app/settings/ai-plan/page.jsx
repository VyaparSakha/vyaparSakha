"use client";

import React, { useState, useEffect } from "react";
import { apiGet } from "@/servies/api";
import PageLoader from "@/components/PageLoader";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsAiPlanPage() {
  const [subscription, setSubscription] = useState({
    plan: "free",
    monthlyLimit: 250,
    usedCredits: 0,
    periodEnd: null,
    status: "active",
  });
  const [loading, setLoading] = useState(true);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/me/ai-subscription");
      if (res?.data) {
        setSubscription(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch AI subscription details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  if (loading) {
    return <PageLoader message="Loading AI subscription and usage quota..." />;
  }

  const { plan = "free", monthlyLimit = 250, usedCredits = 0, periodEnd, status = "active" } = subscription;
  const remainingCredits = Math.max(0, monthlyLimit - usedCredits);
  const percentageUsed = Math.min(100, Math.round((usedCredits / (monthlyLimit || 1)) * 100));

  const formattedPeriodEnd = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Next month";

  const isExhausted = status === "exhausted" || remainingCredits === 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Account-Level Billing</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            AI Subscription &amp; Credits
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your organization's AI query quota, usage history, and store-wide employee access.
          </p>
        </div>

        <button
          onClick={loadSubscription}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          <span>Refresh Quota</span>
        </button>
      </div>

      {/* ── Live Credit Usage Meter Card ── */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black uppercase text-slate-900 tracking-tight">
                {plan} Plan
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  isExhausted
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {isExhausted ? (
                  <>
                    <AlertTriangle className="h-3 w-3" /> Quota Exhausted
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </>
                )}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Billing cycle auto-resets on <span className="font-semibold text-slate-700">{formattedPeriodEnd}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {remainingCredits}
            </span>
            <span className="text-xs font-semibold text-slate-500"> / {monthlyLimit} credits left</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Monthly Usage</span>
            <span>{percentageUsed}% used ({usedCredits} queries)</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${
                percentageUsed > 90
                  ? "bg-rose-500"
                  : percentageUsed > 70
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              }`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
        </div>

        {/* Central Pool Notice */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex gap-3">
            <Users className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <div className="text-xs text-slate-600">
              <p className="font-bold text-blue-950">
                Shared Across All Your Store Workspaces
              </p>
              <p className="mt-1 leading-relaxed text-slate-600">
                This quota is billed once to your owner account and shared across all stores you own. When your cashiers create bills, or stock managers check low-stock alerts using AI, it draws seamlessly from this account pool.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Available Subscription Plans ── */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Available Subscription Plans
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Free Tier */}
          <div className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${
            plan === "free"
              ? "border-blue-600 bg-white ring-2 ring-blue-600/10 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Free Tier</h3>
                {plan === "free" && (
                  <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                    CURRENT
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">₹0</span>
                <span className="text-xs text-slate-500">/month</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Ideal for getting started and testing AI copilots with your store staff.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>250 AI queries / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Shared across all owned stores</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Role-based tool security</span>
                </li>
              </ul>
            </div>

            <button
              disabled={plan === "free"}
              className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
                plan === "free"
                  ? "bg-slate-100 text-slate-400 cursor-default"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {plan === "free" ? "Active Plan" : "Downgrade"}
            </button>
          </div>

          {/* Starter Plan */}
          <div className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${
            plan === "starter"
              ? "border-blue-600 bg-white ring-2 ring-blue-600/10 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Starter Plan</h3>
                {plan === "starter" ? (
                  <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                    CURRENT
                  </span>
                ) : (
                  <span className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10px] font-bold">
                    POPULAR
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">₹499</span>
                <span className="text-xs text-slate-500">/month</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                For busy retail outlets needing daily automated restock calculations and invoice OCR.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>1,000</strong> AI queries / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Supplier Invoice OCR scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Automated morning retail briefings</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => toast.success("Payment gateway integration in progress")}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              {plan === "starter" ? "Active Plan" : "Upgrade to Starter"}
            </button>
          </div>

          {/* Pro Plan */}
          <div className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${
            plan === "pro"
              ? "border-blue-600 bg-white ring-2 ring-blue-600/10 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Pro Enterprise</h3>
                {plan === "pro" && (
                  <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                    CURRENT
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">₹1,499</span>
                <span className="text-xs text-slate-500">/month</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                High-volume multi-chain merchants with unlimited demand forecasting and scheduled automations.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>5,000</strong> AI queries / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Dedicated high-speed inference priority</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Multi-store cross comparison engine</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => toast.success("Payment gateway integration in progress")}
              className="mt-6 w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              {plan === "pro" ? "Active Plan" : "Upgrade to Pro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

