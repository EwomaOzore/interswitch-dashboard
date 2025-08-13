import React from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { login, error, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    if (Object.keys(errors).length > 0) {
      return;
    }

    const result = await login(data.email, data.password);

    if (result.success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg p-8 shadow-lg shadow-gray-200 elevation-2">
          <div className="flex flex-col items-center justify-center mb-4">
            <Image
              src="/interswitch_logo.jpeg"
              alt="Interswitch Logo"
              width={70}
              height={70}
              className="rounded"
              priority
            />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:border-interswitch-primary"
                placeholder="Enter your email"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:border-interswitch-primary"
                placeholder="Enter your password"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-danger bg-opacity-10 px-4 py-3">
                <div className="text-sm text-danger">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-interswitch-primary text-white py-2 px-4 rounded-md hover:bg-interswitch-dark focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-interswitch-primary hover:text-interswitch-dark hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </form>
        </div>
        <div className="mt-8 text-center pt-6">
          <p className="text-sm text-gray-600">
            New to Interswitch Banking?{' '}
            <a
              href="#"
              className="text-interswitch-primary hover:text-interswitch-dark hover:underline font-medium"
            >
              Sign up
            </a>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">Demo: test@interswitch.com / password123</p>
        </div>
      </div>
    </div>
  );
}
