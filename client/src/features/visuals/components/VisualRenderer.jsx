'use client';

/**
 * VisualRenderer — the main entry point.
 *
 * 1. Validates the incoming spec with Zod safeParse.
 * 2. Switches on `type` to render the correct component.
 * 3. Falls back to <VisualErrorFallback> on validation failure.
 *
 * Never throws — always renders something.
 */
import dynamic from 'next/dynamic';
import { parseVisualSpec } from '@/lib/visuals/schema';
import VisualErrorFallback from './VisualErrorFallback';

// Dynamic imports keep chart libs out of the initial bundle.
const KpiCardsView = dynamic(() => import('./KpiCardsView'), { ssr: false });
const BarChartView = dynamic(() => import('./BarChartView'), { ssr: false });
const LineChartView = dynamic(() => import('./LineChartView'), { ssr: false });
const AreaChartView = dynamic(() => import('./AreaChartView'), { ssr: false });
const PieChartView = dynamic(() => import('./PieChartView'), { ssr: false });
const DataTableView = dynamic(() => import('./DataTableView'), { ssr: false });

function renderSpec(spec) {
  switch (spec.type) {
    case 'kpi_cards':
      return <KpiCardsView spec={spec} />;
    case 'bar_chart':
      return <BarChartView spec={spec} />;
    case 'line_chart':
      return <LineChartView spec={spec} />;
    case 'area_chart':
      return <AreaChartView spec={spec} />;
    case 'pie_chart':
      return <PieChartView spec={spec} />;
    case 'table':
      return <DataTableView spec={spec} />;
    default:
      return <VisualErrorFallback errors={`Unknown visual type: ${spec?.type}`} />;
  }
}

export default function VisualRenderer({ spec }) {
  if (!spec || typeof spec !== 'object') {
    return <VisualErrorFallback errors="Received empty or non-object spec" />;
  }

  const result = parseVisualSpec(spec);

  if (!result.success) {
    console.warn('[VisualRenderer] Invalid spec:', result.error);
    return <VisualErrorFallback errors={result.error?.issues} />;
  }

  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm my-2">
      {renderSpec(result.data)}
      {result.data.description && (
        <p className="mt-2 text-[11px] text-slate-400 font-medium">{result.data.description}</p>
      )}
    </div>
  );
}

