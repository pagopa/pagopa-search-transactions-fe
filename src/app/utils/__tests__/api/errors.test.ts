import { ApiRequestError, mapProblemToUiError, toUiError } from '../../api/errors';

describe('mapProblemToUiError', () => {
  it('maps GN_400_003', () => {
    expect(
      mapProblemToUiError(400, {
        code: 'GN_400_003',
        detail: 'Invalid CF (Tax Code)',
      })
    ).toEqual({
      title: 'Codice fiscale non valido',
      description: 'Il codice fiscale indicato non è formalmente corretto.',
      status: 400,
      code: 'GN_400_003',
    });
  });

  it('maps 403 nav-specific message', () => {
    expect(
      mapProblemToUiError(403, {
        detail: 'Invalid NAV matching',
      })
    ).toEqual({
      title: 'Numero avviso non valido',
      description: 'Il numero avviso / NAV indicato non è valido per questa richiesta.',
      status: 403,
      code: undefined,
    });
  });

  it('maps 429 without problem body', () => {
    expect(mapProblemToUiError(429)).toEqual({
      title: 'Troppe richieste',
      description: 'Hai effettuato troppe richieste. Riprova tra qualche minuto.',
      status: 429,
    });
  });

  it('falls back for generic 400', () => {
    expect(
      mapProblemToUiError(400, {
        detail: 'Invalid input',
        code: 'GN_400_002',
      })
    ).toEqual({
      title: 'Richiesta non valida',
      description: 'Invalid input',
      status: 400,
      code: 'GN_400_002',
    });
  });
});

describe('toUiError', () => {
  it('maps ApiRequestError', () => {
    const err = new ApiRequestError({
      title: 'Titolo',
      description: 'Descrizione',
      status: 404,
      code: 'ERR',
    });

    expect(toUiError(err)).toEqual({
      title: 'Titolo',
      description: 'Descrizione',
      status: 404,
      code: 'ERR',
    });
  });

  it('maps generic Error', () => {
    expect(toUiError(new Error('Kaboom'))).toEqual({
      title: 'Errore durante la verifica',
      description: 'Kaboom',
    });
  });

  it('maps unknown error', () => {
    expect(toUiError('boom')).toEqual({
      title: 'Errore durante la verifica',
      description: 'Si è verificato un errore imprevisto.',
    });
  });

    it('maps generic 403 when detail is not nav-specific', () => {
    expect(
      mapProblemToUiError(403, {
        detail: 'Forbidden',
        code: 'ANY_403',
      })
    ).toEqual({
      title: 'Operazione non consentita',
      description: 'Non hai i permessi necessari per visualizzare questo pagamento.',
      status: 403,
      code: 'ANY_403',
    });
  });

  it('maps generic 404 without known code', () => {
    expect(mapProblemToUiError(404)).toEqual({
      title: 'Pagamento non trovato',
      description: 'Non è stato trovato alcun pagamento con i dati indicati.',
      status: 404,
      code: undefined,
    });
  });

  it('maps generic 500 fallback when code is unknown', () => {
    expect(
      mapProblemToUiError(500, {
        detail: 'Server exploded',
        code: 'UNKNOWN_500',
      })
    ).toEqual({
      title: 'Servizio temporaneamente non disponibile',
      description: 'Si è verificato un errore interno. Riprova più tardi.',
      status: 500,
      code: 'UNKNOWN_500',
    });
  });

  it('falls back for generic 400 without detail', () => {
    expect(mapProblemToUiError(400)).toEqual({
      title: 'Richiesta non valida',
      description: 'I dati inviati non sono corretti.',
      status: 400,
      code: undefined,
    });
  });

  it('ApiRequestError uses title as message when description is empty', () => {
    const err = new ApiRequestError({
      title: 'Solo titolo',
      description: '',
    });

    expect(err.message).toBe('Solo titolo');
  });
});