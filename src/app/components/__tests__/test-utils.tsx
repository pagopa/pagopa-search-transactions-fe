import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

let Providers: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ThemeProvider } = require('@mui/material');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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