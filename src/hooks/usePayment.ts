/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import axios from 'axios';

import { PaymentData } from '@/types/payment/PaymentTypes';

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update payment information
  const updatePayment = async (paymentData: PaymentData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/user/update-payment-direct', paymentData);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError('Failed to update payment information');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    updatePayment,
  };
}