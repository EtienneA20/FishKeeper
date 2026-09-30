'use client';

import * as React from 'react';
import {
  Box,
  ButtonBase,
  Typography,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const MOCK_AQUARIUMS = [
  {
    id: 1,
    name: 'Amazonien Discus 350L',
    image: '/images.jpeg', 
    volume: '350L',
  },
  {
    id: 2,
    name: 'Nano Récifal 60L',
    image: '/Logo.png',
    volume: '60L',
  },
  {
    id: 3,
    name: 'Aquascaping Iwagumi 120L',
    image: '/janeiro.jpg',
    volume: '120L',
  },
];

export default function AquariumSelector() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = React.useState<number>(1);

  const open = Boolean(anchorEl);
  const selectedAquarium =
    MOCK_AQUARIUMS.find((a) => a.id === selectedId) || MOCK_AQUARIUMS[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (id: number) => {
    setSelectedId(id);
    handleClose();
  };

  return (
    <>
      <ButtonBase
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 0.8,
          px: 1.8,
          bgcolor: '#ffffff',
          borderRadius: '0.85rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            bgcolor: '#f8fafc',
            borderColor: '#cbd5e1',
          },
        }}
      >
        <Avatar
          src={selectedAquarium.image}
          alt={selectedAquarium.name}
          variant="rounded"
          sx={{
            width: 32,
            height: 32,
            borderRadius: '0.4rem',
            bgcolor: 'transparent',
            objectFit: 'contain',
          }}
        />

        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#031c38',
            whiteSpace: 'nowrap',
          }}
        >
          {selectedAquarium.name}
        </Typography>

        {/* Flèche déroulante animée */}
        <KeyboardArrowDownIcon
          sx={{
            fontSize: '1.2rem',
            color: '#64748b',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </ButtonBase>

      {/* Menu déroulant */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: '0.75rem',
              minWidth: '15rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0',
              p: 0.5,
            },
          },
        }}
      >
        {MOCK_AQUARIUMS.map((aquarium) => (
          <MenuItem
            key={aquarium.id}
            onClick={() => handleSelect(aquarium.id)}
            selected={aquarium.id === selectedId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderRadius: '0.5rem',
              my: 0.25,
              py: 1,
              '&.Mui-selected': {
                bgcolor: '#dff1fb',
                color: '#031c38',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#d2ebf9',
                },
              },
            }}
          >
            <Avatar
              src={aquarium.image}
              alt={aquarium.name}
              variant="rounded"
              sx={{ width: 28, height: 28, borderRadius: '0.35rem' }}
            />
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 'inherit' }}>
                {aquarium.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}