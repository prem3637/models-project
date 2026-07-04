import React, { useState } from 'react';

interface GenderDistributionProps {
  stats: {
    totalModels?: number;
    genderBreakdown?: {
      Male?: number;
      Female?: number;
      Other?: number;
    };
  };
}

export const GenderDistribution: React.FC<GenderDistributionProps> = ({ stats }) => {
  const [hoveredDonut, setHoveredDonut] = useState<string | null>(null);

  const totalModels = stats?.totalModels || 0;
  const maleCount = stats?.genderBreakdown?.Male || 0;
  const femaleCount = stats?.genderBreakdown?.Female || 0;
  const otherCount = stats?.genderBreakdown?.Other || 0;
  const totalGender = maleCount + femaleCount + otherCount;

  const malePercent = totalGender > 0 ? Math.round((maleCount / totalGender) * 100) : 0;
  const femalePercent = totalGender > 0 ? Math.round((femaleCount / totalGender) * 100) : 0;
  const otherPercent = totalGender > 0 ? Math.round((otherCount / totalGender) * 100) : 0;

  // Donut Chart calculations
  const radius = 50;
  const circ = 2 * Math.PI * radius; // ~314.16
  const strokeWidth = 12;

  const femaleLength = (femalePercent / 100) * circ;
  const maleLength = (malePercent / 100) * circ;
  const otherLength = (otherPercent / 100) * circ;

  const femaleOffset = 0;
  const maleOffset = circ - femaleLength;
  const otherOffset = circ - femaleLength - maleLength;

  return (
    <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Gender Distribution</h2>
        <p className="text-xs text-slate-500 dark:text-slate-405 mb-6">Breakdown of talent by gender orientation</p>

        <div className="flex items-center justify-center relative my-6">
          <svg width="150" height="150" viewBox="0 0 120 120" className="transform -rotate-90 select-none overflow-visible">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              className="stroke-slate-100 dark:stroke-slate-805"
              strokeWidth={strokeWidth}
            />

            {femalePercent > 0 && (
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                className="stroke-accent-500 transition-all duration-300 cursor-pointer"
                strokeWidth={hoveredDonut === 'Female' ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${femaleLength} ${circ - femaleLength}`}
                strokeDashoffset={femaleOffset}
                onMouseEnter={() => setHoveredDonut('Female')}
                onMouseLeave={() => setHoveredDonut(null)}
              />
            )}

            {malePercent > 0 && (
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                className="stroke-indigo-500 transition-all duration-300 cursor-pointer"
                strokeWidth={hoveredDonut === 'Male' ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${maleLength} ${circ - maleLength}`}
                strokeDashoffset={maleOffset}
                onMouseEnter={() => setHoveredDonut('Male')}
                onMouseLeave={() => setHoveredDonut(null)}
              />
            )}

            {otherPercent > 0 && (
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                className="stroke-amber-500 transition-all duration-300 cursor-pointer"
                strokeWidth={hoveredDonut === 'Other' ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${otherLength} ${circ - otherLength}`}
                strokeDashoffset={otherOffset}
                onMouseEnter={() => setHoveredDonut('Other')}
                onMouseLeave={() => setHoveredDonut(null)}
              />
            )}
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            {hoveredDonut ? (
              <>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{hoveredDonut}</span>
                <span className="text-lg font-black text-slate-800 dark:text-white">
                  {hoveredDonut === 'Female' ? femalePercent : hoveredDonut === 'Male' ? malePercent : otherPercent}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Models</span>
                <span className="text-xl font-black text-slate-800 dark:text-white">{totalModels}</span>
              </>
            )}
          </div>
        </div>

        {/* Legend list */}
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-navy-border text-xs font-semibold">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-500" />
              <span className="text-slate-600 dark:text-slate-405">Female ({femaleCount})</span>
            </div>
            <span>{femalePercent}%</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-405">Male ({maleCount})</span>
            </div>
            <span>{malePercent}%</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-405">Other ({otherCount})</span>
            </div>
            <span>{otherPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderDistribution;
