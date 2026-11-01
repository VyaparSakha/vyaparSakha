'use client';

import PageLoader from '@/components/PageLoader';

/**
 * StoreDashboardLoading
 * =====================
 * Rendered by Next.js App Router for dynamic subroute transitions inside [storeId].
 * Uses containment="content" so the left sidebar remains completely visible and interactive,
 * only covering the right content pane with the official Vyapar Sakha AI mascot loader.
 */
export default function StoreDashboardLoading() {
  return (
    <PageLoader
      message="Loading store workspace..."
      containment="content"
    />
  );
}

