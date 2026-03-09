import { normalize, matchFiscalCode, matchNav, validateSearchInput } from '../validators';

describe('validators', () => {
  it('normalizes a string by trimming and uppercasing it', () => {
    expect(normalize('  abC  ')).toBe('ABC');
  });

  it('detects a probable fiscal code', () => {
    expect(matchFiscalCode('RSSMRA80A01H501U')).toBe(true);
    expect(matchFiscalCode('12345678901')).toBe(true);
    expect(matchFiscalCode('abc')).toBe(false);
  });

  it('detects a probable NAV', () => {
    expect(matchNav('302012345678')).toBe(true);
    expect(matchNav('A1B2C3')).toBe(true);
    expect(matchNav('12')).toBe(false);
  });

  it('returns an error message when required fields are missing', () => {
    expect(
      validateSearchInput({ enteFiscalCode: '', citizenFiscalCode: 'X', nav: 'Y' })
    ).toBe('Tutti i campi sono obbligatori.');
  });

  it('returns an error message when the organization fiscal code is invalid', () => {
    expect(
      validateSearchInput({
        enteFiscalCode: '***',
        citizenFiscalCode: 'RSSMRA80A01H501U',
        nav: '302012345678',
      })
    ).toBe('CF Ente non valido.');
  });

  it('returns an error message when the citizen fiscal code is invalid', () => {
    expect(
      validateSearchInput({
        enteFiscalCode: '12345678901',
        citizenFiscalCode: '???',
        nav: '302012345678',
      })
    ).toBe('CF Cittadino non valido.');
  });

  it('returns an error message when the NAV is invalid', () => {
    expect(
      validateSearchInput({
        enteFiscalCode: '12345678901',
        citizenFiscalCode: 'RSSMRA80A01H501U',
        nav: '12',
      })
    ).toBe('Numero avviso / NAV non valido.');
  });

  it('returns null when the input is valid', () => {
    expect(
      validateSearchInput({
        enteFiscalCode: '12345678901',
        citizenFiscalCode: 'RSSMRA80A01H501U',
        nav: '302012345678',
      })
    ).toBeNull();
  });
});