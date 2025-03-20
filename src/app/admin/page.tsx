/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress 
} from '@mui/material';
import {
  People as PeopleIcon,
  VerifiedUser as VerifiedUserIcon,
  NewReleases as NewReleasesIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { useSnackbar } from '@/contexts/SnackbarContext';

export default function AdminDashboard() {
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    updateRequests: 0,
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Get users
        const usersResponse = await axios.get('/api/admin/users');
        const users = usersResponse.data;
        
        // Get update requests
        const requestsResponse = await axios.get('/api/admin/update-requests');
        const requests = requestsResponse.data;
        
        // Calculate stats
        const pendingUsers = users.filter((user: any) => !user.isApproved).length;
        const activeUsers = users.filter((user: any) => user.isApproved && user.isActive).length;
        const inactiveUsers = users.filter((user: any) => user.isApproved && !user.isActive).length;
        
        setStats({
          totalUsers: users.length,
          pendingUsers,
          activeUsers,
          inactiveUsers,
          updateRequests: requests.length,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        showSnackbar({
          message: 'Failed to fetch dashboard statistics',
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [showSnackbar]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Paper className="p-6">
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="flex items-center">
              <PeopleIcon className="mr-4 text-blue-500" fontSize="large" />
              <div>
                <Typography variant="h6">{stats.totalUsers}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Users
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="flex items-center">
              <NewReleasesIcon className="mr-4 text-yellow-500" fontSize="large" />
              <div>
                <Typography variant="h6">{stats.pendingUsers}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending Approval
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="flex items-center">
              <VerifiedUserIcon className="mr-4 text-green-500" fontSize="large" />
              <div>
                <Typography variant="h6">{stats.activeUsers}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Active Users
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="flex items-center">
              <PersonOffIcon className="mr-4 text-red-500" fontSize="large" />
              <div>
                <Typography variant="h6">{stats.inactiveUsers}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Inactive Users
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom>
        System Status
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Update Requests
              </Typography>
              <Typography variant="h4">
                {stats.updateRequests}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending requests from users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Typography variant="h4" className="text-green-500">
                Operational
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All systems running normally
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}