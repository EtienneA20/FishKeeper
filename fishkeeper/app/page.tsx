import { Typography, Container, Box } from '@mui/material';
import { HomeIcon } from 'lucide-react';

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenue sur Fishkeeper
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Le socle technique est prêt.
        </Typography>
        <HomeIcon/>
      </Box>
    </Container>
  );
}