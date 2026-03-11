import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import type { CartItem } from '../../../../generated/definitions/biz-events-search-transactions-v1/CartItem';
import type { ProblemJson } from '../../../../generated/definitions/biz-events-search-transactions-v1/ProblemJson';
import { createBizEventsSearchTransactionsClient } from './client';
import { ApiRequestError, mapProblemToUiError } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL ?? '';

const toCiePaidNoticeDetail = (item: CartItem): CartItem => ({
  subject: item.subject,
  amount: item.amount,
  debtor: item.debtor
    ? {
        name: item.debtor.name,
        taxCode: item.debtor.taxCode,
      }
    : undefined,
  payee: item.payee
    ? {
        name: item.payee.name,
        taxCode: item.payee.taxCode,
      }
    : undefined,
  refNumberType: item.refNumberType,
  refNumberValue: item.refNumberValue,
});

function throwMappedError(status: number, problem?: ProblemJson): never {
  throw new ApiRequestError(mapProblemToUiError(status, problem));
}

export async function getPaidNoticeDetail(payload: {
  organizationFiscalCode: string;
  debtorFiscalCode: string;
  nav: string;
  token?: string;
}): Promise<CartItem> {
  if (!API_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL');
  }

  const client = createBizEventsSearchTransactionsClient(payload.token);

  const result = await client.getPaidNoticeDetail({
    'organization-fiscal-code': payload.organizationFiscalCode,
    nav: payload.nav,
    'x-fiscal-code': payload.debtorFiscalCode,
    'X-Request-Id': crypto.randomUUID(),
  });

  return pipe(
    result,
    E.fold(
      (error) => {
        throw new Error(
          error instanceof Error ? error.message : 'Errore di comunicazione con il backend'
        );
      },
      (response) => {
        switch (response.status) {
          case 200:
            return toCiePaidNoticeDetail(response.value);

          case 400:
          case 403:
          case 404:
          case 500:
            return throwMappedError(response.status, response.value);
            
          case 401:
          case 429:
            return throwMappedError(response.status);

          default:
            throw new Error(`Errore verifica (${response.status})`);
        }
      }
    )
  );
}