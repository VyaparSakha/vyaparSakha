import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePermission } from '@/hooks/usePermission';
import PermissionGuard from '@/components/Guard/PermissionGuard';
import WorkspaceSelector from '@/features/workspace/components/WorkspaceSelector';

// Mock useRouter and useSearchParams
const mockPush = jest.fn();
const mockGet = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock WorkspaceContext
const mockSelectWorkspace = jest.fn();
const mockRefreshWorkspaces = jest.fn();
let mockWorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  selectedStoreId: null,
  isLoading: false,
  error: null,
  isStoreCreationEligible: true,
  selectWorkspace: mockSelectWorkspace,
  refreshWorkspaces: mockRefreshWorkspaces,
};

jest.mock('@/context/WorkspaceContext', () => ({
  useWorkspaceContext: () => mockWorkspaceState,
}));

// Test helper component for usePermission hook testing
function PermissionTestComponent({ permission, anyOf, allOf }) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner,
    isEmployee,
    currentRole,
  } = usePermission();

  return (
    <div>
      <div data-testid="is-owner">{isOwner ? 'yes' : 'no'}</div>
      <div data-testid="is-employee">{isEmployee ? 'yes' : 'no'}</div>
      <div data-testid="current-role">{currentRole || 'none'}</div>
      <div data-testid="has-single">
        {permission && hasPermission(permission) ? 'allowed' : 'denied'}
      </div>
      <div data-testid="has-any">
        {anyOf && hasAnyPermission(anyOf) ? 'allowed' : 'denied'}
      </div>
      <div data-testid="has-all">
        {allOf && hasAllPermissions(allOf) ? 'allowed' : 'denied'}
      </div>
    </div>
  );
}

