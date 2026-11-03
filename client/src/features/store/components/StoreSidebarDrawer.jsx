"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ArrowLeft, X, ChevronDown } from "lucide-react";
import { useStorePageContext } from "@/features/store/context/storePageContext";
import { useInventoryContext } from "@/features/inventory/context/inventoryContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { usePermission } from "@/hooks/usePermission";
import { useWorkspaceContext } from "@/context/WorkspaceContext";

const icons = {
  Inventory: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Billing: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <line x1="9" y1="8" x2="11" y2="8" />
    </svg>
  ),
  Staff: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Analytics: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  "AI Dashboard": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Overview: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  Settings: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
    </svg>
  ),
  "Billing History": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  Purchases: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Automations: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Sellers: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Buyers: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Logout: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

function NavLink({ label, href, icon, active, onClick }) {
  return (
    <Link href={href} onClick={onClick}>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "7.5px 11px",
          borderRadius: 10,
          border: "none",
          background: active ? "#2563eb" : "transparent",
          color: active ? "#fff" : "#7a97be",
          fontWeight: active ? 600 : 400,
          fontSize: 13.5,
          fontFamily: "'Segoe UI', sans-serif",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.13s, color 0.13s",
          marginBottom: 1,
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = "#223350";
            e.currentTarget.style.color = "#b8d0ef";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#7a97be";
          }
        }}
      >
        <span style={{ opacity: active ? 1 : 0.8, flexShrink: 0, display: "flex" }}>
          {icon}
        </span>
        <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      </div>
    </Link>
  );
}

