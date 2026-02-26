'use client';

import { Alert, AlertTitle, Box, Button, Stack } from '@mui/material';

type Props = {
  title: string;
  description?: string;
  onBack?: () => void;
  onRetry?: () => void;
};

export default function FullPageError({ title, description, onBack, onRetry }: Props) {
  return (
    <Box minHeight={280} display="flex" justifyContent="center" alignItems="center">
      <Box width="100%" maxWidth={720}>
        <Alert severity="error">
          <AlertTitle>{title}</AlertTitle>
          {description}
        </Alert>
      </Box>
    </Box>
  );
}