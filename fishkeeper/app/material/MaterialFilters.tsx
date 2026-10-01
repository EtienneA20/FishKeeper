'use client';

import React from 'react';
import CategoryFilterBar from '../../components/CategoryFilterBar';

export default function MaterialFilters(): React.JSX.Element {
    return (
    <CategoryFilterBar
        categories={['Entretien & Nettoyage', 'Mesure & Tests', 'Quotidien & Nourrissage', "Changement d'eau"]}
    />
    );
}