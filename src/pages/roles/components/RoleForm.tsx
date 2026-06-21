import React, { useState, useEffect } from 'react';
import { DEFAULT_PERMISSIONS } from '../../../context/ability';
import Button from '../../../components/ui/Button';
import { ArrowLeft, Save, Check } from 'lucide-react';

type ModuleKey = 'Dashboard' | 'Model' | 'User' | 'Roles' | 'Settings';
type ActionKey = 'read' | 'create' | 'update' | 'delete';

const MODULES: { key: ModuleKey; label: string; actions: (ActionKey | 'N/A')[] }[] = [
  { key: 'Dashboard', label: 'Dashboard', actions: ['read', 'N/A', 'N/A', 'N/A'] },
  { key: 'Model', label: 'Model Management', actions: ['read', 'create', 'update', 'delete'] },
  { key: 'User', label: 'Users', actions: ['read', 'create', 'update', 'delete'] },
  { key: 'Roles', label: 'Roles', actions: ['read', 'create', 'update', 'delete'] },
  { key: 'Settings', label: 'Settings', actions: ['read', 'N/A', 'update', 'N/A'] }
];

const ROLE_META = {
  admin: {
    label: 'Admin',
    color: 'text-violet-750 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-200 dark:border-violet-900/30',
    desc: 'Full access: create, read, update, delete — all modules.'
  },
  editor: {
    label: 'Editor',
    color: 'text-accent-700 dark:text-accent-400',
    bg: 'bg-accent-50 dark:bg-accent-950/20',
    border: 'border-accent-200 dark:border-accent-800/30',
    desc: 'Can view and update models. Cannot create, delete, or access Settings.'
  },
  viewer: {
    label: 'Viewer',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-navy-950/50',
    border: 'border-slate-200 dark:border-navy-border',
    desc: 'Read-only access to Dashboard and Models roster.'
  }
};

const getRoleMeta = (r: string) => {
  const meta = (ROLE_META as any)[r];
  if (meta) return meta;

  // Try to load custom meta from localStorage
  let customDesc = 'Custom role configurations.';
  const savedMeta = localStorage.getItem('rbc_roles_metadata');
  if (savedMeta) {
    try {
      const metaObj = JSON.parse(savedMeta);
      if (metaObj[r] && metaObj[r].desc) {
        customDesc = metaObj[r].desc;
      }
    } catch {}
  }

  return {
    label: r.charAt(0).toUpperCase() + r.slice(1),
    color: 'text-sky-700 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    border: 'border-sky-200 dark:border-sky-800/30',
    desc: customDesc
  };
};

