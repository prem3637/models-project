import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { SystemUser } from '../../usersDb';
import { Edit, Trash2 } from 'lucide-react';

const columnHelper = createColumnHelper<SystemUser>();

const ROLE_META = {
  admin: {
    label: 'Admin',
    color: 'text-violet-750 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-200 dark:border-violet-900/30'
  },
  editor: {
    label: 'Editor',
    color: 'text-accent-700 dark:text-accent-400',
    bg: 'bg-accent-50 dark:bg-accent-950/20',
    border: 'border-accent-200 dark:border-accent-800/30'
  },
  viewer: {
    label: 'Viewer',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-navy-950/50',
    border: 'border-slate-200 dark:border-navy-border'
  }
};

export const getRoleMeta = (r: string) => {
  if (r === 'admin') return ROLE_META.admin;
  if (r === 'editor') return ROLE_META.editor;
  if (r === 'viewer') return ROLE_META.viewer;
  return {
    label: r.charAt(0).toUpperCase() + r.slice(1),
    color: 'text-sky-700 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    border: 'border-sky-200 dark:border-sky-800/30'
  };
};

interface UserColumnsProps {
  onEdit: (user: SystemUser) => void;
  onDelete: (user: SystemUser) => void;
  ability: any;
}

export const getUserColumns = ({ onEdit, onDelete, ability }: UserColumnsProps) => [
  columnHelper.accessor('name', {
    header: 'User',
    cell: info => {
      const user = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 shadow-sm">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-accent-100 text-accent-700 flex items-center justify-center font-bold text-sm">
                {user.name[0]}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-550 truncate">{user.email}</span>
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor('department', {
    header: 'Department',
    cell: info => <span className="font-medium text-slate-600 dark:text-slate-300">{info.getValue()}</span>
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    cell: info => {
      const roleVal = info.getValue();
      const rm = getRoleMeta(roleVal);
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${rm.bg} ${rm.color} ${rm.border}`}>
          {rm.label}
        </span>
      );
    }
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
        info.getValue() === 'Active'
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-red-50 text-red-650 border-red-200'
      }`}>
        {info.getValue()}
      </span>
    )
  }),
  columnHelper.accessor('lastLogin', {
    header: 'Last Login',
    cell: info => (
      <span className="text-slate-500 font-medium text-xs">
        {info.getValue()
          ? new Date(info.getValue()!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : '—'}
      </span>
    )
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: info => {
      const user = info.row.original;
      const canUpdate = ability.can('update', 'users');
      const canDelete = ability.can('delete', 'users');

      if (!canUpdate && !canDelete) {
        return <span className="text-slate-400 font-medium text-xs">—</span>;
      }

      return (
        <div className="flex items-center gap-1.5">
          {canUpdate && (
            <button
              onClick={() => onEdit(user)}
              title="Edit User"
              className="p-1.5 rounded bg-slate-100 hover:bg-accent-50 text-slate-600 hover:text-accent-600 transition-colors border border-slate-200 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(user)}
              title="Delete User"
              className="p-1.5 rounded bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-650 transition-colors border border-slate-200 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      );
    }
  })
];
