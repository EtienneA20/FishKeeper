'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import { Box, List, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import ScienceTwoToneIcon from '@mui/icons-material/ScienceTwoTone';
import SetMealTwoToneIcon from '@mui/icons-material/SetMealTwoTone';
import PetsTwoToneIcon from '@mui/icons-material/PetsTwoTone';
import ChecklistTwoToneIcon from '@mui/icons-material/ChecklistTwoTone';
import SaveAsTwoToneIcon from '@mui/icons-material/SaveAsTwoTone';
import Inventory2TwoToneIcon from '@mui/icons-material/Inventory2TwoTone';
import SidebarItem from './SidebarItem';
import Link from 'next/link';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: <DashboardTwoToneIcon /> },
  { label: 'Mes Aquariums', href: '/aquariums', icon: <SetMealTwoToneIcon /> },
  { label: "Paramètres de l'eau", href: '/eau', icon: <ScienceTwoToneIcon /> },
  { label: 'Faune et flore', href: '/faune', icon: <PetsTwoToneIcon /> },
  { label: 'Maintenance & Tâches', href: '/maintenance', icon: <ChecklistTwoToneIcon /> },
  { label: 'Matériel', href: '/materiel', icon: <Inventory2TwoToneIcon /> },
  { label: 'Gestion des données', href: '/data', icon: <SaveAsTwoToneIcon /> },
];

const Drawer = styled(MuiDrawer, { shouldForwardProp: (p) => p !== 'open' })<{ open: boolean }>(
  ({ theme, open }) => ({
    width: open ? "15.5rem ": "4.5rem",
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
      position: 'sticky', 
      top: '6rem',
      width: open ? "15.5rem" : "4.5rem",
      height: 'calc(100vh - 6rem)',
      paddingRight: '0.5rem',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      backgroundColor: '#031c38',
      color: '#8fa0b5',
      overflowX: 'hidden',
      border: 'none',
      boxSizing: 'border-box',
    },
  })
);

export default function AppSidebar() {
  const [open, setOpen] = React.useState(() => {
    if (typeof window === 'undefined') return false;

    const savedState = localStorage.getItem('sidebar_open');
    return savedState === null ? false : savedState === 'true';
  });
  const pathname = usePathname();

  const toggleDrawer = () => {
    setOpen((prev) => {
      const nextState = !prev;
      localStorage.setItem('sidebar_open', String(nextState));
      return nextState;
    });
  };

  return (
    <Drawer variant="permanent" open={open}>
      <Box sx={{ display: 'flex', justifyContent: open ? 'flex-end' : 'center', p: 1 }}>
        <IconButton onClick={toggleDrawer} sx={{ color: '#8fa0b5' }}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* Liste des liens */}
      <List disablePadding>
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            open={open}
            pathname={pathname}
          />
        ))}
      </List>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#8fa0b5',
        }}
      >
        {open ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justify: 'center',
              alignItems: 'center',
              gap: 1,
              '& a': {
                color: '#8fa0b5',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: '#ffffff',
                },
              },
            }}
          >
            <Link href="/cgu">CGU</Link>
            <span>•</span>
            <Link href="/credits">Crédits</Link>
            <span>•</span>
            <Link href="/mentions-legales">Mentions Légales</Link>
          </Box>
        ) : (
          <Box sx={{ opacity: 0.6, fontSize: '0.85rem' }}>©</Box>
        )}
      </Box>
    </Drawer>
  );
}