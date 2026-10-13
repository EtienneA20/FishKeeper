import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ENotificationStatus } from '@/constants/enum/notification-status.enum';
import { ENotificationType } from '@/constants/enum/notification-type.enum';

export class INotificationDto {
    @IsEnum(ENotificationType) type!: ENotificationType;
    @IsString() subject!: string;
    @IsString() body!: string;
    @IsEnum(ENotificationStatus) @IsOptional() status?: ENotificationStatus;
    @IsString() userId!: string;
    @IsString() @IsOptional() alertId?: string;
    @IsString() @IsOptional() taskId?: string;
}