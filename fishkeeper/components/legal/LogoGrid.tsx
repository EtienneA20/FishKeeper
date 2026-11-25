import * as React from 'react';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import CodeTwoToneIcon from '@mui/icons-material/CodeTwoTone';

export interface LogoItem {
    name: string;
    license: string;
    url: string;
    /** Chemin dans /public, ex. /logos/react.svg */
    logo?: string;
    detail?: string;
}

interface LogoGridProps {
    items: LogoItem[];
}

export default function LogoGrid({ items }: LogoGridProps): React.JSX.Element {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))',
                gap: 1.5,
                mt: 1,
            }}
        >
            {items.map((item) => (
                <Box
                    key={item.name}
                    component="a"
                    href={item.url}
                    {...(item.url.startsWith('http') && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    })}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        transition: 'border-color 0.2s, background-color 0.2s',
                        '&:hover': {
                            borderColor: '#cbd5e1',
                            backgroundColor: '#f8fafc',
                            textDecoration: 'none !important',
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#031c38',
                        }}
                    >
                        {item.logo ? (
                            <Image
                                src={item.logo}
                                alt={`Logo ${item.name}`}
                                width={32}
                                height={32}
                                unoptimized
                                style={{ objectFit: 'contain' }}
                            />
                        ) : (
                            <CodeTwoToneIcon />
                        )}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: '#031c38' }}
                        >
                            {item.name}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            component="p"
                        >
                            {item.detail ? `${item.detail} · ` : ''}
                            {item.license}
                        </Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
