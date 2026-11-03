'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import { ShieldAlert, Lock, ArrowLeft, Store, RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * Route security rules for store-scoped paths:
 * Maps URL sub-paths to required roles or permissions.
 */
const ROUTE_SECURITY_RULES = [
  // ─── Owner-only Sections ──────────────────────────────────────────────────
  {
    matcher: (subPath) => subPath === '/staff' || subPath.startsWith('/staff/'),
    title: 'Staff & Roles Management',
    requireOwner: true,
    requiredLabel: 'Store Owner',
    description: 'Managing store staff, roles, and invitations is restricted strictly to the Store Owner.',
  },
  {
    matcher: (subPath) => subPath === '/settings' || subPath.startsWith('/settings/'),
    title: 'Store Settings',
    requireOwner: true,
    requiredLabel: 'Store Owner',
    description: 'Store settings, business details, and deletion controls are restricted to the Store Owner.',
  },
  {
    matcher: (subPath) => subPath === '/automations' || subPath.startsWith('/automations/'),
    title: 'Automations',
    requireOwner: true,
    requiredLabel: 'Store Owner',
    description: 'Automated business workflows and trigger rules are restricted to the Store Owner.',
  },

  // ─── Sales, Bills & Invoicing ─────────────────────────────────────────────
  {
    matcher: (subPath) => subPath === '/billing-history' || subPath.startsWith('/billing-history/'),
    title: 'Billing History & Invoices',
    permission: 'billing:create',
    requiredLabel: 'Billing (billing:create)',
    description: 'Viewing past invoices, payment receipts, and billing history requires billing permissions.',
  },
  {
    matcher: (subPath) => subPath === '/billing' || subPath.startsWith('/billing/'),
    title: 'Point of Sale & Billing',
    permission: 'billing:create',
    requiredLabel: 'Billing (billing:create)',
    description: 'Creating sales receipts, point-of-sale checkout, and discounts requires billing permissions.',
  },
  {
    matcher: (subPath) => subPath === '/buyers' || subPath.startsWith('/buyers/'),
    title: 'Buyers & Clients',
    permission: 'billing:create',
    requiredLabel: 'Billing (billing:create)',
    description: 'Viewing customer profiles, ledgers, and credit limits requires billing permissions.',
  },

  // ─── Inventory Catalog ────────────────────────────────────────────────────
  {
    matcher: (subPath) => subPath === '/inventory' || subPath.startsWith('/inventory/'),
    title: 'Inventory Catalog',
    anyOf: ['inventory:add', 'inventory:manage'],
    requiredLabel: 'Inventory (inventory:add or inventory:manage)',
    description: 'Viewing the stock catalog, editing pricing, and managing inventory requires inventory permissions.',
  },

  // ─── Purchases & Procurement ──────────────────────────────────────────────
  {
    matcher: (subPath) => subPath.startsWith('/purchases/smart-reorder'),
    title: 'AI Smart Reorder',
    permission: 'inventory:manage',
    requiredLabel: 'Stock Management (inventory:manage)',
    description: 'Triggering AI restock recommendations requires inventory management permissions.',
  },
  {
    matcher: (subPath) => subPath.startsWith('/purchases/analytics') || subPath.startsWith('/purchases/reports'),
    title: 'Purchase Reports & Analytics',
    permission: 'reports:view_sales',
    requiredLabel: 'Reports (reports:view_sales)',
    description: 'Viewing procurement analytics and spend reports requires reporting permissions.',
  },
  {
    matcher: (subPath) => subPath === '/purchases' || subPath.startsWith('/purchases/'),
    title: 'Purchases & Purchase Orders',
    anyOf: ['inventory:add', 'inventory:manage'],
    requiredLabel: 'Inventory (inventory:add or inventory:manage)',
    description: 'Creating and managing purchase orders, goods receipts (GRNs), and supplier orders requires inventory permissions.',
  },
  {
    matcher: (subPath) => subPath === '/sellers' || subPath.startsWith('/sellers/'),
    title: 'Sellers & Suppliers',
    anyOf: ['inventory:add', 'inventory:manage'],
    requiredLabel: 'Inventory (inventory:add or inventory:manage)',
    description: 'Viewing supplier directory and purchase ledgers requires inventory permissions.',
  },

  // ─── Analytics & AI ───────────────────────────────────────────────────────
  {
    matcher: (subPath) => subPath === '/analytics' || subPath.startsWith('/analytics/'),
    title: 'Sales Analytics & Reports',
    permission: 'reports:view_sales',
    requiredLabel: 'Reports (reports:view_sales)',
    description: 'Viewing sales analytics, revenue graphs, and performance charts requires reporting permissions.',
  },
  {
    matcher: (subPath) => subPath === '/ai-dashboard' || subPath.startsWith('/ai-dashboard/'),
    title: 'AI Command Dashboard',
    anyOf: ['reports:view_sales', 'inventory:manage'],
    requiredLabel: 'Reports or Inventory Management',
    description: 'Viewing business intelligence and AI insights requires reporting or inventory permissions.',
  },

  // ─── Product Specific Sub-routes ─────────────────────────────────────────
  {
    matcher: (subPath) => /\/[^/]+\/analytics(\/.*)?$/.test(subPath),
    title: 'Product Analytics',
    permission: 'reports:view_sales',
    requiredLabel: 'Reports (reports:view_sales)',
    description: 'Viewing product sales analytics requires reporting permissions.',
  },
  {
    matcher: (subPath) => subPath !== '' && subPath !== '/' && !subPath.startsWith('/page') && /^\/[^/]+$/.test(subPath),
    title: 'Product Details',
    anyOf: ['inventory:add', 'inventory:manage'],
    requiredLabel: 'Inventory (inventory:add or inventory:manage)',
    description: 'Viewing and editing product details requires inventory permissions.',
  },
];

