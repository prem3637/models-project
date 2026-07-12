import React from 'react';
import { Link } from 'react-router-dom';

interface RecentModelsProps {
  stats: {
    recentModels?: {
      id: string;
      fullName: string;
      imageUrl?: string;
      age: number;
    }[];
  };
}

export const RecentModels: React.FC<RecentModelsProps> = ({ stats }) => {
  const recentModels = stats?.recentModels || [];

  return (
    <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Recently Registered</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Latest talent profiles added to the system</p>

        <div className="flex flex-col gap-4">
          {recentModels.length > 0 ? (
            recentModels.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <img
                  src={m.imageUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                  alt={m.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{m.fullName}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-semibold">
                    {m.age} yrs
                  </span>
                </div>
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
  );
};

export default RecentModels;
