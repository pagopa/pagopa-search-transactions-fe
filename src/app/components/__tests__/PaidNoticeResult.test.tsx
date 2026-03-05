import React from 'react';
import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import PaidNoticeResult from '../PaidNoticeResult';
import type { CiePaidNoticeDetail } from '../../types/CieSearch';
import { renderWithProviders } from './test-utils';

describe('PaidNoticeResult', () => {
  const baseDetail: CiePaidNoticeDetail = {
    amount: 10.5,
    subject: 'Payment for service',
    payee: { name: 'Comune di Roma', taxCode: '12345678901' },
    debtor: { name: 'Mario Rossi', taxCode: 'RSSMRA80A01H501U' },
    refNumberValue: '302012345678901234',
    refNumberType: 'NAV',
  };

  it('renders the success summary and paid status', () => {
    renderWithProviders(<PaidNoticeResult detail={baseDetail} onBack={jest.fn()} />);

    expect(screen.getByText('Esito verifica pagamento')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Pagamento trovato.');
    expect(screen.getByText('PAGATO')).toBeInTheDocument();
  });

  it('formats the amount as EUR using Italian locale', () => {
    renderWithProviders(
      <PaidNoticeResult detail={{ ...baseDetail, amount: '10,5' }} onBack={jest.fn()} />
    );

    // it-IT currency output is typically like "10,50 €" (with a space that can be NBSP)
    expect(screen.getByText(/10,50\s*€|€\s*10,50/)).toBeInTheDocument();
  });

  it('shows fallbacks when optional fields are missing', () => {
    const detail: CiePaidNoticeDetail = {
        amount: undefined,
        subject: undefined,
        payee: { taxCode: 'AAAABBBBCCCCDDDD' },
        debtor: { taxCode: 'EEEEFFFFGGGGHHHH' },
        refNumberType: undefined,
        refNumberValue: undefined,
    };

    renderWithProviders(<PaidNoticeResult detail={detail} onBack={jest.fn()} />);

    // Amount fallback: scope to the "Importo" field container
    const importoLabel = screen.getByText('Importo');
    const importoContainer = importoLabel.closest('div');
    expect(importoContainer).not.toBeNull();
    expect(within(importoContainer as HTMLElement).getByText('-')).toBeInTheDocument();

    // Subject fallback: scope to the "Causale" field container
    const causaleLabel = screen.getByText('Causale');
    const causaleContainer = causaleLabel.closest('div');
    expect(causaleContainer).not.toBeNull();
    expect(within(causaleContainer as HTMLElement).getByText('-')).toBeInTheDocument();

    // Payee/debtor show tax code even when name is missing
    expect(screen.getByText('AAAABBBBCCCCDDDD')).toBeInTheDocument();
    expect(screen.getByText('EEEEFFFFGGGGHHHH')).toBeInTheDocument();
    });

  it('does not call onBack just by rendering', () => {
    const onBack = jest.fn();
    renderWithProviders(<PaidNoticeResult detail={baseDetail} onBack={onBack} />);
    expect(onBack).not.toHaveBeenCalled();
  });
});