'use client';

import React, { useState } from 'react';
import createCache from '@emotion/cache';
import type { EmotionCache } from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { UserProvider } from '@/contexts/UserContext';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0288d1',
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
                <UserProvider>{children}</UserProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}
