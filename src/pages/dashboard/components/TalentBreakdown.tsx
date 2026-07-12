import React from 'react';

interface BreakdownProps {
  stats: {
    modelTypeBreakdown?: Record<string, number>;
    bodyShapeBreakdown?: Record<string, number>;
    [key: string]: any;
  };
}

const colors = [
  'bg-accent-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
];

const getPercentage = (count: number, total: number) => {
  return total > 0 ? Math.round((count / total) * 100) : 0;
};

export const ModelTypeBreakdown: React.FC<BreakdownProps> = ({ stats }) => {
  const modelTypeData = stats?.modelTypeBreakdown || {};
  const totalModelTypes = Object.values(modelTypeData).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Model Types</h2>
        <p className="text-xs text-slate-550 dark:text-slate-405 mb-6">Distribution by modeling career levels</p>

        <div className="flex flex-col gap-4">
          {Object.keys(modelTypeData).length > 0 ? (
            Object.entries(modelTypeData).map(([type, count], idx) => {
              const percent = getPercentage(count, totalModelTypes);
              const color = colors[idx % colors.length];
              return (
                <div key={type} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-350">{type}</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {count} <span className="text-[10px] text-slate-400 font-normal">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-505 py-4">No model types data available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const BodyShapeBreakdown: React.FC<BreakdownProps> = ({ stats }) => {
  const bodyShapeData = stats?.bodyShapeBreakdown || {};
  const totalBodyShapes = Object.values(bodyShapeData).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Body Type Analytics</h2>
        <p className="text-xs text-slate-550 dark:text-slate-405 mb-6">Distribution by physical shapes</p>

        <div className="flex flex-col gap-4">
          {Object.keys(bodyShapeData).length > 0 ? (
            Object.entries(bodyShapeData).map(([shape, count], idx) => {
              const percent = getPercentage(count, totalBodyShapes);
              const color = colors[(idx + 2) % colors.length];
              return (
                <div key={shape} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-350">{shape}</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {count} <span className="text-[10px] text-slate-400 font-normal">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-505 py-4">No body shape data available</span>
          )}
        </div>
      </div>
    </div>
  );
};
