import {
  IsEnum,
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
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

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @IsOptional()
  @IsString()
  recurrence_pattern?: string;
}
