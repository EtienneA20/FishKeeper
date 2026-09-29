'use client';

import React, { useState, useMemo } from 'react';
import createCache from '@emotion/cache';
import type { EmotionCache } from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { UserProvider, UserContext } from '@/contexts/UserContext';
import { useContext } from 'react';

interface ThemeRegistryProps {
    children: React.ReactNode;
}

// Composant interne qui consomme le thème du UserContext
function InnerThemeProvider({ children }: { children: React.ReactNode }) {
    const userContext = useContext(UserContext);
    const isDark = userContext?.theme ?? false;

    // Création dynamique du thème MUI (Clair ou Sombre)
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: isDark ? 'dark' : 'light',
                    primary: {
                        main: '#0288d1', // Bleu Fishkeeper
                    },
                    background: {
                        default: isDark ? '#0F172A' : '#F8FAFC',
                        paper: isDark ? '#1E293B' : '#FFFFFF',
                    },
                },
                shape: {
                    borderRadius: 12,
                },
            }),
        [isDark]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}

export default function ThemeRegistry({ children }: ThemeRegistryProps): React.JSX.Element {
    const [{ cache, flush }] = useState<{
        cache: EmotionCache;
        flush: () => string[];
    }>(() => {
        const emotionCache = createCache({ key: 'mui' });
        emotionCache.compat = true;
        const prevInsert = emotionCache.insert;
        let inserted: string[] = [];

        emotionCache.insert = (...args: Parameters<typeof prevInsert>): string | void => {
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
        if (names.length === 0) return null;
        let styles = '';
        for (const name of names) {
            styles += cache.inserted[name];
        }
        return (
            <style
                key={cache.key}
                data-emotion={`${cache.key} ${names.join(' ')}`}
                dangerouslySetInnerHTML={{ __html: styles }}
            />
        );
    });

    return (
        <CacheProvider value={cache}>
            <UserProvider>
                <InnerThemeProvider>{children}</InnerThemeProvider>
            </UserProvider>
        </CacheProvider>
    );
}