import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, UserRole } from '../../store/authSlice';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginForm = z.infer<typeof LoginSchema>;

export const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = (data: LoginForm) => {
    // Determine role based on email if it contains admin/editor/viewer
    let role: UserRole = 'admin';
    if (data.email.includes('editor')) role = 'editor';
    else if (data.email.includes('viewer')) role = 'viewer';

    dispatch(login({
      user: {
        name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
        email: data.email
      },
      role
    }));
    navigate('/dashboard');
  };

  const handleQuickLogin = (role: UserRole) => {
    setValue('email', `${role}@rbc-models.com`, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-bold text-slate-900">Sign In</h1>
        <p className="text-xs text-slate-500">Enter your credentials to access your account</p>
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
          <Link to="/forgot-password" className="text-xs font-semibold text-accent-600 hover:text-accent-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2">
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Login</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Quick Login Badges */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleQuickLogin('admin')}
          className="px-2 py-2 bg-slate-50 hover:bg-accent-50 border border-slate-200 hover:border-accent-300 text-xs font-semibold rounded-lg text-slate-700 hover:text-accent-600 transition-all text-center"
        >
          Admin
        </button>
        <button
          onClick={() => handleQuickLogin('editor')}
          className="px-2 py-2 bg-slate-50 hover:bg-accent-50 border border-slate-200 hover:border-accent-300 text-xs font-semibold rounded-lg text-slate-700 hover:text-accent-600 transition-all text-center"
        >
          Editor
        </button>
        <button
          onClick={() => handleQuickLogin('viewer')}
          className="px-2 py-2 bg-slate-50 hover:bg-accent-50 border border-slate-200 hover:border-accent-300 text-xs font-semibold rounded-lg text-slate-700 hover:text-accent-600 transition-all text-center"
        >
          Viewer
        </button>
      </div>
    </div>
  );
};

export default Login;
