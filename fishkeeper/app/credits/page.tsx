import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import LogoGrid, { type LogoItem } from '@/components/legal/LogoGrid';

export const metadata: Metadata = {
    title: 'Crédits - Fishkeeper',
};

const TEAM = [
    { name: 'Etienne Audor', role: 'Chef de projet' },
    { name: 'Joris Vachey', role: 'Développeur' },
    { name: 'Nolan Morrain', role: 'Développeur' },
    { name: 'Clément Moisan', role: 'Développeur' },
    { name: 'Quentin Moreau', role: 'Développeur' },
];

const TECHNOLOGIES: LogoItem[] = [
    {
        name: 'Next.js',
        license: 'MIT',
        url: 'https://nextjs.org',
        logo: '/logos/nextdotjs.svg',
    },
    {
        name: 'React',
        license: 'MIT',
        url: 'https://react.dev',
        logo: '/logos/react.svg',
    },
    {
        name: 'Material UI',
        license: 'MIT',
        url: 'https://mui.com',
        logo: '/logos/mui.svg',
    },
    {
        name: 'Prisma',
        license: 'Apache 2.0',
        url: 'https://www.prisma.io',
        logo: '/logos/prisma.svg',
    },
    {
        name: 'SQLite',
        license: 'Domaine public',
        url: 'https://sqlite.org',
        logo: '/logos/sqlite.svg',
    },
    {
        name: 'NextAuth.js',
        license: 'ISC',
        url: 'https://next-auth.js.org',
        logo: '/logos/nextauth.png',
    },
    {
        name: 'React Hook Form',
        license: 'MIT',
        url: 'https://react-hook-form.com',
        logo: '/logos/reacthookform.svg',
    },
    { name: 'Yup', license: 'MIT', url: 'https://github.com/jquense/yup' },
    {
        name: 'TypeScript',
        license: 'Apache 2.0',
        url: 'https://www.typescriptlang.org',
        logo: '/logos/typescript.svg',
    },
];

const RESOURCES: LogoItem[] = [
    {
        name: 'Material Icons',
        detail: 'Icônes',
        license: 'Apache 2.0',
        url: 'https://fonts.google.com/icons',
        logo: '/logos/materialdesign.svg',
    },
    {
        name: 'Lucide',
        detail: 'Icônes',
        license: 'ISC',
        url: 'https://lucide.dev',
        logo: '/logos/lucide.svg',
    },
    {
        name: 'Inter',
        detail: 'Police',
        license: 'SIL OFL 1.1',
        url: 'https://rsms.me/inter',
        logo: '/logos/googlefonts.svg',
    },
    {
        name: 'Logo Fishkeeper',
        detail: 'Équipe projet',
        license: 'Tous droits réservés',
        url: '/',
        logo: '/Logo.png',
    },
];

const SECTIONS: LegalSection[] = [
    {
        title: 'Équipe',
        content: (
            <ul>
                {TEAM.map((member) => (
                    <li key={member.name}>
                        <strong>{member.name}</strong> — {member.role}
                    </li>
                ))}
            </ul>
        ),
    },
    {
        title: 'Technologies',
        content: <LogoGrid items={TECHNOLOGIES} />,
    },
    {
        title: 'Icônes, polices et visuels',
        content: <LogoGrid items={RESOURCES} />,
    },
    {
        title: 'Remerciements',
        content: (
            <p>
                Merci à l’équipe pédagogique pour son accompagnement tout au
                long de la SAÉ, ainsi qu’aux communautés open source dont les
                outils ont rendu ce projet possible.
            </p>
        ),
    },
];

export default function CreditsPage(): React.JSX.Element {
    return (
        <LegalPage
            title="Crédits"
            intro="Fishkeeper est un outil open source de gestion d’aquariums, développé dans le cadre d’un projet étudiant."
            sections={SECTIONS}
        />
    );
}
