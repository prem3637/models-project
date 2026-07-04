import React from 'react';
import { formatCmToFeetInches } from '../../../utils/helperfunction';
import StatsCard from '../../../components/ui/StatsCard';

interface OverviewCardsProps {
  stats: {
    totalModels?: number;
    avgAge?: number;
    avgHeight?: number;
    genderBreakdown?: {
      Male?: number;
      Female?: number;
      Other?: number;
    };
  };
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats }) => {
  const totalModels = stats?.totalModels || 0;
  const avgAge = stats?.avgAge || 0;
  const avgHeight = stats?.avgHeight || 0;

  const maleCount = stats?.genderBreakdown?.Male || 0;
  const femaleCount = stats?.genderBreakdown?.Female || 0;
  const otherCount = stats?.genderBreakdown?.Other || 0;
  const totalGender = maleCount + femaleCount + otherCount;

  const femalePercent = totalGender > 0 ? Math.round((femaleCount / totalGender) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Talent Card */}
      <StatsCard
        title="Total Talent"
        value={String(totalModels)}
        bottomText="Active Models"
        variant="accent"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />

      {/* Female Talent Card */}
      <StatsCard
        title="Female Talent"
        value={String(femaleCount)}
        bottomText={`${femalePercent}% of talent pool`}
        variant="pink"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
      />

      {/* Average Age Card */}
      <StatsCard
        title="Average Age"
        value={
          <>
            {avgAge} <span className="text-xs font-bold text-slate-400 dark:text-slate-550">yrs</span>
          </>
        }
        bottomText="Adult Models"
        variant="accent"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />

      {/* Average Height Card */}
      <StatsCard
        title="Average Height"
        value={
          <>
            {formatCmToFeetInches(avgHeight)}
            <span className="text-xs font-bold text-slate-400 dark:text-slate-505 ml-1">({avgHeight} cm)</span>
          </>
        }
        bottomText="Height Mean"
        variant="amber"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        }
      />
    </div>
  );
};

export default OverviewCards;
