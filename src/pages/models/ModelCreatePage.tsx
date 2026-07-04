import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModelForm from './components/ModelForm';

export const ModelCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 w-full">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/models')}
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer w-fit focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Models List
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add New Model Profile</h1>
          <p className="text-xs text-slate-505">Provide details, categories, portfolio images, and bio for the new talent.</p>
        </div>
      </div>
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm">
        <ModelForm onSuccess={() => navigate('/models')} />
      </div>
    </div>
  );
};

export default ModelCreatePage;
