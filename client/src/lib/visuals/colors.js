/**
 * Consistent color palette for all VyaparSathi charts.
 * Uses a blue-indigo-emerald-amber-rose family for brand consistency.
 */

export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
];

export const TREND_COLORS = {
  up: '#10b981',
  down: '#ef4444',
  flat: '#64748b',
};

export const BADGE_COLORS = {
  'Low Stock': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Out of Stock': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'OK': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Expiring Soon': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Active': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Inactive': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  default: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

/**
 * Get a color by index (cycles if index >= palette length).
 */
export function getColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Get badge classes for a given status string.
 */
export function getBadgeClasses(value) {
  return BADGE_COLORS[value] || BADGE_COLORS.default;
}

