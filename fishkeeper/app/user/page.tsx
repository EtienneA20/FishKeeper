import UserListPage from './UserListPage';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';

export default async function UserPage(): Promise<React.JSX.Element> {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/login');
    }

    return <UserListPage />;
}
