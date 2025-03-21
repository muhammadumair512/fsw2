/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { CircularProgress, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import ProfileTab from '@/features/dashboard/ProfileTab';
import ServicesTab from '@/features/dashboard/ServicesTab';
import ChildrenTab from '@/features/dashboard/ChildrenTab';
import PaymentTab from '@/features/dashboard/PaymentTab';
import SecurityTab from '@/features/dashboard/SecurityTab';
import { useProfile } from '@/hooks/useProfile';
import { useSnackbar } from '@/contexts/SnackbarContext';
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const { profile, isLoading, error, fetchProfile } = useProfile();
  const { showSnackbar } = useSnackbar();
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  useEffect(() => {
    if (error) {
      showSnackbar({
        message: 'Failed to load your profile. Please try again.',
        severity: 'error',
      });
    }
  }, [error, showSnackbar]);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography>Failed to load profile. Please refresh the page.</Typography>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Paper className="p-6 mb-6">
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {profile?.firstName}!
          </Typography>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Profile" />
            <Tab label="Services" />
            <Tab label="Children" />
            <Tab label="Payment" />
            <Tab label="Security" />
          </Tabs>
          <div className="mt-6">
            {tabValue === 0 && <ProfileTab profile={profile} refreshProfile={fetchProfile} />}
            {tabValue === 1 && <ServicesTab profile={profile} refreshProfile={fetchProfile} />}
            {tabValue === 2 && <ChildrenTab profile={profile} refreshProfile={fetchProfile} />}
            {tabValue === 3 && <PaymentTab profile={profile} refreshProfile={fetchProfile} />}
            {tabValue === 4 && <SecurityTab />}
          </div>
        </Paper>
      </main>
    </div>
  );
}