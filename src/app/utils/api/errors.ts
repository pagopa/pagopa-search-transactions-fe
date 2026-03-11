import type { ProblemJson } from '../../../../generated/definitions/biz-events-search-transactions-v1/ProblemJson';

export type UiError = {
  title: string;
  description: string;
  status?: number;
  code?: string;
};

export class ApiRequestError extends Error {
  readonly title: string;
  readonly description: string;
  readonly status?: number;
  readonly code?: string;

  constructor(error: UiError) {
    super(error.description || error.title);
    this.name = 'ApiRequestError';
    this.title = error.title;
    this.description = error.description;
    this.status = error.status;
    this.code = error.code;
  }
}

const CODE_MESSAGES: Record<string, Pick<UiError, 'title' | 'description'>> = {
  GN_400_003: {
    title: 'Codice fiscale non valido',
    description: 'Il codice fiscale indicato non è formalmente corretto.',
  },
  BZ_404_004: {
    title: 'Pagamento non trovato',
    description: 'Non è stato trovato alcun pagamento con codice fiscale e numero avviso indicati.',
  },
  UN_500_000: {
    title: 'Errore imprevisto',
    description: 'Si è verificato un errore inatteso. Riprova più tardi.',
  },
};

export function mapProblemToUiError(status: number, problem?: ProblemJson): UiError {
  const code = problem?.code;

  if (status === 403) {
    const detail = (problem?.detail ?? '').toLowerCase();

    if (detail.includes('nav')) {
      return {
        title: 'Numero avviso non valido',
        description: 'Il numero avviso / NAV indicato non è valido per questa richiesta.',
        status,
        code,
      };
    }
  }

  if (code && CODE_MESSAGES[code]) {
    return {
      ...CODE_MESSAGES[code],
      status,
      code,
    };
  }

  if (status === 401) {
    return {
      title: 'Utente non autorizzato',
      description: 'Non sei autorizzato a effettuare questa operazione.',
      status,
    };
  }

  if (status === 403) {
    return {
      title: 'Operazione non consentita',
      description: 'Non hai i permessi necessari per visualizzare questo pagamento.',
      status,
      code,
    };
  }

  if (status === 404) {
    return {
      title: 'Pagamento non trovato',
      description: 'Non è stato trovato alcun pagamento con i dati indicati.',
      status,
      code,
    };
  }

  if (status === 429) {
    return {
      title: 'Troppe richieste',
      description: 'Hai effettuato troppe richieste. Riprova tra qualche minuto.',
      status,
    };
  }

  if (status >= 500) {
    return {
      title: 'Servizio temporaneamente non disponibile',
      description: 'Si è verificato un errore interno. Riprova più tardi.',
      status,
      code,
    };
  }

  return {
    title: 'Richiesta non valida',
    description: problem?.detail || 'I dati inviati non sono corretti.',
    status,
    code,
  };
}

export function toUiError(error: unknown): UiError {
  if (error instanceof ApiRequestError) {
    return {
      title: error.title,
      description: error.description,
      status: error.status,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Errore durante la verifica',
      description: error.message,
    };
  }

  return {
    title: 'Errore durante la verifica',
    description: 'Si è verificato un errore imprevisto.',
  };
}