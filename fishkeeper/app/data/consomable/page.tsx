import { requireDataAdminPage } from '@/lib/auth-guard';

export default async function ConsomableDataPage(): Promise<React.JSX.Element> {
    await requireDataAdminPage();

    return <h1>Gestion des consommables</h1>;
}
