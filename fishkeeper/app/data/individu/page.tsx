import PopulationListPage from './PopulationListPage';
import { requireDataAdminPage } from '@/lib/auth-guard';

export default async function IndividuDataPage(): Promise<React.JSX.Element> {
    await requireDataAdminPage();

    return <PopulationListPage />;
}
