'use client';

import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';

export default function ThemeProviderComponent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}