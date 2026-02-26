'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './page.module.css';
import {
  Alert,
  Box,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import { HeaderAccount, HeaderProduct, RootLinkType } from '@pagopa/mui-italia';

import ResultsTable from './components/ResultsTable';
import FullPageLoader from './components/FullPageLoader';
import FullPageError from './components/FullPageError';

import { searchCieTransactions } from './utils/api/client';
import { validateSearchInput } from './utils/validators';
import { CiePaymentTransaction } from './types/CieSearch';
import { parseCieFragment, FragmentPayload } from './utils/utils/fragment';

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [payload, setPayload] = useState<FragmentPayload | null>(null);
  const [results, setResults] = useState<CiePaymentTransaction[]>([]);
  const [error, setError] = useState<{ title: string; description?: string } | null>(null);

  const [selectedProofRow, setSelectedProofRow] = useState<CiePaymentTransaction | null>(null);

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
    setResults([]);

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

    setPayload(parsed);

    const input = {
      enteFiscalCode: parsed.enteFiscalCode.trim().toUpperCase(),
      citizenFiscalCode: parsed.citizenFiscalCode.trim().toUpperCase(),
      nav: parsed.nav.trim(),
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
      const response = await searchCieTransactions({
        ...input,
        token: parsed.token,
      });

      setResults(response.transactions);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore durante la verifica del pagamento';
      setError({
        title: 'Errore durante la verifica',
        description: message,
      });
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
                onBack={() => window.history.back()}
                onRetry={() => void runCheck()}
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

                {results.length === 0 ? (
                  <Alert severity="info">
                    Nessuna transazione di pagamento trovata per il numero avviso <b>{payload.nav}</b>.
                  </Alert>
                ) : (
                  <ResultsTable
                    rows={results}
                    onBack={() => window.history.back()}
                    onOpenProof={(row) => setSelectedProofRow(row)}
                  />
                )}
              </>
            )}
          </Paper>

          <Dialog
            open={Boolean(selectedProofRow)}
            onClose={() => setSelectedProofRow(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Prova di pagamento</DialogTitle>
            <DialogContent>
              {selectedProofRow?.proof?.receiptUrl ? (
                <a href={selectedProofRow.proof.receiptUrl} target="_blank" rel="noreferrer">
                  Apri ricevuta / prova di pagamento
                </a>
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {JSON.stringify(selectedProofRow?.proof?.rawPayload ?? selectedProofRow, null, 2)}
                </pre>
              )}
            </DialogContent>
          </Dialog>
        </Container>
      </main>
    </div>
  );
}