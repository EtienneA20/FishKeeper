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
            <Typography variant="h3" component="h1" gutterBottom>
                404
            </Typography>
            <Typography variant="h6" gutterBottom>
                Page introuvable
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                La page que vous cherchez n&apos;existe pas ou a été déplacée.
            </Typography>
            <Button component={Link} href="/" variant="contained">
                Retour à l&apos;accueil
            </Button>
        </Box>
    );
}
