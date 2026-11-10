import * as React from 'react';
import { Box, Container, Divider, Paper, Typography } from '@mui/material';

export interface LegalSection {
    title: string;
    content: React.ReactNode;
}

interface LegalPageProps {
    title: string;
    lastUpdated?: string;
    intro?: React.ReactNode;
    sections: LegalSection[];
}

export default function LegalPage({
    title,
    lastUpdated,
    intro,
    sections,
}: LegalPageProps): React.JSX.Element {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ fontWeight: 700, color: '#031c38', mb: 1 }}
                >
                    {title}
                </Typography>
                {lastUpdated && (
                    <Typography variant="caption" color="text.secondary">
                        Dernière mise à jour : {lastUpdated}
                    </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                {intro && (
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        {intro}
                    </Typography>
                )}

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        '& a': {
                            color: 'inherit',
                            fontWeight: 500,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                        },
                        '& ul': { m: 0, pl: 3 },
                        '& li': { mb: 0.5 },
                    }}
                >
                    {sections.map((section, index) => (
                        <Box component="section" key={section.title}>
                            <Typography
                                variant="h6"
                                component="h2"
                                gutterBottom
                                sx={{ fontWeight: 600, color: '#031c38' }}
                            >
                                {index + 1}. {section.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                component="div"
                                sx={{ lineHeight: 1.8 }}
                            >
                                {section.content}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Container>
    );
}
