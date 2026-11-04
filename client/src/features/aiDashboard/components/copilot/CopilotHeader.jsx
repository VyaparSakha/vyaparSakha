"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, MessageSquare, X, Maximize2, Zap, AlertTriangle } from "lucide-react";
import { useAiWallet } from "@/features/settings/hooks/useAiWallet";

export default function CopilotHeader({ onNewChat, onToggleSidebar, onClose, storeId }) {
  const params = useParams();
  const currentStoreId = storeId || params?.storeId;
  const { availableBalance, isExhausted, isLowBalance } = useAiWallet(currentStoreId);
  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-3.5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-0.5 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/10">
            <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center p-1">
              <img
                src="/images/logo/vyapar-sakha-version2-logo.svg"
                alt="Vyapar Sakha Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div>
          <h3 className="font-medium text-slate-800 text-sm sm:text-base tracking-tight flex items-center gap-1.5">
            <span>Vyapar AI Copilot</span>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
              Alt+A
            </span>
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/settings/ai-plan"
          className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all border ${
            isExhausted
              ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              : isLowBalance
              ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          }`}
          title="Click to view AI credit wallet and usage limits in Settings"
        >
          {isExhausted ? (
            <AlertTriangle className="h-3 w-3 text-rose-500" />
          ) : (
            <Zap className="h-3 w-3 fill-blue-500 text-blue-600" />
          )}
          <span>{availableBalance.toLocaleString()} credits</span>
        </Link>
        <button
          type="button"
          onClick={onNewChat}
          className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-slate-700 hover:to-slate-800 hover:shadow transition"
          title="Start New Conversation"
        >
          <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
          <span className="hidden sm:inline">New</span>
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-indigo-400 hover:to-purple-500 hover:shadow transition"
          title="Chat History"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">History</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition ml-1"
            title="Close Assistant (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {currentStoreId && (
          <Link
            href="/chat"
            onClick={() => {
              if (currentStoreId && typeof window !== "undefined") {
                try {
                  localStorage.setItem("vyapar_chat_store_id", currentStoreId);
                } catch (_) {}
              }
            }}
            className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition ml-0.5"
            title="Open Full Page Chat"
          >
            <Maximize2 className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
