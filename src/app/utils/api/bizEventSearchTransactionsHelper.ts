import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import type { CartItem } from "../../../../generated/definitions/biz-events-search-transactions-v1/CartItem";
import {
  API_KEY,
  createBizEventsSearchTransactionsClient,
} from "./client";

const API_BASE_URL = process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL ?? "";

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

export async function getPaidNoticeDetail(
  payload: { organizationFiscalCode: string; debtorFiscalCode: string; nav: string; token?: string; }
): Promise<CartItem | null> {
  if (!API_BASE_URL) {
    await new Promise((r) => setTimeout(r, 600));

    const nav = payload.nav.trim();

    if (nav.toUpperCase().endsWith("999")) {
      throw new Error("Errore mock backend (simulato)");
    }

    if (/[13579]$/.test(nav.slice(-1))) {
      return null;
    }

    return {
      subject: "CIE - RINNOVO (mock) - Diritti di segreteria",
      amount: "22.21",
      payee: {
        name: "Comune di Esempio",
        taxCode: payload.organizationFiscalCode,
      },
      debtor: {
        name: "Mario Rossi",
        taxCode: payload.debtorFiscalCode,
      },
      refNumberType: "NAV",
      refNumberValue: nav,
    };
  }

  
  /*if (!API_KEY) {
    throw new Error("NEXT_PUBLIC_CIE_SEARCH_API_KEY non configurata");
  }*/

  const client = createBizEventsSearchTransactionsClient(payload.token);

  const result = await client.getPaidNoticeDetail({
    "organization-fiscal-code": payload.organizationFiscalCode,
    nav: payload.nav,
    "x-fiscal-code": payload.debtorFiscalCode,
    "X-Request-Id": crypto.randomUUID(),
  });

  return pipe(
    result,
    E.fold(
      (error) => {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Errore di comunicazione con il backend"
        );
      },
      (response) => {
        switch (response.status) {
          case 200:
            return toCiePaidNoticeDetail(response.value);

          case 404:
            return null;

          case 400:
          case 500:
            throw new Error(
              `Errore verifica (${response.status}) ${
                response.value.detail ?? response.value.title ?? ""
              }`.trim()
            );

          case 401:
            throw new Error("Errore verifica (401) Non autorizzato");

          case 429:
            throw new Error("Errore verifica (429) Troppe richieste");

          default:
            throw new Error(`Errore verifica (${response})`); // response?
        }
      }
    )
  );
}