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
    return 'CF Ente non valido.';
  }
  if (!matchFiscalCode(input.citizenFiscalCode)) {
    return 'CF Cittadino non valido.';
  }
  if (!matchNav(input.nav)) {
    return 'Numero avviso / NAV non valido.';
  }
  return null;
}