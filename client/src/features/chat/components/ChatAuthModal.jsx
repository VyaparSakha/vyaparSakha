"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Lock, ArrowRight, Clock, LogIn, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

/**
 * ChatAuthModal - Displays authentication required modal for unauthenticated users on chat routes.
 * Offers immediate "Log In to Continue" button, "Back to Home", and an automatic countdown redirect.
 */
export default function ChatAuthModal({ isOpen = true, redirectPath = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef(null);

  const targetRedirect = redirectPath || pathname || "/chat";

  const handleLogin = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.push(`/login?redirect=${encodeURIComponent(targetRedirect)}`);
  };

  const handleGoHome = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.push("/");
  };

  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          router.push(`/login?redirect=${encodeURIComponent(targetRedirect)}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, targetRedirect, router]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        {/* Top Gradient Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        {/* Vyapar Sakha Logo Badge with Lock Indicator */}
        <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-1 shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-500/15 flex items-center justify-center mx-auto mb-5">
          <div className="h-full w-full rounded-[20px] bg-white flex items-center justify-center p-2 overflow-hidden">
            <Image
              src="/images/logo/vyapar-sakha-version2-logo.svg"
              alt="Vyapar Sakha Logo"
              width={64}
              height={64}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div
            className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1.5 shadow-md ring-2 ring-white"
            title="Authentication required"
          >
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t("auth.loginRequiredTitle") || "Login Required"}
        </h3>

        {/* Description */}
        <p className="mt-2.5 text-sm text-slate-600 leading-relaxed font-medium">
          {t("auth.loginRequiredDesc") ||
            "You must be signed in to access Vyapar Sakha AI Copilot. Please log in with your account to chat, manage your store intelligence, and receive personalized retail guidance."}
        </p>

        {/* Dynamic Countdown Pill */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100/80">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>
            {t("auth.redirectingIn") || "Redirecting to login in"}{" "}
            <span className="font-bold text-blue-800">{countdown}s</span>...
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5 w-full">
          <button
            onClick={handleLogin}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:opacity-95 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            <span>{t("navigation.login") || "Log In to Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGoHome}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("common.back") || "Back to Home"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

