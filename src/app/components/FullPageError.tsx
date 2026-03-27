"use client";

import { Alert, AlertTitle, Box, Typography } from '@mui/material';

type Props = {
  title: string;
  description?: string;
  status?: number;
  code?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function FullPageError({ title, description, status, code }: Props) {
  return (
    <Box minHeight={280} display="flex" justifyContent="center" alignItems="center">
      <Box width="100%">
        <Alert severity="error" role='alert' sx={{
          px: 3,
          py: 2,
          '& .MuiAlert-message': { width: '100%' },
        }}>
          <AlertTitle>
            <Typography variant="h5" component="span" fontWeight={700}>
              {title}
            </Typography>
          </AlertTitle>

          {description && (
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              {description}
            </Typography>
          )}
        </Alert>
      </Box>
    </Box>
  );
}