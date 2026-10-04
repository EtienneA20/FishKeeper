'use client';

import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Image from 'next/image';
import AquariumSelector from './aquariumSelector';

const SETTINGS = ['Mon profil', 'Paramètres', 'Déconnexion'];

export default function AppHeader() {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        color: '#0f172a',
      }}
    >
      <Toolbar 
        disableGutters 
        sx={{ 
          justifyContent: 'space-between', 
          ml:1,
          pl: 1,
          pr: { xs: 2, sm: 3 }, 
          minHeight: '6rem !important',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Image
            src="/Logo.png"
            alt="Logo Fishkeeper"
            width={65}
            height={65}
            priority
        />

        <Typography
            variant="h5"
            noWrap
            component="span"
            sx={{
            ml: 2, // Marge avec le logo
            display: { xs: 'none', md: 'flex' },
            fontWeight: 700,
            fontSize: '3rem', 
            letterSpacing: '-0.02em',
            color: '#031c38',
            }}
        >
            Fishkeeper - Claire Voyance
        </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mx: 1.5}}>
        <AquariumSelector/>
        </Box>
        <Box sx={{ width: '1px', height: '1.8rem', bgcolor: '#e2e8f0', mx: 10 }} />  
            <IconButton sx={{ color: '#64748b' }}>
              <Badge color="error" variant="dot">
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>

          <Box sx={{ flexGrow: 0 }}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
                <Avatar
                  alt="Utilisateur"
                  sx={{ width: 36, height: 36, bgcolor: '#031c38', fontSize: '0.9rem' }}
                >
                  FK
                </Avatar>
              </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {SETTINGS.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography sx={{ fontSize: '0.875rem' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}