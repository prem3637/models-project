import React from 'react';

export interface IUnauthorizedProps {
  message?: string;
}

export const Unauthorized: React.FC<IUnauthorizedProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl max-w-lg mx-auto mt-10 shadow-sm">
    <div className="text-4xl text-red-500 mb-2">⛔</div>
    <h2 className="text-xl font-bold text-red-700 dark:text-red-500 mb-1">Unauthorized</h2>
    <p className="text-slate-600 dark:text-slate-400">{message || 'You do not have permission to view this content.'}</p>
  </div>
);

export default Unauthorized;
