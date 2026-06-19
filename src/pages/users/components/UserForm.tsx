import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser, useUpdateUser } from '../usersHooks';
import { SystemUser } from '../usersDb';
import { DEFAULT_PERMISSIONS } from '../../../context/ability';
import Button from '../../../components/ui/Button';
import FormInput from '../../../components/ui/FormInput';
import SearchDropdown from '../../../components/ui/SearchDropdown';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
export const UserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.string().min(2, 'Role is required'),
  department: z.string().min(2, 'Department is required'),
  status: z.enum(['Active', 'Suspended'])
});
export type UserFormData = z.infer<typeof UserSchema>;

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

interface UserFormProps {
  editing?: SystemUser;
  onSuccess: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ editing, onSuccess }) => {
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
                <span className={hasAccess ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-650'}>{p.label}</span>
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

export default UserForm;
