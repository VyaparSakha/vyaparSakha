"use client";

import React from "react";
import { Building2, ChevronDown, Plus, MessageSquare, Sparkles } from "lucide-react";

export default function ChatPageHeader({
  stores = [],
  selectedStoreId,
  loadingStores = false,
  onStoreChange,
  onNewChat,
  onToggleSidebar,
}) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 py-3.5 backdrop-blur-md">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-0.5 shadow-md shadow-indigo-500/20">
          <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center p-1">
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Vyapar Copilot</span>
          </h1>
        </div>
      </div>

      {/* Action Controls & Store Selector */}
      <div className="flex items-center gap-2.5">
        {/* Store Selection Dropdown */}
        <div className="relative min-w-[180px] sm:min-w-[230px]">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedStoreId || ""}
            onChange={onStoreChange}
            disabled={loadingStores || stores.length === 0}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/90 py-1.5 pl-9 pr-9 text-xs sm:text-sm font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition cursor-pointer disabled:opacity-60"
          >
            {loadingStores && <option value="">Loading stores...</option>}
            {!loadingStores && stores.length === 0 && (
              <option value="">No stores found</option>
            )}
            {stores.map((s) => {
              const sid = s._id || s.id;
              const sname = s.storeName || s.name || "Untitled Store";
              return (
                <option key={sid} value={sid}>
                  {sname}
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Start New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-slate-800 hover:to-slate-700 hover:shadow transition"
          title="Start a new chat conversation"
        >
          <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Chat History Toggle Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-indigo-400 hover:to-purple-500 hover:shadow transition"
          title="Open chat history sidebar"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">History</span>
        </button>
      </div>
    </header>
  );
}

