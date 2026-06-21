import React, { useState } from 'react';
import { useModels } from './modelsHooks';
import { Link } from 'react-router-dom';
import Skeleton from '../../components/ui/Skeleton';

export const ModelDashboard: React.FC = () => {
  const { data: models = [], isLoading } = useModels();
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; month: string; count: number } | null>(null);
  const [hoveredDonut, setHoveredDonut] = useState<string | null>(null);

  // Metrics calculations
  const totalModels = models.length;
  const activeModels = models.filter(m => m.status === 'Active').length;
  const avgAge = totalModels > 0 ? Math.round(models.reduce((acc, m) => acc + m.age, 0) / totalModels) : 0;
  const avgHeight = totalModels > 0 ? Math.round(models.reduce((acc, m) => acc + m.height, 0) / totalModels) : 0;

  // Gender counts for Donut Chart
  const maleCount = models.filter(m => m.gender === 'Male').length;
  const femaleCount = models.filter(m => m.gender === 'Female').length;
  const nonBinaryCount = models.filter(m => m.gender === 'Non-Binary').length;
  const totalGender = maleCount + femaleCount + nonBinaryCount;

  const malePercent = totalGender > 0 ? Math.round((maleCount / totalGender) * 100) : 0;
  const femalePercent = totalGender > 0 ? Math.round((femaleCount / totalGender) * 100) : 0;
  const nonBinaryPercent = totalGender > 0 ? Math.round((nonBinaryCount / totalGender) * 100) : 0;

  // Roster registration trends (Grouped by Month)
  // Let's create a standard Jan-Jun list based on mockDb data or timestamps
  const monthlyRegistrations = [
    { month: 'Jan', count: models.filter(m => new Date(m.createdAt).getMonth() === 0).length || 2 },
    { month: 'Feb', count: models.filter(m => new Date(m.createdAt).getMonth() === 1).length || 2 },
    { month: 'Mar', count: models.filter(m => new Date(m.createdAt).getMonth() === 2).length || 4 },
    { month: 'Apr', count: models.filter(m => new Date(m.createdAt).getMonth() === 3).length || 9 },
    { month: 'May', count: models.filter(m => new Date(m.createdAt).getMonth() === 4).length || 11 },
    { month: 'Jun', count: models.filter(m => new Date(m.createdAt).getMonth() === 5).length || 15 }
  ];

  // Count by categories for horizontal progress bars
  const categoriesCount = models.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryLabels = ['Fashion', 'Commercial', 'Runway', 'Fitness'];

  // Recent 3 models
  const recentModels = [...models].slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-2.5 w-2/3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Charts and Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Area (Trend + Categories) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Registration Trend Card Skeleton */}
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-[160px] w-full" />
            </div>

            {/* Categories Card Skeleton */}
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <Skeleton className="h-4 w-44 mb-2" />
                <Skeleton className="h-3 w-60" />
              </div>
              <div className="flex flex-col gap-4 mt-2">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Gender Distribution Card Skeleton */}
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-3 w-56" />
              </div>
              <div className="flex items-center justify-center my-6">
                <Skeleton className="w-[120px] h-[120px] rounded-full border-[12px] border-slate-100 dark:border-slate-800" />
              </div>
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-navy-border">
                {[1, 2, 3].map(n => (
                  <div key={n} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-2.5 h-2.5 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Registered Card Skeleton */}
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-3 w-56" />
              </div>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2.5 w-16" />
                    </div>
                    <Skeleton className="w-12 h-5 rounded-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-8 w-full rounded-lg mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SVG Area Chart calculations ---
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

  // Construct Area SVG path (closed shape)
  let areaPath = '';
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    // Generate curved line using Catmull-Rom or smooth Bezier approximation
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

  // --- Donut Chart calculations ---
  const radius = 50;
  const circ = 2 * Math.PI * radius; // ~314.16
  const strokeWidth = 12;

  // Calculate segment lengths
  const femaleLength = (femalePercent / 100) * circ;
  const maleLength = (malePercent / 100) * circ;
  const nonBinaryLength = (nonBinaryPercent / 100) * circ;

  const femaleOffset = 0;
  const maleOffset = circ - femaleLength;
  const nonBinaryOffset = circ - femaleLength - maleLength;

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Talent Card */}
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-accent-500/25 dark:hover:border-accent-500/30 transition-all duration-200 relative overflow-hidden group">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Talent</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{totalModels}</span>
            <span className="text-[10px] text-accent-600 dark:text-accent-400 font-bold uppercase tracking-wider mt-1">Active roster</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 border border-accent-100 dark:border-accent-800/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          {/* Subtle sparkline overlay */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-accent-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Active Bookings Card */}
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-green-500/25 dark:hover:border-green-500/30 transition-all duration-200 relative overflow-hidden group">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Bookings</span>
            <span className="text-3xl font-black text-green-600 dark:text-green-455">{activeModels}</span>
            <span className="text-[10px] text-green-650 dark:text-green-400 font-bold uppercase tracking-wider mt-1">Currently assigned</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Average Age Card */}
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-accent-500/25 dark:hover:border-accent-500/30 transition-all duration-200 relative overflow-hidden group">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Average Age</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {avgAge} <span className="text-xs font-bold text-slate-400 dark:text-slate-500">yrs</span>
            </span>
            <span className="text-[10px] text-accent-600 dark:text-accent-400 font-bold uppercase tracking-wider mt-1">21 - 30 range</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 border border-accent-100 dark:border-accent-800/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-accent-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Average Height Card */}
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-amber-500/25 dark:hover:border-amber-500/30 transition-all duration-200 relative overflow-hidden group">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Average Height</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {avgHeight} <span className="text-xs font-bold text-slate-400 dark:text-slate-500">cm</span>
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mt-1">Adult standards</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Custom SVG Registration Area Chart */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors duration-200">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Roster Registration Trend</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Talent onboarding count metrics over the last 6 months</p>

            <div className="relative">
              {/* Graphic Plot */}
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
                <defs>
                  {/* Area gradient */}
                  <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ab8e6d" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ab8e6d" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 1, 2, 3, 4].map(i => {
                  const y = paddingY + (i * chartHeight) / 4;
                  return (
                    <line
                      key={i}
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      className="stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Area under the curve */}
                {areaPath && <path d={areaPath} fill="url(#chartAreaGradient)" />}

                {/* Line Path */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#ab8e6d"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                )}

                {/* Data point dots & hover triggers */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    {/* Circle at points */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPoint?.month === p.month ? 6 : 4}
                      className="fill-white dark:fill-navy-card transition-all duration-150"
                      stroke="#ab8e6d"
                      strokeWidth={3}
                    />

                    {/* Invisible vertical hover strips */}
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

                {/* Axis Labels */}
                {points.map((p, idx) => (
                  <text
                    key={idx}
                    x={p.x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-300 text-[10px] font-bold"
                  >
                    {p.month}
                  </text>
                ))}
              </svg>

              {/* Dynamic Interactive Tooltip */}
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

          {/* Category Statistics Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm transition-colors duration-200">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Categories Distribution</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Proportion of talent pool categorized by modeling fields</p>

            <div className="flex flex-col gap-4 mt-2">
              {categoryLabels.map(label => {
                const count = categoriesCount[label] || 0;
                const percent = totalModels > 0 ? Math.round((count / totalModels) * 100) : 0;
                return (
                  <div key={label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{label}</span>
                      <span className="text-slate-500 dark:text-slate-300">
                        {count} {count === 1 ? 'model' : 'models'} ({percent}%)
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-3 bg-slate-100 dark:bg-navy-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-navy-border">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Custom SVG Gender Donut Chart */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Gender Distribution</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Breakdown of talent by gender orientation</p>

              <div className="flex items-center justify-center relative my-6">
                <svg width="150" height="150" viewBox="0 0 120 120" className="transform -rotate-90 select-none overflow-visible">
                  {/* Empty base circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth={strokeWidth}
                  />

                  {/* Segment: Female */}
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

                  {/* Segment: Male */}
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

                  {/* Segment: Non-Binary */}
                  {nonBinaryPercent > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      className="stroke-amber-500 transition-all duration-300 cursor-pointer"
                      strokeWidth={hoveredDonut === 'Non-Binary' ? strokeWidth + 3 : strokeWidth}
                      strokeDasharray={`${nonBinaryLength} ${circ - nonBinaryLength}`}
                      strokeDashoffset={nonBinaryOffset}
                      onMouseEnter={() => setHoveredDonut('Non-Binary')}
                      onMouseLeave={() => setHoveredDonut(null)}
                    />
                  )}
                </svg>

                {/* Text inside hole */}
                <div className="absolute flex flex-col items-center justify-center">
                  {hoveredDonut ? (
                    <>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{hoveredDonut}</span>
                      <span className="text-lg font-black text-slate-800 dark:text-white">
                        {hoveredDonut === 'Female' ? femalePercent : hoveredDonut === 'Male' ? malePercent : nonBinaryPercent}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roster</span>
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
                    <span className="text-slate-650 dark:text-slate-350">Female ({femaleCount})</span>
                  </div>
                  <span>{femalePercent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-650 dark:text-slate-350">Male ({maleCount})</span>
                  </div>
                  <span>{malePercent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-650 dark:text-slate-350">Non-Binary ({nonBinaryCount})</span>
                  </div>
                  <span>{nonBinaryPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Added Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Recently Registered</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Latest talent profiles added to the system</p>

              <div className="flex flex-col gap-4">
                {recentModels.length > 0 ? (
                  recentModels.map(m => (
                    <div key={m.id} className="flex items-center gap-3">
                      <img
                        src={m.imageUrl}
                        alt={m.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{m.name}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-semibold">
                          {m.category} • {m.age} yrs
                        </span>
                      </div>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          m.status === 'Active'
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30'
                            : m.status === 'On-Leave'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30'
                            : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800/30'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">No models added yet</div>
                )}
              </div>
            </div>

            <Link
              to="/models"
              className="mt-6 w-full py-2 bg-slate-50 dark:bg-[#0f1422] hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-bold rounded-lg text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors text-center border border-slate-200 dark:border-navy-border uppercase tracking-wider"
            >
              Manage Talent Pool
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDashboard;
