export interface FragmentPayload {
  enteFiscalCode: string;
  citizenFiscalCode: string;
  nav: string;
  token?: string;
  requestType?: string; // opzionale: PRIMA_EMISSIONE / RINNOVO / SMARRIMENTO
}

const aliases = {
  enteFiscalCode: ['cfEnte', 'enteFiscalCode', 'codiceFiscaleEnte', 'cf-org'],
  citizenFiscalCode: ['cfCittadino', 'citizenFiscalCode', 'codiceFiscaleDebitore', 'codiceFiscalePagatore'],
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

export function parseCieFragment(hash: string): FragmentPayload | null {
  if (!hash || hash === '#') return null;

  const raw = hash.startsWith('#') ? hash.slice(1) : hash;

  // formato consigliato: key=value&key=value
  const params = new URLSearchParams(raw);

  const enteFiscalCode = pick(params, aliases.enteFiscalCode);
  const citizenFiscalCode = pick(params, aliases.citizenFiscalCode);
  const nav = pick(params, aliases.nav);

  if (!enteFiscalCode || !citizenFiscalCode || !nav) {
    return null;
  }

  return {
    enteFiscalCode,
    citizenFiscalCode,
    nav,
    token: pick(params, aliases.token),
    requestType: pick(params, aliases.requestType),
  };
}