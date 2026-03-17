"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './page.module.css';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { HeaderAccount, HeaderProduct, RootLinkType } from '@pagopa/mui-italia';

import FullPageLoader from './components/FullPageLoader';
import FullPageError from './components/FullPageError';
import PaidNoticeResult from './components/PaidNoticeResult';

import { validateSearchInput } from './utils/validators';
import { parseCieFragment, FragmentPayload } from './utils/fragment';
import { getPaidNoticeDetail } from './utils/api/bizEventSearchTransactionsHelper';
import { CartItem } from '../../generated/definitions/biz-events-search-transactions-v1/CartItem';
import { toUiError, UiError } from './utils/api/errors';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<FragmentPayload | null>(null);
  const [result, setResult] = useState<CartItem | null>(null);
  const [error, setError] = useState<UiError | null>(null);

  const didRun = useRef(false);

  const pagoPALink: RootLinkType = useMemo(
    () => ({
      label: 'PagoPA S.p.A.',
      href: 'https://www.pagopa.it',
      ariaLabel: '',
      title: '',
    }),
    []
  );

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const parsed = parseCieFragment(window.location.hash);
    if (!parsed) {
      setPayload(null);
      setError({
        title: 'Parametri mancanti',
        description:
          'Apri questa pagina dal gestionale CIE tramite redirect (CF Ente, CF Cittadino e NAV devono essere nel fragment URL oltre al token di sicurezza).',
      });
      setLoading(false);
      return;
    }

    setPayload(parsed);

    const input = {
      enteFiscalCode: parsed.enteFiscalCode.trim().toUpperCase(),
      citizenFiscalCode: parsed.citizenFiscalCode.trim().toUpperCase(),
      nav: parsed.nav.trim(),
      token: parsed.token?.trim(),
    };

    const validationError = validateSearchInput(input);
    if (validationError) {
      setError({
        title: 'Parametri non validi',
        description: validationError,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await getPaidNoticeDetail({
        organizationFiscalCode: input.enteFiscalCode,
        debtorFiscalCode: input.citizenFiscalCode,
        nav: input.nav,
        token: input.token,
      });

      setResult(response);
    } catch (e) {
      setError(toUiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    void runCheck();
  }, [runCheck]);

  return (
    <div className={styles.page}>
      <HeaderAccount
        rootLink={pagoPALink}
        enableLogin={false}
        enableAssistanceButton={false}
        onAssistanceClick={() => console.log('Assistenza')}
        onLogin={() => console.log('Login')}
      />

      <HeaderProduct
        chipLabel="Beta"
        productsList={[
          {
            title: 'Verifica pagamenti CIE',
            id: 'cie-search',
            productUrl: '',
            linkType: 'internal',
          },
        ]}
      />

      <main className={styles.main}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 2 }}>
            {loading && <FullPageLoader label="Verifica pagamento in corso…" />}

            {!loading && error && (
              <FullPageError
                title={error.title}
                description={error.description}
                status={error.status}
                code={error.code}
              />
            )}

            {!loading && !error && payload && result && (
              <>
                <Box mb={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Dati richiesta
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary">
                        CF Ente
                      </Typography>
                      <Typography>{payload.enteFiscalCode.toUpperCase()}</Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary">
                        CF Cittadino
                      </Typography>
                      <Typography>{payload.citizenFiscalCode.toUpperCase()}</Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary">
                        Numero avviso / NAV
                      </Typography>
                      <Typography>{payload.nav}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <PaidNoticeResult detail={result} />
              </>
            )}
          </Paper>
        </Container>
      </main>
    </div>
  );
}