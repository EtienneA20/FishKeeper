import UserListPage from './UserListPage';
import { requireDataAdminPage } from '@/lib/auth-guard';

export default async function UserPage(): Promise<React.JSX.Element> {
    await requireDataAdminPage();

    return <UserListPage />;
}
