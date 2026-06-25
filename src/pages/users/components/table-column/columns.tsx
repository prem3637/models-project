import React, { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { IUser } from '../../../../interface/user';
import { Edit, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

const SortIcon = ({ column }: { column: any }) => {
  const sorted = column.getIsSorted();

  if (!sorted) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
  if (sorted === "asc") return <ArrowUp className="w-3 h-3 text-accent-600 dark:text-accent-400" />;
  return <ArrowDown className="w-3 h-3 text-accent-600 dark:text-accent-400" />;
};

const columnHelper = createColumnHelper<IUser>();

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
  const normalized = r.toLowerCase();
  if (normalized === 'admin' || normalized === 'super admin') return ROLE_META.admin;
  if (normalized === 'editor') return ROLE_META.editor;
  if (normalized === 'viewer') return ROLE_META.viewer;
  return {
    label: r.charAt(0).toUpperCase() + r.slice(1),
    color: 'text-sky-700 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    border: 'border-sky-200 dark:border-sky-800/30'
  };
};

const UserCell: React.FC<{ user: IUser; onView: (user: IUser) => void }> = ({ user, onView }) => {
  const [imgError, setImgError] = useState(false);
  const initials = user.fullName
    ? user.fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'U';

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onView(user)}
        className="w-9 h-9 shrink-0 rounded-full overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-300 font-bold text-sm cursor-pointer transition-transform hover:scale-105 focus:outline-none"
      >
        {user.profilePicture && !imgError ? (
          <img
            src={user.profilePicture}
            alt={user.fullName}
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </button>
      <div className="flex flex-col min-w-0">
        <button
          onClick={() => onView(user)}
          className="font-bold text-slate-800 dark:text-slate-100 truncate hover:text-accent-600 dark:hover:text-accent-400 text-left transition-colors cursor-pointer focus:outline-none"
        >
          {user.fullName}
        </button>
        <span className="text-[10px] text-slate-400 dark:text-slate-555 truncate">{user.email}</span>
      </div>
    </div>
  );
};

interface UserColumnsProps {
  onView: (user: IUser) => void;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
  ability: any;
}

export const getUserColumns = ({ onView, onEdit, onDelete, ability }: UserColumnsProps) => [
  columnHelper.accessor('fullName', {
    header: 'User',
    cell: info => {
      const user = info.row.original;
      return <UserCell user={user} onView={onView} />;
    }
  }),
  columnHelper.accessor('department', {
    header: 'Department',
    cell: info => <span className="font-medium text-slate-600 dark:text-slate-300">{info.getValue()}</span>
  }),
  columnHelper.accessor(row => row.role?.name || '', {
    id: 'role',
    header: 'Role',
    cell: info => {
      const roleName = info.getValue() || 'User';
      const rm = getRoleMeta(roleName);
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
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${info.getValue() === 'Active'
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-red-50 text-red-600 border-red-200'
        }`}>
        {info.getValue()}
      </span>
    )
  }),
  columnHelper.accessor('lastLogin', {
    header: 'Last Login',
    cell: info => (
      <span className="text-slate-400 dark:text-slate-400 font-medium text-xs">
        {info.getValue()
          ? new Date(info.getValue()!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Never Used'}
      </span>
    )
  }),
  columnHelper.accessor('createdAt', {
    header: ({ column }) => (
      <div className="flex gap-2 items-center text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer">
        Created At
        <SortIcon column={column} />
      </div>
    ),
    cell: info => (
      <span className="text-slate-550 dark:text-slate-405 font-medium text-xs">
        {info.getValue()
          ? new Date(info.getValue()!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : '—'}
      </span>
    )
  }),
  columnHelper.accessor('updatedAt', {
    header: ({ column }) => (
      <div className="flex gap-2 items-center text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer">
        Updated At
        <SortIcon column={column} />
      </div>
    ),
    cell: info => (
      <span className="text-slate-550 dark:text-slate-405 font-medium text-xs">
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
              className="p-1.5 rounded border border-transparent text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 hover:border-amber-200/50 dark:hover:bg-amber-950/20 dark:hover:border-amber-900/30 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(user)}
              title="Delete User"
              className="p-1.5 rounded border border-transparent text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 hover:border-red-200/50 dark:hover:bg-red-950/20 dark:hover:border-red-900/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      );
    }
  })
];
