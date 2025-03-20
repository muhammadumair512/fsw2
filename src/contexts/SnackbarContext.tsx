import { createContext, useContext } from 'react';

export type SnackbarAction = {
  label: string;
  onClick: () => void;
};

export type SnackbarOptions = {
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  duration?: number;
  action?: SnackbarAction;
};

type SnackbarContextType = {
  showSnackbar: (options: SnackbarOptions) => void;
  hideSnackbar: () => void;
};

export const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
  hideSnackbar: () => {},
});

export const useSnackbar = () => useContext(SnackbarContext);