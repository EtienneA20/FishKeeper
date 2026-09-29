'use client';

import { UserState, IUser } from '@/interface/entity/user.entity';
import { useSession } from 'next-auth/react';
import React, { createContext, useEffect, useMemo, useState } from 'react';

export const UserContext = createContext<UserState | undefined>(undefined);

interface UserProviderProps {
    children: React.ReactNode;
}

export function UserProvider({
    children,
}: UserProviderProps): React.JSX.Element {
    const [user, setUser] = useState<IUser | null>(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session.user) {
            setUser({
                id: session.user.id,
                name: session.user.name ?? '',
                email: session.user.email ?? '',
                departement: session.user.department ?? '',
                role: session.user.role,
            });
            return;
        }

        if (status === 'unauthenticated') {
            setUser(null);
        }
    }, [session, status]);

    const contextValue = useMemo(
        () => ({
            user,
            setUser,
        }),
        [user]
    );

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}
