'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorPageProps {
    error: Error & { digest?: string };
    retry: () => void;
}

/**
 * Erreur d'exécution dans une page (rendue dans le layout racine).
 * En production, `error.message` est masqué pour les erreurs serveur :
 * n'afficher que `error.digest` pour faire le lien avec les logs.
 */
export default function ErrorPage({ error, retry }: ErrorPageProps): React.JSX.Element {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Un problème inattendu s&apos;est produit. Vous pouvez réessayer ou revenir à l&apos;accueil.
            </Typography>
            <img src="/logos/fatal_error_fishkeeper.png" />
            {error.digest && (
                <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 3 }}>
                    Code : {error.digest}
                </Typography>
            )}
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                <Button variant="contained" onClick={() => retry()}>
                    Réessayer
                </Button>
                <Button component={Link} href="/" variant="outlined">
                    Retour à l&apos;accueil
                </Button>
            </Stack>
        </Box>
    );
}
