import { Box } from '@mui/material';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ icon, title, subtitle }: Props) {
  return (
    <Box mb={2}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
        {icon} {title}
      </h2>
      {subtitle && <small style={{ color: '#666' }}>{subtitle}</small>}
    </Box>
  );
}