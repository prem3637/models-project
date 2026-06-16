import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DEFAULT_PERMISSIONS } from '../../context/ability';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import { useUsers } from './usersHooks';
import { usersDb } from './usersDb';

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


export const RoleConfiguration: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'config'>('list');
  const [selectedRole, setSelectedRole] = useState<string>('editor');
  const [roleNameInput, setRoleNameInput] = useState('Editor');
  const [roleDescription, setRoleDescription] = useState('Can view and update models. Cannot create, delete, or access Settings.');
  
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  
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

  const { data: users = [] } = useUsers();
  const counts: Record<string, number> = {};
  users.forEach(u => {
    const r = u.role || 'viewer';
    counts[r] = (counts[r] || 0) + 1;
  });

  const roleKeys = Object.keys(permissions);
  const sortedRoleKeys = roleKeys.sort((a, b) => {
    const order = { admin: 1, editor: 2, viewer: 3 };
    const aOrder = (order as any)[a] || 99;
    const bOrder = (order as any)[b] || 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.localeCompare(b);
  });

  // Keep state in sync when selecting different role
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

  // Load custom values if they exist
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
      [selectedRole]: {
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
      [selectedRole]: {
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
    setView('list');
  };

  const handleDeleteRole = (roleKey: string) => {
    if (roleKey === 'admin' || roleKey === 'editor' || roleKey === 'viewer') return;
    
    const count = counts[roleKey] || 0;
    const confirmMessage = count > 0 
      ? `Are you sure you want to delete the "${roleKey}" role? This will automatically reassign ${count} user(s) to the Viewer role.`
      : `Are you sure you want to delete the "${roleKey}" role?`;
      
    if (!window.confirm(confirmMessage)) return;

    const updatedPerms = { ...permissions };
    delete updatedPerms[roleKey];
    localStorage.setItem('rbc_role_permissions', JSON.stringify(updatedPerms));
    setPermissions(updatedPerms);

    const savedMeta = localStorage.getItem('rbc_roles_metadata');
    if (savedMeta) {
      try {
        const metaObj = JSON.parse(savedMeta);
        delete metaObj[roleKey];
        localStorage.setItem('rbc_roles_metadata', JSON.stringify(metaObj));
      } catch {}
    }

    users.forEach(u => {
      if (u.role === roleKey) {
        usersDb.update(u.id, { role: 'viewer' });
      }
    });

    queryClient.invalidateQueries({ queryKey: ['users'] });
    window.dispatchEvent(new Event('storage'));
    
    alert(`Role "${roleKey}" was deleted successfully.`);
  };

  if (view === 'list') {
    const filteredRoles = sortedRoleKeys.filter(roleKey => {
      const rm = getRoleMeta(roleKey);
      const label = rm.label.toLowerCase();
      const desc = rm.desc.toLowerCase();
      const q = search.toLowerCase();
      return label.includes(q) || desc.includes(q);
    });

    const totalRows = filteredRoles.length;
    const pageCount = Math.ceil(totalRows / pageSize);
    const safePageIndex = Math.min(pageIndex, Math.max(0, pageCount - 1));
    const paginatedRoles = filteredRoles.slice(
      safePageIndex * pageSize,
      (safePageIndex + 1) * pageSize
    );

    const canPreviousPage = safePageIndex > 0;
    const canNextPage = safePageIndex < pageCount - 1;

    return (
      <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Role Configuration</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage global system access tiers, assign permissions, and add custom roles.</p>
          </div>
        </div>

        {/* Search & Add bar */}
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search roles by name or description…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPageIndex(0); }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-navy-950/40 border border-slate-300 dark:border-navy-border rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 outline-none transition-all"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
            {search && (
              <button
                onClick={() => { setSearch(''); setPageIndex(0); }}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Search ×
              </button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setSelectedRole(''); setView('config'); }}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
              className="cursor-pointer font-bold uppercase tracking-wider text-xs w-full sm:w-auto justify-center"
            >
              Add Role
            </Button>
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl shadow-sm overflow-hidden transition-colors duration-200">
          {filteredRoles.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
              No roles matching search query.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950/40 border-b border-slate-200 dark:border-navy-border text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6 font-bold w-[25%]">Role</th>
                      <th className="py-4 px-5 font-bold w-[45%]">Description</th>
                      <th className="py-4 px-5 text-center font-bold w-[15%]">Assigned Users</th>
                      <th className="py-4 px-6 text-right font-bold w-[15%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-border">
                    {paginatedRoles.map(roleKey => {
                      const rm = getRoleMeta(roleKey);
                      const isDefault = ['admin', 'editor', 'viewer'].includes(roleKey);
                      const userCount = counts[roleKey] || 0;

                      return (
                        <tr key={roleKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-2.5">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${rm.bg} ${rm.color} border ${rm.border}`}>
                                {rm.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-550 dark:text-slate-405 font-medium leading-relaxed">
                            {rm.desc}
                          </td>
                          <td className="py-4 px-5 text-center font-bold text-slate-700 dark:text-slate-350">
                            {userCount} {userCount === 1 ? 'user' : 'users'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => { setSelectedRole(roleKey); setView('config'); }}
                                className="text-[10px] font-bold uppercase tracking-wider dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800 border cursor-pointer px-2.5 py-1.5"
                              >
                                Configure
                              </Button>
                              
                              {!isDefault && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleDeleteRole(roleKey)}
                                  className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-650 dark:text-red-400 dark:hover:text-red-300 border border-red-200 hover:border-red-300 dark:border-red-950 dark:hover:border-red-900 dark:bg-[#1a0f0f] cursor-pointer px-2.5 py-1.5"
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              <Pagination
                pageIndex={safePageIndex}
                pageCount={pageCount}
                pageSize={pageSize}
                totalRows={totalRows}
                canPreviousPage={canPreviousPage}
                canNextPage={canNextPage}
                onFirstPage={() => setPageIndex(0)}
                onPreviousPage={() => setPageIndex(p => Math.max(0, p - 1))}
                onNextPage={() => setPageIndex(p => Math.min(pageCount - 1, p + 1))}
                onLastPage={() => setPageIndex(pageCount - 1)}
                onPageSizeChange={size => { setPageSize(size); setPageIndex(0); }}
                onPageChange={index => setPageIndex(index)}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Subheader / Back link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('list')}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Roles list
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Role Details & Summary */}
        <div className="flex flex-col gap-6">
          {/* Role Details Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-200">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">Role Details</h2>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="role-select" className="text-[10px] font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider">
                Select Role to Customize
              </label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0f1422] border border-slate-200 dark:border-navy-border text-slate-850 dark:text-slate-200 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="">-- Create New Role --</option>
                {sortedRoleKeys.map(k => (
                  <option key={k} value={k}>
                    {getRoleMeta(k).label} {['admin', 'editor', 'viewer'].includes(k) ? `(${k === 'admin' ? 'Full Override' : k === 'editor' ? 'Write & Update' : 'Read Only'})` : '(Custom)'}
                  </option>
                ))}
              </select>
            </div>

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
                className="w-full px-3.5 py-2 bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-navy-border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <span className="text-slate-500 dark:text-slate-450">{checked}/{total}</span>
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
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {selectedRole === '' ? 'Create Role' : 'Save Changes'}
                </Button>
              </div>

              {/* Table Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950/40 border-b border-slate-200 dark:border-navy-border text-slate-500 dark:text-slate-455 font-bold uppercase tracking-wider">
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
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
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
                                  : 'bg-white dark:bg-[#0f1422] border-slate-300 dark:border-navy-border hover:border-slate-400'
                              }`}>
                                {isAllChecked && (
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
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
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Permitted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-slate-300 dark:border-navy-border bg-white dark:bg-[#0f1422]" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Denied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500 border border-green-500 text-white flex items-center justify-center">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
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

export default RoleConfiguration;
