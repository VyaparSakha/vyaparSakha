import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreRouteGuard from '@/components/Guard/StoreRouteGuard';

// Mock next/navigation
const mockPush = jest.fn();
let mockCurrentPath = '/storeDashboard/store-123/staff';
let mockCurrentStoreId = 'store-123';

jest.mock('next/navigation', () => ({
  usePathname: () => mockCurrentPath,
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    storeId: mockCurrentStoreId,
  }),
}));

// Mock WorkspaceContext
let mockWorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  selectedStoreId: 'store-123',
  isLoading: false,
  error: null,
  selectWorkspace: jest.fn(),
  refreshWorkspaces: jest.fn(),
};

jest.mock('@/context/WorkspaceContext', () => ({
  useWorkspaceContext: () => mockWorkspaceState,
}));

describe('StoreRouteGuard & Route Security Enforcement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentStoreId = 'store-123';
  });

  describe('1. Owner-only Routes Protection (/staff, /settings, /automations)', () => {
    test('blocks Cashier from accessing /staff and renders Access Restricted card', () => {
      mockCurrentPath = '/storeDashboard/store-123/staff';
      const ws = {
        storeId: 'store-123',
        storeName: 'Test Retail Store',
        membershipType: 'employee',
        role: 'Cashier',
        isOwner: false,
        permissions: ['billing:create'],
      };
      mockWorkspaceState.currentWorkspace = ws;
      mockWorkspaceState.workspaces = [ws];

      render(
        <StoreRouteGuard>
          <div data-testid="staff-content">Staff Management Page</div>
        </StoreRouteGuard>
      );

      expect(screen.queryByTestId('staff-content')).not.toBeInTheDocument();
      expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
      expect(screen.getByText(/You do not have access to this page/i)).toBeInTheDocument();
      expect(screen.getByText(/Staff & Roles Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Return to Dashboard/i)).toBeInTheDocument();
    });

    test('blocks Employee from accessing /settings', () => {
      mockCurrentPath = '/storeDashboard/store-123/settings';
      const ws = {
        storeId: 'store-123',
        storeName: 'Test Retail Store',
        membershipType: 'employee',
        role: 'Manager',
        isOwner: false,
        permissions: ['billing:create', 'inventory:add', 'inventory:manage', 'reports:view_sales'],
      };
      mockWorkspaceState.currentWorkspace = ws;
      mockWorkspaceState.workspaces = [ws];

      render(
        <StoreRouteGuard>
          <div data-testid="settings-content">Settings Page</div>
        </StoreRouteGuard>
      );

      expect(screen.queryByTestId('settings-content')).not.toBeInTheDocument();
      expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Store Settings/i).length).toBeGreaterThanOrEqual(1);
    });

    test('allows Store Owner to access /staff and /settings', () => {
      mockCurrentPath = '/storeDashboard/store-123/staff';
      const ws = {
        storeId: 'store-123',
        storeName: 'Test Retail Store',
        membershipType: 'owner',
        role: 'Owner',
        isOwner: true,
        permissions: ['*'],
      };
      mockWorkspaceState.currentWorkspace = ws;
      mockWorkspaceState.workspaces = [ws];

      render(
        <StoreRouteGuard>
          <div data-testid="staff-content">Staff Management Page</div>
        </StoreRouteGuard>
      );

      expect(screen.getByTestId('staff-content')).toBeInTheDocument();
    });
  });

  describe('2. Permission-specific Routes (/billing, /inventory, /analytics)', () => {
    test('allows Cashier with billing:create to access /billing', () => {
      mockCurrentPath = '/storeDashboard/store-123/billing';
      const ws = {
        storeId: 'store-123',
        storeName: 'Test Retail Store',
        membershipType: 'employee',
        role: 'Cashier',
        isOwner: false,
        permissions: ['billing:create'],
      };
      mockWorkspaceState.currentWorkspace = ws;
      mockWorkspaceState.workspaces = [ws];

      render(
        <StoreRouteGuard>
          <div data-testid="billing-content">POS Checkout System</div>
        </StoreRouteGuard>
      );

      expect(screen.getByTestId('billing-content')).toBeInTheDocument();
    });

    test('denies Stock Manager without billing:create from accessing /billing', () => {
      mockCurrentPath = '/storeDashboard/store-123/billing';
      const ws = {
        storeId: 'store-123',
        storeName: 'Test Retail Store',
        membershipType: 'employee',
        role: 'Stock Manager',
        isOwner: false,
        permissions: ['inventory:add', 'inventory:manage'],
      };
      mockWorkspaceState.currentWorkspace = ws;
      mockWorkspaceState.workspaces = [ws];

      render(
        <StoreRouteGuard>
          <div data-testid="billing-content">POS Checkout System</div>
        </StoreRouteGuard>
      );

      expect(screen.queryByTestId('billing-content')).not.toBeInTheDocument();
      expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
      expect(screen.getByText(/Point of Sale & Billing/i)).toBeInTheDocument();
    });

    test('allows Stock Manager to access /inventory catalog', () => {
      mockCurrentPath = '/storeDashboard/store-123/inventory';
      const ws = {
        storeId: 'store-123',
        storeName: 'Test Retail Store',
        membershipType: 'employee',
        role: 'Stock Manager',
        isOwner: false,
        permissions: ['inventory:add', 'inventory:manage'],
      };
      mockWorkspaceState.currentWorkspace = ws;
      mockWorkspaceState.workspaces = [ws];

      render(
        <StoreRouteGuard>
          <div data-testid="inventory-content">Product Catalog</div>
        </StoreRouteGuard>
      );

      expect(screen.getByTestId('inventory-content')).toBeInTheDocument();
    });

    test('denies Cashier from accessing /inventory catalog', () => {
      mockCurrentPath = '/storeDashboard/store-123/inventory';
      const ws = {
        storeId: 'store-123',
        storeName: 'Test Retail Store',
        membershipType: 'employee',
        role: 'Cashier',
        isOwner: false,
        permissions: ['billing:create'],
      };
      mockWorkspaceState.currentWorkspace = ws;
      mockWorkspaceState.workspaces = [ws];

      render(
        <StoreRouteGuard>
          <div data-testid="inventory-content">Product Catalog</div>
        </StoreRouteGuard>
      );

      expect(screen.queryByTestId('inventory-content')).not.toBeInTheDocument();
      expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
      expect(screen.getByText(/Inventory Catalog/i)).toBeInTheDocument();
    });
  });

  describe('3. Inaccessible Store Workspace (!isMember)', () => {
    test('renders Workspace Inaccessible screen if user does not belong to store', () => {
      mockCurrentStoreId = 'alien-store-999';
      mockCurrentPath = '/storeDashboard/alien-store-999';
      mockWorkspaceState.workspaces = [
        {
          storeId: 'store-123',
          storeName: 'Test Retail Store',
          isOwner: true,
        },
      ];
      mockWorkspaceState.currentWorkspace = null;

      render(
        <StoreRouteGuard>
          <div data-testid="overview-content">Store Overview</div>
        </StoreRouteGuard>
      );

      expect(screen.queryByTestId('overview-content')).not.toBeInTheDocument();
      expect(screen.getByText(/Workspace Inaccessible/i)).toBeInTheDocument();
      expect(screen.getByText(/Switch Workspace/i)).toBeInTheDocument();
    });
  });
});
