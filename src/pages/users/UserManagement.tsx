import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { useUsers, useDeleteUser } from './usersHooks';
import { SystemUser } from './usersDb';
import { useAppAbility } from '../../context/AbilityContext';
import Button from '../../components/ui/Button';
import { DataTable } from '../../components/ui/data-table';
import { getUserColumns, getRoleMeta } from './components/table-column/columns';
import { Search, Plus } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const ability = useAppAbility();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [sorting, setSorting]         = useState<SortingState>([]);
  const [pagination, setPagination]   = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  const handlePaginationChange = (updater: React.SetStateAction<PaginationState>) => {
    setPagination(prev => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      if (next.pageIndex === prev.pageIndex && next.pageSize === prev.pageSize) {
        return prev;
      }
      return next;
    });
  };

  const openCreate  = () => { navigate('/users/new'); };
  const openEdit    = (u: SystemUser) => { navigate(`/users/${u.id}/edit`); };

  const handleDelete = (u: SystemUser) => {
    if (window.confirm(`Remove user "${u.name}" from the system?`)) deleteUser.mutate(u.id);
  };

  // Client-side filtering before passing to TanStack
  const filtered = users.filter(u => {
    const name = u.name || '';
    const email = u.email || '';
    const department = u.department || '';
    const matchSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      department.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // KPI counts from full (unfiltered) list
  const counts = { admin: 0, editor: 0, viewer: 0 };
  users.forEach(u => {
    const r = (u.role === 'admin' || u.role === 'editor' || u.role === 'viewer') ? u.role : 'viewer';
    counts[r]++;
  });

  // Reset page on filter change helpers
  const handleSearchChange = (val: string) => {
    setSearch(val);
    handlePaginationChange(p => ({ ...p, pageIndex: 0 }));
  };
  const handleRoleFilter = (role: string) => {
    setRoleFilter(prev => prev === role ? '' : role);
    handlePaginationChange(p => ({ ...p, pageIndex: 0 }));
  };

  // ── Column definitions ──────────────────────────────────────────────────────
  const columns = getUserColumns({ onEdit: openEdit, onDelete: handleDelete, ability });

  // ── TanStack Table instance ─────────────────────────────────────────────────
  const table = useReactTable({
    data: filtered,
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

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">

      {/* ── KPI Role Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {['admin', 'editor', 'viewer'].map(role => {
          const rm = getRoleMeta(role);
          const count = (counts as any)[role] || 0;
          return (
            <div
              key={role}
              onClick={() => handleRoleFilter(role)}
              className={`bg-white dark:bg-navy-card border rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer transition-all ${
                roleFilter === role
                  ? `${rm.border} ring-2 ring-offset-1 ring-accent-400`
                  : 'border-slate-200 dark:border-navy-border hover:border-slate-355 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/10'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-extrabold ${rm.bg} ${rm.color} border ${rm.border}`}>
                {count}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-xs font-extrabold uppercase tracking-widest ${rm.color}`}>
                  {rm.label}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-550 font-semibold">
                  {count === 1 ? '1 user' : `${count} users`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-5">
        {/* Search + Add bar */}
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email or department…"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-navy-950/40 border border-slate-300 dark:border-navy-border rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-555" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {roleFilter && (
              <button
                onClick={() => { setRoleFilter(''); handlePaginationChange(p => ({ ...p, pageIndex: 0 })); }}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Filter ×
              </button>
            )}
            {ability.can('create', 'users') && (
              <Button
                variant="primary"
                size="sm"
                onClick={openCreate}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add User
              </Button>
            )}
          </div>
        </div>

        {/* User Data Table */}
        <DataTable
          table={table}
          showPagination={true}
          isLoading={isLoading}
          noResultMessage="No users matching current filters."
          minHeight="200px"
        />
      </div>
    </div>
  );
};

export default UserManagement;
