'use client';

import { useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceContext } from '@/context/WorkspaceContext';

/**
 * usePermission — Global hook to check if the current user has specific permissions
 * within the currently selected workspace.
 *
 * Supported Signatures:
 * 1. Zero-argument (context-driven, recommended):
 *      const { hasPermission, isOwner, isEmployee, currentRole } = usePermission();
 *
 * 2. Explicit arguments (backward compatibility):
 *      const { hasPermission } = usePermission(userPermissions, isOwner);
 *
 * @param {string[]} [explicitPermissions] - Optional explicit permissions array override
 * @param {boolean} [explicitIsOwner] - Optional explicit owner bypass override
 */
export const usePermission = (explicitPermissions, explicitIsOwner) => {
  let workspaceContext = null;
  try {
    // Attempt to access central workspace context if inside WorkspaceProvider
    workspaceContext = useWorkspaceContext();
  } catch (_) {
    workspaceContext = null;
  }

  let routeStoreId = null;
  try {
    if (typeof useParams === 'function') {
      const params = useParams();
      routeStoreId = params?.storeId || null;
    }
  } catch (_) {
    routeStoreId = null;
  }

  // Resolve active workspace:
  // If routeStoreId is present in URL and available in workspaces, use it directly
  // so multi-store navigation stays synchronous with the current route.
  const currentWorkspace = useMemo(() => {
    if (routeStoreId && Array.isArray(workspaceContext?.workspaces)) {
      const matched = workspaceContext.workspaces.find((w) => String(w.storeId) === String(routeStoreId));
      if (matched) return matched;
    }
    return workspaceContext?.currentWorkspace || null;
  }, [routeStoreId, workspaceContext?.workspaces, workspaceContext?.currentWorkspace]);

  // Is the user an authorized member of the active store workspace?
  const isMember = useMemo(() => {
    if (typeof explicitIsOwner === 'boolean' || Array.isArray(explicitPermissions)) {
      return true;
    }
    if (!workspaceContext) return true;
    if (workspaceContext.isLoading) return true; // optimistic while loading
    if (!routeStoreId) return Boolean(currentWorkspace);
    return Boolean(
      (currentWorkspace && String(currentWorkspace.storeId) === String(routeStoreId)) ||
      workspaceContext.workspaces?.some((w) => String(w.storeId) === String(routeStoreId))
    );
  }, [explicitIsOwner, explicitPermissions, workspaceContext, routeStoreId, currentWorkspace]);

  // Determine effective ownership and permissions
  const isOwner = useMemo(() => {
    if (typeof explicitIsOwner === 'boolean') {
      return explicitIsOwner;
    }
    if (!currentWorkspace) return false;
    return Boolean(currentWorkspace.isOwner || currentWorkspace.membershipType === 'owner');
  }, [explicitIsOwner, currentWorkspace]);

  const isEmployee = useMemo(() => {
    if (!currentWorkspace) return false;
    return currentWorkspace.membershipType === 'employee';
  }, [currentWorkspace]);

  const currentRole = useMemo(() => {
    if (!currentWorkspace) return null;
    return currentWorkspace.role || (isOwner ? 'Owner' : 'Employee');
  }, [currentWorkspace, isOwner]);

  const effectivePermissions = useMemo(() => {
    if (Array.isArray(explicitPermissions)) {
      return explicitPermissions;
    }
    if (!currentWorkspace) return [];
    return Array.isArray(currentWorkspace.permissions) ? currentWorkspace.permissions : [];
  }, [explicitPermissions, currentWorkspace]);

  /** Check if user has a single permission */
  const hasPermission = useCallback(
    (permissionKey) => {
      if (isOwner) return true;
      if (!permissionKey) return false;
      return effectivePermissions.includes(permissionKey);
    },
    [effectivePermissions, isOwner]
  );

  /** Check if user has AT LEAST ONE of the given permissions */
  const hasAnyPermission = useCallback(
    (permissionKeys = []) => {
      if (isOwner) return true;
      if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) return false;
      return permissionKeys.some((key) => effectivePermissions.includes(key));
    },
    [effectivePermissions, isOwner]
  );

  /** Check if user has ALL of the given permissions */
  const hasAllPermissions = useCallback(
    (permissionKeys = []) => {
      if (isOwner) return true;
      if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) return false;
      return permissionKeys.every((key) => effectivePermissions.includes(key));
    },
    [effectivePermissions, isOwner]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    // Aliases for backward compatibility
    hasAny: hasAnyPermission,
    hasAll: hasAllPermissions,
    isOwner,
    isEmployee,
    currentRole,
    currentWorkspace,
    permissions: effectivePermissions,
    isMember,
    isLoading: workspaceContext?.isLoading ?? false,
    routeStoreId,
  };
};

export default usePermission;
