'use client';

import React from 'react';
import { Box } from '@mui/material';
import MaterialHeaderCard from './MaterialHeaderCard';
import MaterialFilters from './MaterialFilters';
import ViewModeToggle from '../../components/ViewModeToggle';
import MaterialGrid from './MaterialGrid';
import equipments from './__donneesTempo';


export default function MaterialPage(): React.JSX.Element {
  return (
    <Box sx={{ m: -3, p: 3, minHeight: '100%', backgroundColor: 'page.background' }}>
        <MaterialHeaderCard/>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <MaterialFilters/>
          <ViewModeToggle/>
        </Box>
        <MaterialGrid equipments={equipments}/>
    </Box>
  );
}