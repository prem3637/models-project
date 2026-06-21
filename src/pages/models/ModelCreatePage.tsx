import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModelForm from './components/ModelForm';

export const ModelCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add New Model Profile</h1>
        <p className="text-xs text-slate-500">Provide details, categories, portfolio images, and bio for the new talent.</p>
      </div>
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm">
        <ModelForm onSuccess={() => navigate('/models')} />
      </div>
    </div>
  );
};

export default ModelCreatePage;
