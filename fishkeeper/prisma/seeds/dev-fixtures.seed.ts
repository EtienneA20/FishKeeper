import bcrypt from 'bcryptjs';
import type { PrismaClient } from '../../generated/prisma/client';

export async function seedDevFixtures(prisma: PrismaClient): Promise<void> {
    console.log(
        '🧪 Création des utilisateurs fictifs et des données de test...'
    );

    const hashedPassword = await bcrypt.hash('Test1234!', 10);

    // 1. Utilisateur fictif principal (Rôle USER)
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@fishkeeper.fr' },
        update: {},
        create: {
            name: 'Lucas Martin',
            email: 'demo@fishkeeper.fr',
            password: hashedPassword,
            role: 'USER',
            departement: '45',
        },
    });

    // 2. Utilisateur fictif administrateur (Rôle ADMIN)
    await prisma.user.upsert({
        where: { email: 'admin@fishkeeper.fr' },
        update: {},
        create: {
            name: 'Admin FishKeeper',
            email: 'admin@fishkeeper.fr',
            password: hashedPassword,
            role: 'ADMIN',
            departement: '45',
        },
    });

    // 3. Création des deux aquariums ciblés par tes équipements ('aquarium-1' et 'aquarium-2')
    const aquarium1 = await prisma.aquarium.upsert({
        where: { id: 'aquarium-1' },
        update: {},
        create: {
            id: 'aquarium-1',
            name: 'Bac Principal Amazonien 240L',
            grossVolume: 240,
            netVolume: 205,
            waterType: 'FRESH_SOFT',
            biotope: 'Amazonien planté',
            cycle: 'CYCLED',
            startedAt: new Date('2025-01-05'),
            dimension: JSON.stringify({ length: 120, width: 40, height: 50 }),
            ownerId: demoUser.id,
        },
    });

    const aquarium2 = await prisma.aquarium.upsert({
        where: { id: 'aquarium-2' },
        update: {},
        create: {
            id: 'aquarium-2',
            name: 'Nurserie 60L',
            grossVolume: 60,
            netVolume: 52,
            waterType: 'FRESH_SOFT',
            biotope: 'Bac de grossissement / nurserie',
            cycle: 'CYCLED',
            startedAt: new Date('2024-09-01'),
            dimension: JSON.stringify({ length: 60, width: 30, height: 35 }),
            ownerId: demoUser.id,
        },
    });

    // 4. Équipements prioritaires (tes 7 équipements exacts avec upsert sur l'id)
    const priorityEquipments = [
        {
            id: '1',
            name: 'Filtre principal',
            type: 'FILTER_CANISTER',
            brand: 'Eheim',
            model: 'Professionel 4+ 600',
            status: 'WORKING',
            purchasedAt: new Date('2025-03-12'),
            maintenanceInterval: 90,
            lastMaintainedAt: new Date('2026-10-02'),
            notes: "Mousses rincées dans l'eau du bac",
            imageURL:
                'https://img.magnific.com/photos-gratuite/gros-plan-beau-papillon-textures-interessantes-fleur-petale-orange_181624-7640.jpg',
            aquariumId: aquarium1.id,
        },
        {
            id: '2',
            name: 'Sonde pH du bac',
            type: 'PROBE_PH',
            brand: 'Seneye',
            model: 'Home',
            status: 'TO_MAINTAIN',
            purchasedAt: new Date('2025-06-01'),
            maintenanceInterval: 30,
            lastMaintainedAt: new Date('2026-10-15'),
            notes: 'Calibrer avec les solutions pH 7 et pH 4',
            imageURL: 'https://picsum.photos/id/1024/600/400.jpg',
            aquariumId: aquarium1.id,
        },
        {
            id: '3',
            name: 'Filtre de la nurserie',
            type: 'FILTER_INTERNAL',
            brand: 'JBL',
            model: 'CristalProfi i200',
            status: 'WORKING',
            purchasedAt: new Date('2024-11-20'),
            maintenanceInterval: 60,
            lastMaintainedAt: new Date('2026-09-30'),
            notes: null,
            imageURL: 'https://picsum.photos/id/1084/600/400.jpg',
            aquariumId: aquarium2.id,
        },
        {
            id: '4',
            name: 'Chauffage principal',
            type: 'HEATER',
            brand: 'Eheim',
            model: 'Jäger 150W',
            status: 'WORKING',
            purchasedAt: new Date('2025-01-08'),
            maintenanceInterval: 180,
            lastMaintainedAt: new Date('2026-07-01'),
            notes: 'Réglé sur 25 °C',
            imageURL: 'https://picsum.photos/id/119/600/400.jpg',
            aquariumId: aquarium1.id,
        },
        {
            id: '5',
            name: 'Éclairage du bac',
            type: 'LIGHTING_LED',
            brand: 'Fluval',
            model: 'Plant 3.0',
            status: 'WORKING',
            purchasedAt: new Date('2025-02-10'),
            maintenanceInterval: 365,
            lastMaintainedAt: new Date('2026-02-10'),
            notes: null,
            imageURL: 'https://picsum.photos/id/160/600/400.jpg',
            aquariumId: aquarium1.id,
        },
        {
            id: '6',
            name: 'Distributeur de nourriture',
            type: 'AUTO_FEEDER',
            brand: 'Eheim',
            model: 'Everyday',
            status: 'WORKING',
            purchasedAt: new Date('2026-01-15'),
            maintenanceInterval: 30,
            lastMaintainedAt: new Date('2026-10-21'),
            notes: 'Deux distributions par jour',
            imageURL: null,
            aquariumId: aquarium2.id,
        },
        {
            id: '7',
            name: 'Osmolateur de la nurserie',
            type: 'AUTO_TOP_OFF',
            brand: 'Tunze',
            model: 'Osmolator 3155',
            status: 'FAULTY',
            purchasedAt: new Date('2024-09-03'),
            maintenanceInterval: 120,
            lastMaintainedAt: new Date('2026-08-01'),
            notes: 'Capteur optique encrassé',
            imageURL: null,
            aquariumId: aquarium2.id,
        },
    ];

    for (const eq of priorityEquipments) {
        await prisma.equipment.upsert({
            where: { id: eq.id },
            update: eq,
            create: eq,
        });
    }
    console.log(
        `   🔧 ${priorityEquipments.length} équipements prioritaires synchronisés.`
    );

    // 5. Consommables associés (si non déjà présents)
    const existingConsumable = await prisma.consumable.findFirst({
        where: { aquariumId: aquarium1.id },
    });

    if (!existingConsumable) {
        await prisma.consumable.createMany({
            data: [
                {
                    name: 'Conditionneur d’eau Biotopol',
                    type: 'WATER_CONDITIONER',
                    brand: 'JBL',
                    quantity: 350,
                    unit: 'ml',
                    purchasedAt: new Date('2026-09-01'),
                    expiresAt: new Date('2027-09-01'),
                    notes: '10 ml pour 40 L d’eau neuve.',
                    aquariumId: aquarium1.id,
                },
                {
                    name: 'Granulés Nano / Petits Characidés',
                    type: 'FOOD',
                    brand: 'Hikari',
                    quantity: 80,
                    unit: 'g',
                    purchasedAt: new Date('2026-10-01'),
                    expiresAt: new Date('2027-06-01'),
                    notes: 'Distribution 1 fois par jour, jeûne le dimanche.',
                    aquariumId: aquarium1.id,
                },
                {
                    name: 'Recharge Tests Gouttes NO2 / NO3',
                    type: 'TEST_KIT',
                    brand: 'JBL',
                    quantity: 1,
                    unit: 'boîte',
                    purchasedAt: new Date('2026-09-15'),
                    expiresAt: new Date('2027-08-15'),
                    aquariumId: aquarium1.id,
                },
            ],
        });
    }

    // 6. Ajout d'une population réelle depuis la table Species
    const neonTetra = await prisma.species.findFirst({
        where: { scientificName: 'Paracheirodon innesi' },
    });
    const corydoras = await prisma.species.findFirst({
        where: { scientificName: 'Corydoras panda' },
    });

    // Plusieurs individus d'une espèce peuvent partager un aquarium : le nom
    // identifie la fixture pour que le seed reste rejouable sans doublon.
    const ensurePopulation = async (data: {
        name: string;
        size: number;
        notes: string;
        aquariumId: string;
        speciesId: string;
    }): Promise<void> => {
        const existing = await prisma.aquariumPopulation.findFirst({
            where: {
                aquariumId: data.aquariumId,
                speciesId: data.speciesId,
                name: data.name,
            },
            select: { id: true },
        });
        if (!existing) {
            await prisma.aquariumPopulation.create({ data });
        }
    };

    if (neonTetra) {
        await ensurePopulation({
            name: 'Banc de 15 Néons',
            size: 3.5,
            notes: 'Acclimatés au goutte-à-goutte, très actifs.',
            aquariumId: aquarium1.id,
            speciesId: neonTetra.id,
        });
    }

    if (corydoras) {
        await ensurePopulation({
            name: 'Groupe de 6 Corydoras Panda',
            size: 4.5,
            notes: 'Fouillent le sable de Loire.',
            aquariumId: aquarium1.id,
            speciesId: corydoras.id,
        });
    }

    // 7. Relevés de paramètres d'eau et tâche de maintenance
    const existingMeasurement = await prisma.waterMeasurement.findFirst({
        where: { aquariumId: aquarium1.id },
    });

    if (!existingMeasurement) {
        await prisma.waterMeasurement.create({
            data: {
                temperature: 24.8,
                ph: 6.6,
                no2: 0.0,
                no3: 10.0,
                nh4: 0.0,
                gh: 6.0,
                kh: 3.0,
                notes: 'Paramètres stables après changement d’eau hebdomadaire.',
                aquariumId: aquarium1.id,
            },
        });
    }

    const existingTask = await prisma.maintenanceTask.findFirst({
        where: { aquariumId: aquarium1.id },
    });

    if (!existingTask) {
        await prisma.maintenanceTask.create({
            data: {
                title: 'Calibrage sonde pH Seneye',
                type: 'EQUIPMENT_MAINTENANCE',
                frequency: 'MONTHLY',
                interval: 1,
                nextDueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                aquariumId: aquarium1.id,
            },
        });
    }

    console.log('✅ Données de test créées avec succès !');
    console.log('   👤 Compte USER  : demo@fishkeeper.fr  / Test1234!');
    console.log('   🛡️  Compte ADMIN : admin@fishkeeper.fr / Test1234!');
}
