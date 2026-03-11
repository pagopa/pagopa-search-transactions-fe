"use client";

import { Alert, AlertTitle, Box, Typography } from '@mui/material';

type Props = {
  title: string;
  description?: string;
  status?: number;
  code?: string;
};

export default function FullPageError({ title, description, status, code }: Props) {
  return (
    <Box minHeight={280} display="flex" justifyContent="center" alignItems="center">
      <Box width="100%" maxWidth={720}>
        <Alert severity="error">
          <AlertTitle>{title}</AlertTitle>
          {description}
          {(status || code) && (
            <Typography component="div" variant="caption" sx={{ mt: 1, display: 'block' }}>
              {status ? `HTTP ${status}` : ''}
            </Typography>
          )}
        </Alert>
      </Box>
    </Box>
  );
}