// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomUUID } = require('crypto');

const REAL_ENDPOINT =
  /^\/searchtransactions\/v1\/transactions\/organizations\/([^/]+)\/notices\/([^/]+)$/;

const VALID_TOKEN = 'mock-valid-token';

function problem(status, title, detail, code) {
  return {
    status,
    title,
    detail,
    code,
  };
}

module.exports = function (req, res, next) {
  const requestId = req.get('X-Request-Id') || randomUUID();
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id');

  if (req.method !== 'GET') {
    return next();
  }

  const match = req.path.match(REAL_ENDPOINT);
  if (!match) {
    return next();
  }

  const organizationFiscalCode = decodeURIComponent(match[1]);
  const nav = decodeURIComponent(match[2]);
  const debtorFiscalCode = req.get('x-fiscal-code');
  const token = req.get('token');

  if (!debtorFiscalCode) {
    return res.status(400).jsonp(
      problem(
        400,
        'Bad Request',
        'Missing required header x-fiscal-code',
        'GN_400_001'
      )
    );
  }

  if (token !== VALID_TOKEN) {
    res.status(401);
    return res.end();
  }

  const query = new URLSearchParams({
    organizationFiscalCode,
    debtorFiscalCode,
    nav,
  });

  req.url = `/paidNotices?${query.toString()}`;
  req.query = {
    organizationFiscalCode,
    debtorFiscalCode,
    nav,
  };

  const originalJsonp = res.jsonp.bind(res);
  res.jsonp = (data) => {
    const matches = Array.isArray(data) ? data : [];
    const item = matches[0];

    if (!item) {
      res.status(404);
      return originalJsonp(
        problem(
          404,
          'Not Found',
          'Biz Event not found with CF and IUV',
          'BZ_404_004'
        )
      );
    }

    const status = Number(item.status) || 200;
    res.status(status);

    if (status === 200) {
      return originalJsonp(item.body);
    }

    if (status === 429) {
      return res.end();
    }

    return originalJsonp(
      item.body ||
        problem(status, 'Mock error', `Mocked response with status ${status}`, 'TS_000_000')
    );
  };

  return next();
};