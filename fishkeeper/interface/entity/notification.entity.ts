import { ENotificationStatus } from '@/constants/enum/notification-status.enum';
import { ENotificationType } from '@/constants/enum/notification-type.enum';

export interface INotification {
    id: string;
    type: ENotificationType;
    subject: string;
    body: string;
    status: ENotificationStatus;
    createdAt: Date;
    sentAt: Date | null;
    userId: string;
    alertId: string | null;
    taskId: string | null;
}