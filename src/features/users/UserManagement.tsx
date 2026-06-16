import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  PaginationState,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from './usersHooks';
import { SystemUser } from './usersDb';
import { useAppAbility } from '../../context/AbilityContext';
import { DEFAULT_PERMISSIONS } from '../../context/ability';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import SearchDropdown from '../../components/SearchDropdown';
import NestedDrawer from '../../components/NestedDrawer';
import Pagination from '../../components/Pagination';

const columnHelper = createColumnHelper<SystemUser>();

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const UserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.string().min(2, 'Role is required'),
  department: z.string().min(2, 'Department is required'),
  status: z.enum(['Active', 'Suspended'])
});
type UserFormData = z.infer<typeof UserSchema>;

// ─── Role config ───────────────────────────────────────────────────────────────
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
  if (r === 'admin') return ROLE_META.admin;
  if (r === 'editor') return ROLE_META.editor;
  if (r === 'viewer') return ROLE_META.viewer;
  return {
    label: r.charAt(0).toUpperCase() + r.slice(1),
    color: 'text-sky-700 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    border: 'border-sky-200 dark:border-sky-800/30',
    desc: 'Custom role configurations.'
  };
};

const PERMISSION_MAPPING = [
  { label: 'View Dashboard & Analytics', module: 'Dashboard', action: 'read' },
  { label: 'Browse & Filter Models', module: 'Model', action: 'read' },
  { label: 'View Model Profile Details', module: 'Model', action: 'read' },
  { label: 'Edit Model Details', module: 'Model', action: 'update' },
  { label: 'Create New Models', module: 'Model', action: 'create' },
  { label: 'Delete Model Profiles', module: 'Model', action: 'delete' },
  { label: 'Manage Users & Roles', module: 'User', action: 'read' },
  { label: 'Access Global Settings', module: 'Settings', action: 'read' },
];

const checkPermissionForRole = (roleKey: string, actionLabel: string): boolean => {
  if (roleKey === 'admin') return true;
  const mapping = PERMISSION_MAPPING.find(m => m.label === actionLabel);
  if (!mapping) return false;

  const saved = localStorage.getItem('rbc_role_permissions');
  if (saved) {
    try {
      const perms = JSON.parse(saved);
      if (perms[roleKey] && perms[roleKey][mapping.module]) {
        return !!perms[roleKey][mapping.module][mapping.action];
      }
    } catch {}
  }

  const defPerms = (DEFAULT_PERMISSIONS as any)[roleKey] || DEFAULT_PERMISSIONS.viewer;
  return !!(defPerms as any)[mapping.module]?.[mapping.action];
};

