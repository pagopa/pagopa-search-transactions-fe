import { parseCieFragment } from '../fragment';

describe('parseCieFragment', () => {
  it('returns null for empty or "#" hash', () => {
    expect(parseCieFragment('')).toBeNull();
    expect(parseCieFragment('#')).toBeNull();
    expect(parseCieFragment('   ')).toBeNull();
    expect(parseCieFragment('#   ')).toBeNull();
  });

  it('parses key=value format using aliases', () => {
    const hash = '#cfEnte=12345678901&cfCittadino=RSSMRA80A01H501U&iuv=302012345678';
    const parsed = parseCieFragment(hash);

    expect(parsed).toEqual({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '302012345678',
      token: undefined,
      requestType: undefined,
    });
  });

  it('parses key@value format (treated as key=value)', () => {
    const hash = '#cf-org@12345678901&cf-cit@RSSMRA80A01H501U&nav@302012345678&t@abc';
    const parsed = parseCieFragment(hash);

    expect(parsed).toEqual({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '302012345678',
      token: 'abc',
      requestType: undefined,
    });
  });

  it('returns null when required fields are missing in key=value mode', () => {
    const hash = '#cfEnte=12345678901&nav=302012345678';
    expect(parseCieFragment(hash)).toBeNull();
  });

  it('parses positional format with optional token and requestType', () => {
    const hash = '#12345678901&RSSMRA80A01H501U&302012345678&tok123&RT';
    const parsed = parseCieFragment(hash);

    expect(parsed).toEqual({
      enteFiscalCode: '12345678901',
      citizenFiscalCode: 'RSSMRA80A01H501U',
      nav: '302012345678',
      token: 'tok123',
      requestType: 'RT',
    });
  });

  it('decodes url-encoded values in positional mode and keeps invalid encodings as-is', () => {
    const encoded = '#12345678901&RSSMRA80A01H501U&3020%201234%205678';
    const parsed = parseCieFragment(encoded);
    expect(parsed?.nav).toBe('3020 1234 5678');

    const invalid = '#12345678901&RSSMRA80A01H501U&%E0%A4%A';
    const parsed2 = parseCieFragment(invalid);
    // safeDecode should not throw and should return the raw string if decode fails
    expect(parsed2?.nav).toBe('%E0%A4%A');
  });

  it('returns null for positional format with fewer than 3 parts', () => {
    expect(parseCieFragment('#a&b')).toBeNull();
  });
});