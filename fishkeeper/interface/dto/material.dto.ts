
import { IsNotEmpty, IsString, IsNumber, MinLength } from 'class-validator';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';

export class IUserDto {
    @IsString({ message: EERROR_MESSAGE.USER_NAME_INVALID })
    @IsNotEmpty({ message: EERROR_MESSAGE.USER_NAME_REQUIRED })
    @MinLength(2, { message: EERROR_MESSAGE.USER_NAME_TOO_SHORT })
    name!: string;

    @IsNumber({}, { message: EERROR_MESSAGE.NUMBER_INVALID })
    @IsNotEmpty({ message: EERROR_MESSAGE.NUMBER_REQUIRED })
    number!: number;
}
