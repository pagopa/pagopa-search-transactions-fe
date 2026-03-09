import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import FullPageLoader from '../FullPageLoader';
import { renderWithProviders } from './test-utils';

describe('FullPageLoader', () => {
  it('renders a progress indicator and the default label', () => {
    renderWithProviders(<FullPageLoader />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Caricamento…')).toBeInTheDocument();
  });

  it('renders a custom label when provided', () => {
    renderWithProviders(<FullPageLoader label="Loading data" />);

    expect(screen.getByText('Loading data')).toBeInTheDocument();
  });
});