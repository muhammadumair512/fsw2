import { createTheme } from '@mui/material/styles';

import palette from './palette';
import ThemeRegistry from './theme-registry';
import typography from './typography';

export { ThemeRegistry };

const theme = createTheme({
  palette,
  customPalette: palette,
  typography,
});

export default theme;