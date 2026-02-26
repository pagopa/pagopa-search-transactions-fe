export const normalize = (v: string) => v.trim().toUpperCase();

export const isProbablyFiscalCode = (v: string) => /^[A-Z0-9]{11,16}$/i.test(v.trim());
export const isProbablyNav = (v: string) => /^[0-9]{6,35}$/.test(v.trim());

export function validateSearchInput(input: {
  enteFiscalCode: string;
  citizenFiscalCode: string;
  nav: string;
}): string | null {
  if (!input.enteFiscalCode || !input.citizenFiscalCode || !input.nav) {
    return 'Tutti i campi sono obbligatori.';
  }
  if (!isProbablyFiscalCode(input.enteFiscalCode)) {
    return 'CF Ente non valido.';
  }
  if (!isProbablyFiscalCode(input.citizenFiscalCode)) {
    return 'CF Cittadino non valido.';
  }
  if (!isProbablyNav(input.nav)) {
    return 'Numero avviso / NAV non valido.';
  }
  return null;
}