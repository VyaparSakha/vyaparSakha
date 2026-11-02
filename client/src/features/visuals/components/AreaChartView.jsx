'use client';

/**
 * AreaChartView — filled area chart using react-chartjs-2.
 */
import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getColor } from '@/lib/visuals/colors';
import { axisFormatter, tooltipFormatter } from '@/lib/visuals/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AreaChartView({ spec }) {
  const chartRef = useRef(null);
  const { title, xKey, series, data, valueFormat = 'number' } = spec;

  const labels = data.map((row) => String(row[xKey] ?? ''));

  const datasets = series.map((s, i) => {
    const color = s.color || getColor(i);
    return {
      label: s.label,
      data: data.map((row) => Number(row[s.key] ?? 0)),
      borderColor: color,
      backgroundColor: color + '30',
      pointBackgroundColor: color,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
    };
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top',
        labels: { font: { size: 11, weight: '700' }, usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${tooltipFormatter(valueFormat)(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 30 } },
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
        <Line ref={chartRef} data={{ labels, datasets }} options={options} />
      </div>
    </div>
  );
}

