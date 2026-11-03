'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspaceContext } from '@/context/WorkspaceContext';
import { Store, Shield, Briefcase, Plus, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import PageLoader from '@/components/PageLoader';

export default function WorkspaceSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRevokedRedirect = searchParams.get('revoked') === 'true';

  const {
    workspaces,
    selectedStoreId,
    selectWorkspace,
    isLoading,
    error,
    isStoreCreationEligible,
  } = useWorkspaceContext();

  const ownedStores = useMemo(
    () => workspaces.filter((w) => w.isOwner || w.membershipType === 'owner'),
    [workspaces]
  );

  const employeeStores = useMemo(
    () => workspaces.filter((w) => !w.isOwner && w.membershipType === 'employee'),
    [workspaces]
  );

  // Situation A: Single owned store auto-redirect (only if no query params like ?stay=true or ?revoked=true)
  useEffect(() => {
    if (!isLoading && workspaces.length === 1 && ownedStores.length === 1 && !isRevokedRedirect) {
      const singleStore = workspaces[0];
      selectWorkspace(singleStore.storeId);
      router.push(`/storeDashboard/${singleStore.storeId}`);
    }
  }, [isLoading, workspaces, ownedStores, isRevokedRedirect, selectWorkspace, router]);

  const handleOpenWorkspace = (workspace) => {
    selectWorkspace(workspace.storeId);
    router.push(`/storeDashboard/${workspace.storeId}`);
  };

  const handleCreateStore = () => {
    if (!isStoreCreationEligible) {
      alert('Only store owners or new accounts are eligible to create a new store under application policy.');
      return;
    }
    router.push('/createStore');
  };

  if (isLoading) {
    return <PageLoader message="Loading your accessible workspaces..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Access Revoked Banner */}
      {isRevokedRedirect && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Store Access Notice</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Your access to the previously selected store is no longer active or has been suspended.
              Please select another active workspace below.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">
            Multi-Tenant Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            SELECT WORKSPACE
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Choose an active store workspace to launch your role-tailored dashboard.
          </p>
        </div>

        {/* Create Store Button (Shown only if eligible) */}
        {isStoreCreationEligible && (
          <button
            onClick={handleCreateStore}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Create New Store
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Situation E: No Accessible Workspaces */}
      {workspaces.length === 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-12 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Active Workspaces Found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-2 mb-8 font-medium">
            {isStoreCreationEligible
              ? 'You do not belong to any store yet. Set up your store in a few simple steps to get started!'
              : 'You do not have any active store memberships. If you were invited, please ask your store owner to confirm your membership status.'}
          </p>

          {isStoreCreationEligible ? (
            <button
              onClick={handleCreateStore}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transition-transform hover:scale-105"
            >
              Set Up Your First Store →
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 px-4 py-2.5 rounded-xl">
              <Shield className="w-4 h-4" />
              Employee-only account: Store creation requires Owner privileges.
            </div>
          )}
        </div>
      )}

      {/* Section 1: Owned Stores */}
      {ownedStores.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Stores You Own ({ownedStores.length})
            </h2>
            <div className="h-px flex-1 bg-slate-200/70" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedStores.map((store) => {
              const isSelected = selectedStoreId === store.storeId;
              return (
                <div
                  key={store.storeId}
                  onClick={() => handleOpenWorkspace(store)}
                  className={`group relative bg-white/90 backdrop-blur-md rounded-3xl border transition-all duration-200 p-6 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                    isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg shadow-xs">
                      {store.storeName?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      👑 Owner
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {store.storeName}
                  </h3>

                  <p className="text-xs text-slate-500 font-semibold mt-1 capitalize">
                    {store.businessType || 'Retail Store'}
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Full Administrative Access</span>
                    <span className="text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Stores Where You Work (Employee Memberships) */}
      {employeeStores.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Stores Where You Work ({employeeStores.length})
            </h2>
            <div className="h-px flex-1 bg-slate-200/70" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employeeStores.map((store) => {
              const isSelected = selectedStoreId === store.storeId;
              return (
                <div
                  key={store.storeId}
                  onClick={() => handleOpenWorkspace(store)}
                  className={`group relative bg-white/90 backdrop-blur-md rounded-3xl border transition-all duration-200 p-6 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-lg shadow-xs">
                      {store.storeName?.[0]?.toUpperCase() || 'E'}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      🛡️ {store.role || 'Employee'}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {store.storeName}
                  </h3>

                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {Array.isArray(store.permissions) ? `${store.permissions.length} active permissions` : 'Role permissions'}
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 capitalize">{store.businessType || 'Workplace'}</span>
                    <span className="text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

