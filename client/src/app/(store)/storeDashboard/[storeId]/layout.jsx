"use client";

import { useEffect, useState } from "react";
import { usePathname, useParams } from "next/navigation";
import VyaparSathiSidebar from "@/features/inventory/components/InventorySidebar";
import StoreBreadcrumb from "@/features/store/components/StoreBreadcrumb";
import StoreSidebarDrawer from "@/features/store/components/StoreSidebarDrawer";
import { useStorePageContext } from "@/features/store/context/storePageContext";
import { InventoryProvider } from "@/features/inventory/context/inventoryContext";
import { useAgentNavigation } from "@/hooks/useAgentNavigation";

/**
 * Store Dashboard Layout - Responsive sidebar across screen sizes:
 * - Desktop (≥1024px): Full 220px fixed sidebar
 * - Tablet (768px – 1023px): Compact 64px icon-only fixed sidebar with tooltips
 * - Mobile (<768px): Top bar hamburger + sliding drawer overlay
 */
export default function StoreLayout({ children }) {
  const pathname = usePathname();
  const isBillingPage = pathname.endsWith("/billing");
  const { enterStorePage, exitStorePage, copilotOpen, copilotWidth, isDraggingCopilot } = useStorePageContext();
  const [screenMode, setScreenMode] = useState("desktop"); // "mobile" | "tablet" | "desktop"
  const { storeId } = useParams();

  // Allow the AI agent to navigate to different store pages
  useAgentNavigation(storeId);

  useEffect(() => {
    // When entering store dashboard, set store page context
    enterStorePage();

    return () => {
      // When leaving store dashboard, clear store page context
      exitStorePage();
    };
  }, [enterStorePage, exitStorePage]);

  // Handle responsive breakpoints cleanly
  useEffect(() => {
    const updateScreenMode = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenMode("mobile");
      } else if (width < 1024) {
        setScreenMode("tablet");
      } else {
        setScreenMode("desktop");
      }
    };

    updateScreenMode();
    window.addEventListener("resize", updateScreenMode);
    return () => window.removeEventListener("resize", updateScreenMode);
  }, []);

  if (isBillingPage) {
    return <>{children}</>;
  }

  const isMobile = screenMode === "mobile";
  const isTablet = screenMode === "tablet";

  return (
    <InventoryProvider>
      <div className="relative flex min-h-screen w-full print:block">
        {/* Desktop & Tablet Sidebar - Hidden on mobile (<768px) and print */}
        {!isMobile && (
          <div className="print:hidden">
            <VyaparSathiSidebar collapsed={isTablet} />
          </div>
        )}

        {/* Main Content Area - Slides and resizes dynamically when AI Copilot opens and resizes */}
        <main
          className={`flex-1 w-full min-w-0 print:!m-0 print:!p-0 print:!w-full ${
            isDraggingCopilot ? "transition-none" : "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          }`}
          style={{
            padding: isMobile
              ? "0px 8px 16px 8px"
              : isTablet
              ? copilotOpen
                ? "0px 2px 16px 4px"
                : "0px 10px 16px 4px"
              : copilotOpen
              ? "0px 2px 16px 0px"
              : "0px 12px 16px 0px",
            marginRight: !isMobile && copilotOpen ? `${copilotWidth || 480}px` : "0px",
          }}
        >
          {/* Breadcrumb - fixed sticky at top so it always appears while scrolling */}
          <div className="print:hidden sticky top-1 z-40 sm:ml-2 sm:mr-3">
            <StoreBreadcrumb isResponsive={isMobile} />
          </div>

          {children}
        </main>
      </div>

      {/* Mobile Sidebar Drawer - Only on mobile, never on print */}
      {isMobile && (
        <div className="print:hidden">
          <StoreSidebarDrawer />
        </div>
      )}
    </InventoryProvider>
  );
}
