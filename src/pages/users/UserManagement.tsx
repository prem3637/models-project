import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { useAppAbility } from '../../context/AbilityContext';
import Button from '../../components/ui/Button';
import { DataTable } from '../../components/ui/data-table';
import { getUserColumns, getRoleMeta } from './components/table-column/columns';
import { Search, Plus } from 'lucide-react';
import { useGetUsersQuery, useDeleteUserMutation } from '../../redux/services/users';
import { useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';
import { useDebounce } from '../../utils/useDebounce';
import { usersSelectors, selectUsersMeta } from '../../redux/selectors/users';
import { PaginationQuery } from '../../interface/common';
import { useConfirmDelete } from '../../utils/useConfirmDelete';
import { IUser } from '../../interface/user';

export const UserManagement: React.FC = () => {
  const ability = useAppAbility();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  const debouncedSearch = useDebounce(search, 500);

  const query: PaginationQuery = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      orderBy: sorting[0]?.id || undefined,
      order: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      search: debouncedSearch || undefined,
    }),
    [pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch]
  );

  const { isFetching, isLoading } = useGetUsersQuery(query);
  const [deleteUser] = useDeleteUserMutation();

  const { confirmDelete } = useConfirmDelete<any>(
    async (user) => {
      await deleteUser(user.id).unwrap();
    }
  );

  const { selectAll: selectAllUsers } = usersSelectors(query);
  const usersList = useAppSelector((state: RootState) => selectAllUsers(state));
  const meta = useAppSelector(selectUsersMeta(query));

  useEffect(() => {
    if (meta?.limit) {
      setPagination(prev => ({
        ...prev,
        pageSize: meta.limit,
      }));
    }
  }, [meta?.limit]);

  // Client-side filtering if role filter is set
  const tableData = useMemo(() => {
    if (!roleFilter) return usersList;
    return usersList.filter(u => {
      const roleName = u.role?.name?.toLowerCase() || '';
      if (roleFilter === 'admin') return roleName === 'admin' || roleName === 'super admin';
      return roleName === roleFilter;
    });
  }, [usersList, roleFilter]);

  // KPI counts from visible user list
  const counts = useMemo(() => {
    const res = { admin: 0, editor: 0, viewer: 0 };
    usersList.forEach(u => {
      const roleName = u.role?.name?.toLowerCase();
      if (roleName === 'super admin' || roleName === 'admin') {
        res.admin++;
      } else if (roleName === 'editor') {
        res.editor++;
      } else if (roleName === 'viewer' || roleName === 'user') {
        res.viewer++;
      }
    });
    return res;
  }, [usersList]);

  const handleRoleFilter = (role: string) => {
    setRoleFilter(prev => prev === role ? '' : role);
  };

  const openCreate = () => { navigate('/users/new'); };
  const openView = useCallback((u: IUser) => { navigate(`/users/${u.id}`); }, [navigate]);
  const openEdit = useCallback((u: IUser) => { navigate(`/users/${u.id}/edit`); }, [navigate]);
  const handleDelete = useCallback((u: IUser) => {
    confirmDelete(u, u.fullName);
  }, [confirmDelete]);

  const columns = useMemo(() => getUserColumns({ onView: openView, onEdit: openEdit, onDelete: handleDelete, ability }), [ability, openView, openEdit, handleDelete]);

  const table = useReactTable({
    data: tableData,
    columns,
    pageCount: meta?.totalPages || 0,
    manualPagination: true,
    manualSorting: true,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1">Manage global system users, contact details, status, and departments.</p>
        </div>
        {ability.can('create', 'users') && (
          <Button
            variant="primary"
            size="sm"
            onClick={openCreate}
            leftIcon={<Plus className="w-4 h-4" />}
            className="cursor-pointer font-bold uppercase tracking-wider text-xs justify-center shrink-0 shadow-sm"
          >
            Add User
          </Button>
        )}
      </div>

      {/* ── KPI Role Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {['admin', 'editor', 'viewer'].map(role => {
          const rm = getRoleMeta(role);
          const count = (counts as any)[role] || 0;
          return (
            <div
              key={role}
              onClick={() => handleRoleFilter(role)}
              className={`bg-white dark:bg-navy-card border rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer transition-all ${roleFilter === role
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

      {/* Search and Table Card */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email or department…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-navy-950/40 border border-slate-300 dark:border-navy-border rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-555" />
          </div>
          {roleFilter && (
            <button
              onClick={() => { setRoleFilter(''); }}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            >
              Clear Filter ×
            </button>
          )}
        </div>

        {/* User Data Table */}
        <DataTable
          table={table}
          showPagination={true}
          isLoading={isLoading || isFetching}
          noResultMessage="No users matching current filters."
          minHeight="350px"
        />
      </div>
    </div>
  );
};

export default UserManagement;
