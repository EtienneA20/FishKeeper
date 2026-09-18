'use client';

import { useContext } from 'react';
import { UserState } from '@/interface/entity/user.entity';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { UserContext } from '@/contexts/UserContext';

export function useUser(): UserState {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error(EERROR_MESSAGE.USER_CONTEXT);
    }

    return context;
}
