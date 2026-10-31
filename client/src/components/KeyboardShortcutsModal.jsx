
"use client";

import React, { useState, useEffect } from "react";
import {
  Keyboard,
  X,
  Bot,
  Mic,
  Receipt,
  Boxes,
  BarChart3,
  Search,
  Maximize2,
  HelpCircle,
  Command,
} from "lucide-react";

export const KEYBOARD_SHORTCUTS = [
  {
    category: "AI Agent & Voice",
    shortcuts: [
      {
        keys: ["Alt", "A"],
        label: "Toggle AI Copilot",
        description: "Open or close the AI chat assistant",
        icon: Bot,
      },
      {
        keys: ["Alt", "V"],
        label: "Voice Mode",
        description: "Open AI in hands-free live voice conversation",
        icon: Mic,
      },
      {
        keys: ["Esc"],
        label: "Close Drawer / Modal",
        description: "Dismiss the AI drawer or active modal",
        icon: X,
      },
    ],
  },
  {
    category: "Retail Navigation",
    shortcuts: [
      {
        keys: ["Alt", "B"],
        label: "Billing Counter",
        description: "Jump to POS billing screen",
        icon: Receipt,
      },
      {
        keys: ["Alt", "I"],
        label: "Inventory",
        description: "Jump to stock & inventory management",
        icon: Boxes,
      },
      {
        keys: ["Alt", "S"],
        label: "Analytics",
        description: "View sales reports & performance",
        icon: BarChart3,
      },
    ],
  },
  {
    category: "General & Help",
    shortcuts: [
      {
        keys: ["?"],
        label: "Shortcuts Cheat-sheet",
        description: "Show this keyboard shortcuts guide anytime",
        icon: Command,
      },
    ],
  },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/60">
              <Keyboard size={20} />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="text-base font-bold text-slate-800">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-500">Speed up your daily store operations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
          {KEYBOARD_SHORTCUTS.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {group.category}
              </h3>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/30 overflow-hidden">
                {group.shortcuts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200/60 text-slate-500 shadow-xs">
                          <Icon size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                          <div className="text-[11px] text-slate-500">{item.description}</div>
                        </div>
                      </div>

                      {/* Key badge group */}
                      <div className="flex items-center gap-1">
                        {item.keys.map((key) => (
                          <kbd
                            key={key}
                            className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded shadow-xs font-mono"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono text-[11px]">?</kbd> anywhere to view shortcuts
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

