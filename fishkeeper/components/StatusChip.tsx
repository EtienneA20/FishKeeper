'use client';

import React from 'react';
import { Chip, Box } from '@mui/material';

interface StatusChipProps {
  label: string;
  color: string;
  backgroundColor: string;
}

export default function StatusChip({
  label,
  color,
  backgroundColor,
}: StatusChipProps): React.JSX.Element {
  return (
    <Chip
      size="small"
      icon={ <Box sx={{width: 8, height: 8, borderRadius: '50%', backgroundColor: color, ml: 1}}/> }
      label={label}
      sx={{
        backgroundColor, paddingLeft: 1, color, border: `1px solid ${color}`, fontFamily: 'monospace',
        fontWeight: 600, height: 'auto', py: 0.5, '& .MuiChip-label': {px: 1}
      }}
    />
  );
}