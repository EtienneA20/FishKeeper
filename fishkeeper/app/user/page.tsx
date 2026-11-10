import UserListPage from './UserListPage';
import { redirect } from 'next/navigation';
import { canManageUsers } from '@/lib/auth/authorization';
import { getSessionActor } from '@/lib/auth/session';

export default async function UserPage(): Promise<React.JSX.Element> {
    // Reads the role from the database, not from the login token.
    const currentUser = await getSessionActor();
    if (!currentUser) {
        redirect('/login');
    }
    if (!canManageUsers(currentUser.role)) {
        redirect('/aquariums');
    }

    return <UserListPage currentUser={currentUser} />;
}
