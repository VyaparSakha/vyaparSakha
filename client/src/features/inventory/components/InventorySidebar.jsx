"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useStorePageContext } from "@/features/store/context/storePageContext";
import { useInventoryContext } from "@/features/inventory/context/inventoryContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { usePermission } from "@/hooks/usePermission";

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
          padding: "6.5px 11px",
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
          marginBottom: 0.5,
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
        <span
          style={{ opacity: active ? 1 : 0.75, flexShrink: 0, display: "flex" }}
        >
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
          padding: "5.5px 9px 5.5px 11px",
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

const getUserInitials = (displayName) => {
  if (!displayName) return "U";
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function VyaparSathiSidebar({
  isResponsive = false,
  collapsed = false,
  onNavClick,
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const storeId = params?.storeId;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isStorePage, storeSidebarOpen, toggleStoreSidebar } =
    useStorePageContext();
  const { currentStore } = useInventoryContext();
  const [showFullName, setShowFullName] = useState(false);

  const { t } = useTranslation();
  const { hasPermission, hasAnyPermission, isOwner, currentRole, currentWorkspace } = usePermission();

  const isPurchaseRoute = Boolean(pathname?.includes("/purchases"));
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(isPurchaseRoute);

  // Auto-expand when navigating to any purchases route
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
    ].filter((item) => item.visible),
    [storeId, t, isOwner, hasPermission, hasAnyPermission],
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

  // Auto-close sidebar on mobile after navigation
  const handleNavClick = () => {
    if (onNavClick) onNavClick();
    setIsMobileOpen(false);
  };

  const handleBackClick = () => {
    handleNavClick();
    toggleStoreSidebar();
    router.push("/storeDashboard");
  };

  // Sync store sidebar state with mobile open state
  useEffect(() => {
    if (isStorePage) {
      setIsMobileOpen(storeSidebarOpen);
    }
  }, [isStorePage, storeSidebarOpen]);

  const navItems = useMemo(
    () => [
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
        visible: isOwner || hasAnyPermission(["inventory:add", "inventory:manage"]),
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
        visible: isOwner || hasAnyPermission(["inventory:add", "inventory:manage"]),
      },
      {
        label: t("navigation.sellers"),
        href: `/storeDashboard/${storeId}/sellers`,
        key: "sellers",
        visible: isOwner || hasAnyPermission(["inventory:add", "inventory:manage"]),
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
    ].filter((item) => item.visible),
    [storeId, t, isOwner, hasPermission, hasAnyPermission],
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

  const SidebarContent = () => (
    <>
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        style={{
          position: "absolute",
          top: 20,
          left: 12,
          background: "#263d5e",
          border: "none",
          color: "#dbeafe",
          cursor: "pointer",
          width: 32,
          height: 32,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 101,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#35527c";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#263d5e";
          e.currentTarget.style.color = "#dbeafe";
        }}
        aria-label="Back"
        title="Back"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "2px 6px 16px 52px",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "#263d5e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#7eb3ff",
            fontFamily: "'Segoe UI', sans-serif",
            flexShrink: 0,
          }}
        >
          {getStoreInitials(currentStore?.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontFamily: "'Segoe UI', sans-serif",
              fontSize: 14.5,
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: showFullName ? "normal" : "nowrap",
              maxWidth: showFullName ? "100%" : 140,
              cursor: "pointer",
              wordBreak: "break-word",
              display: "block",
            }}
            onClick={() => setShowFullName(!showFullName)}
            title={currentWorkspace?.storeName || currentStore?.name || "VyaparSakha"}
          >
            <span style={{ color: "#fff" }}>
              {currentWorkspace?.storeName || currentStore?.name || "VyaparSakha"}
            </span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                padding: "1px 5.5px",
                borderRadius: 4,
                background: isOwner ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)",
                color: isOwner ? "#6ee7b7" : "#93c5fd",
                border: isOwner ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              {isOwner ? "👑 Owner" : `🛡️ ${currentRole || "Employee"}`}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto" }} className="no-scrollbar">
        {/* Main Dashboard Section */}
        {navItems.some(i => ["overview", "inventory"].includes(i.key)) && (
          <>
            <div style={{ padding: "0 4px", marginBottom: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#4e6580", letterSpacing: "1px", marginBottom: 4, paddingLeft: 8 }}>MAIN DASHBOARD</p>
              {navItems.filter(i => ["overview", "inventory"].includes(i.key)).map((item) => (
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
            <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "0 8px 6px 8px" }}></div>
          </>
        )}

        {/* Sales Section */}
        {navItems.some(i => ["billing", "billing-history"].includes(i.key)) && (
          <>
            <div style={{ padding: "0 4px", marginBottom: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#4e6580", letterSpacing: "1px", marginBottom: 4, paddingLeft: 8 }}>SALES & BILLS</p>
              {navItems.filter(i => ["billing", "billing-history"].includes(i.key)).map((item) => (
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
            <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "0 8px 6px 8px" }}></div>
          </>
        )}

        {/* Management Section */}
        <div style={{ padding: "0 4px", marginBottom: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#4e6580", letterSpacing: "1px", marginBottom: 4, paddingLeft: 8 }}>MANAGEMENT</p>
          {navItems.filter(i => ["purchases", "sellers", "buyers", "staff", "analytics"].includes(i.key)).map((item) => {
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
                    onMouseEnter={(e) => {
                      if (activeNav !== "purchases" && !isPurchasesParentActive) {
                        e.currentTarget.style.background = "#223350";
                        e.currentTarget.style.color = "#b8d0ef";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeNav !== "purchases" && !isPurchasesParentActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#7a97be";
                      }
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
                        padding: "6.5px 6px 6.5px 11px",
                        fontWeight: isPurchasesParentActive ? 600 : 400,
                        fontSize: 13.5,
                        fontFamily: "'Segoe UI', sans-serif",
                        color: "inherit",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ opacity: isPurchasesParentActive ? 1 : 0.75, flexShrink: 0, display: "flex" }}>
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
                        padding: "6.5px 10px 6.5px 4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label="Toggle purchases sub-options"
                      title={isPurchasesOpen ? "Collapse purchases" : "Expand purchases"}
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

        <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "0 8px 6px 8px" }}></div>

        {/* Intelligence Section */}
        {navItems.some(i => ["ai-dashboard", "automations"].includes(i.key)) && (
          <div style={{ padding: "0 4px", marginBottom: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#4e6580", letterSpacing: "1px", marginBottom: 4, paddingLeft: 8 }}>INTELLIGENCE</p>
            {navItems.filter(i => ["ai-dashboard", "automations"].includes(i.key)).map((item) => (
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

      {/* User */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 8px 2px 8px",
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
              padding: "6.5px 11px",
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
              marginTop: 4,
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
            <span style={{ opacity: pathname?.includes("/settings") ? 1 : 0.75, flexShrink: 0, display: "flex" }}>
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
          padding: "6.5px 11px",
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
    </>
  );

  if (isResponsive) {
    return null; // Don't render sidebar on mobile, only drawer controlled by context
  }

  // Tablet mode: compact icon-only sidebar
  if (collapsed) {
    const collapsedNavItems = [
      { key: "overview", href: `/storeDashboard/${storeId}`, icon: icons.Overview, label: t("navigation.overview"), visible: true },
      { key: "inventory", href: `/storeDashboard/${storeId}/inventory`, icon: icons.Inventory, label: t("navigation.inventory"), visible: isOwner || hasAnyPermission(["inventory:add", "inventory:manage"]) },
      { key: "billing", href: `/storeDashboard/${storeId}/billing`, icon: icons.Billing, label: t("navigation.billing"), visible: isOwner || hasPermission("billing:create") },
      { key: "billing-history", href: `/storeDashboard/${storeId}/billing-history`, icon: icons["Billing History"], label: t("navigation.billingHistory"), visible: isOwner || hasPermission("billing:create") },
      { key: "purchases", href: `/storeDashboard/${storeId}/purchases`, icon: icons.Purchases, label: t("navigation.purchases"), visible: isOwner || hasAnyPermission(["inventory:add", "inventory:manage"]) },
      { key: "sellers", href: `/storeDashboard/${storeId}/sellers`, icon: icons.Sellers, label: t("navigation.sellers"), visible: isOwner || hasAnyPermission(["inventory:add", "inventory:manage"]) },
      { key: "buyers", href: `/storeDashboard/${storeId}/buyers`, icon: icons.Buyers, label: t("navigation.buyers"), visible: isOwner || hasPermission("billing:create") },
      { key: "staff", href: `/storeDashboard/${storeId}/staff`, icon: icons.Staff, label: t("navigation.staff"), visible: isOwner },
      { key: "analytics", href: `/storeDashboard/${storeId}/analytics`, icon: icons.Analytics, label: t("navigation.analytics"), visible: isOwner || hasPermission("reports:view_sales") },
      { key: "ai-dashboard", href: `/storeDashboard/${storeId}/ai-dashboard`, icon: icons["AI Dashboard"], label: t("navigation.aiCopilot"), visible: isOwner || hasPermission("reports:view_sales") || hasPermission("inventory:manage") },
      { key: "automations", href: `/storeDashboard/${storeId}/automations`, icon: icons.Automations, label: t("navigation.automations"), visible: isOwner },
    ].filter((item) => item.visible);

    return (
      <div style={{ width: 72, minWidth: 72, flexShrink: 0, padding: "12px 0 12px 8px" }}>
        <div
          style={{
            width: 58,
            height: "calc(100vh - 24px)",
            background: "#1b2a42",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px 4px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 1.5px 6px rgba(0,0,0,0.13)",
            position: "fixed",
            top: 12,
            left: 8,
            zIndex: 40,
          }}
        >
          {/* Back button */}
          <button
            onClick={handleBackClick}
            style={{
              background: "#263d5e",
              border: "none",
              color: "#dbeafe",
              cursor: "pointer",
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
              flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#35527c"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#263d5e"; e.currentTarget.style.color = "#dbeafe"; }}
            aria-label="Back to store dashboard"
            title="Back to store dashboard"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Store Logo badge */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#263d5e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#7eb3ff",
              marginBottom: 10,
              flexShrink: 0,
            }}
            title={currentStore?.name || "VyaparSakha"}
          >
            {getStoreInitials(currentStore?.name)}
          </div>

          <div style={{ height: 1, width: 36, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />

          {/* Nav items icon column */}
          <div
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              overflowY: "auto",
            }}
            className="no-scrollbar"
          >
            {collapsedNavItems.map((item) => {
              const isActive = activeNav === item.key || (item.key === "purchases" && activeNav.startsWith("purchases"));
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={handleNavClick}
                  title={item.label}
                  aria-label={item.label}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 38,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isActive ? "#2563eb" : "transparent",
                      color: isActive ? "#fff" : "#7a97be",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "#223350";
                        e.currentTarget.style.color = "#b8d0ef";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#7a97be";
                      }
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.icon}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div style={{ height: 1, width: 36, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

          {/* Settings Link - Owner Only */}
          {isOwner && (
            <Link
              href={`/storeDashboard/${storeId}/settings`}
              onClick={handleNavClick}
              title={t("navigation.settings")}
              aria-label={t("navigation.settings")}
              style={{ textDecoration: "none", marginBottom: 4 }}
            >
              <div
                style={{
                  width: 40,
                  height: 38,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: pathname?.includes("/settings") ? "#2563eb" : "transparent",
                  color: pathname?.includes("/settings") ? "#fff" : "#7a97be",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
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
                {icons.Settings}
              </div>
            </Link>
          )}

          {/* User Profile Avatar */}
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
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
              overflow: "hidden",
              marginBottom: 4,
            }}
            title={user?.displayName || "User"}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user?.displayName || "User"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              getUserInitials(user?.displayName)
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={async () => {
              handleNavClick();
              await logout();
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#f87171",
              cursor: "pointer",
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#f87171";
            }}
            title={t("navigation.logout")}
            aria-label={t("navigation.logout")}
          >
            {icons.Logout}
          </button>
        </div>
      </div>
    );
  }

  // Desktop mode: full width sidebar
  return (
    <div style={{ width: 232, minWidth: 232, padding: "16px 0 16px 12px", flexShrink: 0 }}>
      <div
        style={{
          width: 220,
          height: "calc(100vh - 32px)",
          background: "#1b2a42",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          padding: "14px 10px 12px 10px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.22), 0 1.5px 6px rgba(0,0,0,0.13)",
          position: "fixed",
          top: 16,
          left: 12,
          zIndex: 40,
        }}
      >
        <SidebarContent />
      </div>
    </div>
  );
}
