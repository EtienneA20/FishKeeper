import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
    title: "Conditions générales d'utilisation - Fishkeeper",
};

const SECTIONS: LegalSection[] = [
    {
        title: 'Objet',
        content: (
            <p>
                Les présentes conditions générales d’utilisation (CGU) ont pour
                objet de définir les modalités d’accès et d’utilisation de
                l’application <strong>Fishkeeper</strong>, outil open source de
                gestion d’aquariums. Toute utilisation de l’application implique
                l’acceptation pleine et entière des présentes CGU.
            </p>
        ),
    },
    {
        title: 'Description du service',
        content: (
            <>
                <p>
                    Fishkeeper permet à ses utilisateurs de suivre et
                    d’organiser la gestion de leurs aquariums, notamment :
                </p>
                <ul>
                    <li>la gestion de plusieurs aquariums ;</li>
                    <li>le relevé et le suivi des paramètres de l’eau ;</li>
                    <li>l’inventaire de la faune et de la flore ;</li>
                    <li>la planification des tâches de maintenance ;</li>
                    <li>l’inventaire du matériel ;</li>
                    <li>l’import et l’export des données.</li>
                </ul>
            </>
        ),
    },
    {
        title: 'Accès au service',
        content: (
            <p>
                L’accès à l’application est gratuit. Certaines fonctionnalités
                nécessitent la création d’un compte utilisateur. Les frais
                d’accès à Internet et le matériel nécessaire restent à la charge
                de l’utilisateur. L’équipe Fishkeeper s’efforce d’assurer la
                disponibilité du service mais ne garantit pas un accès continu
                et sans interruption, notamment en cas de maintenance ou de
                panne.
            </p>
        ),
    },
    {
        title: 'Compte utilisateur',
        content: (
            <p>
                L’utilisateur s’engage à fournir des informations exactes lors
                de la création de son compte. Il est seul responsable de la
                confidentialité de ses identifiants et de toute activité
                réalisée depuis son compte. En cas d’utilisation frauduleuse ou
                contraire aux présentes CGU, l’équipe Fishkeeper se réserve le
                droit de suspendre ou de supprimer le compte concerné.
            </p>
        ),
    },
    {
        title: 'Engagements de l’utilisateur',
        content: (
            <>
                <p>L’utilisateur s’engage à :</p>
                <ul>
                    <li>
                        utiliser l’application conformément à sa destination et
                        à la législation en vigueur ;
                    </li>
                    <li>
                        ne pas tenter de porter atteinte au bon fonctionnement
                        du service ou à la sécurité des données ;
                    </li>
                    <li>
                        ne pas publier de contenu illicite, injurieux ou portant
                        atteinte aux droits de tiers (notamment dans les images
                        importées).
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: 'Données personnelles',
        content: (
            <p>
                Les données saisies dans l’application (informations de compte,
                données relatives aux aquariums) sont utilisées uniquement pour
                le fonctionnement du service et ne sont ni vendues ni cédées à
                des tiers. Les mots de passe sont stockés sous forme chiffrée.
                Conformément au Règlement général sur la protection des données
                (RGPD) et à la loi « Informatique et Libertés », l’utilisateur
                dispose d’un droit d’accès, de rectification, de portabilité et
                de suppression de ses données. Ces droits peuvent être exercés
                auprès de l’équipe Fishkeeper (voir les{' '}
                <Link href="/mentions-legales">mentions légales</Link>).
            </p>
        ),
    },
    {
        title: 'Cookies et stockage local',
        content: (
            <p>
                Fishkeeper utilise uniquement des cookies et un stockage local
                strictement nécessaires au fonctionnement de l’application
                (maintien de la session de connexion, mémorisation de l’état de
                l’interface). Aucun cookie publicitaire ou de mesure d’audience
                n’est déposé.
            </p>
        ),
    },
    {
        title: 'Propriété intellectuelle',
        content: (
            <p>
                Fishkeeper est un projet open source dont le code source est
                publié sur GitHub. Le nom, le logo et les contenus éditoriaux de
                l’application restent la propriété de l’équipe Fishkeeper. Les
                bibliothèques et ressources tierces utilisées sont soumises à
                leurs propres licences, détaillées sur la page{' '}
                <Link href="/credits">Crédits</Link>. Les contenus ajoutés par
                l’utilisateur (photos, notes) restent sa propriété.
            </p>
        ),
    },
    {
        title: 'Limitation de responsabilité',
        content: (
            <p>
                Fishkeeper est un outil d’aide au suivi aquariophile. Les
                informations affichées sont fournies à titre indicatif et ne
                remplacent pas l’avis d’un professionnel. L’équipe Fishkeeper ne
                saurait être tenue responsable d’une perte de données, d’un
                dysfonctionnement du service, ni des conséquences (notamment la
                perte d’animaux ou de plantes) liées à l’interprétation ou à
                l’utilisation des données de l’application. Il est recommandé
                d’exporter régulièrement ses données.
            </p>
        ),
    },
    {
        title: 'Modification des CGU',
        content: (
            <p>
                L’équipe Fishkeeper se réserve le droit de modifier les
                présentes CGU à tout moment. La date de dernière mise à jour
                figure en haut de cette page. L’utilisation de l’application
                après modification vaut acceptation des nouvelles conditions.
            </p>
        ),
    },
    {
        title: 'Droit applicable',
        content: (
            <p>
                Les présentes CGU sont régies par le droit français. En cas de
                litige, une solution amiable sera recherchée avant toute action
                judiciaire ; à défaut, les tribunaux français seront seuls
                compétents.
            </p>
        ),
    },
];

export default function CGUPage(): React.JSX.Element {
    return (
        <LegalPage
            title="Conditions générales d’utilisation"
            lastUpdated="10 novembre 2026"
            sections={SECTIONS}
        />
    );
}
