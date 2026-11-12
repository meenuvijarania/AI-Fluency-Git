import { useState, useId } from 'react';
import { ProgressEntry } from '../../types/fitness';

interface TrendLineChartProps {
  history: ProgressEntry[];
  targetValue: number;
  unit: string;
  goalTitle: string;
  direction: 'decrease' | 'increase';
  themeColor?: string;
}

export function TrendLineChart({
  history,
  targetValue,
  unit,
  goalTitle,
  direction,
  themeColor = '#10B981', // emerald
}: TrendLineChartProps) {
  const gradientId = useId();
  const [hoveredPoint, setHoveredPoint] = useState<{
    entry: ProgressEntry;
    x: number;
    y: number;
  } | null>(null);

  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'ALL'>('ALL');

  if (!history || history.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No recorded history points yet
      </div>
    );
  }

  // Filter history based on time range
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let filtered = sorted;
  const now = new Date('2026-11-11').getTime(); // anchored to current applet date
  if (timeRange === '30D') {
    const cutoff = now - 30 * 24 * 60 * 60 * 1000;
    filtered = sorted.filter((p) => new Date(p.date).getTime() >= cutoff);
    if (filtered.length < 2) filtered = sorted.slice(-4);
  } else if (timeRange === '90D') {
    const cutoff = now - 90 * 24 * 60 * 60 * 1000;
    filtered = sorted.filter((p) => new Date(p.date).getTime() >= cutoff);
    if (filtered.length < 2) filtered = sorted.slice(-6);
  }

  const values = filtered.map((d) => d.value);
  const allValues = [...values, targetValue];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const rangePadding = (maxVal - minVal) * 0.15 || 2;
  const domainMin = Math.max(0, minVal - rangePadding);
  const domainMax = maxVal + rangePadding;

  // SVG dimensions
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (filtered.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (filtered.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(domainMin, Math.min(domainMax, val));
    const normalized = (clamped - domainMin) / (domainMax - domainMin);
    return padding.top + chartHeight - normalized * chartHeight;
  };

  // Generate SVG path for line
  const points = filtered.map((entry, i) => ({
    x: getX(i),
    y: getY(entry.value),
    entry,
  }));

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    // smooth cubic bezier curve
    const prev = points[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const targetY = getY(targetValue);

  // Compute delta stats
  const firstVal = filtered[0].value;
  const latestVal = filtered[filtered.length - 1].value;
  const totalDelta = latestVal - firstVal;
  const isProgressing = direction === 'decrease' ? totalDelta < 0 : totalDelta > 0;

  return (
    <div className="w-full">
      {/* Chart Sub-header with range controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span>Current: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{latestVal} {unit}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Target: <strong className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{targetValue} {unit}</strong></span>
          <span aria-hidden="true">·</span>
          <span className={`font-mono tabular-nums ${isProgressing ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {totalDelta > 0 ? `+${totalDelta.toFixed(1)}` : totalDelta.toFixed(1)} {unit}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          {(['30D', '90D', 'ALL'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                timeRange === r
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={themeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = padding.top + chartHeight * pct;
            const val = domainMax - pct * (domainMax - domainMin);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="2 3"
                  className="text-slate-200 dark:text-slate-800/80"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px] tabular-nums"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Target Value Guideline */}
          <line
            x1={padding.left}
            y1={targetY}
            x2={width - padding.right}
            y2={targetY}
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-75"
          />
          <text
            x={width - padding.right}
            y={targetY - 5}
            textAnchor="end"
            className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[10px] font-medium"
          >
            Target ({targetValue} {unit})
          </text>

          {/* Gradient area */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Trend line curve */}
          <path
            d={pathD}
            fill="none"
            stroke={themeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                className="fill-white dark:fill-slate-900 stroke-2"
                style={{ stroke: themeColor }}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="10"
                className="fill-transparent hover:fill-emerald-500/10 transition-colors"
              />
            </g>
          ))}

          {/* Date labels on X axis */}
          {points.map((pt, i) => {
            // Display label for first, last, and every 2nd or 3rd
            const showLabel =
              i === 0 ||
              i === points.length - 1 ||
              (points.length > 4 && i % Math.ceil(points.length / 4) === 0);
            if (!showLabel) return null;

            const dateStr = new Date(pt.entry.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <text
                key={`label-${i}`}
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px]"
              >
                {dateStr}
              </text>
            );
          })}
        </svg>

        {/* Floating tooltip */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900/95 dark:bg-slate-800/95 px-2.5 py-1.5 text-xs text-white shadow-lg border border-slate-700 backdrop-blur-xs"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 8}%`,
            }}
          >
            <div className="font-mono font-medium text-emerald-400 tabular-nums">
              {hoveredPoint.entry.value} {unit}
            </div>
            <div className="text-[10px] text-slate-300">
              {new Date(hoveredPoint.entry.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            {hoveredPoint.entry.note && (
              <div className="mt-1 text-[10px] italic text-slate-300 border-t border-slate-700/60 pt-0.5 max-w-[140px] truncate">
                {hoveredPoint.entry.note}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
