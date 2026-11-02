'use client';

/**
 * PieChartView — doughnut / pie chart using react-chartjs-2.
 */
import { useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getColor } from '@/lib/visuals/colors';
import { tooltipFormatter, formatValue } from '@/lib/visuals/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChartView({ spec }) {
  const { title, data, valueFormat = 'number' } = spec;

  const total = data.reduce((s, d) => s + Number(d.value), 0);

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => Number(d.value)),
        backgroundColor: data.map((d, i) => (d.color || getColor(i)) + 'cc'),
        borderColor: data.map((d, i) => d.color || getColor(i)),
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    animation: { duration: 600 },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 11 },
          usePointStyle: true,
          pointStyleWidth: 8,
          generateLabels: (chart) =>
            chart.data.labels.map((label, i) => ({
              text: `${label} (${((Number(data[i]?.value) / total) * 100).toFixed(1)}%)`,
              fillStyle: chart.data.datasets[0].backgroundColor[i],
              strokeStyle: chart.data.datasets[0].borderColor[i],
              hidden: false,
              index: i,
            })),
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${tooltipFormatter(valueFormat)(ctx.parsed)} (${((ctx.parsed / total) * 100).toFixed(1)}%)`,
        },
      },
    },
  };

  return (
    <div className="w-full">
      {title && <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{title}</p>}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div style={{ width: '100%', maxWidth: 240, height: 200 }}>
          <Doughnut data={chartData} options={options} />
        </div>
        {/* Mobile legend below chart */}
        <div className="sm:hidden grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ background: d.color || getColor(i) }}
              />
              <span className="text-slate-600 truncate">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5 text-center font-bold">
        Total: {formatValue(total, valueFormat)}
      </p>
    </div>
  );
}

