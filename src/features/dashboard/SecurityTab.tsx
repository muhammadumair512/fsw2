'use client';

import { Button, TextField, Alert, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '@/hooks/useAuth';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { passwordChangeSchema, PasswordChangeData } from '@/types/auth/UserTypes';

export default function SecurityTab() {
  const { changePassword } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = async (data: PasswordChangeData) => {
    setIsLoading(true);
    setSubmitSuccess(false);

    try {
      const success = await changePassword(data.currentPassword, data.newPassword);
      
      if (success) {
        setSubmitSuccess(true);
        reset();
        showSnackbar({
          message: 'Password changed successfully!',
          severity: 'success',
        });
      } else {
        showSnackbar({
          message: 'Failed to change password. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      showSnackbar({
        message: 'An unexpected error occurred. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h6" component="h2" gutterBottom>
        Change Password
      </Typography>
      
      {submitSuccess && (
        <Alert severity="success" className="mb-4">
          Password changed successfully!
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div>
          <TextField
            type="password"
            label="Current Password"
            {...register('currentPassword')}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
            fullWidth
          />
        </div>
        
        <div>
          <TextField
            type="password"
            label="New Password"
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            fullWidth
          />
        </div>
        
        <div>
          <TextField
            type="password"
            label="Confirm New Password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            fullWidth
          />
        </div>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </Button>
      </form>
    </div>
  );
}