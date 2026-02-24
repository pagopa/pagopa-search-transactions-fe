import {
  SearchCieTransactionsRequest,
  SearchCieTransactionsResponse,
  CiePaymentTransaction,
} from '@/app/types/CieSearch';

const API_BASE_URL = process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL ?? '';

function mapApiResponse(raw: any): SearchCieTransactionsResponse {

  const items = Array.isArray(raw?.transactions)
    ? raw.transactions
    : Array.isArray(raw)
      ? raw
      : [];

  const transactions: CiePaymentTransaction[] = items.map((item: any, index: number) => ({
    id: String(item.id ?? item.transactionId ?? `${item.nav ?? 'row'}-${index}`),
    nav: String(item.nav ?? item.noticeNumber ?? ''),
    transactionId: item.transactionId ?? item.paymentId ?? undefined,
    paymentDateTime: item.paymentDateTime ?? item.dateTime ?? item.outcomeDateTime ?? undefined,
    status: String(item.status ?? item.paymentStatus ?? 'NON_PAGATO'),
    trackingInfo:
      item.trackingInfo ??
      item.iuv ??
      item.rptId ??
      item.transactionId ??
      undefined,
    proof: item.proof
      ? {
          receiptUrl: item.proof.receiptUrl ?? item.proof.url,
          rawPayload: item.proof.rawPayload ?? item.proof,
        }
      : undefined,
  }));

  return { transactions };
}

export async function searchCieTransactions(
  payload: SearchCieTransactionsRequest
): Promise<SearchCieTransactionsResponse> {
  if (!API_BASE_URL) {
  await new Promise((r) => setTimeout(r, 800));

  const nav = payload.nav.trim();
  const last = nav.slice(-1);

  // Simula errore backend
  if (nav.endsWith('999')) {
    throw new Error('Errore mock backend (simulato)');
  }

  // Empty state
  if (['1', '3', '5', '7', '9'].includes(last)) {
    return { transactions: [] };
  }

  // Risposta con più righe / stati
  const now = new Date();
  const iso = (minutesAgo: number) =>
    new Date(now.getTime() - minutesAgo * 60_000).toISOString();

  return {
    transactions: [
      {
        id: `tx-${nav}-1`,
        nav,
        transactionId: `TX-${nav}-001`,
        paymentDateTime: iso(15),
        status: 'PAGATO',
        trackingInfo: `IUV-${nav}-A`,
        proof: {
          rawPayload: {
            esito: 'OK',
            messaggio: 'Prova pagamento mock',
            cfEnte: payload.enteFiscalCode,
            cfCittadino: payload.citizenFiscalCode,
            nav,
            transactionId: `TX-${nav}-001`,
          },
        },
      },
      {
        id: `tx-${nav}-2`,
        nav,
        transactionId: `TX-${nav}-002`,
        paymentDateTime: iso(60),
        status: 'IN_ATTESA',
        trackingInfo: `IUV-${nav}-B`,
        proof: {
          rawPayload: {
            esito: 'PENDING',
            messaggio: 'Pagamento in attesa (mock)',
            nav,
          },
        },
      },
      {
        id: `tx-${nav}-3`,
        nav,
        transactionId: `TX-${nav}-003`,
        paymentDateTime: iso(180),
        status: 'NON_PAGATO',
        trackingInfo: `IUV-${nav}-C`,
        proof: {
          rawPayload: {
            esito: 'KO',
            messaggio: 'Pagamento non effettuato (mock)',
            nav,
          },
        },
      },
    ],
  };
}

  const res = await fetch(
    `${API_BASE_URL}/bizevents/noticesservice/v1/paids/organizations/${encodeURIComponent(payload.enteFiscalCode)}/notices/${encodeURIComponent(payload.nav)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-fiscal-code': payload.citizenFiscalCode,
        ...(payload.token ? { 'x-cie-token': payload.token } : {}),
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Errore ricerca (${res.status}) ${text}`);
  }

  const raw = await res.json();
  return mapApiResponse(raw);
}