'use client';

import React from 'react';
import { Box } from '@mui/material';
import MaterialHeaderCard from './MaterialHeaderCard';
import MaterialFilters from './MaterialFilters';
import ViewModeToggle from '../../components/ViewModeToggle';
import MaterialGrid, { MaterialItem } from './MaterialGrid';

const materials: MaterialItem[] = [
  { id: '1', title: 'Raclette & Aimant JBL Floaty', status: 'En service', daysRemaining: 45 },
  { id: '2', title: 'Test pH & Dureté carbonatée', status: 'En service', daysRemaining: -2 },
  { id: '3', title: 'Filtre externe Eheim Pro 4+ 600', status: 'En service', daysRemaining: 43 },
  { id: '4', title: 'Raclette & Aimant JBL Floaty', status: 'En service', daysRemaining: 12 },
  { id: '5', title: 'Test pH & Dureté carbonatée', status: 'En service', daysRemaining: 5 },
  { id: '6', title: 'Filtre externe Eheim Pro 4+ 600', status: 'En service', daysRemaining: 68 },
];

export default function MaterialPage(): React.JSX.Element {
  return (
    <Box sx={{ m: -3, p: 3, minHeight: '100%', backgroundColor: 'page.background' }}>
        <MaterialHeaderCard/>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <MaterialFilters/>
          <ViewModeToggle/>
        </Box>
        <MaterialGrid materials={materials}/>
    </Box>
  );
}