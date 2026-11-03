'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStoreDashboard } from '@/features/storeDashboard/hooks/useStoreDashboard';
import { useWorkspaceContext } from '@/context/WorkspaceContext';
import { STATS_CONFIG } from '@/features/storeDashboard/constants';
import {
  DashboardHeader,
  StatsBar,
  SearchFiltersSection,
  DashboardContent,
  DeleteStoreModal,
} from '@/features/storeDashboard/components';
import PageLoader from '@/components/PageLoader';

/**
 * Store Dashboard Page Component with Multi-Tenant Workspace Integration
 */
const StoreDashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRevoked = searchParams?.get('revoked') === 'true';

  const [loaderMessage, setLoaderMessage] = useState('');
  const loaderTimerRef = useRef(null);
  const storeTimerRef = useRef(null);

  const { stores, allStores, loading, error, filters, updateFilters, refreshStores } = useStoreDashboard();
  const { selectWorkspace, refreshWorkspaces, canCreateStore } = useWorkspaceContext();

  // Clean up timers if component unmounts before 1s (fast navigation)
  useEffect(() => {
    return () => {
      if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current);
      if (storeTimerRef.current) clearTimeout(storeTimerRef.current);
    };
  }, []);

  const handleStoreClick = async (store) => {
    const startTime = Date.now();
    // Show mascot loader immediately on store card click (0ms delay)
    setLoaderMessage(`Opening ${store.name || 'store'}...`);

    // Persist active store ID for API interceptor and WorkspaceContext
    const targetStoreId = store._id || store.storeId || store.id;
    if (typeof window !== 'undefined' && targetStoreId) {
      localStorage.setItem('vyapar_active_store_id', targetStoreId);
    }
    if (selectWorkspace) {
      selectWorkspace(store, false);
    }

    // Initial navigation request
    router.push(`/storeDashboard/${targetStoreId}`);

    // Minimum display duration so user sees the smooth mascot animation
    const elapsed = Date.now() - startTime;
    const minDisplayMs = 1200;
    if (elapsed < minDisplayMs) {
      await new Promise((r) => setTimeout(r, minDisplayMs - elapsed));
    }
  };

  const handleCreateStore = async () => {
    const startTime = Date.now();
    // Show mascot loader immediately on button click
    setLoaderMessage('Setting up your store form...');

    // Initial navigation request
    router.push('/createStore');

    // Ensure loader displays for at least 1.2s so the user sees the smooth mascot animation
    const elapsed = Date.now() - startTime;
    const minDisplayMs = 1200;
    if (elapsed < minDisplayMs) {
      await new Promise((r) => setTimeout(r, minDisplayMs - elapsed));
    }
  };

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, store: null });

  const handleDeleteStore = (store) => {
    setDeleteModal({ isOpen: true, store });
  };

  const handleConfirmDelete = async () => {
    const store = deleteModal.store;
    if (!store) return;

    try {
      setLoaderMessage(`Deleting ${store.name}...`);
      const { deleteStore } = await import('@/features/storeDashboard/services/storeDashboardService');
      await deleteStore(store._id);
      await refreshStores();
      if (refreshWorkspaces) {
        await refreshWorkspaces();
      }
      setDeleteModal({ isOpen: false, store: null });
    } catch (err) {
      alert(err.message || 'Failed to delete store');
    } finally {
      setLoaderMessage('');
    }
  };

  // Determine if user can create stores: must not be disallowed by policy and can't be strictly employee-only
  const isOwner = canCreateStore !== false && (stores.length === 0 || stores.some((s) => !s.isEmployee));

  // Build stats array from config
  const stats = STATS_CONFIG.map((statConfig) => {
    let value;
    if (loading) {
      value = '...';
    } else {
      switch (statConfig.key) {
        case 'total':
          value = stores.length;
          break;
        case 'active':
          value = stores.filter((s) => s.isActive !== false).length;
          break;
        case 'retail':
          value = stores.filter((s) => (s.businessType || '').toLowerCase() === 'retail').length;
          break;
        case 'wholesale':
          value = stores.filter((s) => (s.businessType || '').toLowerCase() === 'wholesale').length;
          break;
        default:
          value = 0;
      }
    }
    return { label: statConfig.label, value };
  });

  return (
    <div className="flex flex-col relative selection:bg-blue-500/20 antialiased min-h-screen">
      {/* Page navigation or store fetching loader */}
      {(loaderMessage || loading) && (
        <PageLoader message={loaderMessage || 'Loading your stores...'} />
      )}

      <main className="relative z-10">
        {/* Access Revocation Notice (if redirected with ?revoked=true) */}
        {isRevoked && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 animate-fade-in">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide">Store Access Notice</h4>
                  <p className="text-xs text-amber-700 font-semibold">
                    Access to the previously selected store is no longer active. Please choose an accessible workspace below.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.replace('/storeDashboard')}
                className="text-xs font-black uppercase tracking-wider px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 rounded-xl transition-colors shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <DashboardHeader
          onCreateStore={handleCreateStore}
          filters={filters}
          updateFilters={updateFilters}
          refreshStores={refreshStores}
          stats={stats}
          isOwner={isOwner}
        />

        {/* ── Stats Bar — desktop only ── */}
        <StatsBar stats={stats} />

        {/* ── Search & Filters ── */}
        <SearchFiltersSection
          filters={filters}
          updateFilters={updateFilters}
          refreshStores={refreshStores}
          stores={allStores || stores}
        />

        {/* ── Store List ── */}
        <DashboardContent
          stores={stores}
          loading={loading}
          error={error}
          onStoreClick={handleStoreClick}
          onDelete={handleDeleteStore}
        />

        {/* ── Delete Confirmation Modal ── */}
        <DeleteStoreModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, store: null })}
          onConfirm={handleConfirmDelete}
          storeName={deleteModal.store?.name}
        />
      </main>
    </div>
  );
};

export default function StoreDashboardPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading your stores..." />}>
      <StoreDashboardContent />
    </Suspense>
  );
}
