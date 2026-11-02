/**
 * Indian number formatting utilities.
 * Uses lakh/crore notation with ₹ prefix for currency.
 */

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/**
 * Format a raw number into a short Indian-style label.
 * e.g. 1500000 → "₹15L"  |  12500000 → "₹1.25Cr"
 */
export function formatInr(value, short = false) {
  const num = Number(value);
  if (isNaN(num)) return '—';
  if (short) {
    if (Math.abs(num) >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(2)}Cr`;
    if (Math.abs(num) >= 1_00_000) return `₹${(num / 1_00_000).toFixed(2)}L`;
    if (Math.abs(num) >= 1_000) return `₹${(num / 1_000).toFixed(1)}k`;
    return `₹${INR_FORMATTER.format(num)}`;
  }
  return `₹${INR_FORMATTER.format(num)}`;
}

export function formatNumber(value, short = false) {
  const num = Number(value);
  if (isNaN(num)) return '—';
  if (short) {
    if (Math.abs(num) >= 1_00_00_000) return `${(num / 1_00_00_000).toFixed(2)}Cr`;
    if (Math.abs(num) >= 1_00_000) return `${(num / 1_00_000).toFixed(2)}L`;
    if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  }
  return INR_FORMATTER.format(num);
}

export function formatPercent(value) {
  const num = Number(value);
  if (isNaN(num)) return '—';
  return `${num.toFixed(1)}%`;
}

/**
 * Format a value based on its valueFormat type.
 */
export function formatValue(value, format = 'number', short = false) {
  switch (format) {
    case 'currency_inr':
      return formatInr(value, short);
    case 'percent':
      return formatPercent(value);
    default:
      return formatNumber(value, short);
  }
}

/**
 * Axis tick formatter — always short form for chart axes.
 */
export function axisFormatter(format) {
  return (value) => formatValue(value, format, true);
}

/**
 * Tooltip formatter — full precision.
 */
export function tooltipFormatter(format) {
  return (value) => formatValue(value, format, false);
}

