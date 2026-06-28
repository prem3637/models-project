import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { DataTable } from '../../components/ui/data-table';
import {
  useReactTable,
  getCoreRowModel,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { RoleRowData, getRoleColumns } from './components/table-column/columns';
import { Search, Plus } from 'lucide-react';
import { useGetRolesQuery, useDeleteRoleMutation } from '../../redux/services/roles';
import { useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';
import { useDebounce } from '../../utils/useDebounce';
import { rolesSelectors, selectRolesMeta } from '../../redux/selectors/roles';
import { PaginationQuery } from '../../interface/common';
import { useConfirmDelete } from '../../utils/useConfirmDelete';

export const RoleConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
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

  const { isFetching, isLoading: isRolesLoading } = useGetRolesQuery(query);
  const [deleteRole] = useDeleteRoleMutation();

  const { confirmDelete } = useConfirmDelete<any>(
    async (role) => {
      await deleteRole(role.id).unwrap();
    }
  );

  const { selectAll: selectAllRoles } = rolesSelectors(query);
  const rolesList = useAppSelector((state: RootState) => selectAllRoles(state));
  const meta = useAppSelector(selectRolesMeta(query));

  useEffect(() => {
    if (meta?.limit) {
      setPagination(prev => ({
        ...prev,
        pageSize: meta.limit,
      }));
    }
  }, [meta?.limit]);

  const tableData: RoleRowData[] = rolesList.map(role => {
    return {
      roleId: role.id,
      roleKey: role.name.toLowerCase(),
      label: role.name,
      desc: role.description || '',
      userCount: role.assignedUsers || 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };
  });

  const columns = useMemo(() => getRoleColumns(), []);

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
    meta: {
      onViewRole: (roleId: string) => {
        navigate(`/roles/${roleId}`);
      },
      onEditRole: (roleId: string) => {
        navigate(`/roles/${roleId}/edit`);
      },
      onDeleteRole: (roleId: string, roleName: string, userCount: number) => {
        const confirmChildren = userCount > 0 ? (
          <span className="text-xs text-yellow-750">
            This will automatically reassign <b>{userCount}</b> user(s) to the Viewer role.
          </span>
        ) : undefined;
        confirmDelete({ id: roleId }, roleName, confirmChildren);
      }
    }
  });

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Role Configuration</h1>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1">Manage global system access tiers, assign permissions, and add custom roles.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/roles/new')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="cursor-pointer font-bold uppercase tracking-wider text-xs justify-center shrink-0 shadow-sm"
        >
          Create Role
        </Button>
      </div>

      {/* Search bar */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-5 shadow-sm sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 mb-4">
          <input
            type="text"
            placeholder="Search roles by name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-navy-950/40 border border-slate-300 dark:border-navy-border rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 outline-none transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-550" />
        </div>
        {/* Roles Table using reusable DataTable */}
        <DataTable
          table={table}
          showPagination={true}
          isLoading={isRolesLoading || isFetching}
          noResultMessage="No roles matching search query."
          minHeight="350px"
        />
      </div>

    </div>
  );
};

export default RoleConfiguration;
