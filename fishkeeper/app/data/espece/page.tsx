import { requireDataAdminPage } from '@/lib/auth-guard';

export default async function EspeceDataPage(): Promise<React.JSX.Element> {
    await requireDataAdminPage();

    return <h1>Gestion des espèces</h1>;
}
