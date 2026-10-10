export interface IWaterMeasurement {
    id: number;
    measuredAt: Date;
    temperature: number | null;
    ph: number | null;
    no2: number | null;
    no3: number | null;
    nh4: number | null;
    gh: number | null;
    kh: number | null;
    notes: string | null;
    createdAt: Date;
    aquariumId: string;
}