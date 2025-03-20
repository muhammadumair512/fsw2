/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { CreditCard as CreditCardIcon } from '@mui/icons-material';
import { Button, TextField, Checkbox, FormControlLabel, Dialog, DialogTitle, 
  DialogContent, DialogActions, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useSnackbar } from '@/contexts/SnackbarContext';
import { usePayment } from '@/hooks/usePayment';
import { paymentUpdateSchema, PaymentData } from '@/types/payment/PaymentTypes';

interface PaymentTabProps {
  profile: any;
  refreshProfile: () => Promise<any>;
}

export default function PaymentTab({ profile, refreshProfile }: PaymentTabProps) {
  const { showSnackbar } = useSnackbar();
  const { updatePayment, isLoading } = usePayment();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentData>({
    resolver: zodResolver(paymentUpdateSchema),
  });

  const openPaymentDialog = () => {
    if (profile?.paymentInfo) {
      // Set form values
      setValue('nameOnCard', profile.paymentInfo.nameOnCard || '');
      setValue('cardNumber', profile.paymentInfo.cardNumber || '');
      setValue('expiryDate', profile.paymentInfo.expiryDate || '');
      setValue('cvv', profile.paymentInfo.cvv || '');
      setValue('saveCard', profile.paymentInfo.saveCard || false);
      
      setShowPaymentDialog(true);
    } else {
      // If no payment info, initialize with empty values
      setValue('nameOnCard', '');
      setValue('cardNumber', '');
      setValue('expiryDate', '');
      setValue('cvv', '');
      setValue('saveCard', false);
      
      setShowPaymentDialog(true);
    }
  };

  const onSubmitPaymentUpdate = async (data: PaymentData) => {
    try {
      const result = await updatePayment(data);
      
      if (result.success) {
        showSnackbar({
          message: 'Payment information updated successfully',
          severity: 'success',
        });
        
        setShowPaymentDialog(false);
        await refreshProfile();
      }
    } catch (error) {
      showSnackbar({
        message: 'Failed to update payment information',
        severity: 'error',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" component="h2">
          Payment Information
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<CreditCardIcon />}
          onClick={openPaymentDialog}
        >
          {profile?.paymentInfo ? 'Update Payment' : 'Add Payment'}
        </Button>
      </div>
      
      {profile?.paymentInfo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography variant="subtitle1" fontWeight="bold">Name on Card:</Typography>
            <Typography>{profile.paymentInfo.nameOnCard}</Typography>
          </div>
          <div>
            <Typography variant="subtitle1" fontWeight="bold">Card Number:</Typography>
            <Typography>
              ••••••••••••{profile.paymentInfo.cardNumber.slice(-4)}
            </Typography>
          </div>
          <div>
            <Typography variant="subtitle1" fontWeight="bold">Expiry Date:</Typography>
            <Typography>{profile.paymentInfo.expiryDate}</Typography>
          </div>
          <div>
            <Typography variant="subtitle1" fontWeight="bold">Save for Future Bookings:</Typography>
            <Typography>{profile.paymentInfo.saveCard ? 'Yes' : 'No'}</Typography>
          </div>
        </div>
      ) : (
        <Typography>No payment information found. Click  Add Payment  to add your payment details.</Typography>
      )}

      {/* Edit Payment Dialog */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {profile?.paymentInfo ? 'Update Payment Information' : 'Add Payment Information'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmitPaymentUpdate)}>
          <DialogContent>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <TextField
                label="Name on Card"
                {...register('nameOnCard')}
                error={!!errors.nameOnCard}
                helperText={errors.nameOnCard?.message}
                fullWidth
              />
              
              <TextField
                label="Card Number"
                {...register('cardNumber')}
                error={!!errors.cardNumber}
                helperText={errors.cardNumber?.message}
                fullWidth
              />
              
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Expiry Date (MM/YY)"
                  {...register('expiryDate')}
                  error={!!errors.expiryDate}
                  helperText={errors.expiryDate?.message}
                  fullWidth
                />
                
                <TextField
                  label="CVV"
                  type="password"
                  {...register('cvv')}
                  error={!!errors.cvv}
                  helperText={errors.cvv?.message}
                  fullWidth
                />
              </div>
              
              <FormControlLabel
                control={
                  <Checkbox 
                    {...register('saveCard')}
                  />
                }
                label="Save this card for future bookings"
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Updating...' : 'Update Payment Info'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}