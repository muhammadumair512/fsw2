'use client';

import { Paper, Typography } from '@mui/material';

export default function SettingsPage() {
  return (
    <Paper className="p-6">
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Settings
      </Typography>
      
      <Typography variant="body1">
        This page is for admin settings and configuration. Features will be added in future updates.
      </Typography>
    </Paper>
  );
}