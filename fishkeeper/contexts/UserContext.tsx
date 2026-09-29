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
    // je veux save le théme qu'a choisi le user genre bool clair = 0 dark = 1
    const [theme, setTheme] = useState<boolean>(false);
    const contextValue = useMemo(
        () => ({
            user,
            setUser,
            theme,
            setTheme,
        }),
        [user]
    );

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}
