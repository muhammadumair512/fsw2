/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import axios from 'axios';

import { ServiceData } from '@/types/service/ServiceTypes';

export function useServices() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update services
  const updateServices = async (serviceData: ServiceData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use direct update without admin approval
      const response = await axios.post('/api/user/update-services-direct', serviceData);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError('Failed to update services');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    updateServices,
  };
}