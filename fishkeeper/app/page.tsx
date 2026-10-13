import { Typography, Container, Box } from '@mui/material';
import { HomeIcon } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    my: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Bienvenue {session.user?.name ?? 'sur Fishkeeper'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Le socle technique est prêt.
                </Typography>
                <HomeIcon />
            </Box>
        </Container>
    );
}
 