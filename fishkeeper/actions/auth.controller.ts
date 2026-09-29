'use server';

import { hash } from 'bcryptjs';
import { EROLE } from '@/constants/enum/role.enum';
import prisma from '@/lib/db';

export interface RegisterInput {
    name: string;
    email: string;
    departement: string;
    password: string;
}

export async function registerUser(input: RegisterInput): Promise<void> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const departement = input.departement.trim();

    if (name.length < 2 || !email.includes('@') || departement.length < 2) {
        throw new Error('Les informations du compte sont invalides.');
    }

    if (input.password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
        throw new Error('Cette adresse e-mail est déjà utilisée.');
    }

    const password = await hash(input.password, 12);

    await prisma.user.create({
        data: { name, email, departement, password, role: EROLE.USER },
    });
}