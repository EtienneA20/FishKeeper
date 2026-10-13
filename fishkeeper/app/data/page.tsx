import {
  Boxes,
  Fish,
  FlaskConical,
  Package,
  Users,
  Waves,
} from 'lucide-react';
import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import prisma from '../../lib/db';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import DataModuleLink from '../../components/utils/DataModuleLink';

const MODULES = [
  {
    title: 'Utilisateurs',
    description: 'Gérez les comptes et les informations des utilisateurs de Fishkeeper.',
    href: '/data/user',
    icon: Users,
    color: '#2563eb',
    countKey: 'users',
  },
  {
    title: 'Aquariums',
    description: 'Consultez et administrez les aquariums enregistrés dans l’application.',
    href: '/data/aquarium',
    icon: Waves,
    color: '#0891b2',
    countKey: 'aquariums',
  },
  {
    title: 'Espèces',
    description: 'Référencez les espèces pouvant peupler vos aquariums.',
    href: '/data/espece',
    icon: Fish,
    color: '#059669',
    countKey: 'species',
  },
  {
    title: 'Catégories',
    description: 'Organisez les espèces grâce à leurs catégories de référence.',
    href: '/data/categorie',
    icon: Boxes,
    color: '#7c3aed',
    countKey: 'speciesCategories',
  },
  {
    title: 'Équipements',
    description: 'Gérez le matériel utilisé pour vos aquariums.',
    href: '/data/equipement',
    icon: FlaskConical,
    color: '#ea580c',
    countKey: 'equipment',
  },
  {
    title: 'Consommables',
    description: 'Suivez les consommables et les stocks nécessaires à l’entretien.',
    href: '/data/consomable',
    icon: Package,
    color: '#db2777',
    countKey: 'consumables',
  },
] as const;

export default async function DataHomePage(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
      if (!session) {
          redirect('/login');
      }
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.aquarium.count(),
    prisma.species.count(),
    prisma.speciesCategory.count(),
    prisma.equipment.count(),
    prisma.consumable.count(),
  ]);

  const moduleCounts = {
    users: counts[0],
    aquariums: counts[1],
    species: counts[2],
    speciesCategories: counts[3],
    equipment: counts[4],
    consumables: counts[5],
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Gestion des données
        </Typography>
        <Typography color="text.secondary">
          Accédez rapidement aux différents référentiels de Fishkeeper.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {MODULES.map((module) => {
          const Icon = module.icon;

          return (
            <Grid key={module.href} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'transform 160ms ease, box-shadow 160ms ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 5 },
                }}
              >
                <DataModuleLink href={module.href}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 2,
                        color: module.color,
                        backgroundColor: `${module.color}18`,
                      }}
                    >
                      <Icon size={25} strokeWidth={2} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                        {module.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, minHeight: 48 }}>
                        {module.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${moduleCounts[module.countKey]} élément${moduleCounts[module.countKey] > 1 ? 's' : ''}`}
                      sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                      variant="outlined"
                    />
                  </CardContent>
                </DataModuleLink>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}