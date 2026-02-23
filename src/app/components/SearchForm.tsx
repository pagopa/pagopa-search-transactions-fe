'use client';

import { Alert, Grid, Paper, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';

export interface SearchFormValues {
  enteFiscalCode: string;
  citizenFiscalCode: string;
  nav: string;
}

interface Props {
  values: SearchFormValues;
  onChange: (next: SearchFormValues) => void;
  onSubmit: () => void;
  onClear: () => void;
  loading: boolean;
  error?: string | null;
}

export default function SearchForm({
  values,
  onChange,
  onSubmit,
  onClear,
  loading,
  error,
}: Props) {
  return (
    <Paper
      sx={{
        p: 3,
        
      }}
    >
      <Grid container spacing={2}>
        {/*<Grid item xs={12}>
          <h3 style={{ margin: 0 }}>Ricerca transazione pagamento CIE</h3>
          <small style={{ color: '#666' }}>
            Inserisci i dati della posizione debitoria e avvia la ricerca
          </small>
        </Grid>*/}

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        <Grid item xs={12} md={4}>
          <TextField
            label="CF Ente"
            fullWidth
            value={values.enteFiscalCode}
            onChange={(e) => onChange({ ...values, enteFiscalCode: e.target.value.toUpperCase() })}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Numero avviso / NAV"
            fullWidth
            value={values.nav}
            onChange={(e) => onChange({ ...values, nav: e.target.value.trim() })}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="CF Cittadino"
            fullWidth
            value={values.citizenFiscalCode}
            onChange={(e) => onChange({ ...values, citizenFiscalCode: e.target.value.toUpperCase() })}
          />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <LoadingButton
            variant="outlined"
            onClick={onClear}
            disabled={loading}
          >
            Pulisci
          </LoadingButton>

          <LoadingButton
            variant="contained"
            onClick={onSubmit}
            loading={loading}
          >
            Cerca transazione
          </LoadingButton>
        </Grid>
      </Grid>
    </Paper>
  );
}