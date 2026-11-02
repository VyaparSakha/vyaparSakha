'use client';

/**
 * ChartSkeleton — animated loading skeleton for charts.
 * Shown while a tool is running (between tool_start and visual events).
 */
export default function ChartSkeleton({ type = 'chart' }) {
  if (type === 'kpi_cards') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-100 rounded-xl p-4 h-20" />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full animate-pulse space-y-2">
        <div className="h-8 bg-slate-100 rounded-lg w-full" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-slate-50 rounded-lg w-full" style={{ opacity: 1 - i * 0.15 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full animate-pulse">
      <div className="h-4 w-32 bg-slate-100 rounded mb-3" />
      <div className="h-[220px] bg-slate-50 rounded-xl flex items-end gap-2 px-4 pb-4">
        {[60, 85, 45, 95, 70, 80, 55].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-200 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

