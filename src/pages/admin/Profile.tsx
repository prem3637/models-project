import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/errorHelper';
import { useAppSelector } from '../../redux/hooks';
import { useUpdateProfileMutation } from '../../redux/services/auth';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';
import SearchDropdown from '../../components/ui/SearchDropdown';
import RoleSingleSelect from '../../components/ui/RoleSingleSelect';
import { CreateUserRequest } from '../../interface/user';
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter';
import ProfileHeader from './components/ProfileHeader';

const ProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  title: z.string().min(2, 'Title/Department is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive']),
  address: z.object({
    addressLine1: z.string().min(1, 'Address Line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required')
  }),
  password: z.string().optional(),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password.length >= 8;
  }
  return true;
}, {
  message: 'Password must be at least 8 characters',
  path: ['password']
}).refine((data) => {
  return data.password === data.confirmPassword;
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

export const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [updateProfileApi, { isLoading }] = useUpdateProfileMutation();

  const { register, handleSubmit, reset, formState: { errors, isDirty }, watch, control } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user?.fullName ?? '',
      email: user?.email ?? '',
      title: user?.department ?? '',
      phone: user?.contactNumber ?? '',
      bio: user?.bio,
      role: user?.role?.id ?? '',
      status: user?.status === 'Active' ? 'Active' : 'Inactive',
      address: {
        addressLine1: user?.address?.addressLine1 ?? '',
        addressLine2: user?.address?.addressLine2 ?? '',
        city: user?.address?.city ?? '',
        state: user?.address?.state ?? '',
        postalCode: user?.address?.postalCode ?? '',
        country: user?.address?.country ?? ''
      },
      password: '',
      confirmPassword: ''
    }
  });

  const passwordValue = watch('password') || '';

  // Reset values when user changes (e.g. role switcher triggers new user info)
  useEffect(() => {
    if (user) {
      reset({
        name: user.fullName ?? '',
        email: user.email,
        title: user.department ?? '',
        phone: user.contactNumber ?? '',
        bio: user?.bio,
        role: user.role?.id ?? '',
        status: user.status === 'Active' ? 'Active' : 'Inactive',
        address: {
          addressLine1: user.address?.addressLine1 ?? '',
          addressLine2: user.address?.addressLine2 ?? '',
          city: user.address?.city ?? '',
          state: user.address?.state ?? '',
          postalCode: user.address?.postalCode ?? '',
          country: user.address?.country ?? ''
        },
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: Partial<CreateUserRequest> = {
        fullName: data.name,
        email: data.email,
        contactNumber: data.phone || '',
        department: data.title,
        role: data.role,
        status: data.status,
        bio: data.bio,
        address: {
          addressLine1: data.address.addressLine1,
          addressLine2: data.address.addressLine2 || undefined,
          city: data.address.city,
          state: data.address.state,
          postalCode: data.address.postalCode,
          country: data.address.country
        }
      };

      if (data.password && data.password.length > 0) {
        payload.password = data.password;
      }

      await updateProfileApi(payload).unwrap();
      reset({
        ...data,
        password: '',
        confirmPassword: ''
      });

      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Failed to update profile'));
    }
  };

  const handleCancel = () => {
    if (user) {
      reset({
        name: user.fullName ?? '',
        email: user.email,
        title: user.department ?? '',
        phone: user.contactNumber ?? '',
        bio: user?.bio,
        role: user.role?.id ?? '',
        status: user.status === 'Active' ? 'Active' : 'Inactive',
        address: {
          addressLine1: user.address?.addressLine1 ?? '',
          addressLine2: user.address?.addressLine2 ?? '',
          city: user.address?.city ?? '',
          state: user.address?.state ?? '',
          postalCode: user.address?.postalCode ?? '',
          country: user.address?.country ?? ''
        },
        password: '',
        confirmPassword: ''
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 max-w-7xl mx-auto w-full">
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 -mb-2">
        <span>Settings</span>
        <span>•</span>
        <span className="text-slate-700 dark:text-slate-300">Profile</span>
      </div>

      <ProfileHeader user={user} />

      {/* Details Card */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 md:p-8 shadow-sm transition-colors duration-200">
        <div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">Personal Information</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Update how you appear across the workspace</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                id="profile-name"
                placeholder="e.g. Sagar Vishwakarma"
                error={errors.name?.message}
                {...register('name')}
              />

              <FormInput
                label="Email Address"
                id="profile-email"
                type="email"
                placeholder="e.g. sagar@example.com"
                disabled
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Title"
                id="profile-title"
                placeholder="e.g. Engineering"
                error={errors.title?.message}
                {...register('title')}
              />

              <FormInput
                label="Phone"
                id="profile-phone"
                placeholder="e.g. +919876543210"
                error={errors.phone?.message}
                {...register('phone')}
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
                    error={!!errors.role?.message}
                    helperText={errors.role?.message}
                    disabled={true}
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
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' }
                    ]}
                    error={errors.status?.message}
                  />
                )}
              />
            </div>

            {/* Security Section */}
            <div className="border-t border-slate-100 dark:border-navy-border pt-4 mt-1">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-1">Security</h3>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mb-3">Update your password to keep your account secure</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <FormInput
                    label="New Password"
                    id="profile-password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  {passwordValue && (
                    <PasswordStrengthMeter value={passwordValue} />
                  )}
                </div>

                <FormInput
                  label="Confirm New Password"
                  id="profile-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
            </div>

            {/* Address Details Section */}
            <div className="border-t border-slate-100 dark:border-navy-border pt-4 mt-1">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-1">Address Details</h3>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mb-3">Please provide your current location details</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormInput
                  label="Address Line 1"
                  id="address-line1"
                  placeholder="e.g. House No. 123"
                  error={errors.address?.addressLine1?.message}
                  {...register('address.addressLine1')}
                />
                <FormInput
                  label="Address Line 2"
                  id="address-line2"
                  placeholder="e.g. Near City Center"
                  error={errors.address?.addressLine2?.message}
                  {...register('address.addressLine2')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormInput
                  label="City"
                  id="address-city"
                  placeholder="e.g. Chandigarh"
                  error={errors.address?.city?.message}
                  {...register('address.city')}
                />
                <FormInput
                  label="State"
                  id="address-state"
                  placeholder="e.g. Punjab"
                  error={errors.address?.state?.message}
                  {...register('address.state')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Postal Code"
                  id="address-postal"
                  placeholder="e.g. 160017"
                  error={errors.address?.postalCode?.message}
                  {...register('address.postalCode')}
                />
                <FormInput
                  label="Country"
                  id="address-country"
                  placeholder="e.g. India"
                  error={errors.address?.country?.message}
                  {...register('address.country')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="profile-bio" className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Bio
              </label>
              <textarea
                id="profile-bio"
                rows={3}
                placeholder="Tell us about your role..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-navy-border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none focus:ring-4 focus:ring-accent-500/25 dark:focus:ring-accent-500/10 focus:border-accent-500 text-sm"
                {...register('bio')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-navy-border mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={!isDirty || isLoading}
                className="dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty}
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
