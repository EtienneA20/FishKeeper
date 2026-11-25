import SpeciesListPage from './SpeciesListPage';
import { requireDataAdminPage } from '@/lib/auth-guard';

export default async function EspeceDataPage(): Promise<React.JSX.Element> {
    await requireDataAdminPage();

    return <SpeciesListPage />;
}
