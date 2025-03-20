'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Snackbar, Alert, AlertTitle, IconButton, Button } from '@mui/material';
import React, { useState } from 'react';

import { SnackbarContext, SnackbarOptions } from '@/contexts/SnackbarContext';

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SnackbarOptions | null>(null);

  const showSnackbar = (newOptions: SnackbarOptions) => {
    setOptions(newOptions);
    setOpen(true);
  };

  const hideSnackbar = () => {
    setOpen(false);
  };

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    hideSnackbar();
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      {options && (
        <Snackbar
          open={open}
          autoHideDuration={options.duration || 6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={options.severity}
            onClose={handleClose}
            action={
              options.action ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={options.action.onClick}
                >
                  {options.action.label}
                </Button>
              ) : (
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={handleClose}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )
            }
          >
            {options.title && <AlertTitle>{options.title}</AlertTitle>}
            {options.message}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
};