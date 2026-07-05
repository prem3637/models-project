import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/errorHelper';
import { useResetPasswordMutation } from '../../redux/services/auth';
import FormInput from '../../components/ui/FormInput';
import Button from '../../components/ui/Button';
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter';

const ResetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [resetPasswordApi, { isLoading }] = useResetPasswordMutation();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' }
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Reset token is missing from the link');
      return;
    }

    try {
      await resetPasswordApi({
        token,
        password: data.password
      }).unwrap();

      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Failed to reset password'));
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-6 text-center items-center py-4">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 flex items-center justify-center shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Invalid Link</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This password reset link is invalid or has expired. Please request a new link.
          </p>
        </div>
        <div className="text-center mt-2 w-full">
          <Link to="/forgot-password" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reset Password</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Enter and confirm your new password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          label="New Password"
          id="password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordStrengthMeter value={passwordValue} />

        <FormInput
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          Reset Password
        </Button>
      </form>

      <div className="text-center mt-2">
        <Link to="/login" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
