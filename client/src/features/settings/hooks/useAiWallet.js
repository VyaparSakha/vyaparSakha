"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWallet } from "../services/aiBillingService";
import { onAgentRefresh } from "@/servies/agentEventBus";

export function useAiWallet(storeId = null) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWallet(storeId);
      if (data) {
        setWallet(data);
      }
    } catch (err) {
      console.warn("[useAiWallet] Failed to fetch AI wallet:", err.message || err);
      setError(err.message || "Failed to load wallet balance");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadWallet();

    // Auto-refresh when an AI operation finishes or purchases are confirmed
    const unsubscribe = onAgentRefresh(({ section }) => {
      if (section === "ai_billing" || section === "*") {
        loadWallet();
      }
    });

    return unsubscribe;
  }, [loadWallet]);

  const availableBalance = wallet?.availableBalance ?? 0;
  const totalBalance = wallet?.balance ?? 0;
  const reservedBalance = wallet?.reservedBalance ?? 0;
  const monthlyLimit = wallet?.monthlyLimit ?? 5000;
  const monthlyUsed = wallet?.monthlyUsed ?? 0;
  const status = wallet?.status || "active";
  const isSharedStoreWallet = Boolean(wallet?.isSharedStoreWallet);

  const remainingMonthlyAllowance = Math.max(0, monthlyLimit - monthlyUsed);
  const percentageMonthlyUsed = Math.min(100, Math.round((monthlyUsed / (monthlyLimit || 1)) * 100));
  const isExhausted = availableBalance <= 0 || monthlyUsed >= monthlyLimit || status !== "active";
  const isLowBalance = availableBalance < 25 && !isExhausted;

  const formattedPeriodEnd = wallet?.periodEnd
    ? new Date(wallet.periodEnd).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "End of month";

  return {
    wallet,
    loading,
    error,
    refreshWallet: loadWallet,
    availableBalance,
    totalBalance,
    reservedBalance,
    monthlyLimit,
    monthlyUsed,
    remainingMonthlyAllowance,
    percentageMonthlyUsed,
    isExhausted,
    isLowBalance,
    status,
    isSharedStoreWallet,
    formattedPeriodEnd,
  };
}
