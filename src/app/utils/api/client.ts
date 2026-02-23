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

    const isPaid = payload.nav.endsWith('0') || payload.nav.endsWith('2') || payload.nav.endsWith('4');
    return {
      transactions: isPaid
        ? [
            {
              id: 'tx-1',
              nav: payload.nav,
              transactionId: 'TX-CIE-001',
              paymentDateTime: new Date().toISOString(),
              status: 'PAGATO',
              trackingInfo: 'IUV-TRK-001',
              proof: {
                rawPayload: {
                  esito: 'OK',
                  messaggio: 'Prova pagamento mock',
                  cfEnte: payload.enteFiscalCode,
                  cfCittadino: payload.citizenFiscalCode,
                  nav: payload.nav,
                },
              },
            },
          ]
        : [],
    };
  }

  const res = await fetch(`${API_BASE_URL}/cie-transactions/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Errore ricerca (${res.status}) ${text}`);
  }

  const raw = await res.json();
  return mapApiResponse(raw);
}