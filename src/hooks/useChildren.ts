/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import axios from 'axios';

import { ChildData } from '@/types/child/ChildTypes';

export function useChildren() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new child
  const addChild = async (childData: Omit<ChildData, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use direct add without admin approval
      const response = await axios.post('/api/user/add-child-direct', childData);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError('Failed to add child');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Update child information
  const updateChild = async (childData: ChildData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use direct update without admin approval
      const response = await axios.post('/api/user/update-child-direct', childData);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError('Failed to update child');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    addChild,
    updateChild,
  };
}