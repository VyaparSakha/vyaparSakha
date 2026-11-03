"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import PageLoader from "@/components/PageLoader";
import { useLanguage, useTranslation } from "@/i18n/LanguageContext";
import { Globe, Bell, Check, Sliders } from "lucide-react";

const DEFAULT_PREFERENCES = {
  language: "en",
  currencyFormat: "inr_lakh",
  dateFormat: "DD/MM/YYYY",
  dailyDigest: true,
  lowStockAlerts: true,
  staffInviteAlerts: true,
};

export default function SettingsPreferencesPage() {
  const { user, isLoading: authLoading } = useAuthContext();
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vyapar_platform_preferences");
        if (stored) {
          setPreferences((prev) => ({ ...prev, ...JSON.parse(stored) }));
        }
      } catch (err) {
        console.warn("Failed to load saved platform settings from localStorage", err);
      }
    }
  }, []);

  const handleChange = (key, value) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== "undefined") {
        localStorage.setItem("vyapar_platform_preferences", JSON.stringify(next));
      }
      return next;
    });
    setIsSaved(true);
    toast.success("Preference updated");
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (authLoading) {
    return <PageLoader message="Loading preferences..." />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Page Title & Description ── */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Platform Preferences
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure regional localization, currency representation, and automated notification alerts.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Localization Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Localization &amp; Regional Formatting</h2>
              <p className="text-xs text-slate-500">Select language, currency representation, and date display</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Language */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Language
              </label>
              <select
                value={locale}
                onChange={(e) => {
                  const nextLang = e.target.value;
                  handleChange("language", nextLang);
                  setLocale(nextLang);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
              </select>
            </div>

            {/* Currency Format */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Currency Notation
              </label>
              <select
                value={preferences.currencyFormat}
                onChange={(e) => handleChange("currencyFormat", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="inr_lakh">Indian (₹ 1,50,000 / 1.5 Lakh)</option>
                <option value="international">International (₹ 150,000 / 150k)</option>
                <option value="standard">Exact Decimals (₹ 1,50,000.00)</option>
              </select>
            </div>

            {/* Date Format */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Date Representation
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => handleChange("dateFormat", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Notifications Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notifications &amp; Alert Settings</h2>
              <p className="text-xs text-slate-500">Configure email and real-time triggers for inventory and staff</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-xs font-bold text-slate-900">Low Stock &amp; Expiry Alerts</p>
                <p className="text-[11px] text-slate-500">Receive instant alerts when items drop below safety stock.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.lowStockAlerts}
                onChange={(e) => handleChange("lowStockAlerts", e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-xs font-bold text-slate-900">Staff Invitation &amp; Role Updates</p>
                <p className="text-[11px] text-slate-500">Alerts when an invited employee registers or accepts an invitation.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.staffInviteAlerts}
                onChange={(e) => handleChange("staffInviteAlerts", e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-xs font-bold text-slate-900">Daily Morning Briefing Summary</p>
                <p className="text-[11px] text-slate-500">Automated daily retail briefing generated by Vyapar AI.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.dailyDigest}
                onChange={(e) => handleChange("dailyDigest", e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

