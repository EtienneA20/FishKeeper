import { requireDataAdminPage } from '@/lib/auth-guard';

export default async function EquipementDataPage(): Promise<React.JSX.Element> {
    await requireDataAdminPage();

    return <h1>Gestion des équipements</h1>;
}
