'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await axios.post('/api/auth/reset-password', data);
      setSubmitSuccess(true);
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && (
        <div className="bg-red-50 p-4 rounded-md text-red-800">{submitError}</div>
      )}

      {submitSuccess ? (
        <div className="bg-green-50 p-4 rounded-md text-green-800">
          <p>Password reset instructions have been sent to your email address.</p>
          <p>Please check your inbox and follow the instructions to reset your password.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-600">
            Enter your email address and we will send you a link to reset your password.
          </p>

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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Send Reset Link'}
          </Button>
        </>
      )}
    </form>
  );
}