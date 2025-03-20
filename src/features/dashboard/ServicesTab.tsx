/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { EditOutlined } from '@mui/icons-material';
import { Button, Checkbox, FormControlLabel, Dialog, DialogTitle, 
  DialogContent, DialogActions, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useSnackbar } from '@/contexts/SnackbarContext';
import { useServices } from '@/hooks/useServices';
import { serviceUpdateSchema, ServiceData } from '@/types/service/ServiceTypes';

interface ServicesTabProps {
  profile: any;
  refreshProfile: () => Promise<any>;
}

export default function ServicesTab({ profile, refreshProfile }: ServicesTabProps) {
  const { showSnackbar } = useSnackbar();
  const { updateServices, isLoading } = useServices();
  const [showServicesDialog, setShowServicesDialog] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<ServiceData>({
    resolver: zodResolver(serviceUpdateSchema),
    defaultValues: {
      childcare: profile.services?.childcare || false,
      mealPreparation: profile.services?.mealPreparation || false,
      lightHousekeeping: profile.services?.lightHousekeeping || false,
      tutoring: profile.services?.tutoring || false,
      petMinding: profile.services?.petMinding || false,
    },
  });

  // Watch services values for controlled checkboxes
  const servicesValues = watch();

  const openServicesDialog = () => {
    if (profile?.services) {
      // Set form values for services
      setValue('childcare', profile.services.childcare);
      setValue('mealPreparation', profile.services.mealPreparation);
      setValue('lightHousekeeping', profile.services.lightHousekeeping);
      setValue('tutoring', profile.services.tutoring);
      setValue('petMinding', profile.services.petMinding);
      
      setShowServicesDialog(true);
    }
  };

  const onSubmitServicesUpdate = async (data: ServiceData) => {
    try {
      const result = await updateServices(data);
      
      if (result.success) {
        showSnackbar({
          message: 'Services updated successfully',
          severity: 'success',
        });
        
        setShowServicesDialog(false);
        await refreshProfile();
      }
    } catch (error) {
      showSnackbar({
        message: 'Failed to update services',
        severity: 'error',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" component="h2">
          Services Selected
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<EditOutlined />}
          onClick={openServicesDialog}
        >
          Update Services
        </Button>
      </div>
      
      <ul className="space-y-2">
        <li>
          <Typography>
            {profile?.services?.childcare ? '✅ Childcare' : '❌ Childcare'}
          </Typography>
        </li>
        <li>
          <Typography>
            {profile?.services?.mealPreparation ? '✅ Meal Preparation' : '❌ Meal Preparation'}
          </Typography>
        </li>
        <li>
          <Typography>
            {profile?.services?.lightHousekeeping ? '✅ Light Housekeeping' : '❌ Light Housekeeping'}
          </Typography>
        </li>
        <li>
          <Typography>
            {profile?.services?.tutoring ? '✅ Tutoring' : '❌ Tutoring'}
          </Typography>
        </li>
        <li>
          <Typography>
            {profile?.services?.petMinding ? '✅ Pet Minding' : '❌ Pet Minding'}
          </Typography>
        </li>
      </ul>

      {/* Edit Services Dialog */}
      <Dialog open={showServicesDialog} onClose={() => setShowServicesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Services</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitServicesUpdate)}>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Please select the services you need:
            </Typography>
            
            <div className="space-y-2">
              <FormControlLabel
                control={
                  <Checkbox 
                    {...register('childcare')}
                    checked={servicesValues.childcare} 
                  />
                }
                label="Childcare"
              />
              
              <FormControlLabel
                control={
                  <Checkbox 
                    {...register('mealPreparation')}
                    checked={servicesValues.mealPreparation}
                  />
                }
                label="Meal Preparation"
              />
              
              <FormControlLabel
                control={
                  <Checkbox 
                    {...register('lightHousekeeping')}
                    checked={servicesValues.lightHousekeeping}
                  />
                }
                label="Light Housekeeping"
              />
              
              <FormControlLabel
                control={
                  <Checkbox 
                    {...register('tutoring')}
                    checked={servicesValues.tutoring}
                  />
                }
                label="Tutoring"
              />
              
              <FormControlLabel
                control={
                  <Checkbox 
                    {...register('petMinding')}
                    checked={servicesValues.petMinding}
                  />
                }
                label="Pet Minding"
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowServicesDialog(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Updating...' : 'Update Services'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}