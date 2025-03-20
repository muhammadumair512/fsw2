import { colors } from './colors';

const palette = {
  primary: {
    main: colors.primary.main,
    light: colors.primary.light,
    dark: colors.primary.dark,
    contrastText: '#fff',
  },
  secondary: {
    main: '#767778',
    light: colors.secondary.light,
    dark: colors.secondary.dark,
    contrastText: '#fff',
  },
  grey: {
    50: colors.neutral[100],
    100: colors.neutral[200],
    200: colors.neutral[300],
    300: colors.neutral[400],
    400: colors.neutral[500],
    500: colors.neutral[600],
    600: colors.neutral[700],
    700: colors.neutral[800],
    800: colors.neutral[900],
    900: colors.neutral[1000],
  },
  error: {
    main: colors.red[100],
    light: colors.red[100],
    dark: colors.red[200],
  },
  warning: {
    main: colors.yellow[100],
    light: colors.yellow[100],
    dark: colors.yellow[200],
  },
  success: {
    main: colors.green[100],
    light: colors.green[100],
    dark: colors.green[200],
  },
  background: {
    default: '#fff',
    paper: '#fff',
  },
};

export default palette;