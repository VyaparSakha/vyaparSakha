"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { ArrowLeft, Menu, X } from "lucide-react";

// Exact 16x16 SVG icons matching InventorySidebar style
const icons = {
  Profile: (
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
  AIPlan: (
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
  Preferences: (
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
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  Workspaces: (
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
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
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

function NavLink({ label, href, icon, active, onClick, badge }) {
  return (
    <Link href={href} onClick={onClick} style={{ textDecoration: "none" }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span
            style={{
              opacity: active ? 1 : 0.75,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
          </span>
        </div>
        {badge && (
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              padding: "1px 5px",
              borderRadius: 4,
              background: active ? "rgba(255, 255, 255, 0.22)" : "rgba(59, 130, 246, 0.25)",
              color: active ? "#fff" : "#93c5fd",
              border: active ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(59, 130, 246, 0.35)",
              marginLeft: 4,
              flexShrink: 0,
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

export default function SettingsSidebar({
  collapsed: externalCollapsed,
  isMobile: externalIsMobile,
  onNavClick,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  let workspaceContext = null;
  try {
    workspaceContext = useWorkspaceContext();
  } catch (_) {}

  const workspaces = workspaceContext?.workspaces || [];
  const ownsAnyStore = workspaces.some((w) => w.isOwner || w.membershipType === "owner");

  const [internalMode, setInternalMode] = useState("desktop");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Responsive breakpoint listener if not provided externally
  useEffect(() => {
    if (externalCollapsed !== undefined || externalIsMobile !== undefined) return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setInternalMode("mobile");
      } else if (width < 1024) {
        setInternalMode("tablet");
      } else {
        setInternalMode("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [externalCollapsed, externalIsMobile]);

  const isMobile = externalIsMobile !== undefined ? externalIsMobile : internalMode === "mobile";
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalMode === "tablet";

  const handleNavClick = () => {
    if (onNavClick) onNavClick();
    setMobileDrawerOpen(false);
  };

  const handleBackClick = () => {
    handleNavClick();
    router.push("/storeDashboard");
  };

  const getActiveKey = () => {
    if (pathname === "/settings" || pathname === "/settings/profile" || pathname.startsWith("/settings/profile/")) {
      return "profile";
    }
    if (pathname === "/settings/staff" || pathname.startsWith("/settings/staff/")) {
      return "staff";
    }
    if (pathname === "/settings/ai-plan" || pathname.startsWith("/settings/ai-plan/")) {
      return "ai-plan";
    }
    if (pathname === "/settings/preferences" || pathname.startsWith("/settings/preferences/")) {
      return "preferences";
    }
    return "";
  };

  const activeKey = getActiveKey();

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
        aria-label="Back to Workspaces"
        title="Back to Workspaces"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Header / Logo */}
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
          VS
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
            title="Settings Hub"
          >
            Settings Hub
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                padding: "1px 5.5px",
                borderRadius: 4,
                background: ownsAnyStore ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)",
                color: ownsAnyStore ? "#6ee7b7" : "#93c5fd",
                border: ownsAnyStore ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              {ownsAnyStore ? "👑 Store Owner" : "🛡️ Staff Member"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, overflowY: "auto" }} className="no-scrollbar">
        {/* Personal & Account Section */}
        <div style={{ padding: "0 4px", marginBottom: 6 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#4e6580",
              letterSpacing: "1px",
              marginBottom: 4,
              paddingLeft: 8,
              textTransform: "uppercase",
            }}
          >
            ACCOUNT SETTINGS
          </p>
          <NavLink
            label="Profile & Security"
            href="/settings/profile"
            icon={icons.Profile}
            active={activeKey === "profile"}
            onClick={handleNavClick}
          />
          <NavLink
            label="Preferences"
            href="/settings/preferences"
            icon={icons.Preferences}
            active={activeKey === "preferences"}
            onClick={handleNavClick}
          />
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "0 8px 6px 8px" }} />

        {/* Organization Section (Owner Only) */}
        {ownsAnyStore && (
          <>
            <div style={{ padding: "0 4px", marginBottom: 6 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#4e6580",
                  letterSpacing: "1px",
                  marginBottom: 4,
                  paddingLeft: 8,
                  textTransform: "uppercase",
                }}
              >
                ORGANIZATION
              </p>
              <NavLink
                label="Team & Staff"
                href="/settings/staff"
                icon={icons.Staff}
                active={activeKey === "staff"}
                onClick={handleNavClick}
              />
              <NavLink
                label="AI & Plan"
                href="/settings/ai-plan"
                icon={icons.AIPlan}
                badge="Pool"
                active={activeKey === "ai-plan"}
                onClick={handleNavClick}
              />
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "0 8px 6px 8px" }} />
          </>
        )}

        {/* Navigation to Workspaces */}
        <div style={{ padding: "0 4px", marginBottom: 6 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#4e6580",
              letterSpacing: "1px",
              marginBottom: 4,
              paddingLeft: 8,
              textTransform: "uppercase",
            }}
          >
            NAVIGATE
          </p>
          <NavLink
            label="My Stores"
            href="/storeDashboard"
            icon={icons.Workspaces}
            active={false}
            onClick={handleNavClick}
          />
        </div>
      </div>

      {/* Divider */}
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #243454",
          margin: "8px 4px 10px 4px",
        }}
      />

      {/* User Section */}
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
              alt={user?.displayName || user?.name || "User"}
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
            getUserInitials(user?.displayName || user?.name)
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
            {user?.displayName || user?.name || "User"}
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
        <span style={{ whiteSpace: "nowrap" }}>Logout</span>
      </button>
    </>
  );

  // Mobile drawer (<768px)
  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-slate-800 bg-[#1b2a42] px-4 py-3 shadow-md md:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackClick}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#263d5e] text-[#dbeafe] transition-all hover:bg-[#35527c] hover:text-white"
              title="Back to Workspaces"
              aria-label="Back to Workspaces"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-sm font-bold text-white tracking-tight">Settings Hub</span>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#263d5e] text-[#dbeafe] transition-all hover:bg-[#35527c] hover:text-white"
            aria-label="Open settings menu"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Mobile sliding drawer overlay */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div
              className="relative flex w-[260px] max-w-[85vw] flex-1 flex-col shadow-2xl"
              style={{
                background: "#1b2a42",
                padding: "14px 10px 12px 10px",
              }}
            >
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg bg-[#263d5e] text-slate-300 hover:text-white"
                aria-label="Close menu"
              >
                <X size={15} />
              </button>
              <SidebarContent />
            </div>
          </div>
        )}
      </>
    );
  }

  // Tablet mode (768px – 1023px): compact icon-only column matching InventorySidebar
  if (collapsed) {
    const collapsedItems = [
      { key: "profile", href: "/settings/profile", icon: icons.Profile, label: "Profile & Security", visible: true },
      { key: "preferences", href: "/settings/preferences", icon: icons.Preferences, label: "Preferences", visible: true },
      { key: "staff", href: "/settings/staff", icon: icons.Staff, label: "Team & Staff", visible: ownsAnyStore },
      { key: "ai-plan", href: "/settings/ai-plan", icon: icons.AIPlan, label: "AI & Plan", visible: ownsAnyStore },
      { key: "workspaces", href: "/storeDashboard", icon: icons.Workspaces, label: "My Stores", visible: true },
    ].filter((i) => i.visible);

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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#35527c";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#263d5e";
              e.currentTarget.style.color = "#dbeafe";
            }}
            aria-label="Back to Workspaces"
            title="Back to Workspaces"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Logo badge */}
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
            title="Settings Hub"
          >
            VS
          </div>

          <div style={{ height: 1, width: 36, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />

          {/* Nav icon items */}
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
            {collapsedItems.map((item) => {
              const isActive = activeKey === item.key;
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
            title={user?.displayName || user?.name || "User"}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user?.displayName || user?.name || "User"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              getUserInitials(user?.displayName || user?.name)
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
            title="Logout"
            aria-label="Logout"
          >
            {icons.Logout}
          </button>
        </div>
      </div>
    );
  }

  // Desktop mode: full width fixed sidebar (matching InventorySidebar exactly)
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
          boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 1.5px 6px rgba(0,0,0,0.13)",
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
