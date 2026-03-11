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
        token: 'mock-valid-token',
      })
    ).resolves.toEqual({
      amount: '22.21',
      subject: 'Mensa scolastica',
      debtor: { name: 'Mario Rossi', taxCode: 'RSSMRA80A01H501U' },
      payee: { name: 'Comune di Roma', taxCode: '12345678901' },
      refNumberType: 'NAV',
      refNumberValue: '3020123456789',
    });
  });

  it('throws mapped ui error on 401', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(E.right({ status: 401 }));

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
        token: 'wrong-token',
      })
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      title: 'Utente non autorizzato',
      status: 401,
    });
  });

  it('throws mapped ui error on 404', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(
      E.right({
        status: 404,
        value: {
          title: 'Not Found',
          status: 404,
          detail: 'Biz Event not found with CF and IUV',
          code: 'BZ_404_004',
        },
      })
    );

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      title: 'Pagamento non trovato',
      status: 404,
      code: 'BZ_404_004',
    });
  });

  it('throws mapped ui error on 429', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(E.right({ status: 429 }));

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      title: 'Troppe richieste',
      status: 429,
    });
  });

  it('throws generic error on unexpected status', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(E.right({ status: 418 }));

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toThrow('Errore verifica');
  });

    it('throws when base url env is missing', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule();

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toThrow('Missing NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL');

    expect(createBizEventsSearchTransactionsClientMock).not.toHaveBeenCalled();
  });

  it('returns mapped value on 200 even when payee and debtor are missing', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(
      E.right({
        status: 200,
        value: {
          amount: '22.21',
          subject: 'Mensa scolastica',
          refNumberType: 'NAV',
          refNumberValue: '3020123456789',
          payee: undefined,
          debtor: undefined,
        },
      })
    );

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).resolves.toEqual({
      amount: '22.21',
      subject: 'Mensa scolastica',
      payee: undefined,
      debtor: undefined,
      refNumberType: 'NAV',
      refNumberValue: '3020123456789',
    });
  });

  it('rethrows left error message when client returns Either.left(Error)', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(E.left(new Error('backend down')));

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toThrow('backend down');
  });

  it('throws generic communication error when client returns Either.left(non Error)', async () => {
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

  it('throws mapped ui error on 400', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(
      E.right({
        status: 400,
        value: {
          title: 'Bad Request',
          status: 400,
          detail: 'Invalid CF (Tax Code)',
          code: 'GN_400_003',
        },
      })
    );

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      title: 'Codice fiscale non valido',
      status: 400,
      code: 'GN_400_003',
    });
  });

  it('throws mapped ui error on 403', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(
      E.right({
        status: 403,
        value: {
          title: 'Forbidden',
          status: 403,
          detail: 'Invalid NAV matching',
        },
      })
    );

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      title: 'Numero avviso non valido',
      status: 403,
    });
  });

  it('throws mapped ui error on 500', async () => {
    const { getPaidNoticeDetail } = await loadHelperModule('https://api.example.test');

    clientGetPaidNoticeDetailMock.mockResolvedValue(
      E.right({
        status: 500,
        value: {
          title: 'Internal Server Error',
          status: 500,
          detail: 'Unexpected error',
          code: 'UN_500_000',
        },
      })
    );

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: '3020123456789',
      })
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      title: 'Errore imprevisto',
      status: 500,
      code: 'UN_500_000',
    });
  });
});