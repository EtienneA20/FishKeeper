export interface IMaterial {
    id: string;
    name: string;
    number: number;
}

export interface MaterialState {
    material: IMaterial | null;
    setMaterial: (material: IMaterial | null) => void;
}
