'use client';

import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';

/**
 * Page 404 : URL inconnue ou appel à `notFound()`.
 * Rendue à l'intérieur du layout racine (thème MUI + AppLayout disponibles).
 */
export default function NotFound(): React.JSX.Element {
    return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h2" gutterBottom>
                Page introuvable
            </Typography>
            <img src="/logos/error_404_fishkeeper.png" />

            <Typography color="text.secondary" variant="h5" sx={{ mb: 3 }}>
                La page que vous cherchez n&apos;existe pas ou a été déplacée.
            </Typography>
            <Button component={Link} href="/" variant="contained">
                Retour à l&apos;accueil
            </Button>
        </Box>
    );
}
