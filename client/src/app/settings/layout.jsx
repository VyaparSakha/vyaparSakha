"use client";

import React from "react";
import SettingsSidebar from "@/features/settings/components/SettingsSidebar";

export default function SettingsLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50/60 text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <SettingsSidebar />

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 pt-16 md:pt-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

