import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import FullPageError from '../FullPageError';
import { renderWithProviders } from './test-utils';

describe('FullPageError', () => {
  it('renders the provided title inside the error alert', () => {
    renderWithProviders(<FullPageError title="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the optional description when provided', () => {
    renderWithProviders(
      <FullPageError title="Error" description="Please try again later." />
    );

    expect(screen.getByText('Please try again later.')).toBeInTheDocument();
  });

  it('does not render any description text when description is omitted', () => {
    renderWithProviders(<FullPageError title="Error" />);

    expect(screen.queryByText(/try again later/i)).not.toBeInTheDocument();
  });
});