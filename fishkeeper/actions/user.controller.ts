'use server';

import { hash } from 'bcryptjs';
import { validate } from 'class-validator';
import { revalidatePath } from 'next/cache';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EROLE } from '@/constants/enum/role.enum';
import { IUserDto } from '@/interface/dto/user.dto';
import { IUser } from '@/interface/entity/user.entity';
import {
    assertCanManageRole,
    assertCanManageUsers,
    type RoleHolder,
} from '@/lib/auth/authorization';
import { getSessionActor } from '@/lib/auth/session';
import prisma from '@/lib/db';

async function requireUserManager(): Promise<RoleHolder> {
    const actor = await getSessionActor();
    if (!actor) {
        throw new Error(EERROR_MESSAGE.NOT_AUTHENTICATED);
    }

    assertCanManageUsers(actor.role);
    return actor;
}

async function findTargetUser(id: string): Promise<RoleHolder> {
    const target = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true },
    });
    if (!target) {
        throw new Error(EERROR_MESSAGE.USER_NOT_FOUND);
    }

    return { id: target.id, role: target.role as EROLE };
}

async function validateUserDto(userDto: IUserDto): Promise<IUserDto> {
    const dto = Object.assign(new IUserDto(), userDto);
    if (typeof dto.email === 'string') {
        // The login lowercases the e-mail, so stored addresses must be lowercase too.
        dto.email = dto.email.trim().toLowerCase();
    }
    if (!dto.password) {
        // The form sends '' when the field is left empty: it means "keep the current password".
        delete dto.password;
    }

    // whitelist drops any field the DTO does not declare (id, createdAt, ...).
    const errors = await validate(dto, { whitelist: true });

    if (errors.length > 0) {
        const messages = errors.flatMap((error) =>
            Object.values(error.constraints ?? {})
        );

        throw new Error(messages.join(' ') || EERROR_MESSAGE.USER_VALIDATION);
    }

    return dto;
}

export async function getUsers(): Promise<IUser[]> {
    await requireUserManager();
    const users = await prisma.user.findMany({
        omit: { password: true },
        orderBy: { name: 'asc' },
    });

    return users.map((user) => ({ ...user, role: user.role as EROLE }));
}

export async function getUserById(id: string): Promise<IUser | null> {
    await requireUserManager();
    const user = await prisma.user.findUnique({
        where: { id },
        omit: { password: true },
    });

    return user ? { ...user, role: user.role as EROLE } : null;
}

export async function createUser(userDto: IUserDto): Promise<void> {
    const actor = await requireUserManager();
    const dto = await validateUserDto(userDto);
    assertCanManageRole(actor.role, dto.role);

    if (!dto.password) {
        throw new Error('Le mot de passe est obligatoire à la création.');
    }

    await prisma.user.create({
        data: { ...dto, password: await hash(dto.password, 12) },
    });

    revalidatePath('/user');
}

export async function updateUser(id: string, userDto: IUserDto): Promise<void> {
    const actor = await requireUserManager();
    const target = await findTargetUser(id);
    const isSelf = target.id === actor.id;
    if (!isSelf) {
        assertCanManageRole(actor.role, target.role);
    }

    const dto = await validateUserDto(userDto);
    if (isSelf && dto.role !== target.role) {
        throw new Error(EERROR_MESSAGE.USER_SELF_ROLE_CHANGE);
    }
    if (!isSelf) {
        assertCanManageRole(actor.role, dto.role);
    }

    const { password, ...userData } = dto;
    await prisma.user.update({
        where: { id },
        data: password
            ? { ...userData, password: await hash(password, 12) }
            : userData,
    });

    revalidatePath('/user');
}

export async function deleteUser(id: string): Promise<void> {
    const actor = await requireUserManager();
    if (id === actor.id) {
        throw new Error(EERROR_MESSAGE.USER_SELF_DELETE);
    }

    const target = await findTargetUser(id);
    assertCanManageRole(actor.role, target.role);

    await prisma.user.delete({
        where: { id },
    });

    revalidatePath('/user');
}
