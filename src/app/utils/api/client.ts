"use client";

import { CiePaidNoticeDetail, CiePaidNoticeRequest } from '@/app/types/CieSearch';

const API_BASE_URL = process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL ?? '';

function normalizeDetail(raw: any): CiePaidNoticeDetail {
  const debtor = raw?.debtor ?? undefined;
  const payee = raw?.payee ?? undefined;

  return {
    subject: raw?.subject ?? undefined,
    amount: raw?.amount ?? undefined,
    debtor: debtor
      ? {
          name: debtor?.name ?? undefined,
          taxCode: String(debtor?.taxCode ?? debtor?.fiscalCode ?? ''),
        }
      : undefined,
    payee: payee
      ? {
          name: payee?.name ?? undefined,
          taxCode: String(payee?.taxCode ?? payee?.fiscalCode ?? ''),
        }
      : undefined,
    refNumberType: raw?.refNumberType ?? raw?.refNumber?.type ?? undefined,
    refNumberValue: raw?.refNumberValue ?? raw?.refNumber?.value ?? undefined,
  };
}

export async function getPaidNoticeDetail(
  payload: CiePaidNoticeRequest
): Promise<CiePaidNoticeDetail | null> {
  // Local mock for development when no API host is configured
  if (!API_BASE_URL) {
    await new Promise((r) => setTimeout(r, 600));

    const nav = payload.nav.trim();

    // Simulated generic error
    if (nav.toUpperCase().endsWith('999')) {
      throw new Error('Errore mock backend (simulato)');
    }

    // Simulated 404 (not paid / not found)
    const lastChar = nav.slice(-1);
    if (/[13579]$/.test(lastChar)) {
      return null;
    }

    // Simulated 200 OK (paid)
    return {
      subject: 'CIE - RINNOVO (mock) - Diritti di segreteria',
      amount: '22.21',
      payee: {
        name: 'Comune di Esempio',
        taxCode: payload.organizationFiscalCode,
      },
      debtor: {
        name: 'Mario Rossi',
        taxCode: payload.debtorFiscalCode,
      },
      refNumberType: 'NAV',
      refNumberValue: nav,
    };
  }

  
  const url = `${API_BASE_URL}/transactions/organizations/${encodeURIComponent(payload.organizationFiscalCode)}/notices/${encodeURIComponent(
    payload.nav
  )}`;
  

  //const url = `/api/be/transactions/organizations/${encodeURIComponent(payload.organizationFiscalCode)}/notices/${encodeURIComponent(payload.nav)}`;


  console.log(`Fetching paid notice detail from API: ${url}`);

  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      // Backend expects x-fiscal-code
      'x-fiscal-code': payload.debtorFiscalCode,
      ...(payload.token ? { 'x-cie-token': payload.token } : {}),
    },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Errore verifica (${res.status}) ${text}`.trim());
  }

  const raw = await res.json();
  return normalizeDetail(raw);
}