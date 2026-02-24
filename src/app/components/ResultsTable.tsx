'use client';

import { Box, Button, Chip, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CiePaymentTransaction } from '@/app/types/CieSearch';

interface Props {
  rows: CiePaymentTransaction[];
  onBack: () => void;
  onOpenProof: (row: CiePaymentTransaction) => void;
}

function splitDateTime(iso?: string) {
  if (!iso) return { date: '-', time: '-' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '-', time: '-' };
  return {
    date: d.toLocaleDateString('it-IT'),
    time: d.toLocaleTimeString('it-IT'),
  };
}

function statusColor(status: string): 'success' | 'error' | 'warning' | 'default' {
  const s = status.toUpperCase().trim().replace(/\s+/g, '_');

  if (s === 'NON_PAGATO') return 'error';
  if (s.includes('ATTESA')) return 'warning';
  if (s === 'PAGATO') return 'success';

  return 'default';
}

export default function ResultsTable({ rows, onBack, onOpenProof }: Props) {
  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Data',
      width: 120,
      sortable: false,
      valueGetter: (_value, row) => splitDateTime(row.paymentDateTime).date,
    },
    {
      field: 'time',
      headerName: 'Ora',
      width: 100,
      sortable: false,
      valueGetter: (_value, row) => splitDateTime(row.paymentDateTime).time,
    },
    {
      field: 'status',
      headerName: 'Stato pagamento',
      flex: 1,
      renderCell: (params) => (
        <Chip size="small" label={String(params.value)} color={statusColor(String(params.value))} />
      ),
    },
    {
      field: 'nav',
      headerName: 'Numero avviso',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'trackingInfo',
      headerName: 'Tracking / ID transazione',
      flex: 1.3,
      minWidth: 220,
      valueGetter: (_v, row) => row.trackingInfo ?? row.transactionId ?? '-',
    },
    {
      field: 'proof',
      headerName: 'Prova pagamento',
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row as CiePaymentTransaction;
        const s = String(row.status ?? '').toUpperCase().replace(/\s+/g, '_');
        const canOpenProof = s === 'PAGATO' && !!row.proof;

        if (!canOpenProof) return <span>-</span>;

        return (
          <Button size="small" variant="outlined" onClick={() => onOpenProof(row)}>
            Visualizza
          </Button>
        );
      }
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <h3 style={{ margin: 0 }}>Risultati ricerca</h3>
        <Button variant="text" onClick={onBack}>
          ← Torna alla ricerca
        </Button>
      </Stack>

      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
        />
      </Box>
    </Box>
  );
}