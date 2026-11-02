'use client';

/**
 * /dev/visuals — Visual demo page for all chart/table/KPI types.
 * Hardcoded sample specs for every VisualSpec type.
 * Only for development — remove or gate behind auth in production.
 */
import { VisualRenderer } from '@/features/visuals';

const SAMPLE_SPECS = [
  {
    type: 'kpi_cards',
    cards: [
      { label: 'Total Sales', value: 1500000, change: '+12% vs last month', trend: 'up', valueFormat: 'currency_inr' },
      { label: 'Products', value: 342, change: '+5 added', trend: 'up', valueFormat: 'number' },
      { label: 'Low Stock', value: 18, change: 'Needs attention', trend: 'down', valueFormat: 'number' },
      { label: 'Net Profit', value: 82000, change: '+₹5k', trend: 'up', valueFormat: 'currency_inr' },
    ],
  },
  {
    type: 'bar_chart',
    title: 'Sales by Category',
    xKey: 'category',
    series: [
      { key: 'sales', label: 'Sales (₹)' },
      { key: 'profit', label: 'Profit (₹)', color: '#10b981' },
    ],
    data: [
      { category: 'Grocery', sales: 85000, profit: 18000 },
      { category: 'Dairy', sales: 42000, profit: 9500 },
      { category: 'Snacks', sales: 67000, profit: 22000 },
      { category: 'Beverages', sales: 53000, profit: 11000 },
      { category: 'Staples', sales: 91000, profit: 25000 },
    ],
    valueFormat: 'currency_inr',
  },
  {
    type: 'line_chart',
    title: 'Sales Over Time (Last 7 Days)',
    xKey: 'date',
    series: [{ key: 'sales', label: 'Daily Sales' }],
    data: [
      { date: 'Mon', sales: 18000 },
      { date: 'Tue', sales: 22000 },
      { date: 'Wed', sales: 15000 },
      { date: 'Thu', sales: 28000 },
      { date: 'Fri', sales: 35000 },
      { date: 'Sat', sales: 42000 },
      { date: 'Sun', sales: 38000 },
    ],
    valueFormat: 'currency_inr',
  },
  {
    type: 'area_chart',
    title: 'Inventory Value Trend',
    xKey: 'month',
    series: [{ key: 'value', label: 'Inventory Value', color: '#6366f1' }],
    data: [
      { month: 'Jun', value: 250000 },
      { month: 'Jul', value: 280000 },
      { month: 'Aug', value: 260000 },
      { month: 'Sep', value: 310000 },
      { month: 'Oct', value: 338700 },
    ],
    valueFormat: 'currency_inr',
  },
  {
    type: 'pie_chart',
    title: 'Inventory by Category',
    data: [
      { label: 'Grocery', value: 85000, color: '#3b82f6' },
      { label: 'Dairy', value: 42000, color: '#10b981' },
      { label: 'Snacks', value: 67000, color: '#f59e0b' },
      { label: 'Beverages', value: 53000, color: '#8b5cf6' },
      { label: 'Staples', value: 91000, color: '#ef4444' },
    ],
    valueFormat: 'currency_inr',
  },
  {
    type: 'table',
    title: 'Low Stock Items',
    columns: [
      { key: 'product', label: 'Product', dataType: 'string' },
      { key: 'stock', label: 'Stock', dataType: 'number', sortable: true },
      { key: 'reorderLevel', label: 'Reorder At', dataType: 'number' },
      { key: 'value', label: 'Value', dataType: 'currency_inr', sortable: true },
      { key: 'status', label: 'Status', dataType: 'badge' },
      { key: 'expiry', label: 'Expiry', dataType: 'date' },
    ],
    rows: [
      { product: 'Amul Butter 500g', stock: 3, reorderLevel: 10, value: 1350, status: 'Low Stock', expiry: '2025-01-15' },
      { product: 'Tata Salt 1kg', stock: 0, reorderLevel: 20, value: 0, status: 'Out of Stock', expiry: '2026-06-01' },
      { product: 'Parle-G 800g', stock: 8, reorderLevel: 15, value: 2400, status: 'Low Stock', expiry: '2025-03-20' },
      { product: 'Aashirvaad Atta 5kg', stock: 12, reorderLevel: 25, value: 9600, status: 'OK', expiry: '2025-08-10' },
      { product: 'Maggi 12pk', stock: 0, reorderLevel: 10, value: 0, status: 'Out of Stock', expiry: '2025-02-28' },
    ],
    pageSize: 5,
  },
];

export default function VisualsDemoPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">Visual Components Demo</h1>
          <p className="text-sm text-slate-500 mt-1">All VyaparSathi chart and table types — for development testing only.</p>
        </div>
        <div className="space-y-6">
          {SAMPLE_SPECS.map((spec, i) => (
            <div key={i}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {spec.type.replace(/_/g, ' ')}
              </p>
              <VisualRenderer spec={spec} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

