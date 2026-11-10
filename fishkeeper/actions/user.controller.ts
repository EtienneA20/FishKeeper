'use server';

import { IUserDto } from '@/interface/dto/user.dto';
import { IUser } from '@/interface/entity/user.entity';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import prisma from '@/lib/db';
import { validate } from 'class-validator';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { hash } from 'bcryptjs';
import { EROLE } from '@/constants/enum/role.enum';

async function requireSession(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Vous devez être connecté pour effectuer cette action.');
  }
}

async function validateUserDto(userDto: IUserDto): Promise<IUserDto> {
  const dto = Object.assign(new IUserDto(), userDto);
  const errors = await validate(dto);

  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );

    throw new Error(messages.join(' ') || EERROR_MESSAGE.USER_VALIDATION);
  }

  return dto;
}

export async function getUsers(): Promise<IUser[]> {
  await requireSession();
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });

  return users.map((user) => ({ ...user, role: user.role as EROLE }));
}

export async function getUserById(id: string): Promise<IUser| null> {
  await requireSession();
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user ? { ...user, role: user.role as EROLE } : null;
}

export async function createUser(userDto: IUserDto): Promise<void> {
  await requireSession();
  const dto = await validateUserDto(userDto);

  if (!dto.password) {
    throw new Error('Le mot de passe est obligatoire à la création.');
  }

  await prisma.user.create({
    data: { ...dto, password: await hash(dto.password, 12) },
  });

  revalidatePath('/user');
}

export async function updateUser(id: string, userDto: IUserDto): Promise<void> {
  await requireSession();
  const dto = await validateUserDto(userDto);

  const { password, ...userData } = dto;
  await prisma.user.update({
    where: { id },
    data: password ? { ...userData, password: await hash(password, 12) } : userData,
  });

  revalidatePath('/user');
}

export async function deleteUser(id: string): Promise<void> {
  await requireSession();
  await prisma.user.delete({
    where: { id },
  });

  revalidatePath('/user');
}