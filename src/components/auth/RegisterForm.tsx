'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

import { registerSchema, UserRegistrationData } from '@/types/auth/UserTypes';
import { useSnackbar } from '@/contexts/SnackbarContext';

export default function RegisterForm() {
  const { showSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<UserRegistrationData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      children: [{ firstName: '', lastName: '', age: 0, specialNotes: '' }],
      services: {
        childcare: false,
        mealPreparation: false,
        lightHousekeeping: false,
        tutoring: false,
        petMinding: false,
      },
      payment: {
        saveCard: false,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'children',
  });

  const onSubmit = async (data: UserRegistrationData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await axios.post('/api/auth/register', data);
      setSubmitSuccess(true);
      reset();
      
      showSnackbar({
        message: 'Registration successful! Your account is pending approval.',
        severity: 'success',
        title: 'Registration Complete',
      });
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-green-50 p-4 rounded-md text-green-800">
        <h3 className="font-bold text-lg">Registration Successful!</h3>
        <p>Your account has been created and is pending approval. You will receive an email once your account is approved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 p-4 rounded-md text-red-800">{submitError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <TextField
            label="First Name"
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            fullWidth
          />
        </div>
        <div>
          <TextField
            label="Last Name"
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            fullWidth
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            label="Phone Number"
            {...register('phone')}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            fullWidth
          />
        </div>
      </div>

      <div>
        <TextField
          label="Address"
          {...register('address')}
          error={!!errors.address}
          helperText={errors.address?.message}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <TextField
            label="City"
            {...register('city')}
            error={!!errors.city}
            helperText={errors.city?.message}
            fullWidth
          />
        </div>
        <div>
          <TextField
            label="Postal Code"
            {...register('postalCode')}
            error={!!errors.postalCode}
            helperText={errors.postalCode?.message}
            fullWidth
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div>
          <TextField
            label="Confirm Password"
            type="password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            fullWidth
          />
        </div>
      </div>
      
      <div>
        <h3 className="font-bold text-lg mb-2">Children</h3>
        
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 gap-4 mb-4 p-4 border rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <TextField
                  label="First Name"
                  {...register(`children.${index}.firstName` as const)}
                  error={!!errors.children?.[index]?.firstName}
                  helperText={errors.children?.[index]?.firstName?.message}
                  fullWidth
                />
              </div>
              <div>
                <TextField
                  label="Last Name"
                  {...register(`children.${index}.lastName` as const)}
                  error={!!errors.children?.[index]?.lastName}
                  helperText={errors.children?.[index]?.lastName?.message}
                  fullWidth
                />
              </div>
              <div>
                <TextField
                  label="Age"
                  type="number"
                  {...register(`children.${index}.age` as const, {
                    valueAsNumber: true,
                  })}
                  error={!!errors.children?.[index]?.age}
                  helperText={errors.children?.[index]?.age?.message}
                  fullWidth
                />
              </div>
            </div>
            <div>
              <TextField
                label="Special Notes"
                multiline
                rows={3}
                {...register(`children.${index}.specialNotes` as const)}
                error={!!errors.children?.[index]?.specialNotes}
                helperText={errors.children?.[index]?.specialNotes?.message}
                placeholder="Allergies, medical conditions, special needs, or any other important information"
                fullWidth
              />
            </div>
            {index > 0 && (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => remove(index)}
                className="mt-2"
              >
                Remove Child
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outlined"
          onClick={() => append({ firstName: '', lastName: '', age: 0, specialNotes: '' })}
          className="mt-2"
        >
          Add Another Child
        </Button>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-2">Services Needed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormControlLabel
            control={
              <Checkbox {...register('services.childcare')} />
            }
            label="Childcare"
          />
          <FormControlLabel
            control={
              <Checkbox {...register('services.mealPreparation')} />
            }
            label="Meal Preparation"
          />
          <FormControlLabel
            control={
              <Checkbox {...register('services.lightHousekeeping')} />
            }
            label="Light Housekeeping"
          />
          <FormControlLabel
            control={
              <Checkbox {...register('services.tutoring')} />
            }
            label="Tutoring"
          />
          <FormControlLabel
            control={
              <Checkbox {...register('services.petMinding')} />
            }
            label="Pet Minding"
          />
        </div>
      </div>

      <div>
        <TextField
          label="Additional Information"
          multiline
          rows={4}
          {...register('additionalInfo')}
          error={!!errors.additionalInfo}
          helperText={errors.additionalInfo?.message}
          fullWidth
        />
      </div>

      <div>
        <h3 className="font-bold text-lg mb-2">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TextField
              label="Name on Card"
              {...register('payment.nameOnCard')}
              error={!!errors.payment?.nameOnCard}
              helperText={errors.payment?.nameOnCard?.message}
              fullWidth
            />
          </div>
          <div>
            <TextField
              label="Card Number"
              {...register('payment.cardNumber')}
              error={!!errors.payment?.cardNumber}
              helperText={errors.payment?.cardNumber?.message}
              fullWidth
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <TextField
              label="Expiry Date (MM/YY)"
              {...register('payment.expiryDate')}
              error={!!errors.payment?.expiryDate}
              helperText={errors.payment?.expiryDate?.message}
              placeholder="MM/YY"
              fullWidth
            />
          </div>
          <div>
            <TextField
              label="CVV"
              {...register('payment.cvv')}
              error={!!errors.payment?.cvv}
              helperText={errors.payment?.cvv?.message}
              fullWidth
            />
          </div>
        </div>
      </div>

      <div>
        <FormControlLabel
          control={
            <Checkbox
              {...register('payment.saveCard')}
            />
          }
          label="Save this card for future bookings"
        />
      </div>

      <div>
        <FormControlLabel
          control={
            <Checkbox
              {...register('payment.agreedToTerms')}
            />
          }
          label="I agree to the Terms of Service and Privacy Policy"
        />
        {errors.payment?.agreedToTerms && (
          <p className="text-red-500 text-sm mt-1">{errors.payment.agreedToTerms.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Register'}
      </Button>
    </form>
  );
}