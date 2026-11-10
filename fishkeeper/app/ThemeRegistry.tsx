'use client';

import React, { useState } from 'react';
import createCache from '@emotion/cache';
import type { EmotionCache } from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { UserProvider } from '@/contexts/UserContext';
import { SessionProvider } from 'next-auth/react';

interface CardPalette {
    background: string;
    borderColor: string;
    colorTitle: string;
    colorText: string;
    backgroundInput: string;
}

interface DarkBlueButtonPalette {
    background: string;
    colorText: string;
}

declare module '@mui/material/styles' {
    interface Palette {
        card: CardPalette;
        darkBlueButton: DarkBlueButtonPalette;
    }
    interface PaletteOptions {
        card?: CardPalette;
        darkBlueButton?: DarkBlueButtonPalette;
    }
}

const theme = createTheme({
    breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
        },
    },
    components: {
        MuiContainer: {
        styleOverrides: {
            root: ({ theme }) => ({
            padding: theme.spacing(2),
            [theme.breakpoints.up('md')]: {
                padding: theme.spacing(4),
            },
            }),
        },
        },
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#0288d1',
        },
        card: {
            background: '#FFFFFF',
            borderColor: '#C4C6CE',
            colorTitle: '#000F22',
            colorText: '#43474D',
            backgroundInput: '#E5EEFF',
        },
        darkBlueButton: {
            background: '#0A2540',
            colorText: '#FFFFFF',
        },
    },
});

interface ThemeRegistryProps {
    children: React.ReactNode;
}

export default function ThemeRegistry({
    children,
}: ThemeRegistryProps): React.JSX.Element {
    const [{ cache, flush }] = useState<{
        cache: EmotionCache;
        flush: () => string[];
    }>(() => {
        const emotionCache = createCache({ key: 'mui' });
        emotionCache.compat = true;
        const prevInsert = emotionCache.insert;
        let inserted: string[] = [];

        emotionCache.insert = (
            ...args: Parameters<typeof prevInsert>
        ): string | void => {
            const serialized = args[1];
            if (emotionCache.inserted[serialized.name] === undefined) {
                inserted.push(serialized.name);
            }
            return prevInsert(...args);
        };

        const flush = (): string[] => {
            const prevInserted = inserted;
            inserted = [];
            return prevInserted;
        };

        return { cache: emotionCache, flush };
    });

    useServerInsertedHTML((): React.JSX.Element | null => {
        const names = flush();
        if (names.length === 0) {
            return null;
        }
        let styles = '';
        for (const name of names) {
            styles += cache.inserted[name];
        }
        return (
            <style
                key={cache.key}
                data-emotion={`${cache.key} ${names.join(' ')}`}
                dangerouslySetInnerHTML={{
                    __html: styles,
                }}
            />
        );
    });

    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <SessionProvider>
                    <UserProvider>{children}</UserProvider>
                </SessionProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}
