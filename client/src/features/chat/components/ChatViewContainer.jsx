"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchAllStores } from "@/features/storeDashboard/services/storeDashboardService";
import AskCopilotSection from "@/features/aiDashboard/components/sections/AskCopilotSection";
import ChatHistorySidebar from "@/features/aiDashboard/components/ChatHistorySidebar";
import ChatPageHeader from "./ChatPageHeader";
import ChatAuthModal from "./ChatAuthModal";
import { getChatId, setChatId, clearChatId, clearSessionId } from "@/servies/api";
import { Store, Loader2 } from "lucide-react";

export default function ChatViewContainer({ initialChatId = null }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        // If a query parameter was provided in the URL, adopt it into state & storage
        const params = new URLSearchParams(window.location.search);
        const queryId = params.get("storeId");
        if (queryId) {
          localStorage.setItem("vyapar_chat_store_id", queryId);
          return queryId;
        }
        return localStorage.getItem("vyapar_chat_store_id") || null;
      } catch (_) {
        return null;
      }
    }
    return null;
  });

  // Automatically sanitize the browser URL on load: strip ?storeId= or any query params immediately!
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Active chat state
  const [currentChatId, setCurrentChatId] = useState(initialChatId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const askCopilotRef = useRef(null);

  // Keep currentChatId in sync when initialChatId prop changes (e.g. route transitions)
  useEffect(() => {
    setCurrentChatId(initialChatId);
    if (initialChatId) {
      setChatId(initialChatId);
    } else {
      clearChatId();
      clearSessionId();
    }
  }, [initialChatId]);

  // Support browser Back/Forward navigation between /chat and /chat/:chatId
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/chat\/([^/]+)/);
      if (match) {
        const id = match[1];
        setCurrentChatId(id);
        setChatId(id);
      } else if (path === "/chat") {
        setCurrentChatId(null);
        clearChatId();
        clearSessionId();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch store options and initialize internal store selection state
  useEffect(() => {
    let isMounted = true;
    const loadStores = async () => {
      try {
        setLoadingStores(true);
        const res = await fetchAllStores();
        const storeList = res?.data || res?.stores || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setStores(storeList);
          if (storeList.length > 0) {
            const hasMatch = storeList.some(
              (s) => (s._id || s.id) === selectedStoreId
            );
            if (!selectedStoreId || !hasMatch) {
              const defaultId = storeList[0]._id || storeList[0].id;
              setSelectedStoreId(defaultId);
              try {
                localStorage.setItem("vyapar_chat_store_id", defaultId);
              } catch (_) {}
            }
          }
        }
      } catch (err) {
        console.error("Failed to load stores for chat view:", err);
      } finally {
        if (isMounted) setLoadingStores(false);
      }
    };

    if (isAuthenticated) {
      loadStores();
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, selectedStoreId]);

  // Switch store handler - purely internal state & localStorage, NO query parameters in URL
  const handleStoreChange = (e) => {
    const newId = e.target.value;
    setSelectedStoreId(newId);
    try {
      localStorage.setItem("vyapar_chat_store_id", newId);
    } catch (_) {}
  };

  // When loading a chat belonging to a specific store, sync selector internally
  const handleStoreDetected = useCallback((storeId) => {
    if (storeId) {
      setSelectedStoreId(storeId);
      try {
        localStorage.setItem("vyapar_chat_store_id", storeId);
      } catch (_) {}
    }
  }, []);

  // Start a fresh conversation at clean /chat
  const handleNewChat = useCallback(() => {
    clearChatId();
    clearSessionId();
    setCurrentChatId(null);
    setSidebarOpen(false);
    if (askCopilotRef.current?.newChat) {
      askCopilotRef.current.newChat();
    }
    if (pathname !== "/chat") {
      router.push("/chat");
    }
  }, [pathname, router]);

  // Handle choosing a past chat from the sidebar - navigates directly to /chat/:chatId
  const handleChatSelect = useCallback((chat) => {
    if (!chat || !chat.chat_id) {
      handleNewChat();
      return;
    }
    const newChatId = chat.chat_id;
    setCurrentChatId(newChatId);
    setChatId(newChatId);
    setSidebarOpen(false);
    router.push(`/chat/${newChatId}`);
  }, [router, handleNewChat]);

  // Chat deleted in sidebar
  const handleChatDeleted = useCallback((deletedId) => {
    if (currentChatId === deletedId) {
      handleNewChat();
    }
    setSidebarRefreshKey((k) => k + 1);
  }, [currentChatId, handleNewChat]);

  // Dynamically update URL to /chat/:chatId as soon as the first message establishes a chat session.
  const handleChatCreated = useCallback((newChatId, title) => {
    if (newChatId && newChatId !== currentChatId) {
      setCurrentChatId(newChatId);
      setChatId(newChatId);
      window.history.pushState(null, "", `/chat/${newChatId}`);
    }
    setSidebarRefreshKey((k) => k + 1);
  }, [currentChatId]);

  const handleTitleGenerated = useCallback((chatId, title) => {
    setSidebarRefreshKey((k) => k + 1);
  }, []);

  // 1. Initial auth verification loading state
  if (authLoading) {
    return (
      <div className="mx-auto flex h-full w-full max-w-7xl flex-1 min-h-0 flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state: display modal with login button and redirect countdown
  if (!isAuthenticated) {
    return (
      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-1 min-h-0 flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-50/50 backdrop-blur-xs shadow-xl shadow-slate-200/50">
        <ChatAuthModal isOpen={true} redirectPath={pathname || "/chat"} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-1 min-h-0 flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50">
      {/* Dedicated Chat Page Header (Clean, distinct from sidebar header) */}
      <ChatPageHeader
        stores={stores}
        selectedStoreId={selectedStoreId}
        loadingStores={loadingStores}
        onStoreChange={handleStoreChange}
        onNewChat={handleNewChat}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Chat Workspace */}
      <main className="relative flex-1 w-full min-h-0 overflow-hidden bg-white">
        {selectedStoreId ? (
          <div className="relative h-full flex flex-col">
            <AskCopilotSection
              ref={askCopilotRef}
              storeId={selectedStoreId}
              chatId={currentChatId}
              showCustomHeader={false}
              onNewChatCustom={handleNewChat}
              onStoreDetected={handleStoreDetected}
              onSession={(id) => {
                setChatId(id);
                setCurrentChatId(id);
              }}
              onChatCreated={handleChatCreated}
              onTitleGenerated={handleTitleGenerated}
              onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
              className="h-full flex-1 flex flex-col bg-white overflow-hidden rounded-none border-0"
            />

            <ChatHistorySidebar
              storeId={selectedStoreId}
              onChatSelect={handleChatSelect}
              onChatDeleted={handleChatDeleted}
              refreshKey={sidebarRefreshKey}
              key={selectedStoreId}
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div className="max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-8">
              <Store className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-base font-bold text-slate-800">Select a Store</h3>
              <p className="mt-1 text-sm text-slate-500">
                Choose a store from the dropdown above to start asking questions or reviewing store intelligence.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
