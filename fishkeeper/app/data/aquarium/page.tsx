import { requireDataAdminPage } from '@/lib/auth-guard';

export default async function AquariumDataPage(): Promise<React.JSX.Element> {
    await requireDataAdminPage();

    return <h1>Gestion des aquariums</h1>;
}
