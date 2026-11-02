'use client';

/**
 * KpiCardsView — grid of KPI cards with trend arrows.
 * Mobile-first: 2 columns on mobile, 3-4 on desktop.
 */
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatValue } from '@/lib/visuals/formatters';
import { TREND_COLORS } from '@/lib/visuals/colors';

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4" style={{ color: TREND_COLORS.up }} />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4" style={{ color: TREND_COLORS.down }} />;
  return <Minus className="h-4 w-4" style={{ color: TREND_COLORS.flat }} />;
};

const trendTextColor = (trend) => {
  if (trend === 'up') return 'text-emerald-600';
  if (trend === 'down') return 'text-red-500';
  return 'text-slate-500';
};

export default function KpiCardsView({ spec }) {
  const { cards } = spec;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm flex flex-col gap-1.5 hover:shadow-md transition-shadow"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
            {card.label}
          </p>
          <p className="text-xl font-black text-slate-900 leading-tight">
            {formatValue(card.value, card.valueFormat || 'number')}
          </p>
          {(card.change || card.trend) && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trendTextColor(card.trend)}`}>
              <TrendIcon trend={card.trend || 'flat'} />
              {card.change && <span>{card.change}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

