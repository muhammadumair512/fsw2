/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
interface Profile {
    firstName: string;
  }
  
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/api/user/profile');
      setProfile(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to load profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use direct update without admin approval
      const response = await axios.post('/api/user/update-profile-direct', data);
      
      // Refresh profile data
      await fetchProfile();
      
      return { success: true, data: response.data };
    } catch (err) {
      setError('Failed to update profile');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  };
}