import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
    title: 'Mentions légales - Fishkeeper',
};

const REPOSITORY_URL = 'https://github.com/EtienneA20/FishKeeper';

const SECTIONS: LegalSection[] = [
    {
        title: 'Éditeur',
        content: (
            <>
                <p>
                    Fishkeeper est un projet étudiant non commercial, réalisé
                    dans le cadre d’une SAÉ (situation d’apprentissage et
                    d’évaluation) du BUT Informatique.
                </p>
                <p>
                    <strong>Nom du projet :</strong> Fishkeeper
                    <br />
                    <strong>Éditeur :</strong> Équipe projet Fishkeeper
                    <br />
                    <strong>Directeur de la publication :</strong> Etienne Audor
                    (chef de projet)
                    <br />
                    <strong>Contact :</strong>{' '}
                    <a href={`${REPOSITORY_URL}/issues`}>
                        via les issues du dépôt GitHub
                    </a>
                </p>
            </>
        ),
    },
    {
        title: 'Hébergement',
        content: (
            <p>
                TO DO 
            </p>
        ),
    },
    {
        title: 'Propriété intellectuelle',
        content: (
            <p>
                Le code source de Fishkeeper est consultable sur{' '}
                <a href={REPOSITORY_URL}>GitHub</a>. Le nom « Fishkeeper », le
                logo et les contenus de l’application sont la propriété de
                l’équipe projet. Les bibliothèques, polices et icônes tierces
                restent la propriété de leurs auteurs respectifs et sont
                utilisées conformément à leurs licences (voir la page{' '}
                <Link href="/credits">Crédits</Link>).
            </p>
        ),
    },
    {
        title: 'Données personnelles',
        content: (
            <p>
                Les données collectées (adresse e-mail, nom d’utilisateur,
                données relatives aux aquariums) sont nécessaires au
                fonctionnement du service et ne sont transmises à aucun tiers.
                Conformément au RGPD, vous pouvez exercer vos droits d’accès, de
                rectification, d’effacement et de portabilité en contactant
                l’équipe. Vous disposez également du droit d’introduire une
                réclamation auprès de la CNIL (
                <a href="https://www.cnil.fr">www.cnil.fr</a>). Pour plus de
                détails, consultez les{' '}
                <Link href="/cgu">conditions générales d’utilisation</Link>.
            </p>
        ),
    },
    {
        title: 'Cookies',
        content: (
            <p>
                Seuls des cookies techniques strictement nécessaires
                (authentification) sont utilisés. Conformément aux
                recommandations de la CNIL, ils ne nécessitent pas de
                consentement préalable.
            </p>
        ),
    },
];

export default function MentionsLegalesPage(): React.JSX.Element {
    return (
        <LegalPage
            title="Mentions légales"
            lastUpdated="10 novembre 2026"
            sections={SECTIONS}
        />
    );
}
