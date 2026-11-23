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
    <Box sx={{ m: -3, p: 6, boxSizing: 'border-box', height: 'calc(100% + 48px)', overflowY: 'auto', scrollbarGutter: 'stable', backgroundColor: 'page.background' }}>
        <MaterialHeaderCard/>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <MaterialFilters equipments={equipments}/>
          <ViewModeToggle/>
        </Box>
        <MaterialGrid equipments={equipments}/>
    </Box>
  );
}