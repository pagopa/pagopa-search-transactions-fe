import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

let Providers: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>;

try {
   
  const { ThemeProvider } = require('@mui/material');
   
  const { theme } = require('@pagopa/mui-italia');

  Providers = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;
} catch {
  // Optional: keep rendering without theme
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: Providers, ...options });
}