'use server';

import { IUserDto } from '@/interface/dto/user.dto';
import { IUser } from '@/interface/entity/user.entity';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import prisma from '@/lib/db';
import { validate } from 'class-validator';
import { revalidatePath } from 'next/cache';

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
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });

  return users;
}

export async function getUserById(id: string): Promise<IUser| null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user;
}

export async function createUser(userDto: IUserDto): Promise<void> {
  const dto = await validateUserDto(userDto);

  await prisma.user.create({
    data: dto,
  });

  revalidatePath('/user');
}

export async function updateUser(id: string, userDto: IUserDto): Promise<void> {
  const dto = await validateUserDto(userDto);

  await prisma.user.update({
    where: { id },
    data: dto,
  });

  revalidatePath('/user');
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });

  revalidatePath('/user');
}