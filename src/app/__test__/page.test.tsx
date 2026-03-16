import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@pagopa/mui-italia', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HeaderAccount: (props: any) => (
    <div>
      <div data-testid="HeaderAccount" />
      <button onClick={props.onAssistanceClick}>Header assistenza</button>
      <button onClick={props.onLogin}>Header login</button>
    </div>
  ),
  HeaderProduct: () => <div data-testid="HeaderProduct" />,
}));

const getPaidNoticeDetailMock = jest.fn();
jest.mock('../utils/api/bizEventSearchTransactionsHelper', () => ({
  getPaidNoticeDetail: (payload: {
    organizationFiscalCode: string;
    debtorFiscalCode: string;
    nav: string;
    token?: string;
  }) => getPaidNoticeDetailMock(payload),
}));

const parseCieFragmentMock = jest.fn();
jest.mock('../utils/fragment', () => ({
  parseCieFragment: (hash: string) => parseCieFragmentMock(hash),
}));

const validateSearchInputMock = jest.fn();
jest.mock('../utils/validators', () => ({
  validateSearchInput: (input: {
    enteFiscalCode: string;
    citizenFiscalCode: string;
    nav: string;
  }) => validateSearchInputMock(input),
}));

jest.mock('../components/FullPageError', () => {
  function MockFullPageError(props: {
    title: string;
    description?: string;
    status?: number;
    code?: string;
  }) {
    return (
      <div role="alert">
        <div>{props.title}</div>
        {props.description && <div>{props.description}</div>}
        {props.status !== undefined && <div>{`HTTP ${props.status}`}</div>}
        {props.code && <div>{`Codice errore: ${props.code}`}</div>}
      </div>
    );
  }

  return MockFullPageError;
});

import Home from '../page';
import { ApiRequestError } from '../utils/api/errors';

const successfulDetail = {
  amount: '22.21',
  subject: 'Test subject',
  payee: { name: 'Comune', taxCode: '12345678901' },
  debtor: { name: 'Mario', taxCode: 'RSSMRA80A01H501U' },
  refNumberType: 'NAV',
  refNumberValue: '3020123456780',
};

describe('Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.hash = '#cfEnte=12345678901&cfCittadino=RSSMRA80A01H501U&nav=3020123456780';

    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456780',
    });

    validateSearchInputMock.mockReturnValue(null);
    getPaidNoticeDetailMock.mockResolvedValue(successfulDetail);
  });

  it('shows an error when fragment parameters are missing', async () => {
    parseCieFragmentMock.mockReturnValue(null);

    render(<Home />);

    expect(await screen.findByText('Parametri mancanti')).toBeInTheDocument();
    expect(
      screen.getByText(/CF Ente, CF Cittadino e NAV devono essere nel fragment URL/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(getPaidNoticeDetailMock).not.toHaveBeenCalled();
  });

  it('shows an error when validation fails', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: 'xxx',
      citizenFiscalCode: 'yyy',
      nav: 'zzz',
    });

    validateSearchInputMock.mockReturnValue('Il codice fiscale ente indicato non è formalmente corretto.');

    render(<Home />);

    expect(await screen.findByText('Parametri non validi')).toBeInTheDocument();
    expect(screen.getByText('Il codice fiscale ente indicato non è formalmente corretto.')).toBeInTheDocument();
    expect(getPaidNoticeDetailMock).not.toHaveBeenCalled();
  });

it('renders the paid notice result and request summary when API returns a detail', async () => {
  render(<Home />);

  expect(await screen.findByText('Esito verifica pagamento')).toBeInTheDocument();
  expect(screen.getByText('PAGATO')).toBeInTheDocument();

  const requestSectionTitle = screen.getByText('Dati richiesta');
  const requestSection = requestSectionTitle.parentElement as HTMLElement;

  expect(within(requestSection).getByText('CF Ente')).toBeInTheDocument();
  expect(within(requestSection).getByText('CF Cittadino')).toBeInTheDocument();
  expect(within(requestSection).getByText('Numero avviso / NAV')).toBeInTheDocument();

  expect(screen.getAllByText('12345678901').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('RSSMRA80A01H501U').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('3020123456780').length).toBeGreaterThanOrEqual(1);
});

  it('shows a generic error when API throws', async () => {
    getPaidNoticeDetailMock.mockRejectedValue(new Error('Kaboom'));

    render(<Home />);

    expect(await screen.findByText('Errore durante la verifica')).toBeInTheDocument();
    expect(screen.getByText('Kaboom')).toBeInTheDocument();
  });

  it('shows mapped error when API throws ApiRequestError', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '40412121212121212',
      token: 'mock-valid-token',
    });

    getPaidNoticeDetailMock.mockRejectedValue(
      new ApiRequestError({
        title: 'Pagamento non trovato',
        description: 'Non è stato trovato alcun pagamento con i dati indicati.',
        status: 404,
        code: 'BZ_404_004',
      })
    );

    render(<Home />);

    expect(await screen.findByText('Pagamento non trovato')).toBeInTheDocument();
    expect(
      screen.getByText('Non è stato trovato alcun pagamento con i dati indicati.')
    ).toBeInTheDocument();
    expect(screen.getByText('HTTP 404')).toBeInTheDocument();
    expect(screen.getByText('Codice errore: BZ_404_004')).toBeInTheDocument();
  });

  it('passes token to getPaidNoticeDetail when available in fragment', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456780',
      token: 'tok',
    });

    render(<Home />);

    await screen.findByText('Esito verifica pagamento');

    expect(getPaidNoticeDetailMock).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'tok' })
    );
  });

  it('normalizes inputs (trim + uppercase) before validation and API call', async () => {
    parseCieFragmentMock.mockReturnValue({
      enteFiscalCode: '  abcdEF12345  ',
      citizenFiscalCode: '  rSSmra80a01h501u ',
      nav: '  3020  ',
      token: 'tok',
    });

    render(<Home />);

    await screen.findByText('Esito verifica pagamento');

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

  it('does not run twice on rerender (didRun guard)', async () => {
    const { rerender } = render(<Home />);

    await screen.findByText('Esito verifica pagamento');
    expect(getPaidNoticeDetailMock).toHaveBeenCalledTimes(1);

    rerender(<Home />);

    await waitFor(() => {
      expect(getPaidNoticeDetailMock).toHaveBeenCalledTimes(1);
    });
  });

  it('wires header callbacks', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    parseCieFragmentMock.mockReturnValue(null);

    render(<Home />);

    fireEvent.click(screen.getByRole('button', { name: 'Header assistenza' }));
    fireEvent.click(screen.getByRole('button', { name: 'Header login' }));

    expect(logSpy).toHaveBeenCalledWith('Assistenza');
    expect(logSpy).toHaveBeenCalledWith('Login');

    logSpy.mockRestore();
  });
});