"use client";

import {
  Alert,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { CartItem } from '../../../generated/definitions/biz-events-search-transactions-v1/CartItem';

function formatAmount(amount?: string | number) {
  if (amount === undefined || amount === null) return '-';
  const n = typeof amount === 'number' ? amount : Number(String(amount).replace(',', '.'));
  if (Number.isFinite(n)) {
    return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  }
  return String(amount);
}

export default function PaidNoticeResult({
  detail,
  onBack,
}: {
  detail: CartItem;
  onBack: () => void;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ m: 0 }}>
          Esito verifica pagamento
        </Typography>
       
      </Stack>

      <Alert severity="success" sx={{ mb: 2 }}>
        Pagamento trovato.
      </Alert>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">
              Stato
            </Typography>
            <Box mt={0.5}>
              <Chip size="small" label="PAGATO" color="success" />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">
              Importo
            </Typography>
            <Typography>{formatAmount(detail.amount)}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Causale
            </Typography>
            <Typography>{detail.subject ?? '-'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">
              Ente creditore
            </Typography>
            <Typography>
              {detail.payee?.name ? `${detail.payee.name} — ` : ''}
              {detail.payee?.taxCode ?? '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">
              Cittadino / Debitore
            </Typography>
            <Typography>
              {detail.debtor?.name ? `${detail.debtor.name} — ` : ''}
              {detail.debtor?.taxCode ?? '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">
              Numero avviso / NAV
            </Typography>
            <Typography>{detail.refNumberValue ?? '-'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">
              Tipo riferimento
            </Typography>
            <Typography>{detail.refNumberType ?? '-'}</Typography>
          </Grid>
        </Grid>
       
      </Paper>
    </Box>
  );
}