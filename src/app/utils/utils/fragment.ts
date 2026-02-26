export interface FragmentPayload {
  enteFiscalCode: string;
  citizenFiscalCode: string;
  nav: string;
  token?: string;
  requestType?: string; // PRIMA_EMISSIONE / RINNOVO / SMARRIMENTO (opzionale)
}

const aliases = {
  enteFiscalCode: ['cfEnte', 'enteFiscalCode', 'codiceFiscaleEnte', 'cf-org'],
  citizenFiscalCode: [
    'cfCittadino',
    'citizenFiscalCode',
    'codiceFiscaleDebitore',
    'codiceFiscalePagatore',
  ],
  nav: ['nav', 'numeroAvviso', 'noticeNumber', 'codiceAvviso', 'iuv'],
  token: ['token', 'accessToken', 't'],
  requestType: ['requestType', 'tipoRichiesta'],
};

function pick(params: URLSearchParams, names: string[]): string | undefined {
  for (const n of names) {
    const v = params.get(n);
    if (v) return v;
  }
  return undefined;
}

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export function parseCieFragment(hash: string): FragmentPayload | null {
  if (!hash || hash === '#') return null;

  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // 1) Caso key=value (o key@value) &key=value...
  const looksKeyValue = trimmed.includes('=') || /[a-zA-Z0-9_-]+@[^&]+/.test(trimmed);
  if (looksKeyValue) {
    const normalized = trimmed.replace(/@/g, '=');
    const params = new URLSearchParams(normalized);

    const enteFiscalCode = pick(params, aliases.enteFiscalCode);
    const citizenFiscalCode = pick(params, aliases.citizenFiscalCode);
    const nav = pick(params, aliases.nav);

    if (!enteFiscalCode || !citizenFiscalCode || !nav) return null;

    return {
      enteFiscalCode,
      citizenFiscalCode,
      nav,
      token: pick(params, aliases.token),
      requestType: pick(params, aliases.requestType),
    };
  }

  // 2) Fallback posizionale: #<cfEnte>&<cfCittadino>&<nav>&<token?>&<requestType?>
  const parts = trimmed
    .split('&')
    .map((p) => safeDecode(p.trim()))
    .filter(Boolean);

  if (parts.length < 3) return null;

  const [enteFiscalCode, citizenFiscalCode, nav, token, requestType] = parts;

  return {
    enteFiscalCode,
    citizenFiscalCode,
    nav,
    token,
    requestType,
  };
}