'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatusBadgeProps {
  text: string;
  backgroundColor: string;
  borderColor: string;
}

export default function StatusBadge({
  text,
  backgroundColor,
  borderColor,
}: StatusBadgeProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.5,
        backgroundColor: backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '50px',
      }}
    >
      <Box sx={{width: 8, height: 8, borderRadius: '50%', backgroundColor: borderColor}}/>
      
      <Typography component="span" sx={{color: borderColor, fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 400}}>
        {text}
      </Typography>
    </Box>
  );
}