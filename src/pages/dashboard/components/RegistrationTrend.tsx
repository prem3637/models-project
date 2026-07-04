import React, { useState } from 'react';

interface RegistrationTrendProps {
  stats: {
    monthlyRegistrations?: {
      month: string;
      count: number;
    }[];
  };
}

export const RegistrationTrend: React.FC<RegistrationTrendProps> = ({ stats }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; month: string; count: number } | null>(null);

  const monthlyRegistrations = stats?.monthlyRegistrations && stats.monthlyRegistrations.length > 0
    ? stats.monthlyRegistrations
    : [
        { month: 'Jan', count: 0 },
        { month: 'Feb', count: 0 },
        { month: 'Mar', count: 0 },
        { month: 'Apr', count: 0 },
        { month: 'May', count: 0 },
        { month: 'Jun', count: 0 }
      ];

  // SVG Area Chart calculations
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;
  const maxVal = Math.max(...monthlyRegistrations.map(d => d.count), 5);

  const points = monthlyRegistrations.map((d, index) => {
    const x = paddingX + (index * chartWidth) / (monthlyRegistrations.length - 1);
    const y = svgHeight - paddingY - (d.count * chartHeight) / maxVal;
    return { x, y, month: d.month, count: d.count };
  });

  // Construct Area SVG path
  let areaPath = '';
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
  }

  return (
    <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors duration-200">
      <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Model Registration Trend</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Talent onboarding count metrics over the last 6 months</p>

      <div className="relative">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ab8e6d" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ab8e6d" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map(i => {
            const y = paddingY + (i * chartHeight) / 4;
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                className="stroke-slate-100 dark:stroke-slate-805"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#chartAreaGradient)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#ab8e6d"
              strokeWidth={3}
              strokeLinecap="round"
            />
          )}

          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.month === p.month ? 6 : 4}
                className="fill-white dark:fill-navy-card transition-all duration-150"
                stroke="#ab8e6d"
                strokeWidth={3}
              />
              <rect
                x={p.x - 20}
                y={0}
                width={40}
                height={svgHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}

          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={svgHeight - 4}
              textAnchor="middle"
              className="fill-slate-505 dark:fill-slate-300 text-[10px] font-bold"
            >
              {p.month}
            </text>
          ))}
        </svg>

        {hoveredPoint && (
          <div
            style={{
              left: `${((hoveredPoint.x - paddingX) / chartWidth) * 80 + 10}%`,
              top: `${Math.max(hoveredPoint.y - 40, 10)}px`
            }}
            className="absolute p-2.5 bg-slate-900/95 dark:bg-slate-850/95 text-white border border-slate-800 rounded-lg shadow-xl text-center pointer-events-none flex flex-col gap-0.5 z-20 min-w-[70px] -translate-x-1/2"
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{hoveredPoint.month}</span>
            <span className="text-xs font-black">{hoveredPoint.count} Registered</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationTrend;
