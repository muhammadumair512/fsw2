'use client';

import { EditOutlined } from '@mui/icons-material';
import { Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, Alert, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useSnackbar } from '@/contexts/SnackbarContext';
import { useProfile } from '@/hooks/useProfile';
import { z } from 'zod';

// Profile update schema
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  additionalInfo: z.string().optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

interface ProfileTabProps {
  profile: any;
  refreshProfile: () => Promise<any>;
}

export default function ProfileTab({ profile, refreshProfile }: ProfileTabProps) {
  const { showSnackbar } = useSnackbar();
  const { updateProfile } = useProfile();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
      postalCode: profile.postalCode || '',
      additionalInfo: profile.additionalInfo || '',
    },
  });

  const openProfileDialog = () => {
    // Explicitly set all form values
    setValue('firstName', profile.firstName || '');
    setValue('lastName', profile.lastName || '');
    setValue('phone', profile.phone || '');
    setValue('address', profile.address || '');
    setValue('city', profile.city || '');
    setValue('postalCode', profile.postalCode || '');
    setValue('additionalInfo', profile.additionalInfo || '');
    
    setShowProfileDialog(true);
  };

  const onSubmitProfileUpdate = async (data: ProfileUpdateFormData) => {
    try {
      setIsSubmitting(true);
      
      const result = await updateProfile(data);
      
      if (result.success) {
        showSnackbar({
          message: 'Profile updated successfully',
          severity: 'success',
        });
        
        setShowProfileDialog(false);
        await refreshProfile();
      }
    } catch (error) {
      showSnackbar({
        message: 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" component="h2">
          Personal Information
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<EditOutlined />}
          onClick={openProfileDialog}
        >
          Edit Profile
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Typography variant="subtitle1" fontWeight="bold">Name:</Typography>
          <Typography>{profile.firstName} {profile.lastName}</Typography>
        </div>
        <div>
          <Typography variant="subtitle1" fontWeight="bold">Email:</Typography>
          <Typography>{profile.email}</Typography>
        </div>
        <div>
          <Typography variant="subtitle1" fontWeight="bold">Phone:</Typography>
          <Typography>{profile.phone}</Typography>
        </div>
        <div>
          <Typography variant="subtitle1" fontWeight="bold">Address:</Typography>
          <Typography>{profile.address}, {profile.city}, {profile.postalCode}</Typography>
        </div>
        {profile.additionalInfo && (
          <div className="md:col-span-2">
            <Typography variant="subtitle1" fontWeight="bold">Additional Information:</Typography>
            <Typography>{profile.additionalInfo}</Typography>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitProfileUpdate)}>
          <DialogContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                label="First Name"
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                fullWidth
              />
              
              <TextField
                label="Last Name"
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                fullWidth
              />
            </div>
            
            <TextField
              label="Phone"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              fullWidth
              className="mb-4"
            />
            
            <TextField
              label="Address"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
              fullWidth
              className="mb-4"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                label="City"
                {...register('city')}
                error={!!errors.city}
                helperText={errors.city?.message}
                fullWidth
              />
              
              <TextField
                label="Postal Code"
                {...register('postalCode')}
                error={!!errors.postalCode}
                helperText={errors.postalCode?.message}
                fullWidth
              />
            </div>
            
            <TextField
              label="Additional Information"
              {...register('additionalInfo')}
              error={!!errors.additionalInfo}
              helperText={errors.additionalInfo?.message}
              multiline
              rows={4}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowProfileDialog(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}