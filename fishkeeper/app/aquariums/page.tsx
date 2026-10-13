import { Typography, Container, Box } from '@mui/material';
import SetMealTwoToneIcon from '@mui/icons-material/SetMealTwoTone';


export default function aquariumsHomePage() {
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
                    Bienvenue sur la page mes aquariums
                </Typography>
                <SetMealTwoToneIcon />
            </Box>
        </Container>
    );
}
