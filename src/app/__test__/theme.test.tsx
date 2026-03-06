import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@pagopa/mui-italia', () => ({
  theme: {
    palette: { primary: { main: '#000' } },
    typography: {},
  },
}));

import ThemeProviderComponent from '../theme';

describe('ThemeProviderComponent', () => {
  it('renders children', () => {
    render(
      <ThemeProviderComponent>
        <div>Hello</div>
      </ThemeProviderComponent>
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});