// ─── UserForm component ────────────────────────────────────────────────────────
interface UserFormProps {
  editing?: SystemUser;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ editing, onSuccess }) => {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isEdit = !!editing;

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: editing?.name ?? '',
      email: editing?.email ?? '',
      role: editing?.role ?? 'viewer',
      department: editing?.department ?? '',
      status: editing?.status ?? 'Active'
    }
  });

  const selectedRole = watch('role') || 'viewer';

  const roleOptions = (() => {
    const defaultRoles = ['admin', 'editor', 'viewer'];
    const saved = localStorage.getItem('rbc_role_permissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const allRoles = Array.from(new Set([...defaultRoles, ...Object.keys(parsed)]));
        return allRoles.map(r => ({
          value: r,
          label: r === 'admin' ? 'Admin — Full Access' : r === 'editor' ? 'Editor — Write & Update' : r === 'viewer' ? 'Viewer — Read Only' : r.charAt(0).toUpperCase() + r.slice(1)
        }));
      } catch {}
    }
    return [
      { value: 'admin', label: 'Admin — Full Access' },
      { value: 'editor', label: 'Editor — Write & Update' },
      { value: 'viewer', label: 'Viewer — Read Only' }
    ];
  })();

  const onSubmit = (data: UserFormData) => {
    if (isEdit && editing) {
      updateUser.mutate({ id: editing.id, data }, { onSuccess });
    } else {
      createUser.mutate(
        {
          ...data,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0ea5e9&color=fff&size=100`
        },
        { onSuccess }
      );
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-10">
      {/* Role Preview Banner */}
      {selectedRole && (
        <div className={`flex flex-col gap-1.5 p-4 rounded-xl border ${getRoleMeta(selectedRole).bg} ${getRoleMeta(selectedRole).border}`}>
          <span className={`text-xs font-extrabold uppercase tracking-widest ${getRoleMeta(selectedRole).color}`}>
            {getRoleMeta(selectedRole).label} Role
          </span>
          <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">{getRoleMeta(selectedRole).desc}</p>
        </div>
      )}

      <FormInput label="Full Name" id="user-name" placeholder="e.g. Jane Doe" error={errors.name?.message} {...register('name')} />
      <FormInput label="Email Address" id="user-email" type="email" placeholder="jane@rbc-models.com" error={errors.email?.message} {...register('email')} />

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <SearchDropdown
            label="Assigned Role"
            value={field.value}
            onChange={field.onChange}
            options={roleOptions}
            error={errors.role?.message}
          />
        )}
      />

      <FormInput label="Department" id="user-department" placeholder="e.g. Talent Relations" error={errors.department?.message} {...register('department')} />

      <Controller name="status" control={control} render={({ field }) => (
        <SearchDropdown
          label="Account Status"
          value={field.value}
          onChange={field.onChange}
          options={[
            { value: 'Active',    label: 'Active' },
            { value: 'Suspended', label: 'Suspended' }
          ]}
          error={errors.status?.message}
        />
      )} />

      {/* Permission preview */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Permissions for this role</span>
        <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-border rounded-xl overflow-hidden">
          {PERMISSION_MAPPING.map((p, i) => {
            const hasAccess = checkPermissionForRole(selectedRole, p.label);
            return (
              <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-xs ${i > 0 ? 'border-t border-slate-100 dark:border-navy-border' : ''}`}>
                <span className={hasAccess ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-600'}>{p.label}</span>
                <span className={`font-bold text-sm ${hasAccess ? 'text-green-500' : 'text-slate-300 dark:text-slate-750'}`}>{hasAccess ? '✓' : '✕'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-border">
        <Button
          type="button"
          variant="secondary"
          onClick={onSuccess}
          disabled={isPending}
          className="dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isPending}>{isEdit ? 'Save Changes' : 'Create User'}</Button>
      </div>
    </form>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const UserManagement: React.FC = () => {
  const ability = useAppAbility();
  const { data: users = [], isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | undefined>();
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

  const openCreate  = () => { setEditingUser(undefined); setDrawerOpen(true); };
  const openEdit    = (u: SystemUser) => { setEditingUser(u); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditingUser(undefined); };

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
  const columns = [
    columnHelper.accessor('name', {
      header: 'User',
      cell: info => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 shadow-sm">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-accent-100 text-accent-700 flex items-center justify-center font-bold text-sm">
                  {user.name[0]}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-550 truncate">{user.email}</span>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('department', {
      header: 'Department',
      cell: info => <span className="font-medium text-slate-600 dark:text-slate-300">{info.getValue()}</span>
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: info => {
        const roleVal = info.getValue();
        const rm = getRoleMeta(roleVal);
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${rm.bg} ${rm.color} ${rm.border}`}>
            {rm.label}
          </span>
        );
      }
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          info.getValue() === 'Active'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor('lastLogin', {
      header: 'Last Login',
      cell: info => (
        <span className="text-slate-500 font-medium text-xs">
          {info.getValue()
            ? new Date(info.getValue()!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : '—'}
        </span>
      )
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const user = info.row.original;
        const canUpdate = ability.can('update', 'User');
        const canDelete = ability.can('delete', 'User');

        if (!canUpdate && !canDelete) {
          return <span className="text-slate-400 font-medium text-xs">—</span>;
        }

        return (
          <div className="flex items-center gap-1.5">
            {canUpdate && (
              <button
                onClick={() => openEdit(user)}
                title="Edit User"
                className="p-1.5 rounded bg-slate-100 hover:bg-accent-50 text-slate-600 hover:text-accent-600 transition-colors border border-slate-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDelete(user)}
                title="Delete User"
                className="p-1.5 rounded bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors border border-slate-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        );
      }
    })
  ];

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
    autoResetPageIndex: false,   // filtered is recomputed every render (new ref) — don't auto-reset on data change
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
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
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
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
            {ability.can('create', 'User') && (
              <Button
                variant="primary"
                size="sm"
                onClick={openCreate}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add User
              </Button>
            )}
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              <svg className="animate-spin w-8 h-8 text-accent-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
              No users matching current filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    {table.getHeaderGroups().map(hg => (
                      <tr key={hg.id} className="bg-slate-50 dark:bg-navy-950/40 border-b border-slate-200 dark:border-navy-border text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        {hg.headers.map(header => (
                          <th key={header.id} className="py-4 px-5 select-none font-bold">
                            {header.isPlaceholder ? null : (
                              <div
                                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                className={`flex items-center gap-1.5 ${header.column.getCanSort() ? 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-200' : ''}`}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted() === 'asc' && ' ↑'}
                                {header.column.getIsSorted() === 'desc' && ' ↓'}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-border">
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/10 transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="py-4 px-5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              <Pagination
                pageIndex={table.getState().pagination.pageIndex}
                pageCount={table.getPageCount()}
                pageSize={table.getState().pagination.pageSize}
                totalRows={filtered.length}
                canPreviousPage={table.getCanPreviousPage()}
                canNextPage={table.getCanNextPage()}
                onFirstPage={() => table.setPageIndex(0)}
                onPreviousPage={() => table.previousPage()}
                onNextPage={() => table.nextPage()}
                onLastPage={() => table.setPageIndex(table.getPageCount() - 1)}
                onPageSizeChange={size => { handlePaginationChange(p => ({ ...p, pageSize: size, pageIndex: 0 })); }}
                onPageChange={index => handlePaginationChange(p => ({ ...p, pageIndex: index }))}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Drawer: Create / Edit User ─────────────────────────────────── */}
      <NestedDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        title={editingUser ? 'Edit User & Role' : 'Create New User'}
        stackIndex={0}
        size="md"
      >
        <UserForm editing={editingUser} onSuccess={closeDrawer} />
      </NestedDrawer>
    </div>
  );
};

export default UserManagement;
