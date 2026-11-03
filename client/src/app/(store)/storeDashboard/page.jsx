'use client';

import React, { Suspense } from 'react';
import WorkspaceSelector from '@/features/workspace/components/WorkspaceSelector';
import PageLoader from '@/components/PageLoader';

export default function StoreDashboardPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading workspaces..." />}>
      <WorkspaceSelector />
    </Suspense>
  );
}
