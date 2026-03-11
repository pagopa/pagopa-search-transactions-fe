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

  it('renders only the HTTP status when only status is provided', () => {
    renderWithProviders(<FullPageError title="Error" status={404} />);

    expect(screen.getByText('HTTP 404')).toBeInTheDocument();
    expect(screen.queryByText(/Codice errore:/i)).not.toBeInTheDocument();
  });

  it('renders only the error code when only code is provided', () => {
    renderWithProviders(<FullPageError title="Error" code="BZ_404_004" />);

    expect(screen.queryByText(/HTTP/i)).not.toBeInTheDocument();
  });

  it('renders both status and code when both are provided', () => {
    renderWithProviders(
      <FullPageError
        title="Error"
        description="Descrizione"
        status={500}
        code="UN_500_000"
      />
    );

    expect(screen.getByText(/HTTP 500/i)).toBeInTheDocument();
  });
});