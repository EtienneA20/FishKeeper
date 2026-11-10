import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from './ThemeRegistry';
import AppLayout from '@/components/AppLayout';

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
          <AppLayout>{children}</AppLayout>
        </ThemeRegistry>
      </body>
    </html>
  );
}