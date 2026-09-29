'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import ControlPointTwoToneIcon from '@mui/icons-material/ControlPointTwoTone';
import DialogButton from '../../components/DialogButton';
import StatusBadge from '../../components/StatusBadge';

export default function MaterialTitle(): React.JSX.Element {
  return (
    <Box
      sx={{
        my: 4,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        backgroundColor: 'card.background',
        border: '1px solid #ddd6d6',
        borderRadius: 4,
      }}
    >
      <Typography variant="h4" component="h1" sx={{ color: 'card.colorTitle', fontWeight: 700 }}>
        Matériel & Équipements
      </Typography>

      <Typography component="p" sx={{ color: 'card.colorText', textAlign: 'center' }}>
        {"Inventaire technique du bac, cycles et d'usure des consommables."}
      </Typography>

      <StatusBadge 
          text='Équipement opérationnels (5/6 en service)'
          backgroundColor='#e5f5f4'
          borderColor='#009d8d'
        />

      <Box sx={{ mt: 1 }}>
        <DialogButton 
          startIcon={<ControlPointTwoToneIcon />}
          label="Ajouter un équipement"
          backgroundColor="darkBlueButton.background"
          textColor="darkBlueButton.colorText"
          onClick={() => {}} 
        />
      </Box>
    </Box>
  );
}