import UserListPage from './UserListPage';
import { requireDataAdminPage } from '@/lib/auth-guard';

export default async function UserPage(): Promise<React.JSX.Element> {
    const session = await requireDataAdminPage();

    return (
        <UserListPage
            currentUser={{ id: session.user.id, role: session.user.role }}
        />
    );
}