export default function StoreRouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    hasPermission,
    hasAnyPermission,
    isOwner,
    currentRole,
    currentWorkspace,
    isMember,
    isLoading,
  } = usePermission();

  // Extract storeId and subPath from pathname
  // Expected structure: /storeDashboard/[storeId]/[...subPath]
  const pathParts = (pathname || '').split('/').filter(Boolean);
  const storeDashboardIdx = pathParts.indexOf('storeDashboard');
  const storeIdFromUrl = storeDashboardIdx !== -1 ? pathParts[storeDashboardIdx + 1] : null;
  const subPathParts = storeDashboardIdx !== -1 ? pathParts.slice(storeDashboardIdx + 2) : [];
  const subPath = subPathParts.length > 0 ? '/' + subPathParts.join('/') : '';

  // 1. Loading state: keep UI smooth while checking workspace permissions
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] p-8 text-center">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm animate-pulse mb-4">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-600">Verifying workspace permissions...</p>
      </div>
    );
  }

  // 2. User does not have membership in this store at all (inaccessible or revoked workspace)
  if (!isMember) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] px-4 py-8">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-rose-200/80 shadow-xl p-6 sm:p-8 text-center transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
            <ShieldAlert size={28} />
          </div>

          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Workspace Inaccessible
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            You do not have access to this store workspace. Your membership may have been revoked or the store link is invalid.
          </p>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left">
            <span className="font-semibold text-slate-700">Requested Store ID:</span>{' '}
            <code className="text-slate-500">{storeIdFromUrl || 'Unknown'}</code>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => router.push('/storeDashboard')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-xs"
            >
              <Store size={16} />
              Switch Workspace
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Evaluate route security rules
  const matchingRule = ROUTE_SECURITY_RULES.find((rule) => rule.matcher(subPath));

  if (matchingRule) {
    let hasAccess = false;

    if (isOwner) {
      hasAccess = true;
    } else if (matchingRule.requireOwner) {
      hasAccess = false;
    } else if (matchingRule.permission) {
      hasAccess = hasPermission(matchingRule.permission);
    } else if (Array.isArray(matchingRule.anyOf) && matchingRule.anyOf.length > 0) {
      hasAccess = hasAnyPermission(matchingRule.anyOf);
    } else {
      hasAccess = true;
    }

    if (!hasAccess) {
      const storeName = currentWorkspace?.storeName || 'This store';
      const roleDisplayName = currentRole || 'Employee';

      return (
        <div className="flex items-center justify-center min-h-[70vh] px-4 py-8">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-xl p-6 sm:p-8 text-center transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Glowing Icon Badge */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mb-5 shadow-xs">
              <Lock size={30} />
            </div>

            {/* Headline */}
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 mb-2">
              Access Restricted
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              You do not have access to this page
            </h2>

            {/* Description */}
            <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
              Your assigned role as <span className="font-semibold text-slate-800">{roleDisplayName}</span> in{' '}
              <span className="font-semibold text-slate-800">{storeName}</span> does not have permission to access{' '}
              <span className="font-semibold text-slate-800">{matchingRule.title}</span>.
            </p>

            {/* Explanatory Info Card */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-left space-y-2">
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <span>{matchingRule.description}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                  Store: <strong className="text-slate-800">{storeName}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                  Your Role: <strong className="text-blue-600">{roleDisplayName}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                  Required: <strong>{matchingRule.requiredLabel}</strong>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/storeDashboard/${storeIdFromUrl}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-xs"
              >
                <ArrowLeft size={16} />
                Return to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => router.push('/storeDashboard')}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
              >
                <Store size={15} />
                Switch Store
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Authorized: render child component
  return <>{children}</>;
}

