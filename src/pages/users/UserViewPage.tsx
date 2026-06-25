import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useGetUserDetailsQuery } from '../../redux/services/users';
import UserForm from './components/UserForm';
import Skeleton from '../../components/ui/Skeleton';

export const UserViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: userResponse, isLoading, error } = useGetUserDetailsQuery(id || '');
  const user = userResponse?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 w-full">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-5 rounded-2xl shadow-sm flex flex-col gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center w-full">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-150">User Not Found</h2>
        <p className="text-xs text-slate-500 max-w-xs">The user you are trying to view does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/users')}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
        >
          Back to Users
        </button>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">User Details</h1>
            <p className="text-xs text-slate-500">View personal details, permissions, and roles for {user.fullName}.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/users/${user.id}/edit`)}
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors cursor-pointer w-fit focus:outline-none"
          >
            <Edit className="w-4 h-4" />
            Edit User
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-5 rounded-2xl shadow-sm">
        <UserForm editing={user} onSuccess={() => navigate('/users')} readOnly={true} />
      </div>
    </div>
  );
};

export default UserViewPage;
