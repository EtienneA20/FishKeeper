import CategoryListPage from './CategoryListPage';
import { requireDataAdminPage } from '@/lib/auth-guard';

export default async function CategorieDataPage(): Promise<React.JSX.Element> {
    await requireDataAdminPage();

    return <CategoryListPage />;
}
