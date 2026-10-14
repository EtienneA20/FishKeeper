import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

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
                    department: user.departement,
                    role: user.role,
                    image: user.imageURL,
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
                token.department = user.department;
                token.role = user.role;
                token.picture = user.image;
            }

            if (trigger === 'update' && token.id) {
                const refreshedUser = await prisma.user.findUnique({
                    where: { id: token.id },
                });

                if (refreshedUser) {
                    token.name = refreshedUser.name;
                    token.email = refreshedUser.email;
                    token.department = refreshedUser.departement;
                    token.role = refreshedUser.role;
                    token.picture = refreshedUser.imageURL;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.department = token.department;
                session.user.role = token.role;
                session.user.image = token.picture;
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);