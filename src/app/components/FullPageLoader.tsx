'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

export default function FullPageLoader({ label = 'Caricamento…' }: { label?: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      justifyContent="center"
      alignItems="center"
      minHeight={280}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}