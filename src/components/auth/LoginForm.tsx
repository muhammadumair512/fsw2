'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/hooks/useAuth';
import { loginSchema, LoginData } from '@/types/auth/UserTypes';

export default function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check for error parameter in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'CredentialsSignin') {
      setLoginError('Invalid email or password');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const success = await login(data);
      
      if (!success) {
        setLoginError('Failed to sign in. Please check your credentials.');
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {loginError && (
        <div className="bg-red-50 p-4 rounded-md text-red-800">{loginError}</div>
      )}

      <div>
        <TextField
          label="Email"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
        />
      </div>

      <div>
        <TextField
          label="Password"
          type="password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          fullWidth
        />
      </div>

      <div className="text-sm text-blue-600 hover:underline">
        <Link href="/reset-password">Forgot your password?</Link>
      </div>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}