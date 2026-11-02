'use client';

/**
 * BarChartView — responsive bar chart using react-chartjs-2.
 * Supports grouped and single-series bars.
 * Indian number formatting on axes and tooltips.
 */
import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getColor } from '@/lib/visuals/colors';
import { axisFormatter, tooltipFormatter } from '@/lib/visuals/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChartView({ spec }) {
  const chartRef = useRef(null);
  const { title, xKey, series, data, valueFormat = 'number' } = spec;

  const labels = data.map((row) => String(row[xKey] ?? ''));

  const datasets = series.map((s, i) => ({
    label: s.label,
    data: data.map((row) => Number(row[s.key] ?? 0)),
    backgroundColor: s.color || getColor(i) + 'cc',
    borderColor: s.color || getColor(i),
    borderWidth: 1.5,
    borderRadius: 6,
    borderSkipped: false,
  }));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top',
        labels: { font: { size: 11, weight: '700' }, usePointStyle: true, pointStyleWidth: 8 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${tooltipFormatter(valueFormat)(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, maxRotation: 30 },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 }, callback: axisFormatter(valueFormat) },
      },
    },
  };

  return (
    <div className="w-full">
      {title && <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{title}</p>}
      <div style={{ width: '100%', height: 220 }}>
        <Bar ref={chartRef} data={{ labels, datasets }} options={options} />
      </div>
    </div>
  );
}

