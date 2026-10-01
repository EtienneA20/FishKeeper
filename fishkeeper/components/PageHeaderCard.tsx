'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderCardProps {
  title: string;
  description?: string;
  statusSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
}

export default function PageHeaderCard({
  title,
  description,
  statusSlot,
  actionsSlot,
}: PageHeaderCardProps): React.JSX.Element {
  return (
    <Box
      sx={{
        my: 4, p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'stretch' }, backgroundColor: 'card.background', border: '1px solid', 
        borderColor: 'card.borderColor', borderRadius: 4
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5}}>

        <Typography variant="h4" component="h1" sx={{ color: 'card.colorTitle', fontWeight: 700 }}>
          {title}
        </Typography>

        {statusSlot && statusSlot}

        {description && (
          <Typography component="p" sx={{ color: 'card.colorText', textAlign: 'left' }}>
            {description}
          </Typography>
        )}

      </Box>

      <Box sx={{display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', 
          alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5}}>
         
        {actionsSlot && actionsSlot}
      </Box>
    </Box>
  );
}