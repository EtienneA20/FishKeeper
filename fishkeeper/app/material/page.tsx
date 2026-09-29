'use client';

import React from 'react';
import { Box } from '@mui/material';
import MaterialTitle from './MaterialTitle';

export default function MaterialPage(): React.JSX.Element {
  return (
    <Box component="main" sx={{ p: 3, backgroundColor: 'primary.main' }}>
        <MaterialTitle/>
    </Box>
  );
}