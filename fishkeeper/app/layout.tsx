import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from './ThemeRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Fishkeeper',
    description: "Outil de gestion d'aquariums",
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({
    children,
}: RootLayoutProps): React.JSX.Element {
    return (
        <html lang="fr">
            <body className={inter.className}>
                <ThemeRegistry>{children}</ThemeRegistry>
            </body>
        </html>
    );
}
