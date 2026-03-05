/* eslint-disable @typescript-eslint/no-explicit-any */

describe('getPaidNoticeDetail', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('returns null in local-mock mode when NAV ends with an odd digit', async () => {
    process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL = '';

    // Re-import after env setup
    const { getPaidNoticeDetail } = await import('../../api/client');

    const res = await getPaidNoticeDetail({
      organizationFiscalCode: '12345678901',
      debtorFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456789', // ends with 9 => odd => null
    });

    expect(res).toBeNull();
  });

  it('throws in local-mock mode when NAV ends with 999', async () => {
    process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL = '';

    const { getPaidNoticeDetail } = await import('../../api/client');

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: 'ABC999',
      })
    ).rejects.toThrow('Errore mock backend (simulato)');
  });

  it('returns a mocked paid detail in local-mock mode when NAV ends with an even digit', async () => {
    process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL = '';

    const { getPaidNoticeDetail } = await import('../../api/client');

    const res = await getPaidNoticeDetail({
      organizationFiscalCode: '12345678901',
      debtorFiscalCode: 'RSSMRA80A01H501U',
      nav: '3020123456780',
    });

    expect(res).not.toBeNull();
    expect(res?.refNumberType).toBe('NAV');
    expect(res?.refNumberValue).toBe('3020123456780');
    expect(res?.payee?.taxCode).toBe('12345678901');
    expect(res?.debtor?.taxCode).toBe('RSSMRA80A01H501U');
  });

  it('calls fetch with correct url and headers when API base url is configured', async () => {
    process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL = 'https://example.test';

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        subject: 'Hello',
        amount: '10.00',
        debtor: { fiscalCode: 'RSSMRA80A01H501U' },
        payee: { fiscalCode: '12345678901' },
        refNumber: { type: 'NAV', value: 'NAV123' },
      }),
    });

    (global as any).fetch = fetchMock;

    const { getPaidNoticeDetail } = await import('../../api/client');

    const res = await getPaidNoticeDetail({
      organizationFiscalCode: '12345678901',
      debtorFiscalCode: 'RSSMRA80A01H501U',
      nav: 'NAV123',
      token: 'tok',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL}/transactions/organizations/12345678901/notices/NAV123`);

    expect(options).toMatchObject({
      method: 'GET',
      cache: 'no-store',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'x-fiscal-code': 'RSSMRA80A01H501U',
        'x-cie-token': 'tok',
      }),
    });

    expect(res).toEqual({
      subject: 'Hello',
      amount: '10.00',
      debtor: { name: undefined, taxCode: 'RSSMRA80A01H501U' },
      payee: { name: undefined, taxCode: '12345678901' },
      refNumberType: 'NAV',
      refNumberValue: 'NAV123',
    });
  });

  it('returns null when API responds 404', async () => {
    process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL = 'https://example.test';

    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'Not found',
    });

    const { getPaidNoticeDetail } = await import('../../api/client');

    const res = await getPaidNoticeDetail({
      organizationFiscalCode: '12345678901',
      debtorFiscalCode: 'RSSMRA80A01H501U',
      nav: 'NAV404',
    });

    expect(res).toBeNull();
  });

  it('throws when API responds with a non-ok non-404 status', async () => {
    process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL = 'https://example.test';

    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Boom',
    });

    const { getPaidNoticeDetail } = await import('../../api/client');

    await expect(
      getPaidNoticeDetail({
        organizationFiscalCode: '12345678901',
        debtorFiscalCode: 'RSSMRA80A01H501U',
        nav: 'NAV500',
      })
    ).rejects.toThrow('Errore verifica (500) Boom');
  });
});