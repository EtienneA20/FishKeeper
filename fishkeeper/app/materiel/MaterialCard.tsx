'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface MaterialCardProps {
  title: string;
}

export default function MaterialCardProps({
  title
}: MaterialCardProps): React.JSX.Element {
  return (
    <Box
        sx={{
        my: 4, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'stretch' }, backgroundColor: 'card.background', border: '1px solid #ddd6d6',
        borderRadius: 4,
        }}
    >
        <Typography variant="h4" component="h1" sx={{ color: 'card.colorTitle', fontWeight: 700 }}>
            {title}
        </Typography>
    </Box>
  );
}