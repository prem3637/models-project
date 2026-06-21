import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import { FormInput } from '../../../components/ui/FormInput';
import { FormTextarea } from '../../../components/ui/FormTextarea';
import { ArrowLeft, Save, Check } from 'lucide-react';
import Skeleton from '../../../components/ui/Skeleton';
import {
  useGetPermissionMatrixQuery,
  useGetroleDetailsQuery,
  useAddRolesMutation,
  useUpdateRoleMutation,
} from '../../../redux/services/roles';
import { PermissionModuleDto } from '../../../interface/role';
import PermissionMatrixTable from './PermissionMatrixTable';

const roleFormSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required'),
  description: z.string().trim().optional(),
  permissions: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  selectedRole: string; // '' for new (UUID or role key)
  onSuccess: () => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export const RoleForm: React.FC<RoleFormProps> = ({ selectedRole, onSuccess, onCancel, readOnly = false }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  const watchedPermissions = watch('permissions') || [];
  const watchedName = watch('name') || '';

  // Fetch permissions matrix and role details
  const { data: matrixResponse, isLoading: isMatrixLoading } = useGetPermissionMatrixQuery();
  const { data: roleDetailsData, isLoading: isRoleDetailsLoading } = useGetroleDetailsQuery(selectedRole, {
    skip: !selectedRole,
  });

  const [addRole, { isLoading: isAdding }] = useAddRolesMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  // Keep state in sync when roleDetailsData loads or is skipped
  useEffect(() => {
    if (roleDetailsData?.data) {
      reset({
        name: roleDetailsData.data.name,
        description: roleDetailsData.data.description || '',
        permissions: roleDetailsData.data.permissions.map((p) => p.id),
      });
    } else if (selectedRole === '') {
      reset({
        name: '',
        description: '',
        permissions: [],
      });
    }
  }, [roleDetailsData, selectedRole, reset]);

  const currentRoleName = roleDetailsData?.data?.name || watchedName || '';
  const isDefaultRole = ['admin', 'editor', 'viewer'].includes(currentRoleName.toLowerCase());
  const isDisabled = isDefaultRole || readOnly;

  const matrix = matrixResponse?.data;
  const actionsList = matrix?.actions || [];
  const modulesList = matrix?.modules || [];

  const handleCheckboxChange = (permId: string, checked: boolean) => {
    const current = watchedPermissions;
    if (checked) {
      if (!current.includes(permId)) {
        setValue('permissions', [...current, permId], { shouldValidate: true });
      }
    } else {
      setValue('permissions', current.filter(id => id !== permId), { shouldValidate: true });
    }
  };

  const handleAllRowChange = (module: PermissionModuleDto, checkAll: boolean) => {
    const ids = module.permissions.map(p => p.id);
    const current = watchedPermissions;
    if (checkAll) {
      const newIds = [...current];
      ids.forEach(id => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      setValue('permissions', newIds, { shouldValidate: true });
    } else {
      setValue('permissions', current.filter(id => !ids.includes(id)), { shouldValidate: true });
    }
  };

  const isRowAllChecked = (module: PermissionModuleDto): boolean => {
    if (!module.permissions || module.permissions.length === 0) return false;
    return module.permissions.every(p => watchedPermissions.includes(p.id));
  };

  const getCheckedCountForModule = (module: PermissionModuleDto): { checked: number; total: number } => {
    const total = module.permissions.length;
    const checked = module.permissions.filter(p => watchedPermissions.includes(p.id)).length;
    return { checked, total };
  };

  const totalGrantedCount = watchedPermissions.length;

  const onSubmit = (values: RoleFormValues) => {
    if (selectedRole === '') {
      addRole({
        name: values.name,
        description: values.description || '',
        permissions: values.permissions,
      })
        .unwrap()
        .then(() => {
          toast.success('Role created successfully!');
          onSuccess();
        })
        .catch((err: any) => {
          toast.error(err?.data?.message || err?.message || 'Failed to create role');
        });
    } else {
      updateRole({
        id: selectedRole,
        name: values.name,
        description: values.description || '',
        permissions: values.permissions,
      })
        .unwrap()
        .then(() => {
          toast.success('Role updated successfully!');
          onSuccess();
        })
        .catch((err: any) => {
          toast.error(err?.data?.message || err?.message || 'Failed to update role');
        });
    }
  };

  if (isMatrixLoading || (selectedRole !== '' && isRoleDetailsLoading)) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-200 dark:bg-navy-950/40 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Subheader / Back link & Create/Save Button aligned to top-right */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles list
        </button>
        {!isDisabled && (
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isAdding || isUpdating}
            leftIcon={<Save className="w-4 h-4" />}
            className="shadow-sm cursor-pointer font-bold tracking-wider text-xs px-4 py-2 whitespace-nowrap"
          >
            {selectedRole === '' ? 'Create Role' : 'Save Changes'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Role Details & Summary */}
        <div className="flex flex-col gap-6">
          {/* Role Details Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-200">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {selectedRole === '' ? 'Create New Role' : readOnly ? `View Role: ${currentRoleName}` : `Customize Role: ${currentRoleName}`}
            </h2>

            <FormInput
              id="role-name"
              label="Role Name *"
              disabled={isDisabled}
              error={errors.name?.message}
              {...register('name')}
              placeholder="e.g. Admin, Manager, Viewer"
            />

            <FormTextarea
              id="role-desc"
              label="Description"
              rows={3}
              disabled={isDisabled}
              error={errors.description?.message}
              {...register('description')}
              placeholder="Describe what this role can do..."
            />
          </div>

          {/* Permission Summary Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-200">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 self-start mb-4">Permission Summary</h2>

            <div className="flex flex-col items-center justify-center my-6">
              <span className="text-5xl font-black text-accent-600 dark:text-accent-400 mb-1">{totalGrantedCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">permissions granted</span>
            </div>

            <div className="w-full flex flex-col gap-2.5 text-left border-t border-slate-100 dark:border-navy-border pt-4">
              {modulesList.map(module => {
                const { checked, total } = getCheckedCountForModule(module);
                return (
                  <div key={module.key} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">{module.label}</span>
                    <span className="text-slate-500 dark:text-slate-400">{checked}/{total}</span>
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
              <div className="p-6 border-b border-slate-200 dark:border-navy-border">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-0.5">Permissions Matrix</h2>
                <p className="text-xs text-slate-500 dark:text-slate-405">Configure granular access for each module and action</p>
              </div>

              {/* Table Matrix Component */}
              <PermissionMatrixTable
                actionsList={actionsList}
                modulesList={modulesList}
                selectedPermissionIds={watchedPermissions}
                isDefaultRole={isDisabled}
                onCheckboxChange={handleCheckboxChange}
                onAllRowChange={handleAllRowChange}
                isRowAllChecked={isRowAllChecked}
              />
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
                <span className="text-slate-450 dark:text-slate-650 text-sm leading-none font-bold">—</span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-405">Not Applicable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RoleForm;
