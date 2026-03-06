import { createClient } from "../../../../generated/definitions/biz-events-search-transactions-v1/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL ?? "";
const API_BASE_PATH = process.env.NEXT_PUBLIC_CIE_SEARCH_API_BASE_PATH ?? "";
export const API_KEY = process.env.NEXT_PUBLIC_CIE_SEARCH_API_KEY ?? "";

export const createBizEventsSearchTransactionsClient = (token?: string) =>
  createClient({
    baseUrl: API_BASE_URL,
    basePath: API_BASE_PATH,
    fetchApi: (input, init) => {
      const headers = new Headers(init?.headers);


      if (token) {
        headers.set("token", token);
      }

      return fetch(input, {
        ...init,
        headers,
      });
    },
  });