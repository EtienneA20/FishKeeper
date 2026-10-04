'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';

import { registerUser } from '@/actions/auth.controller';
import AuthForm from '@/form/form/AuthForm';
import type { AuthFormValues } from '@/form/schema/auth.schema';

export default function LoginPage(): React.JSX.Element {
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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