import React from 'react';
import { useModels } from './modelsHooks';
import { Link } from 'react-router-dom';

export const ModelDashboard: React.FC = () => {
  const { data: models = [], isLoading } = useModels();

  // Metrics calculations
  const totalModels = models.length;
  const activeModels = models.filter(m => m.status === 'Active').length;
  const avgAge = totalModels > 0 ? Math.round(models.reduce((acc, m) => acc + m.age, 0) / totalModels) : 0;
  const avgHeight = totalModels > 0 ? Math.round(models.reduce((acc, m) => acc + m.height, 0) / totalModels) : 0;

  // Count by categories for a custom SVG bar chart
  const categoriesCount = models.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryLabels = ['Fashion', 'Commercial', 'Runway', 'Fitness'];

  // Recent 3 models
  const recentModels = [...models].slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        {/* Stats row skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        {/* Main Grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[340px] bg-slate-200 rounded-2xl" />
          <div className="h-[340px] bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-slate-800">
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-accent-500/25 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Talent</span>
            <span className="text-3xl font-extrabold text-slate-900">{totalModels}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-600 border border-accent-200/50 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-accent-500/25 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Bookings</span>
            <span className="text-3xl font-extrabold text-green-600">{activeModels}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 border border-green-200/50 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-accent-500/25 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Age</span>
            <span className="text-3xl font-extrabold text-slate-900">{avgAge} <span className="text-sm font-normal text-slate-400">yrs</span></span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/50 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-accent-500/25 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Height</span>
            <span className="text-3xl font-extrabold text-slate-900">{avgHeight} <span className="text-sm font-normal text-slate-400">cm</span></span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/50 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Statistics Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:col-span-2 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">Categories Distribution</h2>
          <p className="text-xs text-slate-500 mb-6">Proportion of talent pool categorized by modeling fields</p>

          <div className="flex flex-col gap-4 mt-2">
            {categoryLabels.map(label => {
              const count = categoriesCount[label] || 0;
              const percent = totalModels > 0 ? Math.round((count / totalModels) * 100) : 0;
              return (
                <div key={label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 font-bold">{label}</span>
                    <span className="text-slate-500">
                      {count} {count === 1 ? 'model' : 'models'} ({percent}%)
                    </span>
                  </div>
                  {/* Custom progress bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
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

        {/* Recently Added Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Recently Registered</h2>
            <p className="text-xs text-slate-500 mb-6">Latest talent profiles added to the system</p>

            <div className="flex flex-col gap-4">
              {recentModels.length > 0 ? (
                recentModels.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                        {m.category} • {m.age} yrs
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        m.status === 'Active'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : m.status === 'On-Leave'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">No models added yet</div>
              )}
            </div>
          </div>

          <Link
            to="/models"
            className="mt-6 w-full py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-lg text-accent-600 hover:text-accent-700 transition-colors text-center border border-slate-200 uppercase tracking-wider"
          >
            Manage Talent Pool
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModelDashboard;
