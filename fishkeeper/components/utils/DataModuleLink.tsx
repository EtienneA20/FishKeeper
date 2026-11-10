'use client';

import Link from 'next/link';
import { CardActionArea } from '@mui/material';

interface DataModuleLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function DataModuleLink({ href, children }: DataModuleLinkProps): React.ReactElement {
  return (
    <CardActionArea
      component={Link}
      href={href}
      sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
    >
      {children}
    </CardActionArea>
  );
}
