'use client';

import React from 'react';
import { Box } from '@mui/material';
import MaterialHeaderCard from './MaterialHeaderCard';
import MaterialFilters from './MaterialFilters';
import ViewModeToggle from '../../components/ViewModeToggle';

export default function MaterialPage(): React.JSX.Element {
  return (
    <Box component="main" sx={{ p: 3, backgroundColor: 'primary.main' }}>
        <MaterialHeaderCard/>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <MaterialFilters/>
          <ViewModeToggle/>
        </Box>
    </Box>
  );
}