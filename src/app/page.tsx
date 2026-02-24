'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
} from '@mui/material';
import { HeaderAccount, HeaderProduct, RootLinkType } from '@pagopa/mui-italia';
import SearchForm, { SearchFormValues } from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import SectionDivider from './components/SectionDivider';
import SectionHeader from './components/SectionHeader';
import { searchCieTransactions } from './utils/api/client';
import { validateSearchInput } from './utils/validators';
import { CiePaymentTransaction } from './types/CieSearch';
import { parseCieFragment } from './utils/utils/fragment';

type ViewMode = 'search' | 'results';

const DEFAULT_CF_ENTE = process.env.NEXT_PUBLIC_DEFAULT_CF_ENTE ?? '';

export default function Home() {
  const [view, setView] = useState<ViewMode>('search');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<SearchFormValues>({
    enteFiscalCode: DEFAULT_CF_ENTE,
    citizenFiscalCode: '',
    nav: '',
  });

  const [lastSearch, setLastSearch] = useState<SearchFormValues | null>(null);
  const [results, setResults] = useState<CiePaymentTransaction[]>([]);

  const [selectedProofRow, setSelectedProofRow] = useState<CiePaymentTransaction | null>(null);

  const pagoPALink: RootLinkType = useMemo(
    () => ({
      label: 'PagoPA S.p.A.',
      href: 'https://www.pagopa.it',
      ariaLabel: '',
      title: '',
    }),
    []
  );

  const handleClear = () => {
    setForm((prev) => ({
      enteFiscalCode: prev.enteFiscalCode, // mantieni CF ente precompilato
      citizenFiscalCode: '',
      nav: '',
    }));
    setErrorMsg(null);
  };

   const handleSubmitSearch = async (
    override?: SearchFormValues,
    token?: string
   ) => {
    const input = override ?? form;
    const validationError = validateSearchInput(input);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await searchCieTransactions({
        enteFiscalCode: input.enteFiscalCode.trim().toUpperCase(),
        citizenFiscalCode: input.citizenFiscalCode.trim().toUpperCase(),
        nav: input.nav.trim(),
        token,
      });

      setResults(response.transactions);
      setLastSearch(form);
      setView('results');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore durante la ricerca';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const parsed = parseCieFragment(window.location.hash);
    if (!parsed) return;

    const nextForm = {
      enteFiscalCode: parsed.enteFiscalCode.toUpperCase(),
      citizenFiscalCode: parsed.citizenFiscalCode.toUpperCase(),
      nav: parsed.nav,
    };

    setForm(nextForm);

    void handleSubmitSearch(nextForm, parsed.token);
  }, []);

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
            title: 'Ricerca pagamenti CIE',
            id: 'cie-search',
            productUrl: '',
            linkType: 'internal',
          },
        ]}
      />

      <main className={styles.main}>
        <Container maxWidth="lg">
          <SectionHeader
            icon=""
            title="Portale ricerca transazioni CIE"
            subtitle="Ricerca per CF Ente, CF Cittadino e Numero Avviso"
          />

          <Paper
            sx={{
              p: 2,
            }}
          >
            {view === 'search' && (
              <SearchForm
                values={form}
                onChange={setForm}
                onSubmit={handleSubmitSearch}
                onClear={handleClear}
                loading={loading}
                error={errorMsg}
              />
            )}

            {view === 'results' && (
              <>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
                    <CircularProgress />
                  </Box>
                ) : results.length === 0 ? (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Nessuna transazione di pagamento trovata per il num avviso {lastSearch?.nav ?? '-'}
                    </Alert>
                    <Box textAlign="right">
                      <button
                        type="button"
                        onClick={() => setView('search')}
                        style={{ cursor: 'pointer' }}
                      >
                        ← Torna alla pagina di ricerca
                      </button>
                    </Box>
                  </Box>
                ) : (
                  <ResultsTable
                    rows={results}
                    onBack={() => setView('search')}
                    onOpenProof={(row) => setSelectedProofRow(row)}
                  />
                )}
              </>
            )}
          </Paper>

          {errorMsg && view === 'results' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMsg}
            </Alert>
          )}
        </Container>
      </main>

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
    </div>
  );
}