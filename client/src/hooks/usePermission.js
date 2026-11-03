'use client';

import { useCallback, useContext, useMemo } from 'react';
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

  const currentWorkspace = workspaceContext?.currentWorkspace || null;

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
  };
};

export default usePermission;
