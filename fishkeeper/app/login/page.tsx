'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Container, Paper, Stack, Typography, IconButton, Avatar } from '@mui/material';

import { registerUser } from '@/actions/auth.controller';
import AuthForm from '@/form/form/AuthForm';
import type { AuthFormValues } from '@/form/schema/auth.schema';
import UserMenuPopover from '@/components/UserMenuPopover';

export default function LoginPage(): React.JSX.Element {
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // État pour la Popover du profil
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    async function handleSubmit(values: AuthFormValues): Promise<void> {
        setError(null);
        setIsLoading(true);

        try {
            if (isRegistering) {
                await registerUser({
                    name: values.name,
                    email: values.email,
                    departement: values.departement,
                    password: values.password,
                });
            }

            const result = await signIn('credentials', {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error('E-mail ou mot de passe invalide.');
            }

            router.push('/user');
            router.refresh();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 5, md: 10 } }}>
            {/* Barre supérieure avec le bouton Avatar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <IconButton onClick={handleOpenMenu} size="small">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>A</Avatar>
                </IconButton>
            </Box>

            {/* Popover rattachée au bouton Avatar */}
            <UserMenuPopover
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            />

            <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 } }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {isRegistering ? 'Créer un compte' : 'Connexion'}
                        </Typography>
                        <Typography color="text.secondary">
                            Accédez à votre espace Fishkeeper.
                        </Typography>
                    </Box>
                    <AuthForm
                        isRegistering={isRegistering}
                        isLoading={isLoading}
                        error={error}
                        onSubmit={handleSubmit}
                        onToggleMode={() => {
                            setIsRegistering((current) => !current);
                            setError(null);
                        }}
                    />
                </Stack>
            </Paper>
        </Container>
    );
}   