import type { EROLE } from '@/constants/enum/role.enum';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: EROLE;
            name?: string | null;
            email?: string | null;
            departement?: string | null;
            imageURL?: string | null;
        };
    }

    interface User {
        role: EROLE;
        departement?: string | null;
        imageURL?: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: EROLE;
        departement?: string | null;
        imageURL?: string | null;
    }
}
