import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoleForm } from './components/RoleForm';

export const RoleViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Role Details</h1>
        <p className="text-xs text-slate-500">View configuration and assigned permissions for this access tier.</p>
      </div>
      <RoleForm
        selectedRole={id || ''}
        readOnly={true}
        onSuccess={() => navigate('/roles')}
        onCancel={() => navigate('/roles')}
      />
    </div>
  );
};

export default RoleViewPage;
