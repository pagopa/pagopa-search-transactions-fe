import * as E from 'fp-ts/Either';

const createBizEventsSearchTransactionsClientMock = jest.fn();
const clientGetPaidNoticeDetailMock = jest.fn();

async function loadHelperModule(baseUrl?: string) {
  jest.resetModules();

  if (baseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL = baseUrl;
  }

  createBizEventsSearchTransactionsClientMock.mockImplementation(() => ({
    getPaidNoticeDetail: clientGetPaidNoticeDetailMock,
  }));

  jest.doMock('../../api/client', () => ({
    createBizEventsSearchTransactionsClient: (token?: string) =>
      createBizEventsSearchTransactionsClientMock(token),
  }));

  return import('../../api/bizEventSearchTransactionsHelper');
}

describe('getPaidNoticeDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global, 'crypto', {
      value: { randomUUID: jest.fn(() => 'uuid-123') },
      configurable: true,
    });
  });

  it('throws when env is missing', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule();

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toThrow('Missing NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL');
  });

  it('returns mapped value on 200', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(
      E.right({
        status: 200,
        value: {
          amount: '22.21',
          subject: 'Mensa scolastica',
          debtor: { name: 'Mario Rossi', taxCode: 'RSSMRA80A01H501U', extra: 'ignored' },
          payee: { name: 'Comune di Roma', taxCode: '12345678901', extra: 'ignored' },
          refNumberType: 'NAV',
          refNumberValue: '3020123456789',
        },
      })
    );

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
        token: 'tok-123',
      })
    ).resolves.toEqual({
      amount: '22.21',
      subject: 'Mensa scolastica',
      debtor: { name: 'Mario Rossi', taxCode: 'RSSMRA80A01H501U' },
      payee: { name: 'Comune di Roma', taxCode: '12345678901' },
      refNumberType: 'NAV',
      refNumberValue: '3020123456789',
    });

    expect(createBizEventsSearchTransactionsClientMock).toHaveBeenCalledWith('tok-123');
    expect(clientGetPaidNoticeDetailMock).toHaveBeenCalledWith({
      'organization-fiscal-code': '12345678901',
      'x-fiscal-code': 'RSSMRA80A01H501U',
      nav: '3020123456789',
      'X-Request-Id': 'uuid-123',
    });
  });

  it('returns null on 404', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(
      E.right({ status: 404, value: { title: 'Not found' } })
    );

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).resolves.toBeNull();
  });

  it('rethrows left Error message', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(E.left(new Error('Kaboom left')));

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toThrow('Kaboom left');
  });

  it('uses generic communication error for non-Error left values', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(E.left('boom'));

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toThrow('Errore di comunicazione con il backend');
  });
});