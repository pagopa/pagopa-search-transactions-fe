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
      <Box width="100%" maxWidth={720}>
        <Alert severity="error" role='alert'>
           <AlertTitle>
            <Typography variant="h6" component="span" fontWeight={600}>
              {title}
            </Typography>
          </AlertTitle>

          {description && (
            <Typography variant="body1">
              {description}
            </Typography>
          )}
        </Alert>
      </Box>
    </Box>
  );
}