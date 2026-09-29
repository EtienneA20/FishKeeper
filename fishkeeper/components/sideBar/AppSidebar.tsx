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

const OPEN_WIDTH = '14.5rem';
const CLOSE_WIDTH = '4.5rem';

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
    width: open ? OPEN_WIDTH : CLOSE_WIDTH,
    transition: theme.transitions.create('width'),
    '& .MuiDrawer-paper': {
      width: open ? OPEN_WIDTH : CLOSE_WIDTH,
      transition: theme.transitions.create('width'),
      backgroundColor: '#031c38',
      color: '#8fa0b5',
      overflowX: 'hidden',
      border: 'none',
    },
  })
);

export default function AppSidebar() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const savedState = localStorage.getItem('sidebar_open');
    if (savedState !== null) setOpen(savedState === 'true');
  }, []);

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
    </Drawer>
  );
}