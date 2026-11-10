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
                    departement: user.departement,
                    imageURL: user.imageURL,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
                token.departement = user.departement ?? null;
                token.imageURL = user.imageURL ?? null;
            }

            if (trigger === 'update' && token.id) {
                const refreshedUser = await prisma.user.findUnique({
                    where: { id: token.id },
                });

                if (refreshedUser) {
                    token.name = refreshedUser.name;
                    token.email = refreshedUser.email;
                    token.role = refreshedUser.role as EROLE;
                    token.departement = refreshedUser.departement;
                    token.imageURL = refreshedUser.imageURL;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.departement = token.departement ?? null;
                session.user.imageURL = token.imageURL ?? null;
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);