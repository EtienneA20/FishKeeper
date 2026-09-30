import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from './ThemeRegistry';
import Box from '@mui/material/Box';
import AppSidebar from '../components/sideBar/AppSidebar';
import AppHeader from '../components/headerBar/AppHeader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fishkeeper',
  description: "Outil de gestion d'aquariums",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="fr">
      <body className={inter.className} style={{ margin: 0 }}>
        <ThemeRegistry>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <AppHeader />

            <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
              <AppSidebar />
              <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto', minWidth: 0 }}>
                {children}
              </Box>
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}