function SubNavLink({ label, href, active, onClick, badge }) {
  return (
    <Link href={href} onClick={onClick} style={{ textDecoration: "none" }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px 6px 12px",
          borderRadius: 8,
          background: active ? "rgba(37, 99, 235, 0.22)" : "transparent",
          color: active ? "#60a5fa" : "#8ea8cc",
          fontWeight: active ? 600 : 400,
          fontSize: 12.5,
          fontFamily: "'Segoe UI', sans-serif",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.15s ease",
          marginBottom: 1,
          borderLeft: active ? "2.5px solid #3b82f6" : "2.5px solid transparent",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
            e.currentTarget.style.color = "#dbeafe";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#8ea8cc";
          }
        }}
      >
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </span>
        {badge && (
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              padding: "1px 5px",
              borderRadius: 4,
              background: "rgba(59, 130, 246, 0.25)",
              color: "#93c5fd",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              marginLeft: 4,
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function StoreSidebarDrawer() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const storeId = params?.storeId;
  const { storeSidebarOpen, setStoreSidebarOpen } = useStorePageContext();
  const { currentStore } = useInventoryContext();
  const [showFullName, setShowFullName] = useState(false);
  const { t } = useTranslation();
  const { hasPermission, hasAnyPermission, isOwner, currentRole, currentWorkspace } = usePermission();

  const isPurchaseRoute = Boolean(pathname?.includes("/purchases"));
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(isPurchaseRoute);

  useEffect(() => {
    if (pathname?.includes("/purchases")) {
      setIsPurchasesOpen(true);
    }
  }, [pathname]);

  const purchaseSubItems = useMemo(
    () => [
      {
        label: t("purchases.title"),
        href: `/storeDashboard/${storeId}/purchases`,
        key: "purchases",
        visible: isOwner || hasAnyPermission(["inventory:add", "inventory:manage"]),
      },
      {
        label: t("purchases.purchaseOrders"),
        href: `/storeDashboard/${storeId}/purchases/orders`,
        key: "purchases-orders",
        visible: isOwner || hasAnyPermission(["inventory:add", "inventory:manage"]),
      },
      {
        label: t("purchases.grn"),
        href: `/storeDashboard/${storeId}/purchases/grns`,
        key: "purchases-grns",
        visible: isOwner || hasAnyPermission(["inventory:add", "inventory:manage"]),
      },
      {
        label: t("purchases.smartReorder"),
        href: `/storeDashboard/${storeId}/purchases/smart-reorder`,
        key: "purchases-reorder",
        badge: "AI",
        visible: isOwner || hasPermission("inventory:manage"),
      },
      {
        label: t("analytics.title"),
        href: `/storeDashboard/${storeId}/purchases/analytics`,
        key: "purchases-analytics",
        visible: isOwner || hasPermission("reports:view_sales"),
      },
      {
        label: t("purchases.subtitle"),
        href: `/storeDashboard/${storeId}/purchases/reports`,
        key: "purchases-reports",
        visible: isOwner || hasPermission("reports:view_sales"),
      },
    ].filter((sub) => sub.visible),
    [storeId, t, isOwner, hasPermission, hasAnyPermission]
  );

  const getStoreInitials = (name) => {
    if (!name) return "VS";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavClick = () => {
    setStoreSidebarOpen(false);
  };

  const handleBackClick = () => {
    setStoreSidebarOpen(false);
    router.push("/storeDashboard");
  };

  const navItems = useMemo(
    () => {
      const all = [
        {
          label: t("navigation.overview"),
          href: `/storeDashboard/${storeId}`,
          key: "overview",
          visible: true,
        },
        {
          label: t("navigation.inventory"),
          href: `/storeDashboard/${storeId}/inventory`,
          key: "inventory",
          visible: isOwner || hasPermission("inventory:add") || hasPermission("inventory:manage"),
        },
        {
          label: t("navigation.billing"),
          href: `/storeDashboard/${storeId}/billing`,
          key: "billing",
          visible: isOwner || hasPermission("billing:create"),
        },
        {
          label: t("navigation.billingHistory"),
          href: `/storeDashboard/${storeId}/billing-history`,
          key: "billing-history",
          visible: isOwner || hasPermission("billing:create"),
        },
        {
          label: t("navigation.staff"),
          href: `/storeDashboard/${storeId}/staff`,
          key: "staff",
          visible: isOwner,
        },
        {
          label: t("navigation.purchases"),
          href: `/storeDashboard/${storeId}/purchases`,
          key: "purchases",
          visible: isOwner || hasPermission("inventory:add") || hasPermission("inventory:manage"),
        },
        {
          label: t("navigation.sellers"),
          href: `/storeDashboard/${storeId}/sellers`,
          key: "sellers",
          visible: isOwner || hasPermission("inventory:add") || hasPermission("inventory:manage"),
        },
        {
          label: t("navigation.buyers"),
          href: `/storeDashboard/${storeId}/buyers`,
          key: "buyers",
          visible: isOwner || hasPermission("billing:create"),
        },
        {
          label: t("navigation.analytics"),
          href: `/storeDashboard/${storeId}/analytics`,
          key: "analytics",
          visible: isOwner || hasPermission("reports:view_sales"),
        },
        {
          label: t("navigation.aiCopilot"),
          href: `/storeDashboard/${storeId}/ai-dashboard`,
          key: "ai-dashboard",
          visible: isOwner || hasPermission("reports:view_sales") || hasPermission("inventory:manage"),
        },
        {
          label: t("navigation.automations"),
          href: `/storeDashboard/${storeId}/automations`,
          key: "automations",
          visible: isOwner,
        },
      ];
      return all.filter((item) => item.visible);
    },
    [storeId, t, isOwner, hasPermission]
  );

  const getActiveNav = () => {
    if (pathname?.includes("/inventory")) return "inventory";
    if (pathname?.includes("/billing-history")) return "billing-history";
    if (pathname?.includes("/billing")) return "billing";
    if (pathname?.includes("/purchases/orders")) return "purchases-orders";
    if (pathname?.includes("/purchases/grns")) return "purchases-grns";
    if (pathname?.includes("/purchases/smart-reorder")) return "purchases-reorder";
    if (pathname?.includes("/purchases/analytics")) return "purchases-analytics";
    if (pathname?.includes("/purchases/reports")) return "purchases-reports";
    if (pathname?.includes("/purchases")) return "purchases";
    if (pathname?.includes("/sellers")) return "sellers";
    if (pathname?.includes("/buyers")) return "buyers";
    if (pathname?.includes("/staff")) return "staff";
    if (pathname?.includes("/analytics")) return "analytics";
    if (pathname?.includes("/ai-dashboard")) return "ai-dashboard";
    if (pathname?.includes("/automations")) return "automations";
    return "overview";
  };

  const activeNav = getActiveNav();

  const getUserInitials = (displayName) => {
    if (!displayName) return "U";
    return displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!storeSidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          zIndex: 99,
        }}
        onClick={() => setStoreSidebarOpen(false)}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "min(300px, 82vw)",
          height: "100vh",
          background: "#1b2a42",
          zIndex: 100,
          padding: "16px 12px 14px 12px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          overflowY: "auto",
          borderRadius: "0 20px 20px 0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls: Back & Close */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button
            type="button"
            onClick={handleBackClick}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#dbeafe",
              cursor: "pointer",
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.color = "#dbeafe";
            }}
            aria-label="Back to store dashboard"
            title="Back to store dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            onClick={() => setStoreSidebarOpen(false)}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#dbeafe",
              cursor: "pointer",
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.color = "#dbeafe";
            }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Store Logo & Name with Role Badge & Switch */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            padding: "0 4px",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: isOwner ? "#064e3b" : "#1e3a8a",
              border: isOwner ? "1px solid #059669" : "1px solid #3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: isOwner ? "#6ee7b7" : "#93c5fd",
              fontFamily: "'Segoe UI', sans-serif",
              flexShrink: 0,
            }}
          >
            {getStoreInitials(currentWorkspace?.storeName || currentStore?.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: 14.5,
                fontWeight: 700,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
              title={currentWorkspace?.storeName || currentStore?.name || "VyaparSakha"}
            >
              {currentWorkspace?.storeName || currentStore?.name || "VyaparSakha"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: isOwner ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)",
                  color: isOwner ? "#6ee7b7" : "#93c5fd",
                  border: isOwner ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                {isOwner ? "👑 Owner" : `🛡️ ${currentRole || "Employee"}`}
              </span>
              <button
                onClick={handleBackClick}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 10.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
                title="Switch store workspace"
              >
                Switch
              </button>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, overflowY: "auto" }} className="no-scrollbar">
          {/* Main Dashboard Section */}
          {navItems.some((i) => ["overview", "inventory"].includes(i.key)) && (
            <>
              <div style={{ padding: "0 4px", marginBottom: 6 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#4e6580", letterSpacing: "1px", marginBottom: 4, paddingLeft: 8 }}>
                  MAIN DASHBOARD
                </p>
                {navItems.filter((i) => ["overview", "inventory"].includes(i.key)).map((item) => (
                  <NavLink
                    key={item.key}
                    label={item.label}
                    href={item.href}
                    icon={icons[item.label]}
                    active={activeNav === item.key}
                    onClick={handleNavClick}
                  />
                ))}
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "0 8px 6px 8px" }}></div>
            </>
          )}

          {/* Sales Section */}
          {navItems.some((i) => ["billing", "billing-history"].includes(i.key)) && (
            <>
              <div style={{ padding: "0 4px", marginBottom: 6 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#4e6580", letterSpacing: "1px", marginBottom: 4, paddingLeft: 8 }}>
                  SALES & BILLS
                </p>
                {navItems.filter((i) => ["billing", "billing-history"].includes(i.key)).map((item) => (
                  <NavLink
                    key={item.key}
                    label={item.label}
                    href={item.href}
                    icon={icons[item.label]}
                    active={activeNav === item.key}
                    onClick={handleNavClick}
                  />
                ))}
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "0 8px 6px 8px" }}></div>
            </>
          )}

          {/* Management Section (Visible only if user has at least one permitted item) */}
          {navItems.some((i) => ["purchases", "sellers", "buyers", "staff", "analytics"].includes(i.key)) && (
          <div style={{ padding: "0 4px", marginBottom: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#4e6580", letterSpacing: "1px", marginBottom: 4, paddingLeft: 8 }}>
              MANAGEMENT
            </p>
            {navItems
              .filter((i) => ["purchases", "sellers", "buyers", "staff", "analytics"].includes(i.key))
              .map((item) => {
                if (item.key === "purchases") {
                  const isPurchasesParentActive = activeNav.startsWith("purchases");
                  return (
                    <div key="purchases" style={{ marginBottom: 1 }}>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderRadius: 10,
                          background: activeNav === "purchases" ? "#2563eb" : (isPurchasesParentActive ? "#203450" : "transparent"),
                          color: (activeNav === "purchases" || isPurchasesParentActive) ? "#fff" : "#7a97be",
                          transition: "background 0.13s, color 0.13s",
                          marginBottom: 0.5,
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => {
                            handleNavClick();
                            setIsPurchasesOpen(true);
                          }}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "7.5px 6px 7.5px 11px",
                            fontWeight: isPurchasesParentActive ? 600 : 400,
                            fontSize: 13.5,
                            fontFamily: "'Segoe UI', sans-serif",
                            color: "inherit",
                            textDecoration: "none",
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ opacity: isPurchasesParentActive ? 1 : 0.8, flexShrink: 0, display: "flex" }}>
                            {icons[item.label]}
                          </span>
                          <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setIsPurchasesOpen(!isPurchasesOpen);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "inherit",
                            cursor: "pointer",
                            padding: "7.5px 10px 7.5px 4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          aria-label="Toggle purchases sub-options"
                        >
                          <ChevronDown
                            size={14}
                            style={{
                              transform: isPurchasesOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                              opacity: 0.8,
                            }}
                          />
                        </button>
                      </div>

                      {/* Expandable sub-options */}
                      {isPurchasesOpen && (
                        <div
                          style={{
                            marginLeft: 16,
                            paddingLeft: 8,
                            borderLeft: "1.5px solid rgba(126, 179, 255, 0.18)",
                            marginTop: 2,
                            marginBottom: 4,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {purchaseSubItems.map((sub) => (
                            <SubNavLink
                              key={sub.key}
                              label={sub.label}
                              href={sub.href}
                              active={activeNav === sub.key}
                              badge={sub.badge}
                              onClick={handleNavClick}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.key}
                    label={item.label}
                    href={item.href}
                    icon={icons[item.label]}
                    active={activeNav === item.key}
                    onClick={handleNavClick}
                  />
                );
              })}
          </div>
          )}

          <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "0 8px 6px 8px" }}></div>

          {/* Intelligence Section (Visible only if user has access) */}
          {navItems.some((i) => ["ai-dashboard", "automations"].includes(i.key)) && (
          <div style={{ padding: "0 4px", marginBottom: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#4e6580", letterSpacing: "1px", marginBottom: 4, paddingLeft: 8 }}>
              INTELLIGENCE
            </p>
            {navItems
              .filter((i) => ["ai-dashboard", "automations"].includes(i.key))
              .map((item) => (
                <NavLink
                  key={item.key}
                  label={item.label}
                  href={item.href}
                  icon={icons[item.label]}
                  active={activeNav === item.key}
                  onClick={handleNavClick}
                />
              ))}
          </div>
          )}
        </div>

        {/* Divider */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #243454",
            margin: "8px 4px 10px 4px",
          }}
        />

        {/* User Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 8px 6px 8px",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: user?.photoURL
                ? "transparent"
                : "linear-gradient(135deg, #4a90d9, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "'Segoe UI', sans-serif",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user?.displayName || "User"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              getUserInitials(user?.displayName)
            )}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#e6edf7",
                fontFamily: "'Segoe UI', sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.displayName || "User"}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "#4e6580",
                fontFamily: "'Segoe UI', sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.email || "N/A"}
            </div>
          </div>
        </div>

        {/* Settings Button - Owner Only */}
        {isOwner && (
          <Link href={`/storeDashboard/${storeId}/settings`}>
            <button
              onClick={handleNavClick}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7.5px 11px",
                borderRadius: 10,
                border: "none",
                background: pathname?.includes("/settings") ? "#2563eb" : "transparent",
                color: pathname?.includes("/settings") ? "#fff" : "#7a97be",
                fontWeight: pathname?.includes("/settings") ? 600 : 400,
                fontSize: 13.5,
                fontFamily: "'Segoe UI', sans-serif",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.13s, color 0.13s",
                marginTop: 2,
              }}
              onMouseEnter={(e) => {
                if (!pathname?.includes("/settings")) {
                  e.currentTarget.style.background = "#223350";
                  e.currentTarget.style.color = "#b8d0ef";
                }
              }}
              onMouseLeave={(e) => {
                if (!pathname?.includes("/settings")) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#7a97be";
                }
              }}
            >
              <span style={{ opacity: pathname?.includes("/settings") ? 1 : 0.8, flexShrink: 0, display: "flex" }}>
                {icons.Settings}
              </span>
              <span style={{ whiteSpace: "nowrap" }}>{t("navigation.settings")}</span>
            </button>
          </Link>
        )}

        {/* Logout Button */}
        <button
          onClick={async () => {
            handleNavClick();
            await logout();
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "7.5px 11px",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "#f87171",
            fontWeight: 400,
            fontSize: 13.5,
            fontFamily: "'Segoe UI', sans-serif",
            cursor: "pointer",
            textAlign: "left",
            transition: "background 0.13s, color 0.13s",
            marginTop: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#f87171";
          }}
        >
          <span style={{ opacity: 0.85, flexShrink: 0, display: "flex" }}>
            {icons.Logout}
          </span>
          <span style={{ whiteSpace: "nowrap" }}>{t("navigation.logout")}</span>
        </button>
      </div>
    </>
  );
}
