import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { EROLE } from '@/constants/enum/role.enum';

import prisma from '@/lib/db';

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret) {
    throw new Error('NEXTAUTH_SECRET must be defined.');
}

export const authOptions: NextAuthOptions = {
    secret: nextAuthSecret,
    session: { strategy: 'jwt' },
    pages: { signIn: '/login' },
    providers: [
        CredentialsProvider({
            name: 'Identifiants',
            credentials: {
                email: { label: 'E-mail', type: 'email' },
                password: { label: 'Mot de passe', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findFirst({
                    where: { email: credentials.email.toLowerCase().trim() },
                });

                if (!user || !(await compare(credentials.password, user.password))) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role as EROLE,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);