describe('Workspace Context & Role-Aware Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  describe('1. usePermission Hook', () => {
    test('grants full permissions when active workspace is owned', () => {
      mockWorkspaceState.currentWorkspace = {
        storeId: 'store-a',
        storeName: 'Store A',
        membershipType: 'owner',
        role: 'Owner',
        isOwner: true,
        permissions: ['*'],
      };

      render(
        <PermissionTestComponent
          permission="inventory:manage"
          anyOf={['billing:create', 'reports:view_sales']}
          allOf={['inventory:add', 'inventory:manage']}
        />
      );

      expect(screen.getByTestId('is-owner')).toHaveTextContent('yes');
      expect(screen.getByTestId('is-employee')).toHaveTextContent('no');
      expect(screen.getByTestId('current-role')).toHaveTextContent('Owner');
      expect(screen.getByTestId('has-single')).toHaveTextContent('allowed');
      expect(screen.getByTestId('has-any')).toHaveTextContent('allowed');
      expect(screen.getByTestId('has-all')).toHaveTextContent('allowed');
    });

    test('strictly enforces assigned permissions for employee workspace (Cashier)', () => {
      mockWorkspaceState.currentWorkspace = {
        storeId: 'store-a',
        storeName: 'Store A',
        membershipType: 'employee',
        role: 'Cashier',
        isOwner: false,
        permissions: ['billing:create'],
      };

      render(
        <PermissionTestComponent
          permission="billing:create"
          anyOf={['billing:create', 'inventory:manage']}
          allOf={['billing:create', 'inventory:manage']}
        />
      );

      expect(screen.getByTestId('is-owner')).toHaveTextContent('no');
      expect(screen.getByTestId('is-employee')).toHaveTextContent('yes');
      expect(screen.getByTestId('current-role')).toHaveTextContent('Cashier');
      expect(screen.getByTestId('has-single')).toHaveTextContent('allowed');
      expect(screen.getByTestId('has-any')).toHaveTextContent('allowed');
      // Lacks inventory:manage, so allOf must be denied
      expect(screen.getByTestId('has-all')).toHaveTextContent('denied');
    });

    test('fails safely and denies all permissions when no workspace is selected', () => {
      mockWorkspaceState.currentWorkspace = null;

      render(
        <PermissionTestComponent
          permission="billing:create"
          anyOf={['billing:create']}
          allOf={['billing:create']}
        />
      );

      expect(screen.getByTestId('is-owner')).toHaveTextContent('no');
      expect(screen.getByTestId('is-employee')).toHaveTextContent('no');
      expect(screen.getByTestId('current-role')).toHaveTextContent('none');
      expect(screen.getByTestId('has-single')).toHaveTextContent('denied');
      expect(screen.getByTestId('has-any')).toHaveTextContent('denied');
      expect(screen.getByTestId('has-all')).toHaveTextContent('denied');
    });

    test('correctly transitions permissions for user with multiple roles (Priya in Store B vs Store A)', () => {
      // Step A: Priya active in Store B (Owner)
      mockWorkspaceState.currentWorkspace = {
        storeId: 'store-b',
        storeName: 'Priya Store B',
        membershipType: 'owner',
        role: 'Owner',
        isOwner: true,
        permissions: [],
      };

      const { rerender } = render(
        <PermissionTestComponent permission="inventory:manage" />
      );
      expect(screen.getByTestId('is-owner')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-single')).toHaveTextContent('allowed');

      // Step B: Priya switches to Store A (Cashier employee)
      mockWorkspaceState.currentWorkspace = {
        storeId: 'store-a',
        storeName: 'Store A',
        membershipType: 'employee',
        role: 'Cashier',
        isOwner: false,
        permissions: ['billing:create'],
      };

      rerender(<PermissionTestComponent permission="inventory:manage" />);
      expect(screen.getByTestId('is-owner')).toHaveTextContent('no');
      expect(screen.getByTestId('is-employee')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-single')).toHaveTextContent('denied');
    });
  });

  describe('2. PermissionGuard Component', () => {
    test('renders children when single permission is granted', () => {
      mockWorkspaceState.currentWorkspace = {
        storeId: 'store-a',
        isOwner: false,
        permissions: ['inventory:add'],
      };

      render(
        <PermissionGuard permission="inventory:add">
          <button data-testid="add-btn">Add Product</button>
        </PermissionGuard>
      );

      expect(screen.getByTestId('add-btn')).toBeInTheDocument();
    });

    test('hides children when permission is missing', () => {
      mockWorkspaceState.currentWorkspace = {
        storeId: 'store-a',
        isOwner: false,
        permissions: ['billing:create'],
      };

      render(
        <PermissionGuard permission="inventory:add">
          <button data-testid="add-btn">Add Product</button>
        </PermissionGuard>
      );

      expect(screen.queryByTestId('add-btn')).not.toBeInTheDocument();
    });

    test('renders fallback component when access is denied', () => {
      mockWorkspaceState.currentWorkspace = {
        storeId: 'store-a',
        isOwner: false,
        permissions: ['billing:create'],
      };

      render(
        <PermissionGuard
          permission="reports:view_sales"
          fallback={<div data-testid="denied-notice">Reports Restricted</div>}
        >
          <div data-testid="sales-chart">Chart</div>
        </PermissionGuard>
      );

      expect(screen.queryByTestId('sales-chart')).not.toBeInTheDocument();
      expect(screen.getByTestId('denied-notice')).toHaveTextContent('Reports Restricted');
    });

    test('genuinely disables interactive controls in disableOnly mode', () => {
      mockWorkspaceState.currentWorkspace = {
        storeId: 'store-a',
        isOwner: false,
        permissions: ['billing:create'],
      };

      const handleMockClick = jest.fn();

      render(
        <PermissionGuard permission="inventory:manage" disableOnly>
          <button data-testid="delete-btn" onClick={handleMockClick}>
            Delete Product
          </button>
        </PermissionGuard>
      );

      const deleteBtn = screen.getByTestId('delete-btn');
      expect(deleteBtn).toBeInTheDocument();
      expect(deleteBtn).toBeDisabled();
      expect(deleteBtn).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(deleteBtn);
      expect(handleMockClick).not.toHaveBeenCalled();
    });
  });

  describe('3. WorkspaceSelector (Multi-Tenant Scenarios)', () => {
    test('renders Situation B: Multiple owned stores with Owner badge and open action', () => {
      mockWorkspaceState.workspaces = [
        {
          storeId: 'store-1',
          storeName: 'Grocery Store',
          membershipType: 'owner',
          role: 'Owner',
          isOwner: true,
          businessType: 'Retail',
        },
        {
          storeId: 'store-2',
          storeName: 'Hardware Store',
          membershipType: 'owner',
          role: 'Owner',
          isOwner: true,
          businessType: 'Wholesale',
        },
      ];
      mockWorkspaceState.isStoreCreationEligible = true;

      render(<WorkspaceSelector />);

      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
      expect(screen.getByText('Hardware Store')).toBeInTheDocument();
      expect(screen.getAllByText('👑 Owner').length).toBe(2);

      // Clicking store card selects workspace and navigates
      fireEvent.click(screen.getByText('Grocery Store'));
      expect(mockSelectWorkspace).toHaveBeenCalledWith('store-1');
      expect(mockPush).toHaveBeenCalledWith('/storeDashboard/store-1');
    });

    test('renders Situation C: Employee-only account hides owner options and shows employee badges', () => {
      mockWorkspaceState.workspaces = [
        {
          storeId: 'store-x',
          storeName: 'Metro Mart',
          membershipType: 'employee',
          role: 'Cashier',
          isOwner: false,
          businessType: 'Supermarket',
          permissions: ['billing:create'],
        },
      ];
      mockWorkspaceState.isStoreCreationEligible = false; // employee-only is not eligible to create stores

      render(<WorkspaceSelector />);

      expect(screen.getByText('Metro Mart')).toBeInTheDocument();
      expect(screen.getByText('🛡️ Cashier')).toBeInTheDocument();
      expect(screen.queryByText('Create New Store')).not.toBeInTheDocument();
    });

    test('renders Situation D: Distinguishes stores owned vs employee stores (Priya)', () => {
      mockWorkspaceState.workspaces = [
        {
          storeId: 'store-b',
          storeName: 'Store B (Owned)',
          membershipType: 'owner',
          role: 'Owner',
          isOwner: true,
        },
        {
          storeId: 'store-a',
          storeName: 'Store A (Workplace)',
          membershipType: 'employee',
          role: 'Manager',
          isOwner: false,
          permissions: ['billing:create', 'inventory:add'],
        },
      ];
      mockWorkspaceState.isStoreCreationEligible = true;

      render(<WorkspaceSelector />);

      expect(screen.getByText(/Stores You Own/i)).toBeInTheDocument();
      expect(screen.getByText(/Stores Where You Work/i)).toBeInTheDocument();
      expect(screen.getByText('Store B (Owned)')).toBeInTheDocument();
      expect(screen.getByText('Store A (Workplace)')).toBeInTheDocument();
      expect(screen.getByText('👑 Owner')).toBeInTheDocument();
      expect(screen.getByText('🛡️ Manager')).toBeInTheDocument();
    });

    test('renders Situation E: Zero workspaces onboarding with eligibility notice', () => {
      mockWorkspaceState.workspaces = [];
      mockWorkspaceState.isStoreCreationEligible = true;

      render(<WorkspaceSelector />);

      expect(screen.getByText('No Active Workspaces Found')).toBeInTheDocument();
      expect(screen.getByText('Set Up Your First Store →')).toBeInTheDocument();
    });

    test('displays revoked banner when redirected with ?revoked=true', () => {
      mockGet.mockReturnValue('true');
      mockWorkspaceState.workspaces = [
        {
          storeId: 'store-valid',
          storeName: 'Valid Store',
          membershipType: 'owner',
          isOwner: true,
        },
      ];

      render(<WorkspaceSelector />);

      expect(screen.getByText('Store Access Notice')).toBeInTheDocument();
      expect(screen.getByText(/access to the previously selected store is no longer active/i)).toBeInTheDocument();
    });
  });
});

