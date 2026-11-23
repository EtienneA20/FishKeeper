'use server';

import { IUserDto } from '@/interface/dto/user.dto';
import { IUser } from '@/interface/entity/user.entity';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import prisma from '@/lib/db';
import { validate } from 'class-validator';
import { revalidatePath } from 'next/cache';
import type { Session } from 'next-auth';
import { hash } from 'bcryptjs';
import {
  DATA_ADMIN_ROLES,
  EROLE,
  canManageData,
  canManageUser,
  getAssignableRoles,
} from '@/constants/enum/role.enum';
import { requireRole } from '@/lib/auth-guard';

const FORBIDDEN_MESSAGE = "Vous n'avez pas les droits pour effectuer cette action.";

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  departement: true,
  imageURL: true,
} as const;

function revalidateUserPages(): void {
  revalidatePath('/data/user');
  revalidatePath('/data');
}

function assertCanAssignRole(session: Session, role: EROLE): void {
  if (!getAssignableRoles(session.user.role).includes(role)) {
    throw new Error(FORBIDDEN_MESSAGE);
  }
}

async function assertCanManageTarget(session: Session, targetId: string): Promise<void> {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { role: true },
  });

  if (!target) {
    throw new Error(EERROR_MESSAGE.USER_NOT_FOUND);
  }

  if (!canManageUser(session.user.role, target.role as EROLE)) {
    throw new Error(FORBIDDEN_MESSAGE);
  }
}

async function assertEmailAvailable(email: string, excludeId?: string): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing && existing.id !== excludeId) {
    throw new Error('Cette adresse e-mail est déjà utilisée.');
  }
}

async function validateUserDto(userDto: IUserDto): Promise<IUserDto> {
  const dto = Object.assign(new IUserDto(), userDto);
  dto.name = dto.name?.trim();
  dto.email = dto.email?.trim().toLowerCase();
  dto.departement = dto.departement?.trim();
  dto.imageURL = dto.imageURL?.trim();
  if (!dto.password) dto.password = undefined;
  if (!dto.imageURL) dto.imageURL = undefined;
  // whitelist : ignore tout champ non déclaré dans le DTO (id, createdAt…).
  const errors = await validate(dto, { whitelist: true });

  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );

    throw new Error(messages.join(' ') || EERROR_MESSAGE.USER_VALIDATION);
  }

  return dto;
}

export async function getUsers(): Promise<IUser[]> {
  await requireRole(...DATA_ADMIN_ROLES);
  const users = await prisma.user.findMany({
    select: PUBLIC_USER_SELECT,
    orderBy: { name: 'asc' },
  });

  return users.map((user) => ({ ...user, role: user.role as EROLE }));
}

export async function getUserById(id: string): Promise<IUser | null> {
  await requireRole(...DATA_ADMIN_ROLES);
  const user = await prisma.user.findUnique({
    where: { id },
    select: PUBLIC_USER_SELECT,
  });

  return user ? { ...user, role: user.role as EROLE } : null;
}

export async function createUser(userDto: IUserDto): Promise<void> {
  const session = await requireRole(...DATA_ADMIN_ROLES);
  const dto = await validateUserDto(userDto);
  assertCanAssignRole(session, dto.role);

  if (!dto.password) {
    throw new Error('Le mot de passe est obligatoire à la création.');
  }

  await assertEmailAvailable(dto.email);
  await prisma.user.create({
    data: { ...dto, password: await hash(dto.password, 12) },
  });

  revalidateUserPages();
}

export async function updateUser(id: string, userDto: IUserDto): Promise<void> {
  const session = await requireRole(...DATA_ADMIN_ROLES);
  const dto = await validateUserDto(userDto);

  await assertCanManageTarget(session, id);
  assertCanAssignRole(session, dto.role);

  if (id === session.user.id && !canManageData(dto.role)) {
    throw new Error('Vous ne pouvez pas retirer vos propres droits d’administration.');
  }

  await assertEmailAvailable(dto.email, id);
  const { password, ...userData } = dto;
  await prisma.user.update({
    where: { id },
    data: password ? { ...userData, password: await hash(password, 12) } : userData,
  });

  revalidateUserPages();
}

export async function updateProfile(profileDto: Omit<IUserDto, 'role'>): Promise<void> {
  const session = await requireRole();
  const dto = await validateUserDto({ ...profileDto, role: session.user.role });
  const id = session.user.id;

  await assertEmailAvailable(dto.email, id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, role, ...userData } = dto;
  await prisma.user.update({
    where: { id },
    data: password ? { ...userData, password: await hash(password, 12) } : userData,
  });

  revalidateUserPages();
}

export async function deleteUser(id: string): Promise<void> {
  const session = await requireRole(...DATA_ADMIN_ROLES);

  if (id === session.user.id) {
    throw new Error(EERROR_MESSAGE.USER_SELF_DELETE);
  }

  await assertCanManageTarget(session, id);
  await prisma.user.delete({
    where: { id },
  });

  revalidateUserPages();
}
