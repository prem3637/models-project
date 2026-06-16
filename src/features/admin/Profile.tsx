import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RootState } from '../../store';
import { updateProfile } from '../../store/authSlice';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';

const ProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  title: z.string().min(2, 'Title is required'),
  phone: z.string().optional(),
  bio: z.string().optional()
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state: RootState) => state.auth);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      title: user?.title ?? '',
      phone: user?.phone ?? '',
      bio: user?.bio ?? ''
    }
  });

  // Reset values when user changes (e.g. role switcher triggers new user info)
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        title: user.title ?? '',
        phone: user.phone ?? '',
        bio: user.bio ?? ''
      });
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileFormData) => {
    dispatch(updateProfile(data));
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        title: user.title ?? '',
        phone: user.phone ?? '',
        bio: user.bio ?? ''
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100">
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 -mb-2">
        <span>Settings</span>
        <span>•</span>
        <span className="text-slate-700 dark:text-slate-300">Profile</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Avatar Card */}
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-accent-600 to-indigo-600/80" />
          
          <div className="relative mt-8 mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent-400 to-indigo-500 text-white border-4 border-white dark:border-navy-card flex items-center justify-center font-bold text-4xl shadow-md transition-all">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-accent-600 rounded-full shadow-md cursor-pointer transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{user?.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">{user?.title || 'Agency Personnel'}</p>
          
          <span className="px-3.5 py-1 bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-accent-100 dark:border-accent-800/30">
            {role} Role
          </span>
        </div>

        {/* Right Details Card */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">Personal Information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Update how you appear across the workspace</p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Full Name"
                  id="profile-name"
                  placeholder="e.g. Admin User"
                  error={errors.name?.message}
                  {...register('name')}
                />
                
                <FormInput
                  label="Email Address"
                  id="profile-email"
                  type="email"
                  placeholder="e.g. admin@agency.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Title"
                  id="profile-title"
                  placeholder="e.g. Agency Director"
                  error={errors.title?.message}
                  {...register('title')}
                />

                <FormInput
                  label="Phone"
                  id="profile-phone"
                  placeholder="e.g. +1 (555) 000-0000"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="profile-bio" className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  rows={4}
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
                  disabled={!isDirty}
                  className="dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isDirty}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
