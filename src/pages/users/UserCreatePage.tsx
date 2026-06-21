import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from './components/UserForm';

export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New User</h1>
        <p className="text-xs text-slate-500">Provide personal info, select a role tier, and set the user status.</p>
      </div>
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm">
        <UserForm onSuccess={() => navigate('/users')} />
      </div>
    </div>
  );
};

export default UserCreatePage;
