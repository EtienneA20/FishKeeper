import React from 'react';
import { Box } from '@mui/material';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import { getMyEquipments } from '@/actions/equipment.controller';
import { getMyAquariums } from '@/actions/aquarium.controller';
import MaterialHeaderCard from './MaterialHeaderCard';
import MaterialFilters from './MaterialFilters';
import ViewModeToggle from '../../components/ViewModeToggle';
import MaterialGrid from './MaterialGrid';


export default async function MaterialPage(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const equipments = await getMyEquipments();
  const aquariums = await getMyAquariums();

  return (
    <Box sx={{ m: -3, p: 6, boxSizing: 'border-box', height: 'calc(100% + 48px)', overflowY: 'auto', scrollbarGutter: 'stable', backgroundColor: 'page.background' }}>
        <MaterialHeaderCard equipments={equipments} aquariums={aquariums}/>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <MaterialFilters equipments={equipments}/>
          <ViewModeToggle/>
        </Box>
        <MaterialGrid equipments={equipments}/>
    </Box>
  );
}
