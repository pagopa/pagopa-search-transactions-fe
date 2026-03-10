"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './page.module.css';
import { Alert, Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import { HeaderAccount, HeaderProduct, RootLinkType } from '@pagopa/mui-italia';

import FullPageLoader from './components/FullPageLoader';
import FullPageError from './components/FullPageError';
import PaidNoticeResult from './components/PaidNoticeResult';

import { validateSearchInput } from './utils/validators';
import { parseCieFragment, FragmentPayload } from './utils/fragment';
import { getPaidNoticeDetail } from './utils/api/bizEventSearchTransactionsHelper';
import { CartItem } from '../../generated/definitions/biz-events-search-transactions-v1/CartItem';

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [payload, setPayload] = useState<FragmentPayload | null>(null);
  const [result, setResult] = useState<CartItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<{ title: string; description?: string } | null>(null);

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
    console.log("starting run check");
    setLoading(true);
    setError(null);
    setResult(null);
    setNotFound(false);
    console.log("end set");

    const parsed = parseCieFragment(window.location.hash);
    if (!parsed) {
      setPayload(null);
      setError({
        title: 'Parametri mancanti',
        description:
          'Apri questa pagina dal gestionale CIE tramite redirect (CF Ente, CF Cittadino e NAV devono essere nel fragment URL).',
      });
      setLoading(false);
      return;
    }
          console.log("starting setPayload");

    setPayload(parsed);

    const input = {
      enteFiscalCode: parsed.enteFiscalCode.trim().toUpperCase(),
      citizenFiscalCode: parsed.citizenFiscalCode.trim().toUpperCase(),
      nav: parsed.nav.trim(),
    };

          console.log("starting validateSearchInput");
    const validationError = validateSearchInput(input);
    if (validationError) {
      console.log(" validation error");
      setError({
        title: 'Parametri non validi',
        description: validationError,
      });
            console.log(" setting loading false");

      setLoading(false);
      return;
    }

    try {
            console.log(" start getPaidNoticeDetail");

      const response = await getPaidNoticeDetail({
        organizationFiscalCode: input.enteFiscalCode,
        debtorFiscalCode: input.citizenFiscalCode,
        nav: input.nav,
        token: parsed.token,
      });

      if (response) {
        setResult(response);
        setNotFound(false);
      } else {
        setResult(null);
        setNotFound(true);
      }
    } catch (e) {
            console.log(" start error get paid notice");
      const message = e instanceof Error ? e.message : 'Errore durante la verifica del pagamento';
      setError({
        title: 'Errore durante la verifica',
        description: message,
      });
    } finally {
      console.log(" finally ");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("use effect start");
    if (didRun.current) return;
        console.log("didRun.current false");

    didRun.current = true;
     console.log("call runCheck");
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
              />
            )}

            {!loading && !error && payload && (
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

                    {payload.requestType && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">
                          Tipologia richiesta
                        </Typography>
                        <Typography>{payload.requestType}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {notFound && (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Pagamento non trovato per il numero avviso <b>{payload.nav}</b>.
                    </Alert>

                    <Box display="flex" justifyContent="flex-end">
                      <Button variant="outlined" onClick={() => window.history.back()}>
                        Indietro
                      </Button>
                    </Box>
                  </Box>
                )}

                {!notFound && result && (
                  <PaidNoticeResult detail={result} />
                )}
              </>
            )}
          </Paper>
        </Container>
      </main>
    </div>
  );
}