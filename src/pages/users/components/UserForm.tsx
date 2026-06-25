import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import FormInput from '../../../components/ui/FormInput';
import SearchDropdown from '../../../components/ui/SearchDropdown';
import RoleSingleSelect from '../../../components/ui/RoleSingleSelect';
import PasswordStrengthMeter from '../../../components/ui/PasswordStrengthMeter';
import { IUser } from '../../../interface/user';
import { useAddUsersMutation, useUpdateUserMutation } from '../../../redux/services/users';
import { useGetroleDetailsQuery } from '../../../redux/services/roles';

// ─── Zod Schema Factory ───────────────────────────────────────────────────────
export const getUserSchema = (isEdit: boolean) =>
  z.object({
    fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    department: z.string().trim().min(2, 'Department is required'),
    contactNumber: z.string().trim().min(1, 'Phone number is required'),
    bio: z.string().trim().optional(),
    role: z.string().min(1, 'Role is required'),
    status: z.enum(['Active', 'Inactive']),
    address: z.object({
      addressLine1: z.string().trim().min(1, 'Address Line 1 is required'),
      addressLine2: z.string().trim().optional(),
      city: z.string().trim().min(1, 'City is required'),
      state: z.string().trim().min(1, 'State is required'),
      postalCode: z.string().trim().min(1, 'Postal code is required'),
      country: z.string().trim().min(1, 'Country is required'),
    }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => {
    if (!isEdit && (!data.password || data.password.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: 'Password is required for new users',
    path: ['password'],
  })
  .refine((data) => {
    if (data.password && data.password.length > 0) {
      return data.password.length >= 8;
    }
    return true;
  }, {
    message: 'Password must be at least 8 characters',
    path: ['password'],
  })
  .refine((data) => {
    return data.password === data.confirmPassword;
  }, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UserFormData = z.infer<ReturnType<typeof getUserSchema>>;

const PERMISSION_MAPPING = [
  { label: 'View Dashboard & Analytics', module: 'dashboard', action: 'read' },
  { label: 'Browse & Filter Models', module: 'models', action: 'read' },
  { label: 'View Model Profile Details', module: 'models', action: 'read' },
  { label: 'Edit Model Details', module: 'models', action: 'update' },
  { label: 'Create New Models', module: 'models', action: 'create' },
  { label: 'Delete Model Profiles', module: 'models', action: 'delete' },
  { label: 'Manage Users & Roles', module: 'users', action: 'read' },
  { label: 'Access Global Settings', module: 'settings', action: 'read' },
];

interface UserFormProps {
  editing?: IUser;
  onSuccess: () => void;
  readOnly?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({ editing, onSuccess, readOnly = false }) => {
  const isEdit = !!editing;
  const [createUser, { isLoading: isCreating }] = useAddUsersMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(getUserSchema(isEdit)),
    defaultValues: {
      fullName: '',
      email: '',
      department: '',
      contactNumber: '',
      bio: '',
      role: '',
      status: 'Active',
      address: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      password: '',
      confirmPassword: '',
    },
  });

  // Reset form when editing changes
  useEffect(() => {
    if (editing) {
      reset({
        fullName: editing.fullName ?? '',
        email: editing.email ?? '',
        department: editing.department ?? '',
        contactNumber: editing.contactNumber ?? '',
        bio: editing.bio ?? '',
        role: editing.role?.id ?? '',
        status: editing.status === 'Active' ? 'Active' : 'Inactive',
        address: {
          addressLine1: editing.address?.addressLine1 ?? '',
          addressLine2: editing.address?.addressLine2 ?? '',
          city: editing.address?.city ?? '',
          state: editing.address?.state ?? '',
          postalCode: editing.address?.postalCode ?? '',
          country: editing.address?.country ?? '',
        },
        password: '',
        confirmPassword: '',
      });
    }
  }, [editing, reset]);

  const selectedRole = watch('role') || '';
  const passwordValue = watch('password') || '';

  // Dynamically load selected role details for permission checklist
  const { data: roleDetailsResponse } = useGetroleDetailsQuery(selectedRole, {
    skip: !selectedRole,
  });
  const roleDetails = roleDetailsResponse?.data;

  const checkPermissionForRole = (module: string, action: string): boolean => {
    if (!roleDetails?.permissions) return false;
    return roleDetails.permissions.some(
      (p) =>
        p.subject?.toLowerCase() === module.toLowerCase() &&
        p.action?.toLowerCase() === action.toLowerCase()
    );
  };

  const onSubmit = async (data: UserFormData) => {
    if (readOnly) return;
    try {
      if (isEdit && editing) {
        const payload = {
          id: editing.id,
          fullName: data.fullName,
          email: data.email,
          department: data.department,
          status: data.status,
          role: data.role,
          contactNumber: data.contactNumber,
          bio: data.bio || undefined,
          address: {
            addressLine1: data.address.addressLine1,
            addressLine2: data.address.addressLine2 || undefined,
            city: data.address.city,
            state: data.address.state,
            postalCode: data.address.postalCode,
            country: data.address.country,
          },
          ...(data.password && data.password.length > 0 ? { password: data.password } : {}),
        };
        await updateUser(payload).unwrap();
        toast.success('User updated successfully!');
        onSuccess();
      } else {
        const payload = {
          fullName: data.fullName,
          email: data.email,
          department: data.department,
          status: data.status,
          role: data.role,
          contactNumber: data.contactNumber,
          bio: data.bio || undefined,
          address: {
            addressLine1: data.address.addressLine1,
            addressLine2: data.address.addressLine2 || undefined,
            city: data.address.city,
            state: data.address.state,
            postalCode: data.address.postalCode,
            country: data.address.country,
          },
          password: data.password || '',
        };
        await createUser(payload).unwrap();
        toast.success('User created successfully!');
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || 'Failed to save user');
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 w-full">

      {/* Personal Information Section */}
      <div>
        <h2 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">Personal Information</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Specify name, contact info, department, and system access tier</p>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              id="user-fullname"
              placeholder="e.g. Jane Doe"
              disabled={readOnly}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <FormInput
              label="Email Address"
              id="user-email"
              type="email"
              placeholder="e.g. jane@example.com"
              disabled={readOnly}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Department"
              id="user-department"
              placeholder="e.g. Talent Relations"
              disabled={readOnly}
              error={errors.department?.message}
              {...register('department')}
            />

            <FormInput
              label="Phone"
              id="user-phone"
              placeholder="e.g. +1234567890"
              disabled={readOnly}
              error={errors.contactNumber?.message}
              {...register('contactNumber')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <RoleSingleSelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={readOnly}
                  error={!!errors.role?.message}
                  helperText={errors.role?.message}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SearchDropdown
                  label="Status"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={readOnly}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  error={errors.status?.message}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Security Section (Hidden in View Mode) */}
      {!readOnly && (
        <div className="border-t border-slate-100 dark:border-navy-border pt-6 mt-2">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-1">Security</h3>
          <p className="text-[11px] text-slate-550 dark:text-slate-400 mb-4">
            {isEdit ? 'Leave password empty to keep existing password' : 'Provide a strong password for account registration'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <FormInput
                label="New Password"
                id="user-password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              {passwordValue && <PasswordStrengthMeter value={passwordValue} />}
            </div>

            <FormInput
              label="Confirm New Password"
              id="user-confirm-password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
        </div>
      )}

      {/* Address Details Section */}
      <div className="border-t border-slate-100 dark:border-navy-border pt-6 mt-2">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-1">Address Details</h3>
        <p className="text-[11px] text-slate-550 dark:text-slate-400 mb-4">Please provide current location details</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormInput
            label="Address Line 1"
            id="address-line1"
            placeholder="e.g. House No. 123"
            disabled={readOnly}
            error={errors.address?.addressLine1?.message}
            {...register('address.addressLine1')}
          />
          <FormInput
            label="Address Line 2"
            id="address-line2"
            placeholder="e.g. Near City Center"
            disabled={readOnly}
            error={errors.address?.addressLine2?.message}
            {...register('address.addressLine2')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormInput
            label="City"
            id="address-city"
            placeholder="e.g. Chandigarh"
            disabled={readOnly}
            error={errors.address?.city?.message}
            {...register('address.city')}
          />
          <FormInput
            label="State"
            id="address-state"
            placeholder="e.g. Punjab"
            disabled={readOnly}
            error={errors.address?.state?.message}
            {...register('address.state')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Postal Code"
            id="address-postal"
            placeholder="e.g. 160017"
            disabled={readOnly}
            error={errors.address?.postalCode?.message}
            {...register('address.postalCode')}
          />
          <FormInput
            label="Country"
            id="address-country"
            placeholder="e.g. India"
            disabled={readOnly}
            error={errors.address?.country?.message}
            {...register('address.country')}
          />
        </div>
      </div>

      {/* Bio Section */}
      <div className="flex flex-col gap-1.5 w-full pt-2">
        <label htmlFor="user-bio" className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Bio
        </label>
        <textarea
          id="user-bio"
          rows={3}
          disabled={readOnly}
          placeholder="Tell us about the user's role and history..."
          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-navy-border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none focus:ring-4 focus:ring-accent-500/25 dark:focus:ring-accent-500/10 focus:border-accent-500 text-sm disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          {...register('bio')}
        />
      </div>

      {/* Permission Preview Section */}
      {selectedRole && (
        <div className="border-t border-slate-100 dark:border-navy-border pt-6 mt-2 flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-1">Role Permissions Preview</h3>
          <p className="text-[11px] text-slate-550 dark:text-slate-400 mb-2">
            These are the permissions derived dynamically from the selected role
          </p>

          <div className="bg-slate-50 dark:bg-navy-950/20 border border-slate-200 dark:border-navy-border rounded-2xl overflow-hidden transition-colors duration-200">
            {PERMISSION_MAPPING.map((p, i) => {
              const hasAccess = checkPermissionForRole(p.module, p.action);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-5 py-3 text-xs ${
                    i > 0 ? 'border-t border-slate-150 dark:border-navy-border/50' : ''
                  }`}
                >
                  <span className={hasAccess ? 'text-slate-700 dark:text-slate-300 font-bold' : 'text-slate-400 dark:text-slate-650'}>
                    {p.label}
                  </span>
                  <span className={`font-bold text-sm ${hasAccess ? 'text-green-500' : 'text-slate-300 dark:text-slate-750'}`}>
                    {hasAccess ? '✓' : '✕'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons (Hidden in View Mode) */}
      {!readOnly && (
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-navy-border mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onSuccess}
            disabled={isLoading}
            className="dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default UserForm;
