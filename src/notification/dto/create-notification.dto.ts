import { IsEnum, IsInt, IsString } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsInt()
  user_id: number;

  @IsString()
  end_date: string;

  @IsString()
  time: string;

  @IsEnum(NotificationType)
  type: NotificationType;
}
