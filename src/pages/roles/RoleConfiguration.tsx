import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DEFAULT_PERMISSIONS } from '../../context/ability';
import Button from '../../components/ui/Button';
import { useUsers } from '../users/usersHooks';
import { usersDb } from '../users/usersDb';
import RoleForm from './components/RoleForm';
import { DataTable } from '../../components/ui/data-table';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { RoleRowData, getRoleColumns } from './components/table-column/columns';
import { Search, Plus } from 'lucide-react';

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
  const [search, setSearch] = useState('');

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

  const syncPermissions = () => {
    const saved = localStorage.getItem('rbc_role_permissions');
    if (saved) {
      try {
        setPermissions(JSON.parse(saved));
      } catch (e) {}
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      syncPermissions();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const tableData: RoleRowData[] = sortedRoleKeys.map(roleKey => {
    const rm = getRoleMeta(roleKey);
    const userCount = counts[roleKey] || 0;
    return {
      roleKey,
      label: rm.label,
      desc: rm.desc,
      userCount
    };
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  const handlePaginationChange = (updater: React.SetStateAction<PaginationState>) => {
    setPagination(prev => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      if (next.pageIndex === prev.pageIndex && next.pageSize === prev.pageSize) {
        return prev;
      }
      return next;
    });
  };

  const filteredRolesData = tableData.filter(row => {
    const q = search.toLowerCase();
    return row.label.toLowerCase().includes(q) || row.desc.toLowerCase().includes(q);
  });

  const columns = getRoleColumns({
    onConfigure: (roleKey) => { setSelectedRole(roleKey); setView('config'); },
    onDelete: handleDeleteRole,
    getRoleMeta
  });

  const table = useReactTable({
    data: filteredRolesData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    autoResetPageIndex: false,
  });

  if (view === 'list') {
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
              onChange={e => { setSearch(e.target.value); handlePaginationChange(p => ({ ...p, pageIndex: 0 })); }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-navy-950/40 border border-slate-300 dark:border-navy-border rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
            {search && (
              <button
                onClick={() => { setSearch(''); handlePaginationChange(p => ({ ...p, pageIndex: 0 })); }}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Search ×
              </button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setSelectedRole(''); setView('config'); }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="cursor-pointer font-bold uppercase tracking-wider text-xs w-full sm:w-auto justify-center"
            >
              Add Role
            </Button>
          </div>
        </div>

        {/* Roles Table using reusable DataTable */}
        <DataTable
          table={table}
          showPagination={true}
          noResultMessage="No roles matching search query."
          minHeight="200px"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <RoleForm
        selectedRole={selectedRole}
        onSuccess={() => {
          syncPermissions();
          setView('list');
        }}
        onCancel={() => setView('list')}
      />
    </div>
  );
};

export default RoleConfiguration;
