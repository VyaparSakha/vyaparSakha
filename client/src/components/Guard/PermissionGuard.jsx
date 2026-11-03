'use client';

import React from 'react';
import { usePermission } from '@/hooks/usePermission';

/**
 * PermissionGuard — Conditionally renders or disables children based on user permissions
 * within the active workspace.
 *
 * Usage:
 * 1. Single permission:
 *    <PermissionGuard permission="inventory:add">
 *      <AddProductButton />
 *    </PermissionGuard>
 *
 * 2. Any of multiple permissions:
 *    <PermissionGuard anyOf={["inventory:add", "inventory:manage"]}>
 *      <StockControls />
 *    </PermissionGuard>
 *
 * 3. All required permissions:
 *    <PermissionGuard allOf={["billing:create", "reports:view_sales"]}>
 *      <AdvancedCheckout />
 *    </PermissionGuard>
 *
 * 4. Disabled mode (disables the interactive control instead of hiding):
 *    <PermissionGuard permission="inventory:manage" disableOnly>
 *      <button onClick={handleDelete}>Delete Product</button>
 *    </PermissionGuard>
 *
 * 5. With Fallback UI:
 *    <PermissionGuard permission="reports:view_sales" fallback={<AccessDeniedCard />}>
 *      <SalesAnalyticsChart />
 *    </PermissionGuard>
 */
const PermissionGuard = ({
  permission,
  anyOf = [],
  allOf = [],
  userPermissions,
  isOwner: propIsOwner,
  fallback = null,
  disableOnly = false,
  children,
}) => {
  // Use central hook if props not explicitly provided
  const permissionHook = usePermission(userPermissions, propIsOwner);

  let isAllowed = permissionHook.isOwner;

  if (!isAllowed) {
    if (permission) {
      isAllowed = permissionHook.hasPermission(permission);
    } else if (Array.isArray(anyOf) && anyOf.length > 0) {
      isAllowed = permissionHook.hasAnyPermission(anyOf);
    } else if (Array.isArray(allOf) && allOf.length > 0) {
      isAllowed = permissionHook.hasAllPermissions(allOf);
    } else {
      isAllowed = true;
    }
  }

  if (!isAllowed) {
    if (disableOnly && children) {
      // True disabled state: recursively clone children passing disabled prop where supported
      const disableChild = (child) => {
        if (!React.isValidElement(child)) return child;

        const originalProps = child.props || {};
        const isInteractive =
          typeof child.type === 'string' &&
          ['button', 'input', 'select', 'textarea'].includes(child.type.toLowerCase());

        return React.cloneElement(child, {
          ...(isInteractive ? { disabled: true } : {}),
          'aria-disabled': 'true',
          tabIndex: -1,
          style: {
            ...(originalProps.style || {}),
            opacity: 0.5,
            pointerEvents: 'none',
            cursor: 'not-allowed',
          },
          onClick: (e) => {
            e?.preventDefault?.();
            e?.stopPropagation?.();
          },
        });
      };

      const disabledContent = React.Children.map(children, disableChild);

      return (
        <span
          title="You do not have permission for this action"
          style={{ display: 'inline-block', cursor: 'not-allowed' }}
        >
          {disabledContent}
        </span>
      );
    }

    return fallback;
  }

  return children;
};

export default PermissionGuard;
