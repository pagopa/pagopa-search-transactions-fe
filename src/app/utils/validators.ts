"use client";

export const normalize = (v: string) => v.trim().toUpperCase();

export const matchFiscalCode = (v: string) => /^[A-Z0-9]{11,16}$/i.test(v.trim());

export const matchNav = (v: string) => /^[A-Z0-9]{6,35}$/i.test(v.trim());

export function validateSearchInput(input: {
  enteFiscalCode: string;
  citizenFiscalCode: string;
  nav: string;
}): string | null {
  if (!input.enteFiscalCode || !input.citizenFiscalCode || !input.nav) {
    return 'Tutti i campi sono obbligatori.';
  }
  if (!matchFiscalCode(input.enteFiscalCode)) {
    return 'Il codice fiscale ente indicato non è formalmente corretto.';
  }
  if (!matchFiscalCode(input.citizenFiscalCode)) {
    return 'Il codice fiscale cittadino indicato non è formalmente corretto.';
  }
  if (!matchNav(input.nav)) {
    return 'Il numero avviso / NAV indicato non è valido per questa richiesta.';
  }
  return null;
}