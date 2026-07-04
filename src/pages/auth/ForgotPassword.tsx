import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../../redux/services/auth';
import FormInput from '../../components/ui/FormInput';
import Button from '../../components/ui/Button';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [forgotPasswordApi, { isLoading }] = useForgotPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await forgotPasswordApi({ email: data.email }).unwrap();
      setIsSubmitted(true);
      toast.success('Reset link sent successfully to your email');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!isSubmitted ? (
        <>
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Forgot Password?</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enter your email and we'll send you a password reset link</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormInput
              label="Email Address"
              id="email"
              type="email"
              placeholder="name@agency.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-5 text-center items-center py-4">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 text-green-600 dark:text-green-400 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Reset Link Sent</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check your inbox. We have sent a password reset link to your registered email address.
            </p>
          </div>
        </div>
      )}

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

export default ForgotPassword;
