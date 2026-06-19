import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import Button from '../../../../components/ui/Button';

export interface RoleRowData {
  roleKey: string;
  label: string;
  desc: string;
  userCount: number;
}

const columnHelper = createColumnHelper<RoleRowData>();

interface RoleColumnsProps {
  onConfigure: (roleKey: string) => void;
  onDelete: (roleKey: string) => void;
  getRoleMeta: (r: string) => any;
}

export const getRoleColumns = ({ onConfigure, onDelete, getRoleMeta }: RoleColumnsProps) => [
  columnHelper.accessor('label', {
    header: 'Role',
    cell: info => {
      const row = info.row.original;
      const rm = getRoleMeta(row.roleKey);
      return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${rm.bg} ${rm.color} border ${rm.border}`}>
          {info.getValue()}
        </span>
      );
    }
  }),
  columnHelper.accessor('desc', {
    header: 'Description',
    cell: info => (
      <span className="text-slate-555 dark:text-slate-405 font-medium leading-relaxed">
        {info.getValue()}
      </span>
    )
  }),
  columnHelper.accessor('userCount', {
    header: 'Assigned Users',
    cell: info => (
      <span className="font-bold text-slate-700 dark:text-slate-350">
        {info.getValue()} {info.getValue() === 1 ? 'user' : 'users'}
      </span>
    )
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: info => {
      const row = info.row.original;
      const isDefault = ['admin', 'editor', 'viewer'].includes(row.roleKey);

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onConfigure(row.roleKey)}
            className="text-[10px] font-bold uppercase tracking-wider dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800 border cursor-pointer px-2.5 py-1.5"
          >
            Configure
          </Button>
          
          {!isDefault && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDelete(row.roleKey)}
              className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-655 dark:text-red-400 dark:hover:text-red-300 border border-red-200 hover:border-red-300 dark:border-red-950 dark:hover:border-red-900 dark:bg-[#1a0f0f] cursor-pointer px-2.5 py-1.5"
            >
              Delete
            </Button>
          )}
        </div>
      );
    }
  })
];
