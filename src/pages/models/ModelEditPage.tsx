import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModel } from './modelsHooks';
import ModelForm from './components/ModelForm';
import Skeleton from '../../components/ui/Skeleton';

export const ModelEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: model, isLoading, error } = useModel(id || '');

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 max-w-4xl mx-auto">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center max-w-4xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-150">Model Profile Not Found</h2>
        <p className="text-xs text-slate-500 max-w-xs">The model talent profile you are trying to edit does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/models')}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
        >
          Back to Talent Roster
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Model Profile Details</h1>
        <p className="text-xs text-slate-500">Update talent attributes, category, status, and portfolio for {model.name}.</p>
      </div>
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm">
        <ModelForm modelId={model.id} initialValues={model} onSuccess={() => navigate(`/models/${model.id}`)} />
      </div>
    </div>
  );
};

export default ModelEditPage;
