import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@pagopa/mui-italia', () => ({
  HeaderAccount: () => <div data-testid="HeaderAccount" />,
  HeaderProduct: () => <div data-testid="HeaderProduct" />,
}));

const getPaidNoticeDetailMock = jest.fn();
jest.mock('../utils/api/client', () => ({
  getPaidNoticeDetail: (payload: any) => getPaidNoticeDetailMock(payload),
}));

const parseCieFragmentMock = jest.fn();
jest.mock('../utils/fragment', () => ({
  parseCieFragment: (hash: string) => parseCieFragmentMock(hash),
}));

const validateSearchInputMock = jest.fn();
jest.mock('../utils/validators', () => ({
  validateSearchInput: (input: any) => validateSearchInputMock(input),
}));

jest.mock('../components/FullPageError', () => (props: any) => (
  <div role="alert">
    <div>{props.title}</div>
    {props.description && <div>{props.description}</div>}
    <button onClick={props.onBack}>Indietro</button>
    <button onClick={props.onRetry}>Riprova</button>
  </div>
));

import Home from '../page';

describe('Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.hash = '#anything';
  });

  it('shows an error when fragment parameters are missing', async () => {
    parseCieFragmentMock.mockReturnValue(null);

    render(<Home />);

    // No loader is guaranteed here; the page can render the error immediately.
    expect(await screen.findByText('Parametri mancanti')).toBeInTheDocument();
    expect(
      screen.getByText(/CF Ente, CF Cittadino e NAV devono essere nel fragment URL/i)
    ).toBeInTheDocument();

    // also assert that an error alert exists
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows an error when validation fails', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: 'xxx',
      citizenFiscalCode: 'yyy',
      nav: 'zzz',
    });

    validateSearchInputMock.mockReturnValue('CF Ente non valido.');

    render(<Home />);

    expect(await screen.findByText('Parametri non validi')).toBeInTheDocument();
    expect(screen.getByText('CF Ente non valido.')).toBeInTheDocument();
    expect(getPaidNoticeDetailMock).not.toHaveBeenCalled();
  });

  it('shows not found warning when API returns null', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456789',
    });

    validateSearchInputMock.mockReturnValue(null);
    getPaidNoticeDetailMock.mockResolvedValue(null);

    render(<Home />);

    expect(await screen.findByText(/Pagamento non trovato/i)).toBeInTheDocument();

    // The NAV appears in multiple places (request summary + alert). Assert it appears at least once.
    expect(screen.getAllByText('3020123456789').length).toBeGreaterThanOrEqual(1);

    // Even better: check that the alert contains it
    const alert = screen.getByRole('alert');
    expect(within(alert).getByText('3020123456789')).toBeInTheDocument();
  });

  it('renders the paid notice result when API returns a detail', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456780',
    });

    validateSearchInputMock.mockReturnValue(null);
    getPaidNoticeDetailMock.mockResolvedValue({
      amount: '22.21',
      subject: 'Test subject',
      payee: { name: 'Comune', taxCode: '12345678901' },
      debtor: { name: 'Mario', taxCode: 'RSSMRA80A01H501U' },
      refNumberType: 'NAV',
      refNumberValue: '3020123456780',
    });

    render(<Home />);

    expect(await screen.findByText('Esito verifica pagamento')).toBeInTheDocument();
    expect(screen.getByText('PAGATO')).toBeInTheDocument();
  });

  it('shows a generic error when API throws', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456780',
    });

    validateSearchInputMock.mockReturnValue(null);
    getPaidNoticeDetailMock.mockRejectedValue(new Error('Kaboom'));

    render(<Home />);

    expect(await screen.findByText('Errore durante la verifica')).toBeInTheDocument();
    expect(screen.getByText('Kaboom')).toBeInTheDocument();
  });

  it('passes token to getPaidNoticeDetail when available in fragment', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456780',
      token: 'tok',
    });

    validateSearchInputMock.mockReturnValue(null);
    getPaidNoticeDetailMock.mockResolvedValue(null);

    render(<Home />);

    await screen.findByText(/Pagamento non trovato/i);

    expect(getPaidNoticeDetailMock).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'tok' })
    );
  });

  it('renders requestType when present', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456789',
      requestType: 'ANNULLAMENTO',
    });
    validateSearchInputMock.mockReturnValue(null);
    getPaidNoticeDetailMock.mockResolvedValue(null);

    render(<Home />);

    await screen.findByText(/Pagamento non trovato/i);
    expect(screen.getByText('Tipologia richiesta')).toBeInTheDocument();
    expect(screen.getByText('ANNULLAMENTO')).toBeInTheDocument();
  });

  it('calls history.back when clicking Indietro in notFound', async () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});

    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456789',
    });
    validateSearchInputMock.mockReturnValue(null);
    getPaidNoticeDetailMock.mockResolvedValue(null);

    render(<Home />);

    await screen.findByText(/Pagamento non trovato/i);
    fireEvent.click(screen.getByRole('button', { name: /indietro/i }));

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('normalizes inputs (trim + uppercase) before validation and API call', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '  abcdEF12345  ',
      citizenFiscalCode: '  rSSmra80a01h501u ',
      nav: '  3020  ',
      token: 'tok',
    });

    validateSearchInputMock.mockReturnValue(null);
    getPaidNoticeDetailMock.mockResolvedValue(null);

    render(<Home />);
    await screen.findByText(/Pagamento non trovato/i);

    expect(validateSearchInputMock).toHaveBeenCalledWith({
      enteFiscalCode: 'ABCDEF12345',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020',
    });

    expect(getPaidNoticeDetailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationFiscalCode: 'ABCDEF12345',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020',
        token: 'tok',
      })
    );
  });

  it('retry re-runs check and clears previous error', async () => {
    // 1a run: fragment ok, validation error
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: 'xxx',
      citizenFiscalCode: 'yyy',
      nav: 'zzz',
    });
    validateSearchInputMock.mockReturnValueOnce('CF Ente non valido.');

    render(<Home />);
    expect(await screen.findByText('Parametri non validi')).toBeInTheDocument();

    // 2a run: validation ok + api null => not found
    validateSearchInputMock.mockReturnValueOnce(null);
    getPaidNoticeDetailMock.mockResolvedValueOnce(null);

    fireEvent.click(screen.getByRole('button', { name: /riprova/i }));

    expect(await screen.findByText(/Pagamento non trovato/i)).toBeInTheDocument();
  });

  it('does not run twice on rerender (didRun guard)', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456789',
    });
    validateSearchInputMock.mockReturnValue(null);
    getPaidNoticeDetailMock.mockResolvedValue(null);

    const { rerender } = render(<Home />);
    await screen.findByText(/Pagamento non trovato/i);

    rerender(<Home />);
    expect(getPaidNoticeDetailMock).toHaveBeenCalledTimes(1);
  });  
});