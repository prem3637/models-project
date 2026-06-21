import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleForm } from './components/RoleForm';

export const RoleCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New Role</h1>
        <p className="text-xs text-slate-500">Configure global access tiers and map them to permission policies.</p>
      </div>
      <RoleForm
        selectedRole=""
        readOnly={false}
        onSuccess={() => navigate('/roles')}
        onCancel={() => navigate('/roles')}
      />
    </div>
  );
};

export default RoleCreatePage;
