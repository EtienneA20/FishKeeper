'use client';

import React from 'react';
import CategoryFilterBar from '../../components/CategoryFilterBar';
import { IEquipment } from '@/interface/entity/equipment.entity';
import { EQUIPMENT_TYPES } from '@/constants/equipment.constant';

interface EquipmentFiltersProps {
    equipments: IEquipment[];
}

export default function EquipmentFilters({
    equipments,
}: EquipmentFiltersProps): React.JSX.Element {
    const categories: Record<string, number> = {};

    for (const equipment of equipments) {
        const category = EQUIPMENT_TYPES[equipment.type].category;
        categories[category] = (categories[category] ?? 0) + 1;
    }

    return <CategoryFilterBar categories={categories} />;
}
