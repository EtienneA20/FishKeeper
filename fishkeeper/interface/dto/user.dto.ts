
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';

export class IUserDto {
    @IsString({ message: EERROR_MESSAGE.USER_NAME_INVALID })
    @IsNotEmpty({ message: EERROR_MESSAGE.USER_NAME_REQUIRED })
    @MinLength(2, { message: EERROR_MESSAGE.USER_NAME_TOO_SHORT })
    name!: string;

    @IsEmail({}, { message: EERROR_MESSAGE.USER_EMAIL_INVALID })
    @IsNotEmpty({ message: EERROR_MESSAGE.USER_EMAIL_REQUIRED })
    email!: string;
}
