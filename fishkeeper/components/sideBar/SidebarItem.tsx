'use client';

import * as React from 'react';
import Link from 'next/link';
import { styled } from '@mui/material/styles';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

const NavButton = styled(ListItemButton)<{ component?: React.ElementType; href?: string }>(() => ({
  borderRadius: '0.5rem',
  margin: '0.25rem 0.5rem',
  backgroundColor: 'transparent',
  color: '#8fa0b5',
  '& .MuiListItemIcon-root': { color: '#8fa0b5' },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    '& .MuiListItemIcon-root': { color: '#ffffff' },
  },
  '&.Mui-selected': {
    backgroundColor: '#dff1fb !important',
    color: '#031c38 !important',
    fontWeight: 600,
    '& .MuiListItemIcon-root': { color: '#031c38 !important' },
  },
}));

interface SidebarItemProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  open: boolean;
  pathname: string;
}

export default function SidebarItem({ label, href, icon, open, pathname }: SidebarItemProps) {
  const isSelected = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <ListItem disablePadding>
      <NavButton component={Link} href={href} selected={isSelected}>
        <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', color: 'inherit' }}>
          {icon}
        </ListItemIcon>
        {open && <ListItemText primary={label} />}
      </NavButton>
    </ListItem>
  );
}