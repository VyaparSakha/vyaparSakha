'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { apiGet } from '@/servies/api';
import { useQueryClient } from '@tanstack/react-query';

const WorkspaceContext = createContext(null);

const WORKSPACE_STORAGE_KEY = 'vyapar_active_store_id';

export function WorkspaceProvider({ children }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all accessible workspaces from GET /api/me/workspaces
  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setSelectedStoreId(null);
      setIsLoading(false);
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      let workspaceList = [];

      try {
        const res = await apiGet('/me/workspaces');
        workspaceList = Array.isArray(res?.data) ? res.data : [];
      } catch (meErr) {
        // Fallback for deployed servers where /me/workspaces has not yet finished deploying:
        // Use GET /store/all to populate owned stores so owners are never locked out
        console.warn('[WORKSPACE_CONTEXT] /me/workspaces unavailable, attempting fallback to /store/all:', meErr);
        try {
          const fallbackRes = await apiGet('/store/all');
          const rawStores = Array.isArray(fallbackRes?.data) ? fallbackRes.data : [];
          workspaceList = rawStores.map((s) => ({
            storeId: String(s._id || s.id),
            storeName: s.name,
            businessType: s.businessType,
            membershipType: 'owner',
            role: 'Owner',
            isOwner: true,
            permissions: ['*'],
            status: 'active',
          }));
        } catch (fallbackErr) {
          throw meErr || fallbackErr;
        }
      }

      setWorkspaces(workspaceList);
      return workspaceList;
    } catch (err) {
      console.error('[WORKSPACE_CONTEXT] Failed to fetch workspaces:', err);
      setError(err?.message || 'Failed to load accessible stores');
      setWorkspaces([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch on authentication state change
  useEffect(() => {
    if (!authLoading) {
      fetchWorkspaces();
    }
  }, [authLoading, fetchWorkspaces]);

  // Listen for access revocation events from API interceptor
  useEffect(() => {
    const handleRevoked = () => {
      console.warn('[WORKSPACE_CONTEXT] Workspace access revoked event received. Refreshing workspaces...');
      fetchWorkspaces();
      queryClient.invalidateQueries();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('vyapar:workspace_revoked', handleRevoked);
      return () => {
        window.removeEventListener('vyapar:workspace_revoked', handleRevoked);
      };
    }
  }, [fetchWorkspaces, queryClient]);

  // Restore or default selected store
  useEffect(() => {
    if (workspaces.length === 0) {
      setSelectedStoreId(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      }
      return;
    }

    if (typeof window !== 'undefined') {
      const savedStoreId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      const isValidSavedStore = workspaces.some((w) => w.storeId === savedStoreId);

      if (isValidSavedStore) {
        setSelectedStoreId(savedStoreId);
      } else {
        // Default to the first available workspace
        const defaultStoreId = workspaces[0].storeId;
        setSelectedStoreId(defaultStoreId);
        localStorage.setItem(WORKSPACE_STORAGE_KEY, defaultStoreId);
      }
    }
  }, [workspaces]);

  // Select a specific workspace
  const selectWorkspace = useCallback((storeId) => {
    if (!storeId) return;

    const target = workspaces.find((w) => w.storeId === storeId);
    if (!target) {
      console.warn(`[WORKSPACE_CONTEXT] Attempted to select inaccessible storeId: ${storeId}`);
      return;
    }

    setSelectedStoreId(storeId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, storeId);
    }

    // Invalidate/clear store-scoped queries so stale data does not leak
    queryClient.invalidateQueries();
  }, [workspaces, queryClient]);

  // Refresh workspaces and optionally verify current selection
  const refreshWorkspaces = useCallback(async () => {
    const list = await fetchWorkspaces();
    queryClient.invalidateQueries();
    return list;
  }, [fetchWorkspaces, queryClient]);

  // Resolve currently active workspace object
  const currentWorkspace = useMemo(() => {
    if (!selectedStoreId || workspaces.length === 0) return null;
    return workspaces.find((w) => w.storeId === selectedStoreId) || null;
  }, [selectedStoreId, workspaces]);

  // Store creation eligibility:
  // User is eligible if:
  // 1. They currently own at least 1 store (owners can create more stores), OR
  // 2. They have 0 stores and 0 employee memberships (brand-new user onboarding).
  // Employee-only accounts (0 owned stores, >= 1 employee memberships) are ineligible under backend policy.
  const isStoreCreationEligible = useMemo(() => {
    if (workspaces.length === 0) return true; // Brand-new user
    const ownsAnyStore = workspaces.some((w) => w.isOwner || w.membershipType === 'owner');
    return ownsAnyStore;
  }, [workspaces]);

  const value = useMemo(
    () => ({
      workspaces,
      currentWorkspace,
      selectedStoreId,
      isLoading: authLoading || isLoading,
      error,
      selectWorkspace,
      refreshWorkspaces,
      isStoreCreationEligible,
    }),
    [
      workspaces,
      currentWorkspace,
      selectedStoreId,
      authLoading,
      isLoading,
      error,
      selectWorkspace,
      refreshWorkspaces,
      isStoreCreationEligible,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
  }
  return context;
}

// Alias for convenience
export const useWorkspace = useWorkspaceContext;
