
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EROLE } from '@/constants/enum/role.enum';

export class IUserDto {
    @IsString({ message: EERROR_MESSAGE.USER_NAME_INVALID })
    @IsNotEmpty({ message: EERROR_MESSAGE.USER_NAME_REQUIRED })
    @MinLength(2, { message: EERROR_MESSAGE.USER_NAME_TOO_SHORT })
    name!: string;

    @IsEmail({}, { message: EERROR_MESSAGE.USER_EMAIL_INVALID })
    @IsNotEmpty({ message: EERROR_MESSAGE.USER_EMAIL_REQUIRED })
    email!: string;

    @IsEnum(EROLE, { message: EERROR_MESSAGE.USER_ROLE_INVALID })
    @IsNotEmpty({ message: EERROR_MESSAGE.USER_ROLE_REQUIRED })
    role!: EROLE;

    @IsString()
    @IsNotEmpty()
    departement!: string;

    @IsOptional()
    @IsString()
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
    password?: string;

    @IsOptional()
    @IsUrl({}, { message: "L'URL de l'image est invalide." })
    imageURL?: string;
}
