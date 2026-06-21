import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export interface RoleRowData {
  roleId: string;
  roleKey: string;
  label: string;
  desc: string;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    onViewRole?: (roleId: string, roleName: string) => void;
    onEditRole?: (roleId: string, roleName: string) => void;
    onDeleteRole?: (roleId: string, roleName: string, userCount: number) => void;
  }
}

const SortIcon = ({ column }: { column: any }) => {
  const sorted = column.getIsSorted();

  if (!sorted) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
  if (sorted === "asc") return <ArrowUp className="w-3 h-3 text-accent-600 dark:text-accent-400" />;
  return <ArrowDown className="w-3 h-3 text-accent-600 dark:text-accent-400" />;
};

export const getRoleColumns = (): ColumnDef<RoleRowData, any>[] => [
  {
    accessorKey: 'label',
    header: () => (
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Role
      </span>
    ),
    cell: ({ getValue }) => (
      <span className="font-extrabold uppercase text-slate-800 dark:text-slate-200">
        {getValue<string>()}
      </span>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'desc',
    header: () => (
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Description
      </span>
    ),
    cell: ({ getValue }) => {
      const desc = getValue<string>() || '';
      return (
        <span className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-1" title={desc}>
          {desc}
        </span>
      );
    },
    enableSorting: false
  },
  {
    accessorKey: 'userCount',
    header: () => (
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Assigned Users
      </span>
    ),
    cell: ({ getValue }) => (
      <span className="font-bold text-slate-700 dark:text-slate-350">
        {getValue<number>()} {getValue<number>() === 1 ? 'user' : 'users'}
      </span>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <div className="flex gap-2 items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
        Created At
        <SortIcon column={column} />
      </div>
    ),
    cell: ({ getValue }) => (
      <span className="text-slate-600 dark:text-slate-400 font-medium">
        {new Date(getValue<string>()).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </span>
    )
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <div className="flex gap-2 items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
        Updated At
        <SortIcon column={column} />
      </div>
    ),
    cell: ({ getValue }) => (
      <span className="text-slate-600 dark:text-slate-400 font-medium">
        {new Date(getValue<string>()).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </span>
    )
  },
  {
    id: 'actions',
    header: () => (
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </span>
    ),
    enableSorting: false,
    cell: ({ row, table }) => {
      const role = row.original;
      const isDefault = ['admin', 'editor', 'viewer'].includes(role.roleKey);

      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              table.options.meta?.onViewRole?.(role.roleId, role.label);
            }}
            className="p-1.5 rounded border border-transparent text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 hover:border-green-200/50 dark:hover:bg-green-950/20 dark:hover:border-green-900/30 transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              table.options.meta?.onEditRole?.(role.roleId, role.label);
            }}
            className="p-1.5 rounded border border-transparent text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 hover:border-amber-200/50 dark:hover:bg-amber-950/20 dark:hover:border-amber-900/30 transition-colors cursor-pointer"
            title="Configure / Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          
          {!isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                table.options.meta?.onDeleteRole?.(role.roleId, role.label, role.userCount);
              }}
              className="p-1.5 rounded border border-transparent text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 hover:border-red-200/50 dark:hover:bg-red-950/20 dark:hover:border-red-900/30 transition-colors cursor-pointer"
              title="Delete Role"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      );
    }
  }
];
