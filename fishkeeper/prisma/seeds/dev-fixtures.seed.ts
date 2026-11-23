import bcrypt from 'bcryptjs';
import type { PrismaClient } from '../../generated/prisma/client';

export async function seedDevFixtures(prisma: PrismaClient): Promise<void> {
    console.log('🧪 Création des données de test (Utilisateur, Aquariums, Équipements, Consommables)...');

    // 1. Utilisateur de test (mot de passe : Test1234!)
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@fishkeeper.fr' },
        update: {},
        create: {
            name: 'Aquariophile Démo',
            email: 'demo@fishkeeper.fr',
            password: hashedPassword,
            role: 'USER',
            departement: '45',
        },
    });

    // Vérifier si l'aquarium de test existe déjà pour éviter les doublons
    const existingAquarium = await prisma.aquarium.findFirst({
        where: {
            ownerId: demoUser.id,
            name: 'Bac Amazonien 240L',
        },
    });

    if (existingAquarium) {
        console.log('   → Les données de test existent déjà pour demo@fishkeeper.fr.');
        return;
    }

    // 2. Création de l'Aquarium 1 : Eau douce tropicale
    const amazonianTank = await prisma.aquarium.create({
        data: {
            name: 'Bac Amazonien 240L',
            grossVolume: 240,
            netVolume: 205,
            waterType: 'FRESH_SOFT',
            biotope: 'Amazonien planté',
            cycle: 'CYCLED',
            startedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Lancé il y a 90 jours
            dimension: JSON.stringify({ length: 120, width: 40, height: 50 }),
            ownerId: demoUser.id,
        },
    });

    // 3. Équipements du Bac Amazonien
    await prisma.equipment.createMany({
        data: [
            {
                name: 'Filtre externe CristalProfi e902',
                type: 'FILTER',
                brand: 'JBL',
                model: 'e902 Greenline',
                status: 'WORKING',
                purchasedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
                maintenanceInterval: 30,
                lastMaintainedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
                notes: 'Rinçage des mousses bleues à l’eau du bac uniquement.',
                aquariumId: amazonianTank.id,
            },
            {
                name: 'Chauffage Thermocontrol 200W',
                type: 'HEATER',
                brand: 'Eheim',
                model: '3617',
                status: 'WORKING',
                purchasedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 100),
                maintenanceInterval: 180,
                lastMaintainedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                notes: 'Réglé sur 25°C.',
                aquariumId: amazonianTank.id,
            },
            {
                name: 'Rampe LED Plant 3.0',
                type: 'LIGHTING',
                brand: 'Fluval',
                model: 'Plant Spectrum 46W',
                status: 'WORKING',
                purchasedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
                maintenanceInterval: 60,
                lastMaintainedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                notes: 'Photopériode programmée de 11h00 à 19h30.',
                aquariumId: amazonianTank.id,
            },
            {
                name: 'Kit CO2 Pressurisé ProFlora',
                type: 'CO2_SYSTEM',
                brand: 'JBL',
                model: 'm502',
                status: 'NEEDS_MAINTENANCE',
                purchasedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
                maintenanceInterval: 45,
                lastMaintainedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
                notes: 'Pression bouteille à surveiller, diffuseur à nettoyer.',
                aquariumId: amazonianTank.id,
            },
        ],
    });

    // 4. Consommables associés
    await prisma.consumable.createMany({
        data: [
            {
                name: 'Conditionneur d’eau Biotopol',
                type: 'WATER_CONDITIONER',
                brand: 'JBL',
                quantity: 350,
                unit: 'ml',
                purchasedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                notes: '10 ml pour 40 L d’eau neuve.',
                aquariumId: amazonianTank.id,
            },
            {
                name: 'Granulés Nano / Petits Characidés',
                type: 'FOOD',
                brand: 'Hikari',
                quantity: 80,
                unit: 'g',
                purchasedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                expiresAt: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
                notes: 'Distribution 1 fois par jour, jeûne le dimanche.',
                aquariumId: amazonianTank.id,
            },
            {
                name: 'Recharge Tests Gouttes NO2 / NO3',
                type: 'TEST_KIT',
                brand: 'JBL',
                quantity: 1,
                unit: 'boîte',
                purchasedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
                expiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
                aquariumId: amazonianTank.id,
            },
        ],
    });

    // 5. Ajout d'une population réelle depuis la table Species (si déjà seedée)
    const neonTetra = await prisma.species.findFirst({
        where: { scientificName: 'Paracheirodon innesi' },
    });
    const corydoras = await prisma.species.findFirst({
        where: { scientificName: 'Corydoras panda' },
    });

    if (neonTetra) {
        await prisma.aquariumPopulation.create({
            data: {
                name: 'Banc de 15 Néons',
                size: 3.5,
                notes: 'Acclimatés au goutte-à-goutte, très actifs.',
                aquariumId: amazonianTank.id,
                speciesId: neonTetra.id,
            },
        });
    }

    if (corydoras) {
        await prisma.aquariumPopulation.create({
            data: {
                name: 'Groupe de 6 Corydoras Panda',
                size: 4.5,
                notes: 'Fouillent le sable de Loire.',
                aquariumId: amazonianTank.id,
                speciesId: corydoras.id,
            },
        });
    }

    // 6. Relevés de paramètres d'eau et tâche de maintenance
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
            aquariumId: amazonianTank.id,
        },
    });

    await prisma.maintenanceTask.create({
        data: {
            title: 'Nettoyage pré-filtre externe',
            type: 'EQUIPMENT_MAINTENANCE',
            frequency: 'MONTHLY',
            interval: 1,
            nextDueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            aquariumId: amazonianTank.id,
        },
    });

    // 7. Création d'un second aquarium de test : Nano Récifal 60L
    const nanoReef = await prisma.aquarium.create({
        data: {
            name: 'Nano Récifal 60L',
            grossVolume: 60,
            netVolume: 52,
            waterType: 'MARINE_HARD',
            biotope: 'Récifal Indo-Pacifique',
            cycle: 'CYCLING',
            startedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
            dimension: JSON.stringify({ length: 40, width: 40, height: 40 }),
            ownerId: demoUser.id,
        },
    });

    await prisma.equipment.createMany({
        data: [
            {
                name: 'Écumeur interne Tunze 9001',
                type: 'SKIMMER',
                brand: 'Tunze',
                model: 'Comline DOC Skimmer 9001',
                status: 'WORKING',
                purchasedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                maintenanceInterval: 14,
                lastMaintainedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                notes: 'Godet vidé tous les 4 jours.',
                aquariumId: nanoReef.id,
            },
            {
                name: 'Pompe de brassage Nero 3',
                type: 'PUMP',
                brand: 'AquaIllumination',
                model: 'Nero 3',
                status: 'WORKING',
                purchasedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                maintenanceInterval: 60,
                aquariumId: nanoReef.id,
            },
        ],
    });

    console.log('✅ Données de test créées avec succès !');
    console.log('   👤 Compte démo : demo@fishkeeper.fr / Test1234!');
}