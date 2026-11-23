'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface CategoryFilterBarProps {
  categories: Record<string, number>;
}

export default function CategoryFilterBar({
  categories
}: CategoryFilterBarProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentCategory = searchParams.get('category') || 'Tous';
  const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
  const allTabs: [string, number][] = [['Tous', total], ...Object.entries(categories)];

  const handleSelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'Tous') {
        params.delete('category')
    } else {
        params.set('category', category);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };
  return (
    <Box
        sx={{
        display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center', p: 0.8, width: 'fit-content',
        backgroundColor: 'card.background', border: '1px solid', borderColor: 'card.borderColor', borderRadius: 4, 
        }}
    >
      {allTabs.map(([category, count]) => {
        const isSelected = currentCategory === category;

        return (
            <Box  
                key={category} 
                component="button" 
                onClick={ () => {handleSelect(category)} }
                sx={{
                    display: 'flex', flexDirection: 'row', gap: 0.2, alignItems: 'center',
                    border: 'none', cursor: 'pointer', py: 1, px: 2, borderRadius: 2.5, 
                    backgroundColor: isSelected ? 'darkBlueButton.background' : 'transparent'
                }}
            >
                <Typography sx={{color: isSelected ? '#FFFFFF' : 'card.colorText'}}>
                    {category}
                </Typography>
            
                <Box sx={{width: 25, height: 20, borderRadius: '40%', backgroundColor: 'card.backgroundInput', ml: 1, alignItems: 'center'}}
                >
                    <Typography sx={{fontWeight: 'bold', fontSize: 13, color: 'card.colorText'}}>
                        {count}
                    </Typography>
                </Box>

            </Box>
        );
      })}
    </Box>
  );
}