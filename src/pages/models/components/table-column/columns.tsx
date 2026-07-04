import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { IModel } from '../../../../interface/model';
import { Eye, Edit, Trash2 } from 'lucide-react';

const columnHelper = createColumnHelper<IModel>();

interface ModelColumnsProps {
  onOpenDetails: (model: IModel) => void;
  onOpenEdit: (model: IModel) => void;
  onDelete: (id: string, name: string) => void;
  ability: any;
}

export const getModelColumns = ({ onOpenDetails, onOpenEdit, onDelete, ability }: ModelColumnsProps) => [
  columnHelper.accessor(row => row.basicDeatils?.fullName, {
    id: 'fullName',
    header: 'Model',
    cell: info => {
      const model = info.row.original;
      const imageUrl = model.images?.[0]?.url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop';
      return (
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onOpenDetails(model)}>
          <img
            src={imageUrl}
            alt={model.basicDeatils?.fullName || ''}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-navy-border shrink-0 shadow-sm"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-205 group-hover:text-accent-600 transition-colors truncate">
              {model.basicDeatils?.fullName || ''}
            </span>
            <span className="text-[10px] text-slate-405 dark:text-slate-550 truncate font-medium">{model.basicDeatils?.email || ''}</span>
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor(row => row.basicDeatils?.gender, {
    id: 'gender',
    header: 'Gender',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue() || ''}</span>
  }),
  columnHelper.accessor(row => row.basicDeatils?.age, {
    id: 'age',
    header: 'Age',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{info.getValue() ? `${info.getValue()} yrs` : ''}</span>
  }),
  columnHelper.accessor(row => row.measurements?.height, {
    id: 'height',
    header: 'Height',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{info.getValue() || ''}</span>
  }),
  columnHelper.accessor(row => row.measurements?.weight, {
    id: 'weight',
    header: 'Weight',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue() ? `${info.getValue()} kg` : ''}</span>
  }),
  columnHelper.accessor(row => row.address?.country, {
    id: 'country',
    header: 'Country',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()?.name || ''}</span>
  }),
  columnHelper.accessor(row => row.address?.state, {
    id: 'state',
    header: 'State',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()?.name || ''}</span>
  }),
  columnHelper.accessor(row => row.address?.city, {
    id: 'city',
    header: 'City',
    cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()?.name || ''}</span>
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
            className="p-1.5 rounded border border-transparent text-green-600 hover:text-green-700 dark:text-green-405 dark:hover:text-green-300 hover:bg-green-50 hover:border-green-200/50 dark:hover:bg-green-950/20 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {ability.can('update', 'models') && (
            <button
              onClick={() => onOpenEdit(model)}
              title="Edit Details"
              className="p-1.5 rounded border border-transparent text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 hover:border-amber-200/50 dark:hover:bg-amber-950/20 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {ability.can('delete', 'models') && (
            <button
              onClick={() => onDelete(model.id, model.basicDeatils?.fullName || '')}
              title="Delete Profile"
              className="p-1.5 rounded border border-transparent text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 hover:border-red-200/50 dark:hover:bg-red-950/20 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      );
    }
  })
];
