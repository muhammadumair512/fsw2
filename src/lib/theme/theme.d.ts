import palette from './palette';

declare module '@mui/material/styles' {
  interface Theme {
    customPalette: typeof palette;
  }
  interface ThemeOptions {
    customPalette?: typeof palette;
  }
}
