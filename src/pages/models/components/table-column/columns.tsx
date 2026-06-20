import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { RBCModel } from '../../mockDb';
import { Eye, Edit, Trash2 } from 'lucide-react';

const columnHelper = createColumnHelper<RBCModel>();

interface ModelColumnsProps {
  onOpenDetails: (model: RBCModel) => void;
  onOpenEdit: (model: RBCModel) => void;
  onDelete: (id: string, name: string) => void;
  ability: any;
}

export const getModelColumns = ({ onOpenDetails, onOpenEdit, onDelete, ability }: ModelColumnsProps) => [
  columnHelper.accessor('name', {
    header: 'Model',
    cell: info => {
      const model = info.row.original;
      return (
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onOpenDetails(model)}>
          <img
            src={model.imageUrl}
            alt={model.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-navy-border shrink-0 shadow-sm"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-205 group-hover:text-accent-600 transition-colors truncate">
              {model.name}
            </span>
            <span className="text-[10px] text-slate-405 dark:text-slate-550 truncate font-medium">{model.email}</span>
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor('gender', {
    header: 'Gender',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()}</span>
  }),
  columnHelper.accessor('age', {
    header: 'Age',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{info.getValue()} yrs</span>
  }),
  columnHelper.accessor('height', {
    header: 'Height',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{info.getValue()} cm</span>
  }),
  columnHelper.accessor('weight', {
    header: 'Weight',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()} kg</span>
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    cell: info => (
      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-border rounded-md">
        {info.getValue()}
      </span>
    )
  }),
  columnHelper.accessor('country', {
    header: 'Country',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()}</span>
  }),
  columnHelper.accessor('state', {
    header: 'State',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()}</span>
  }),
  columnHelper.accessor('city', {
    header: 'City',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()}</span>
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => {
      const val = info.getValue();
      return (
        <span
          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            val === 'Active'
              ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30'
              : val === 'On-Leave'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30'
              : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-405 border border-slate-200 dark:border-slate-800/30'
          }`}
        >
          {val}
        </span>
      );
    }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: info => {
      const model = info.row.original;
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenDetails(model)}
            title="View Profile"
            className="p-1.5 rounded bg-slate-100 dark:bg-[#0f1422] hover:bg-slate-205 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors border border-slate-200 dark:border-navy-border cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {ability.can('update', 'models') && (
            <button
              onClick={() => onOpenEdit(model)}
              title="Edit Details"
              className="p-1.5 rounded bg-slate-100 dark:bg-[#0f1422] hover:bg-accent-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-405 transition-colors border border-slate-200 dark:border-navy-border cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {ability.can('delete', 'models') && (
            <button
              onClick={() => onDelete(model.id, model.name)}
              title="Delete Profile"
              className="p-1.5 rounded bg-slate-100 dark:bg-[#0f1422] hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-655 dark:text-slate-355 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-navy-border cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      );
    }
  })
];
