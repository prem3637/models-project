import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UserForm from './components/UserForm';

export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 w-full">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer w-fit focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users list
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New User</h1>
          <p className="text-xs text-slate-500">Provide personal info, select a role tier, and set the user status.</p>
        </div>
      </div>
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-5 rounded-2xl shadow-sm">
        <UserForm onSuccess={() => navigate('/users')} />
      </div>
    </div>
  );
};

export default UserCreatePage;
