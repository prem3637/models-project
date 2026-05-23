import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onChange'
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {!isSubmitted ? (
        <>
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-xl font-bold text-slate-900">Forgot Password?</h1>
            <p className="text-xs text-slate-500">Enter your email and we'll send you recovery instructions</p>
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

            <Button type="submit" variant="primary" className="w-full mt-2">
              Send Instructions
            </Button>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-5 text-center items-center py-4">
          <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-bold text-slate-900">Instructions Sent</h1>
            <p className="text-xs text-slate-500">
              Check your inbox. We have sent password reset instructions to your registered email.
            </p>
          </div>
        </div>
      )}

      <div className="text-center mt-2">
        <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors">
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
