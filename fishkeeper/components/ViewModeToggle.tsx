'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import GridViewTwoToneIcon from '@mui/icons-material/GridViewTwoTone';
import ViewListTwoToneIcon from '@mui/icons-material/ViewListTwoTone';


export default function ViewModeToggle(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentView = searchParams.get('viewmode') || 'grid';

  const viewModes = ['grid', 'list'];

  const handleSelect = (modeChoose: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('viewmode', modeChoose);
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <Box
        sx={{
        display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center', p: 0.8, width: 'fit-content',
        backgroundColor: 'card.background', border: '1px solid', borderColor: 'card.borderColor', borderRadius: 4, pl: 2
        }}
    >
        <Typography sx={{color: 'card.colorText'}}>
            {'Vue :'}
        </Typography>

      {viewModes.map((modeChoose) => {
        const isSelected = currentView === modeChoose;

        return (
            <Box  
                key={modeChoose} 
                component="button" 
                onClick={ () => {handleSelect(modeChoose)} }
                sx={{
                    display: 'flex', flexDirection: 'row', gap: 0.2, alignItems: 'center',
                    border: 'none', cursor: 'pointer', p: 1, borderRadius: 2.5, 
                    backgroundColor: isSelected ? 'darkBlueButton.background' : 'transparent'
                }}
            >

                <Box sx={{ display: 'flex', alignItems: 'center', color: isSelected ? '#FFFFFF' : 'card.colorText'}}>
                    {modeChoose === 'grid' ? <GridViewTwoToneIcon/> : <ViewListTwoToneIcon/>}
                </Box>

            </Box>
        );
      })}
    </Box>
  );
}