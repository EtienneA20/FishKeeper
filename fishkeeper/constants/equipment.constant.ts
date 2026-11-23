import { EEquipmentStatus } from '@/constants/enum/equipment-status.enum';
import { EEquipmentType } from '@/constants/enum/equipment-type.enum';

export const ALERT_THRESHOLD_DAYS = 7;

export const DEFAULT_EQUIPMENT_IMAGE_URL =
    'https://img.icons8.com/pulsar-line/1200/image.jpg';

export const EQUIPMENT_STATUS_LABELS: Record<EEquipmentStatus, string> = {
    [EEquipmentStatus.WORKING]: 'En service',
    [EEquipmentStatus.TO_MAINTAIN]: 'En maintenance',
    [EEquipmentStatus.FAULTY]: 'En panne',
    [EEquipmentStatus.RETIRED]: 'Retiré',
};

interface EquipmentStatusColors {
    color: string;
    backgroundColor: string;
}

export const EQUIPMENT_STATUS_COLORS: Record<
    EEquipmentStatus,
    EquipmentStatusColors
> = {
    [EEquipmentStatus.WORKING]: { color: '#047857', backgroundColor: '#D1FAE5' },
    [EEquipmentStatus.TO_MAINTAIN]: { color: '#B45309', backgroundColor: '#FEF3C7' },
    [EEquipmentStatus.FAULTY]: { color: '#BA1A1A', backgroundColor: '#FFDAD6' },
    [EEquipmentStatus.RETIRED]: { color: '#475569', backgroundColor: '#E2E8F0' },
};

// En BD, un équipement n'a qu'un seul type (EEquipmentType) et pas de catégorie.
// C'est donc ici qu'on définit, pour chaque type, son nom en français (label)
// et dans quelle catégorie (onglet de filtre) il est rangé.
interface EquipmentTypeInfo {
    label: string;
    category: string;
}

export const EQUIPMENT_TYPES: Record<EEquipmentType, EquipmentTypeInfo> = {
    [EEquipmentType.FILTER_CANISTER]: {
        label: 'Filtre externe',
        category: 'Entretien & Nettoyage',
    },
    [EEquipmentType.FILTER_SUMP]: {
        label: 'Filtre à décantation',
        category: 'Entretien & Nettoyage',
    },
    [EEquipmentType.FILTER_INTERNAL]: {
        label: 'Filtre interne',
        category: 'Entretien & Nettoyage',
    },
    [EEquipmentType.WAVE_MAKER]: {
        label: 'Pompe de brassage',
        category: 'Entretien & Nettoyage',
    },
    [EEquipmentType.RETURN_PUMP]: {
        label: 'Pompe de remontée',
        category: 'Entretien & Nettoyage',
    },
    [EEquipmentType.PROTEIN_SKIMMER]: {
        label: 'Écumeur',
        category: 'Entretien & Nettoyage',
    },
    [EEquipmentType.UV_STERILIZER]: {
        label: 'Stérilisateur UV',
        category: 'Entretien & Nettoyage',
    },
    [EEquipmentType.OZONE_GENERATOR]: {
        label: 'Ozoniseur',
        category: 'Entretien & Nettoyage',
    },
    [EEquipmentType.AIR_PUMP]: {
        label: 'Pompe à air',
        category: 'Entretien & Nettoyage',
    },
    [EEquipmentType.PROBE_PH]: {
        label: 'Sonde pH',
        category: 'Mesure & Tests',
    },
    [EEquipmentType.PROBE_TEMP]: {
        label: 'Sonde de température',
        category: 'Mesure & Tests',
    },
    [EEquipmentType.PROBE_SALINITY]: {
        label: 'Sonde de salinité',
        category: 'Mesure & Tests',
    },
    [EEquipmentType.PROBE_REDX]: {
        label: 'Sonde redox',
        category: 'Mesure & Tests',
    },
    [EEquipmentType.TEMPERATURE_CONTROLLER]: {
        label: 'Thermostat',
        category: 'Mesure & Tests',
    },
    [EEquipmentType.CONTROLLER_CENTRAL]: {
        label: 'Contrôleur central',
        category: 'Mesure & Tests',
    },
    [EEquipmentType.HEATER]: {
        label: 'Chauffage',
        category: 'Quotidien & Nourrissage',
    },
    [EEquipmentType.CHILLER]: {
        label: 'Groupe froid',
        category: 'Quotidien & Nourrissage',
    },
    [EEquipmentType.LIGHTING_LED]: {
        label: 'Éclairage LED',
        category: 'Quotidien & Nourrissage',
    },
    [EEquipmentType.CO2_SYSTEM]: {
        label: 'Système CO2',
        category: 'Quotidien & Nourrissage',
    },
    [EEquipmentType.DOSING_PUMP]: {
        label: 'Pompe doseuse',
        category: 'Quotidien & Nourrissage',
    },
    [EEquipmentType.CALCIUM_REACTOR]: {
        label: 'Réacteur à calcium',
        category: 'Quotidien & Nourrissage',
    },
    [EEquipmentType.AUTO_FEEDER]: {
        label: 'Distributeur de nourriture',
        category: 'Quotidien & Nourrissage',
    },
    [EEquipmentType.AUTO_TOP_OFF]: {
        label: 'Osmolateur',
        category: "Changement d'eau",
    },
    [EEquipmentType.OTHER]: { label: 'Autre', category: 'Autre' },
};
