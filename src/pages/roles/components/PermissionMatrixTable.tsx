import React from 'react';
import { Check } from 'lucide-react';
import { PermissionModuleDto } from '../../../interface/role';

interface PermissionMatrixTableProps {
  actionsList: string[];
  modulesList: PermissionModuleDto[];
  selectedPermissionIds: string[];
  isDefaultRole: boolean;
  onCheckboxChange: (permId: string, checked: boolean) => void;
  onAllRowChange: (module: PermissionModuleDto, checkAll: boolean) => void;
  isRowAllChecked: (module: PermissionModuleDto) => boolean;
}

export const PermissionMatrixTable: React.FC<PermissionMatrixTableProps> = ({
  actionsList,
  modulesList,
  selectedPermissionIds,
  isDefaultRole,
  onCheckboxChange,
  onAllRowChange,
  isRowAllChecked,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[550px] text-xs text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-navy-950/40 border-b border-slate-200 dark:border-navy-border text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">
            <th className="py-4 px-6 font-bold">Module</th>
            {actionsList.map(action => (
              <th key={action} className="py-4 px-5 text-center font-bold capitalize">{action}</th>
            ))}
            <th className="py-4 px-5 text-center font-bold uppercase">All</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-navy-border">
          {modulesList.map(module => {
            const isAllChecked = isRowAllChecked(module);
            return (
              <tr key={module.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-slate-200">{module.label}</td>
                
                {/* Loop through dynamic action columns */}
                {actionsList.map(action => {
                  const perm = module.permissions.find(p => p.action === action);
                  const isNa = !perm;
                  const isChecked = perm ? selectedPermissionIds.includes(perm.id) : false;
                  
                  return (
                    <td key={action} className="py-4 px-5 text-center">
                      {isNa ? (
                        <span className="text-slate-350 dark:text-slate-600">—</span>
                      ) : (
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDefaultRole}
                            onChange={e => onCheckboxChange(perm.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                            isAllChecked 
                              ? 'bg-green-500 border-green-500 text-white shadow-sm shadow-green-500/10'
                              : isChecked
                              ? 'bg-accent-600 border-accent-600 text-white shadow-sm shadow-accent-500/10'
                              : 'bg-white dark:bg-[#0f1422] border-slate-300 dark:border-navy-border hover:border-slate-400 dark:hover:border-slate-600'
                          }`}>
                            {(isChecked || isAllChecked) && (
                              <Check className="w-2.5 h-2.5" />
                            )}
                          </div>
                        </label>
                      )}
                    </td>
                  );
                })}

                {/* ALL column */}
                <td className="py-4 px-5 text-center">
                  <label className="inline-flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllChecked}
                      disabled={isDefaultRole}
                      onChange={e => onAllRowChange(module, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                      isAllChecked 
                        ? 'bg-green-500 border-green-500 text-white shadow-sm shadow-green-500/10'
                        : 'bg-white dark:bg-[#0f1422] border-slate-300 dark:border-navy-border hover:border-slate-405'
                    }`}>
                      {isAllChecked && (
                        <Check className="w-2.5 h-2.5" />
                      )}
                    </div>
                  </label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionMatrixTable;