interface RoleFormProps {
  selectedRole: string; // '' for new, or role name key
  onSuccess: () => void;
  onCancel: () => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({ selectedRole, onSuccess, onCancel }) => {
  const [roleNameInput, setRoleNameInput] = useState('');
  const [roleDescription, setRoleDescription] = useState('');

  const [permissions, setPermissions] = useState<any>(() => {
    const saved = localStorage.getItem('rbc_role_permissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
  });



  // Keep state in sync when selectedRole changes or permissions load
  useEffect(() => {
    if (selectedRole === 'admin') {
      setRoleNameInput('Admin');
      setRoleDescription('Full access: create, read, update, delete — all modules.');
    } else if (selectedRole === 'editor') {
      setRoleNameInput('Editor');
      setRoleDescription('Can view and update models. Cannot create, delete, or access Settings.');
    } else if (selectedRole === 'viewer') {
      setRoleNameInput('Viewer');
      setRoleDescription('Read-only access to Dashboard and Models roster.');
    } else if (selectedRole === '') {
      setRoleNameInput('');
      setRoleDescription('');
    } else {
      setRoleNameInput(selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1));
      
      const savedMeta = localStorage.getItem('rbc_roles_metadata');
      let customDesc = 'Custom role configurations.';
      if (savedMeta) {
        try {
          const metaObj = JSON.parse(savedMeta);
          if (metaObj[selectedRole] && metaObj[selectedRole].desc) {
            customDesc = metaObj[selectedRole].desc;
          }
        } catch {}
      }
      setRoleDescription(customDesc);
    }
  }, [selectedRole]);

  const activePerms = permissions[selectedRole] || {
    Dashboard: { read: false },
    Model: { read: false, create: false, update: false, delete: false },
    User: { read: false, create: false, update: false, delete: false },
    Roles: { read: false, create: false, update: false, delete: false },
    Settings: { read: false, update: false }
  };

  const handleCheckboxChange = (module: ModuleKey, action: ActionKey, value: boolean) => {
    const updated = {
      ...permissions,
      [selectedRole || '']: {
        ...activePerms,
        [module]: {
          ...activePerms[module],
          [action]: value
        }
      }
    };
    setPermissions(updated);
  };

  const handleAllRowChange = (module: ModuleKey, checkAll: boolean) => {
    const moduleInfo = MODULES.find(m => m.key === module);
    if (!moduleInfo) return;

    const updatedModulePerms = { ...activePerms[module] };
    moduleInfo.actions.forEach(action => {
      if (action !== 'N/A') {
        updatedModulePerms[action] = checkAll;
      }
    });

    const updated = {
      ...permissions,
      [selectedRole || '']: {
        ...activePerms,
        [module]: updatedModulePerms
      }
    };
    setPermissions(updated);
  };

  const isRowAllChecked = (module: ModuleKey): boolean => {
    const moduleInfo = MODULES.find(m => m.key === module);
    if (!moduleInfo) return false;
    
    return moduleInfo.actions.every(action => {
      if (action === 'N/A') return true;
      return !!activePerms[module]?.[action];
    });
  };

  const getCheckedCountForModule = (module: ModuleKey): { checked: number; total: number } => {
    const moduleInfo = MODULES.find(m => m.key === module);
    if (!moduleInfo) return { checked: 0, total: 0 };
    
    let checked = 0;
    let total = 0;
    moduleInfo.actions.forEach(action => {
      if (action !== 'N/A') {
        total++;
        if (activePerms[module]?.[action]) checked++;
      }
    });
    return { checked, total };
  };

  const totalGrantedCount = MODULES.reduce((acc, m) => {
    return acc + getCheckedCountForModule(m.key).checked;
  }, 0);

  const handleSaveChanges = () => {
    const roleKey = roleNameInput.toLowerCase().trim();
    if (!roleKey) {
      alert('Role name is required');
      return;
    }

    const updatedPerms = {
      ...permissions,
      [roleKey]: activePerms
    };

    if (selectedRole && selectedRole !== roleKey && !['admin', 'editor', 'viewer'].includes(selectedRole)) {
      delete updatedPerms[selectedRole];
    }

    localStorage.setItem('rbc_role_permissions', JSON.stringify(updatedPerms));
    setPermissions(updatedPerms);

    const savedMeta = localStorage.getItem('rbc_roles_metadata');
    let metaObj: any = {};
    if (savedMeta) {
      try {
        metaObj = JSON.parse(savedMeta);
      } catch {}
    }
    
    if (!['admin', 'editor', 'viewer'].includes(roleKey)) {
      metaObj[roleKey] = {
        label: roleNameInput.trim(),
        desc: roleDescription.trim()
      };
    }

    if (selectedRole && selectedRole !== roleKey && !['admin', 'editor', 'viewer'].includes(selectedRole)) {
      delete metaObj[selectedRole];
    }

    localStorage.setItem('rbc_roles_metadata', JSON.stringify(metaObj));

    alert('Dynamic role permissions updated in CASL system successfully!');
    window.dispatchEvent(new Event('storage'));
    onSuccess();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Subheader / Back link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-855 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles list
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Role Details & Summary */}
        <div className="flex flex-col gap-6">
          {/* Role Details Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-200">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {selectedRole === '' ? 'Create New Role' : `Customize Role: ${getRoleMeta(selectedRole).label}`}
            </h2>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="role-name" className="text-[10px] font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider">
                Role Name *
              </label>
              <input
                id="role-name"
                type="text"
                value={roleNameInput}
                disabled={['admin', 'editor', 'viewer'].includes(selectedRole)}
                onChange={e => setRoleNameInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-navy-border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="e.g. Admin, Manager, Viewer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="role-desc" className="text-[10px] font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="role-desc"
                rows={3}
                value={roleDescription}
                disabled={['admin', 'editor', 'viewer'].includes(selectedRole)}
                onChange={e => setRoleDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-navy-border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-405 outline-none text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Describe what this role can do..."
              />
            </div>
          </div>

          {/* Permission Summary Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-200">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 self-start mb-4">Permission Summary</h2>
            
            <div className="flex flex-col items-center justify-center my-6">
              <span className="text-5xl font-black text-accent-600 dark:text-accent-400 mb-1">{totalGrantedCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">permissions granted</span>
            </div>

            <div className="w-full flex flex-col gap-2.5 text-left border-t border-slate-100 dark:border-navy-border pt-4">
              {MODULES.map(m => {
                const { checked, total } = getCheckedCountForModule(m.key);
                return (
                  <div key={m.key} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-650 dark:text-slate-350">{m.label}</span>
                    <span className="text-slate-500 dark:text-slate-300">{checked}/{total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Permissions Matrix */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition-colors duration-200">
            <div>
              {/* Header inside table card */}
              <div className="p-6 border-b border-slate-200 dark:border-navy-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-0.5">Permissions Matrix</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Configure granular access for each module and action</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveChanges}
                  className="shadow-sm cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {selectedRole === '' ? 'Create Role' : 'Save Changes'}
                </Button>
              </div>

              {/* Table Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950/40 border-b border-slate-200 dark:border-navy-border text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6 font-bold">Module</th>
                      <th className="py-4 px-5 text-center font-bold">View</th>
                      <th className="py-4 px-5 text-center font-bold">Create</th>
                      <th className="py-4 px-5 text-center font-bold">Edit</th>
                      <th className="py-4 px-5 text-center font-bold">Delete</th>
                      <th className="py-4 px-5 text-center font-bold">All</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-border">
                    {MODULES.map(m => {
                      const isAllChecked = isRowAllChecked(m.key);
                      return (
                        <tr key={m.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-slate-200">{m.label}</td>
                          
                          {/* Loop through action columns */}
                          {['read', 'create', 'update', 'delete'].map((action, actionIdx) => {
                            const isNa = m.actions[actionIdx] === 'N/A';
                            const isChecked = !isNa && !!activePerms[m.key]?.[action];
                            
                            return (
                              <td key={action} className="py-4 px-5 text-center">
                                {isNa ? (
                                  <span className="text-slate-350 dark:text-slate-600">—</span>
                                ) : (
                                  <label className="inline-flex items-center justify-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={selectedRole === 'admin'} // Admin has override
                                      onChange={e => handleCheckboxChange(m.key, action as ActionKey, e.target.checked)}
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
                                disabled={selectedRole === 'admin'}
                                onChange={e => handleAllRowChange(m.key, e.target.checked)}
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
            </div>

            {/* Checkbox Legend */}
            <div className="p-6 bg-slate-50/50 dark:bg-navy-950/20 border-t border-slate-150 dark:border-navy-border flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-accent-600 border border-accent-600 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Permitted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-slate-300 dark:border-navy-border bg-white dark:bg-[#0f1422]" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Denied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500 border border-green-500 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">All Permitted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 dark:text-slate-650 text-sm leading-none font-bold">—</span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Not Applicable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleForm;
