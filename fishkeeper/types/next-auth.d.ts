import type { EROLE } from '@/constants/enum/role.enum';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: EROLE;
            name?: string | null;
            email?: string | null;
            department?: string | null;
            imageUrl?: string | null;
        };
    }

    interface User {
        role: EROLE;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: EROLE;
    }
}