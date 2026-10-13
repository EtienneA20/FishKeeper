'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { usePathname } from 'next/navigation';
import AppHeader from '@/components/headerBar/AppHeader';
import AppSidebar from '@/components/sideBar/AppSidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
    const pathname = usePathname();

    if (pathname === '/login') {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    p: 2,
                }}
            >
                <Box component="main" sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {children}
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <AppHeader />
            <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
                <AppSidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto', minWidth: 0 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}