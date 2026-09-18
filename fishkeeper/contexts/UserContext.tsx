'use client';

import { UserState, IUser } from '@/interface/entity/user.entity';
import React, { createContext, useState, useMemo } from 'react';

export const UserContext = createContext<UserState | undefined>(undefined);

interface UserProviderProps {
    children: React.ReactNode;
}

export function UserProvider({
    children,
}: UserProviderProps): React.JSX.Element {
    const [user, setUser] = useState<IUser | null>(null);

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
