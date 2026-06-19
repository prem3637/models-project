import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../redux/services/auth';
import FormInput from '../../components/ui/FormInput';
import Button from '../../components/ui/Button';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginForm = z.infer<typeof LoginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginApi, { isLoading }] = useLoginMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginApi({
        email: data.email,
        password: data.password
      }).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Login failed: ' + ((err as any)?.data?.message || 'Invalid credentials'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign In</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Enter your credentials to access your account</p>
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

        <FormInput
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default Login;
