const createClientMock = jest.fn();
const fetchMock = jest.fn();

async function loadClientModule(baseUrl?: string, basePath?: string) {
  jest.resetModules();

  if (baseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL = baseUrl;
  }

  if (basePath === undefined) {
    delete process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_PATH;
  } else {
    process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_PATH = basePath;
  }

  createClientMock.mockImplementation((config) => config);

  jest.doMock(
    '../../../../../generated/definitions/biz-events-search-transactions-v1/client',
    () => ({
      createClient: (config: unknown) => createClientMock(config),
    })
  );

  return import('../../api/client');
}

describe('createBizEventsSearchTransactionsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock;
    fetchMock.mockResolvedValue({ ok: true });
  });

  it('passes baseUrl/basePath and token header', async () => {
    const { createBizEventsSearchTransactionsClient } = await loadClientModule(
      'https://api.example.test',
      '/search'
    );

    createBizEventsSearchTransactionsClient('tok-123');

    expect(createClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'https://api.example.test',
        basePath: '/search',
        fetchApi: expect.any(Function),
      })
    );

    const [{ fetchApi }] = createClientMock.mock.calls[0];
    await fetchApi('/paid-notice', {
      method: 'GET',
      headers: { 'x-test': '1' },
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.get('x-test')).toBe('1');
    expect(init.headers.get('Authorization')).toBe('Bearer tok-123');
  });

  it('works without token and with empty envs', async () => {
    const { createBizEventsSearchTransactionsClient } = await loadClientModule();

    createBizEventsSearchTransactionsClient();

    expect(createClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: '',
        basePath: '',
        fetchApi: expect.any(Function),
      })
    );

    const [{ fetchApi }] = createClientMock.mock.calls[0];
    await fetchApi('/paid-notice', {});

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.get('token')).toBeNull();
  });
});